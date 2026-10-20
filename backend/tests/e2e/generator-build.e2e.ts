import { spawn, spawnSync, type ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { codeGenerator, ProjectType, type CodeGenerationInput, type GeneratedFile } from '../../src/generation/code-generator';
import { uiGenerator } from '../../src/generation/ui-generator';
import { detectScopeFromPrompt } from '../../src/generation/prompt-scope-detector';
import express from 'express';
import request from 'supertest';
import JSZip from 'jszip';
import { generationRoutes } from '../../src/routes/generation.routes';
import { orchestrationEngine } from '../../src/engines/orchestrator-engine';
import { generationExecutionService } from '../../src/generation/generation-execution-service';
import { ProductBlueprintPlanner } from '../../src/blueprint/product-blueprint';

const npmCli = process.env['npm_execpath'];

if (!npmCli) {
  throw new Error('npm_execpath is required to run generated-project E2E tests');
}
const npmCliPath: string = npmCli;

interface Scenario {
  name: string;
  input: CodeGenerationInput;
  runtimeEndpoint?: string;
}

const scenarios: Scenario[] = [
  {
    name: 'frontend-analytics',
    input: {
      projectName: 'AnalyticsBoard',
      projectType: ProjectType.FRONTEND,
      entities: ['Metric', 'Report'],
      requirements: {
        description: 'Dashboard responsivo de analytics com gráficos, filtros e relatórios',
        features: ['Metric cards', 'Charts', 'Date filters', 'Reports'],
        tech_stack: { frontend: ['react', 'typescript'] },
      },
    },
  },
  {
    name: 'backend-inventory',
    input: {
      projectName: 'InventoryApi',
      projectType: ProjectType.BACKEND,
      entities: ['Product', 'StockMovement'],
      requirements: {
        description: 'API REST para produtos e movimentações de estoque com PostgreSQL',
        features: ['Product CRUD', 'Stock movement CRUD'],
        tech_stack: { backend: ['node', 'express', 'typescript'], database: 'postgresql' },
      },
      database: { type: 'postgresql', entities: ['Product', 'StockMovement'] },
      api_type: 'rest',
    },
  },
  {
    name: 'fullstack-appointments',
    input: {
      projectName: 'AppointmentFlow',
      projectType: ProjectType.FULLSTACK,
      entities: ['Appointment', 'Customer'],
      requirements: {
        description: 'Sistema fullstack de agendamentos e clientes com calendário e SQLite',
        features: ['Appointment CRUD', 'Customer CRUD', 'Calendar'],
        tech_stack: {
          frontend: ['react', 'typescript'],
          backend: ['node', 'express', 'typescript'],
          database: 'sqlite',
        },
      },
      database: { type: 'sqlite', entities: ['Appointment', 'Customer'] },
      api_type: 'rest',
    },
    runtimeEndpoint: '/api/appointments',
  },
  {
    name: 'fullstack-crm-relations',
    input: {
      projectName: 'VortexRevenue',
      projectType: ProjectType.FULLSTACK,
      entities: ['Company', 'Contact', 'Deal', 'Task'],
      requirements: {
        description: 'CRM Vortex azul marinho com empresas, contatos relacionados, pipeline de negócios, tarefas e autenticação',
        features: ['Company CRUD', 'Contact CRUD', 'Deal pipeline', 'Task workflow', 'Authentication'],
        tech_stack: { frontend: ['react', 'typescript'], backend: ['node', 'express', 'typescript'], database: 'sqlite' },
      },
      database: { type: 'sqlite', entities: ['Company', 'Contact', 'Deal', 'Task'] },
      api_type: 'rest',
      authentication: true,
    },
    runtimeEndpoint: '/health',
  },
  {
    name: 'fullstack-commerce-catalog',
    input: {
      projectName: 'CasaSolCommerce',
      projectType: ProjectType.FULLSTACK,
      entities: ['Category', 'Product', 'Customer', 'Order'],
      requirements: {
        description: 'E-commerce Casa Sol vibrante em laranja com catálogo, estoque, clientes e fluxo de pedidos',
        features: ['Product catalog', 'Stock', 'Customers', 'Order workflow'],
        tech_stack: { frontend: ['react', 'typescript'], backend: ['node', 'express', 'typescript'], database: 'sqlite' },
      },
      database: { type: 'sqlite', entities: ['Category', 'Product', 'Customer', 'Order'] },
      api_type: 'rest',
    },
    runtimeEndpoint: '/health',
  },
  {
    name: 'fullstack-finance-ledger',
    input: {
      projectName: 'LumeLedger',
      projectType: ProjectType.FULLSTACK,
      entities: ['Transaction', 'Invoice', 'Customer'],
      requirements: {
        description: 'Plataforma financeira Lume com ledger de transações, faturas, clientes, layout bento e tema claro azul',
        features: ['Transaction ledger', 'Invoices', 'Customers', 'Filters'],
        tech_stack: { frontend: ['react', 'typescript'], backend: ['node', 'express', 'typescript'], database: 'sqlite' },
      },
      database: { type: 'sqlite', entities: ['Transaction', 'Invoice', 'Customer'] },
      api_type: 'rest',
    },
    runtimeEndpoint: '/health',
  },
];

type MaterializedFile = Pick<GeneratedFile, 'path' | 'content'> & {
  filename?: string;
  name?: string;
};

function fileTarget(root: string, file: MaterializedFile): string {
  const filename = file.filename || file.name;
  if (!filename) throw new Error(`Generated file has no filename: ${file.path}`);
  const target = path.resolve(root, file.path || '', filename);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Generated path escapes project root: ${file.path}/${filename}`);
  }
  return target;
}

async function materialize(root: string, files: MaterializedFile[]): Promise<void> {
  for (const file of files) {
    const target = fileTarget(root, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, file.content, 'utf8');
  }
}

function sqliteEnvironment(root: string): NodeJS.ProcessEnv {
  return { DATABASE_URL: `file:${path.join(root, 'backend', 'prisma', 'test.db').replace(/\\/g, '/')}` };
}

function applySqliteMigration(root: string): void {
  runNpm(
    ['exec', '--', 'prisma', 'migrate', 'deploy', '--schema', 'backend/prisma/schema.prisma'],
    root,
    { ...sqliteEnvironment(root), RUST_BACKTRACE: '1', RUST_LOG: 'info' }
  );
}

function runNpm(args: string[], cwd: string, extraEnv: NodeJS.ProcessEnv = {}): void {
  const result = spawnSync(process.execPath, [npmCliPath, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CI: '1', ...extraEnv },
    timeout: args[0] === 'install' ? 600000 : 240000,
  });
  if (result.status !== 0) {
    throw new Error([
      `npm ${args.join(' ')} failed in ${cwd}`,
      result.error?.stack,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join('\n'));
  }
}

async function waitForEndpoint(url: string, process: ChildProcess): Promise<void> {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) throw new Error(`Generated server exited with ${process.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.status > 0) return;
    } catch {
      // Server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Generated server did not become ready: ${url}`);
}

async function requestJson<T>(url: string, init: RequestInit, expectedStatus: number): Promise<T> {
  const response = await fetch(url, init);
  const payload = await response.json() as T;
  if (response.status !== expectedStatus) {
    throw new Error(`${init.method || 'GET'} ${url} returned ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function stopProcessTree(child: ChildProcess): Promise<void> {
  if (!child.pid || child.exitCode !== null) return;

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
      encoding: 'utf8',
      windowsHide: true,
    });
  } else {
    child.kill('SIGTERM');
  }

  await new Promise(resolve => setTimeout(resolve, 250));
}

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe.each(scenarios)('generated project build: $name', scenario => {
  let projectRoot = '';

  afterEach(async () => {
    if (projectRoot) {
      await fs.rm(projectRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
    }
  });

  it('installs and builds without errors', async () => {
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), `orus-${scenario.name}-`));
    const result = await codeGenerator.generate(scenario.input);
    expect(result.success).toBe(true);
    await materialize(projectRoot, result.files);

    runNpm(['install', '--prefer-offline', '--no-audit', '--no-fund'], projectRoot);
    if (scenario.input.database) {
      runNpm(
        ['exec', '--', 'prisma', 'generate', '--schema', 'backend/prisma/schema.prisma'],
        projectRoot,
        { DATABASE_URL: 'file:./test.db' }
      );
      if (scenario.input.database.type === 'sqlite') {
        applySqliteMigration(projectRoot);
      }
    }
    runNpm(['run', 'build'], projectRoot);

    if (scenario.runtimeEndpoint) {
      const port = 43101;
      const server = spawn(process.execPath, [npmCliPath, 'run', 'start', '--workspace=backend'], {
        cwd: projectRoot,
        env: {
          ...process.env,
          ...sqliteEnvironment(projectRoot),
          PORT: String(port),
          NODE_ENV: 'test',
          JWT_SECRET: 'e2e-secret-with-at-least-32-characters',
        },
        stdio: 'ignore',
      });
      try {
        await waitForEndpoint(`http://127.0.0.1:${port}${scenario.runtimeEndpoint}`, server);
        if (scenario.name === 'fullstack-crm-relations') {
          const baseUrl = `http://127.0.0.1:${port}`;
          const registration = await requestJson<{ data: { token: string } }>(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name: 'Admin E2E', email: 'admin@vortex.test', password: 'SecurePass123!' }),
          }, 201);
          const headers = { 'content-type': 'application/json', authorization: `Bearer ${registration.data.token}` };
          const company = await requestJson<{ data: { id: string } }>(`${baseUrl}/api/companies`, {
            method: 'POST', headers, body: JSON.stringify({ name: 'Acme Brasil' }),
          }, 201);
          const contact = await requestJson<{ data: { id: string; companyId: string } }>(`${baseUrl}/api/contacts`, {
            method: 'POST', headers, body: JSON.stringify({ name: 'Marina Costa', email: 'marina@acme.test', companyId: company.data.id }),
          }, 201);
          expect(contact.data.companyId).toBe(company.data.id);
          const deal = await requestJson<{ data: { id: string; stage: string } }>(`${baseUrl}/api/deals`, {
            method: 'POST', headers, body: JSON.stringify({ name: 'Expansão anual', value: 125000, companyId: company.data.id, contactId: contact.data.id }),
          }, 201);
          const transitioned = await requestJson<{ data: { stage: string } }>(`${baseUrl}/api/deals/${deal.data.id}/status`, {
            method: 'PATCH', headers, body: JSON.stringify({ value: 'qualification' }),
          }, 200);
          expect(transitioned.data.stage).toBe('qualification');
        }
      } finally {
        await stopProcessTree(server);
      }
    }
  });
});

const specializedPrompts = [
  {
    name: 'landing-page',
    prompt: 'Crie uma landing page de cursos com hero, benefícios, depoimentos e CTA. Apenas frontend.',
    entity: 'course',
    expectedScope: 'landing_page' as const,
  },
  {
    name: 'single-component',
    prompt: 'Crie somente um componente React reutilizável ProductCard. Não crie backend.',
    entity: 'product',
    expectedScope: 'single-component' as const,
  },
];

describe('Builder HTTP generation and download', () => {
  let projectRoot = '';
  let generationId = '';

  afterAll(async () => {
    if (generationId) generationExecutionService.cancel(generationId);
    await orchestrationEngine.stop();
    if (projectRoot) {
      const relative = path.relative(os.tmpdir(), projectRoot);
      if (!relative.startsWith('orus-http-') || relative.includes(path.sep)) throw new Error('Unsafe temporary directory');
      await fs.rm(projectRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
    }
  });

  it('generates, certifies, downloads, migrates, seeds, builds and serves a fullstack project', async () => {
    await orchestrationEngine.initialize({ enabled: true, defaultMaxRetries: 1 });
    await orchestrationEngine.start();
    const app = express();
    app.use(express.json());
    app.use('/api/generation', generationRoutes);
    app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(500).json({ error: error.message });
    });
    const generated = await request(app).post('/api/generation').send({
      projectId: 'e2e-appointments',
      prompt: 'Crie um sistema fullstack de agendamentos e clientes com calendário, relatórios de indicadores, SQLite e autenticação JWT',
      framework: 'react',
      language: 'typescript',
      includeTests: true,
    });
    expect({ status: generated.status, error: generated.body.error }).toEqual({ status: 202, error: undefined });
    generationId = generated.body.jobId;
    const accessToken = generated.body.accessToken;
    expect(generationId).toEqual(expect.any(String));
    expect(accessToken).toEqual(expect.any(String));
    expect((await request(app).get(`/api/generation/${generationId}/status`)).status).toBe(403);

    let generationResult: any;
    let lastStatus: any;
    const observedStatuses = new Set<string>();
    for (let attempt = 0; attempt < 720; attempt++) {
      const status = await request(app).get(`/api/generation/${generationId}/status`).set('x-orus-job-token', accessToken);
      expect(status.status).toBe(200);
      lastStatus = status.body.data;
      observedStatuses.add(lastStatus.status);
      if (status.body.data.status === 'failed') {
        const failedDiagnostics = (status.body.data.diagnostics || [])
          .filter((diagnostic: any) => diagnostic.severity === 'error')
          .map((diagnostic: any) => ({
            stage: diagnostic.stage,
            message: diagnostic.message,
            details: diagnostic.details?.details || diagnostic.details,
          }));
        throw new Error([
          status.body.data.error,
          JSON.stringify(failedDiagnostics, null, 2),
        ].filter(Boolean).join('\n'));
      }
      if (status.body.data.status === 'ready') {
        const result = await request(app).get(`/api/generation/${generationId}/result`).set('x-orus-job-token', accessToken);
        expect(result.status).toBe(200);
        generationResult = result.body.data;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!generationResult) throw new Error(`Generation timeout: ${JSON.stringify(lastStatus)}`);
    expect(Array.from(observedStatuses)).toEqual(expect.arrayContaining(['generating', 'validating', 'ready']));
    expect(generationResult.certification).toEqual(expect.objectContaining({
      status: 'ready',
      buildPassed: true,
      repairAttempts: 0,
    }));
    const downloaded = await request(app).get(`/api/generation/download/${generationId}`).set('x-orus-job-token', accessToken).buffer(true).parse((res, callback) => {
      const chunks: Buffer[] = [];
      res.on('data', chunk => chunks.push(Buffer.from(chunk)));
      res.on('end', () => callback(null, Buffer.concat(chunks)));
      res.on('error', callback);
    });
    expect(downloaded.status).toBe(200);
    expect(downloaded.headers['x-orus-artifact-digest']).toMatch(/^[a-f0-9]{64}$/);
    const zip = await JSZip.loadAsync(downloaded.body);
    expect(zip.file('package.json')).not.toBeNull();
    expect(zip.file('package-lock.json')).not.toBeNull();
    expect(zip.file('backend/package.json')).not.toBeNull();
    expect(zip.file('frontend/package.json')).not.toBeNull();
    expect(zip.file('backend/src/__tests__/orus-generated.contract.test.ts')).not.toBeNull();
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'orus-http-'));
    for (const file of generationResult.files) {
      expect(await zip.file(file.path)?.async('string')).toBe(file.content);
    }
    for (const file of Object.values(zip.files)) {
      if (!file.dir) await materialize(projectRoot, [{ path: path.dirname(file.name), filename: path.basename(file.name), content: await file.async('string') }]);
    }
    runNpm(['ci', '--ignore-scripts', '--prefer-offline', '--no-audit', '--no-fund'], projectRoot);
    runNpm(['exec', '--', 'prisma', 'generate', '--schema', 'backend/prisma/schema.prisma'], projectRoot, sqliteEnvironment(projectRoot));
    applySqliteMigration(projectRoot);
    runNpm(['exec', '--workspace=backend', '--', 'ts-node', '--project', 'tsconfig.json', 'prisma/seed.ts'], projectRoot, sqliteEnvironment(projectRoot));
    runNpm(['run', 'build'], projectRoot);
    const port = 43102;
    const server = spawn(process.execPath, [npmCliPath, 'run', 'start', '--workspace=backend'], {
      cwd: projectRoot,
      env: { ...process.env, ...sqliteEnvironment(projectRoot), PORT: String(port), NODE_ENV: 'test', JWT_SECRET: 'e2e-secret-with-at-least-32-characters', ADMIN_EMAILS: 'e2e@example.com' },
      stdio: 'ignore',
      windowsHide: true,
    });
    try {
      await waitForEndpoint(`http://127.0.0.1:${port}/api/appointments`, server);
      const endpoint = `http://127.0.0.1:${port}/api/appointments`;
      expect((await fetch(endpoint)).status).toBe(401);
      const registration = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Usuário E2E', email: 'e2e@example.com', password: 'StrongPass123!' }),
      });
      expect(registration.status).toBe(201);
      const registrationBody = await registration.json() as { data: { token: string; user: Record<string, unknown> } };
      expect(registrationBody.data.user).not.toHaveProperty('password');
      expect(registrationBody.data.user).toMatchObject({ role: 'admin' });
      expect((await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Duplicado', email: 'e2e@example.com', password: 'StrongPass123!' }),
      })).status).toBe(409);
      expect((await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'e2e@example.com', password: 'wrong-password' }),
      })).status).toBe(401);
      const login = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'e2e@example.com', password: 'StrongPass123!' }),
      });
      expect(login.status).toBe(200);
      const loginBody = await login.json() as { data: { token: string } };
      const authorization = { Authorization: `Bearer ${loginBody.data.token}` };
      expect((await fetch(`http://127.0.0.1:${port}/api/auth/me`, { headers: { Authorization: 'Bearer invalid' } })).status).toBe(401);
      expect((await fetch(`http://127.0.0.1:${port}/api/auth/me`, { headers: authorization })).status).toBe(200);
      const created = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authorization },
        body: JSON.stringify({
          name: 'Consulta de teste',
          scheduledAt: '2026-11-12T14:00:00.000Z',
          professional: 'Dra. Marina Costa',
          description: 'E2E HTTP',
        }),
      });
      expect(created.status).toBe(201);
      const record = (await created.json() as { data: { id: string } }).data;
      const loaded = await fetch(`${endpoint}/${record.id}`, { headers: authorization });
      expect(loaded.status).toBe(200);
      expect((await loaded.json() as { data: { name: string } }).data.name).toBe('Consulta de teste');
      const updated = await fetch(`${endpoint}/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authorization },
        body: JSON.stringify({ name: 'Consulta atualizada' }),
      });
      expect(updated.status).toBe(200);
      expect((await updated.json() as { data: { name: string } }).data.name).toBe('Consulta atualizada');
      for (const method of ['PUT', 'PATCH']) {
        const invalid = await fetch(`${endpoint}/${record.id}${method === 'PATCH' ? '/status' : ''}`, {
          method,
          headers: { 'Content-Type': 'application/json', ...authorization },
          body: JSON.stringify(method === 'PATCH' ? { value: 'completed' } : { status: 'completed' }),
        });
        expect(invalid.status).toBe(400);
      }
      const transitioned = await requestJson<{ data: { status: string } }>(`${endpoint}/${record.id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authorization },
        body: JSON.stringify({ value: 'confirmed' }),
      }, 200);
      expect(transitioned.data.status).toBe('confirmed');
      const reloaded = await requestJson<{ data: { status: string } }>(`${endpoint}/${record.id}`, { headers: authorization }, 200);
      expect(reloaded.data.status).toBe('confirmed');
      const reportsEndpoint = `http://127.0.0.1:${port}/api/reports`;
      const beforeSummary = await requestJson<{ data: { total: number; numericTotals: { value: number } } }>(`${reportsEndpoint}/insights/summary`, { headers: authorization }, 200);
      await requestJson(reportsEndpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...authorization },
        body: JSON.stringify({ name: 'Indicador E2E', metric: 'Consultas confirmadas', value: 7 }),
      }, 201);
      const afterSummary = await requestJson<{ data: { total: number; numericTotals: { value: number } } }>(`${reportsEndpoint}/insights/summary`, { headers: authorization }, 200);
      expect(afterSummary.data.total).toBe(beforeSummary.data.total + 1);
      expect(afterSummary.data.numericTotals.value).toBe(beforeSummary.data.numericTotals.value + 7);
      expect((await fetch(endpoint, { headers: authorization })).status).toBe(200);
      expect((await fetch(`${endpoint}/${record.id}`, { method: 'DELETE', headers: authorization })).status).toBe(204);
      expect((await fetch(`${endpoint}/${record.id}`, { headers: authorization })).status).toBe(404);
    } finally {
      await stopProcessTree(server);
    }
  }, 1200000);
});

describe.each(specializedPrompts)('specialized prompt build: $name', scenario => {
  let projectRoot = '';

  afterEach(async () => {
    if (projectRoot) {
      await fs.rm(projectRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
    }
  });

  it('detects the prompt, installs, and builds the specialized output', async () => {
    const scope = detectScopeFromPrompt(scenario.prompt);
    expect(scope.type).toBe(scenario.expectedScope);

    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), `orus-${scenario.name}-`));
    const result = await uiGenerator.generate({
      framework: 'react',
      generationType: scope.type === 'landing_page' ? 'LANDING_PAGE' : 'COMPONENT',
      entities: [scenario.entity],
      requirements: {
        description: scenario.prompt,
        features: [],
        tech_stack: { frontend: ['react', 'typescript'] },
      },
    });

    expect(result.success).toBe(true);
    await materialize(projectRoot, result.files);
    runNpm(['install', '--prefer-offline', '--no-audit', '--no-fund'], projectRoot);
    runNpm(['run', 'build'], projectRoot);
  });
});

describe('Blueprint layout build', () => {
  let projectRoot = '';

  afterAll(async () => {
    if (projectRoot) await fs.rm(projectRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  });

  it('builds distinct catalog, checkout, payment and integration experiences', async () => {
    const prompt = 'Marketplace Aurora com catálogo, carrinho, checkout, pagamentos Pix, Stripe, integrações e pedidos';
    const productBlueprint = await new ProductBlueprintPlanner().create({ prompt });
    const result = await codeGenerator.generate({
      projectName: 'AuroraCommerce',
      projectType: ProjectType.FRONTEND,
      productBlueprint,
      entities: productBlueprint.data.map(entity => entity.name),
      requirements: {
        description: prompt,
        features: productBlueprint.capabilities.map(capability => capability.name),
        tech_stack: { frontend: ['react', 'typescript'] },
      },
    });
    expect(result.success).toBe(true);
    const contents = result.files.map(file => file.content);
    expect(contents.some(content => content.includes('aspect-[4/3]'))).toBe(true);
    expect(contents.some(content => content.includes('lg:grid-cols-[1fr_340px]'))).toBe(true);
    expect(contents.some(content => content.includes('Operação financeira'))).toBe(true);
    expect(contents.some(content => content.includes('Configurar'))).toBe(true);
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'orus-blueprint-layout-'));
    await materialize(projectRoot, result.files);
    runNpm(['install', '--prefer-offline', '--no-audit', '--no-fund'], projectRoot);
    runNpm(['run', 'build'], projectRoot);
  }, 600000);
});

describe.each([
  {
    name: 'recruiting',
    projectName: 'TalentoVivo',
    prompt: 'Sistema Talento Vivo com vagas, candidatos, processo seletivo em pipeline e entrevistas.',
  },
  {
    name: 'logistics',
    projectName: 'RotaClara',
    prompt: 'Aplicação Rota Clara para remessas e entregas, gestão de frota, planejamento de rotas e rastreamento logístico.',
  },
  {
    name: 'education',
    projectName: 'AprendeMais',
    prompt: 'Plataforma Aprende+ com catálogo de cursos, matrículas, progresso de aprendizagem e avaliações acadêmicas.',
  },
  {
    name: 'events',
    projectName: 'FestivalVivo',
    prompt: 'Aplicativo Festival Vivo com programação de eventos, ingressos e inscrições e credenciamento na entrada.',
  },
  {
    name: 'restaurant',
    projectName: 'MesaAutoral',
    prompt: 'Sistema Mesa Autoral com reservas de mesas, cardápio, pedidos do restaurante e painel da cozinha.',
  },
  {
    name: 'uncatalogued-library',
    projectName: 'AcervoVivo',
    prompt: 'Sistema Acervo Vivo para bibliotecas, com catálogo de obras, empréstimos com prazo e devolução, reservas e cálculo automático de multas.',
  },
])('domain-specific fullstack build: $name', scenario => {
  let projectRoot = '';

  afterEach(async () => {
    if (projectRoot) await fs.rm(projectRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  });

  it('generates relations, validates Prisma and builds both applications', async () => {
    const productBlueprint = await new ProductBlueprintPlanner().create({ prompt: scenario.prompt, depth: 'complete' });
    const entities = productBlueprint.data.map(entity => entity.name);
    const result = await codeGenerator.generate({
      projectName: scenario.projectName,
      projectType: ProjectType.FULLSTACK,
      productBlueprint,
      entities,
      requirements: {
        description: scenario.prompt,
        features: productBlueprint.capabilities.map(capability => capability.name),
        tech_stack: { frontend: ['react', 'typescript'], backend: ['node', 'express', 'typescript'], database: 'sqlite' },
      },
      database: { type: 'sqlite', entities },
      api_type: 'rest',
    });

    expect(result.success).toBe(true);
    expect(entities).not.toEqual(expect.arrayContaining(['Item', 'Task', 'Project', 'Workspace']));
    projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), `orus-domain-${scenario.name}-`));
    await materialize(projectRoot, result.files);
    runNpm(['install', '--prefer-offline', '--no-audit', '--no-fund'], projectRoot);
    runNpm(['exec', '--', 'prisma', 'validate', '--schema', 'backend/prisma/schema.prisma'], projectRoot, sqliteEnvironment(projectRoot));
    runNpm(['run', 'build'], projectRoot);
  }, 600000);
});
