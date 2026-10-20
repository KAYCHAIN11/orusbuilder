import { codeGenerator, ProjectType, type GeneratedFile } from '../../src/generation/code-generator';

function findFile(files: GeneratedFile[], directory: string, filename: string): GeneratedFile {
  const file = files.find(candidate => candidate.path === directory && candidate.filename === filename);
  if (!file) throw new Error(`Missing generated file: ${directory}/${filename}`);
  return file;
}

function assertUniquePaths(files: GeneratedFile[]): void {
  const paths = files.map(file => `${file.path}/${file.filename}`.replace(/^\//, ''));
  expect(new Set(paths).size).toBe(paths.length);
}

describe('CodeGenerator project contracts', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('generates a self-contained frontend workspace with a valid Vite entrypoint', async () => {
    const result = await codeGenerator.generate({
      projectName: 'TaskFlow',
      projectType: ProjectType.FRONTEND,
      entities: ['Task'],
      requirements: {
        description: 'React task manager with form, list and filters',
        features: ['Task creation', 'Task list', 'Task filtering'],
        tech_stack: { frontend: ['react', 'typescript'] }
      }
    });

    expect(result.success).toBe(true);
    expect(result.files.some(file => file.path.startsWith('backend'))).toBe(false);
    assertUniquePaths(result.files);

    const indexHtml = findFile(result.files, 'frontend', 'index.html');
    expect(indexHtml.content).toContain('/src/main.tsx');
    expect(indexHtml.content).not.toContain('/src/index.tsx');

    const viteConfig = findFile(result.files, 'frontend', 'vite.config.ts');
    expect(viteConfig.content).toContain("minify: 'esbuild'");
    expect(viteConfig.content).toContain('fs.realpathSync(process.cwd())');

    const designSystem = JSON.parse(findFile(result.files, '.orus', 'design-system.json').content);
    expect(designSystem.schemaVersion).toBe('2.0.0');
    expect(designSystem.planningOrder).toEqual(['brand-identity', 'product-experience', 'components', 'screens']);
    expect(findFile(result.files, '.orus', 'brand-identity.json')).toBeDefined();
    expect(findFile(result.files, '.orus', 'experience-plan.json')).toBeDefined();
    expect(findFile(result.files, 'frontend/src/design-system', 'theme.css').content)
      .toContain('--orus-primary');
    const localApi = findFile(result.files, 'frontend/src/utils', 'api.ts').content;
    expect(localApi).toContain('localStorage.setItem');
    expect(localApi).not.toContain("import axios from 'axios'");

    const rootPackage = JSON.parse(findFile(result.files, '', 'package.json').content);
    const frontendPackage = JSON.parse(findFile(result.files, 'frontend', 'package.json').content);
    expect(frontendPackage.name).toMatch(/^[a-z0-9][a-z0-9._-]*$/);
    expect(rootPackage.workspaces).toEqual(['frontend']);
    expect(rootPackage.scripts.build).toBe('npm run build --workspace=frontend');
    expect(rootPackage.allowScripts.esbuild).toBe(true);
  });

  it('generates installable backend metadata and syntactically valid route templates', async () => {
    const result = await codeGenerator.generate({
      projectName: 'TaskFlow',
      projectType: ProjectType.FULLSTACK,
      entities: ['Task', 'User'],
      requirements: {
        description: 'Fullstack task manager with authentication',
        features: ['Task creation', 'Task list', 'User authentication'],
        tech_stack: {
          frontend: ['react', 'typescript'],
          backend: ['node', 'express', 'typescript'],
          database: 'postgresql'
        }
      },
      database: { type: 'postgresql', entities: ['Task', 'User'] },
      authentication: true,
      api_type: 'rest'
    });

    expect(result.success).toBe(true);
    assertUniquePaths(result.files);

    const backendPackage = JSON.parse(findFile(result.files, 'backend', 'package.json').content);
    const backendTsConfig = JSON.parse(findFile(result.files, 'backend', 'tsconfig.json').content);
    expect(backendPackage.type).toBe('commonjs');
    expect(backendTsConfig.compilerOptions.module).toBe('CommonJS');
    expect(backendPackage.dependencies.jsonwebtoken).toBe('^9.0.2');
    expect(backendPackage.dependencies.bcryptjs).toBe('^3.0.2');
    expect(backendPackage.devDependencies['@types/cors']).toBeDefined();
    expect(backendPackage.devDependencies['@types/jsonwebtoken']).toBeDefined();
    const rootPackage = JSON.parse(findFile(result.files, '', 'package.json').content);
    expect(rootPackage.allowScripts).toEqual(expect.objectContaining({
      esbuild: true,
      '@prisma/client': true,
      '@prisma/engines': true,
      prisma: true,
    }));
    const networkApi = findFile(result.files, 'frontend/src/utils', 'api.ts').content;
    expect(networkApi).toContain("import axios from 'axios'");
    expect(networkApi).toContain('axios.create');
    const frontendTsConfig = JSON.parse(findFile(result.files, 'frontend', 'tsconfig.json').content);
    expect(frontendTsConfig.compilerOptions.moduleResolution).toBe('Bundler');
    expect(frontendTsConfig.compilerOptions.types).toContain('vite/client');

    const envExample = findFile(result.files, 'backend', '.env.example');
    expect(envExample.content).toContain('DATABASE_URL=postgresql://');

    const taskRoutes = findFile(result.files, 'backend/src/routes', 'task.routes.ts');
    expect(taskRoutes.content).not.toContain('\\n authMiddleware');
    expect(taskRoutes.content).toContain('router.use(authMiddleware)');

    const authRoutes = findFile(result.files, 'backend/src/routes', 'auth.routes.ts');
    expect(authRoutes.content).toContain("router.post('/register'");
    expect(authRoutes.content).toContain("router.post('/login'");
    expect(authRoutes.content).toContain("router.get('/me', authMiddleware");
    const authMiddleware = findFile(result.files, 'backend/src/middleware', 'auth.middleware.ts');
    expect(authMiddleware.content).toContain('jwtUtil.verify');
    expect(authMiddleware.content).not.toContain('TODO');
    const authController = findFile(result.files, 'backend/src/controllers', 'auth.controller.ts');
    expect(authController.content).toContain('bcrypt.hash');
    expect(authController.content).toContain('bcrypt.compare');
    const schema = findFile(result.files, 'backend/prisma', 'schema.prisma').content;
    expect(schema).toContain('email       String      @unique');
    expect(schema).toContain('password    String');

    const taskService = findFile(result.files, 'backend/src/services', 'task.service.ts');
    expect(taskService.content).toContain("import { taskRepository }");
    expect(taskService.content).toContain('return this.repository.findAll(options)');
    expect(taskService.content).not.toContain('private items:');

    const routesIndex = findFile(result.files, 'backend/src/routes', 'index.ts');
    const functionOffset = routesIndex.content.indexOf('export function setupRoutes');
    expect(routesIndex.content.indexOf("import taskRoutes from './task.routes';")).toBeLessThan(functionOffset);
    expect(routesIndex.content).not.toContain("import userRoutes from './user.routes';");
  });

  it('detects Portuguese domain entities without an AI provider', async () => {
    const result = await codeGenerator.generate({
      projectName: 'GestaoProjetos',
      projectType: ProjectType.BACKEND,
      requirements: {
        description: 'Sistema para gestão de projetos, tarefas, equipes e usuários',
        features: ['Projetos', 'Tarefas', 'Equipes', 'Usuários'],
        tech_stack: { backend: ['node', 'express', 'typescript'], database: 'sqlite' },
      },
      database: { type: 'sqlite', entities: [] },
      api_type: 'rest',
    });

    expect(result.success).toBe(true);
    expect(findFile(result.files, 'backend/src/models', 'project.model.ts')).toBeDefined();
    expect(findFile(result.files, 'backend/src/models', 'task.model.ts')).toBeDefined();
    expect(findFile(result.files, 'backend/src/models', 'team.model.ts')).toBeDefined();
    expect(findFile(result.files, 'backend/src/models', 'user.model.ts')).toBeDefined();
  });

  it.each([
    {
      name: 'analytics dashboard frontend',
      projectType: ProjectType.FRONTEND,
      entities: ['Metric', 'Report'],
      description: 'Dashboard de métricas com gráficos, filtros por período e relatórios',
      features: ['Metric cards', 'Charts', 'Date filters', 'Reports'],
      expectedWorkspace: ['frontend'],
      expectedPrefix: 'frontend/',
      forbiddenPrefix: 'backend/',
    },
    {
      name: 'inventory REST backend',
      projectType: ProjectType.BACKEND,
      entities: ['Product', 'StockMovement'],
      description: 'API REST de estoque com produtos e movimentações usando PostgreSQL',
      features: ['Product CRUD', 'Stock movement CRUD'],
      expectedWorkspace: ['backend'],
      expectedPrefix: 'backend/',
      forbiddenPrefix: 'frontend/',
    },
    {
      name: 'appointment fullstack application',
      projectType: ProjectType.FULLSTACK,
      entities: ['Appointment', 'Customer'],
      description: 'Sistema fullstack de agendamentos com clientes, calendário e SQLite',
      features: ['Appointment CRUD', 'Customer CRUD', 'Calendar'],
      expectedWorkspace: ['frontend', 'backend'],
      expectedPrefix: 'frontend/',
      forbiddenPrefix: '',
    },
  ])('honors the complete workspace contract for $name', async scenario => {
    const usesDatabase = scenario.projectType !== ProjectType.FRONTEND;
    const result = await codeGenerator.generate({
      projectName: scenario.name.replace(/\s+/g, '-'),
      projectType: scenario.projectType,
      entities: scenario.entities,
      requirements: {
        description: scenario.description,
        features: scenario.features,
        tech_stack: {
          frontend: scenario.projectType === ProjectType.BACKEND ? [] : ['react', 'typescript'],
          backend: scenario.projectType === ProjectType.FRONTEND ? [] : ['node', 'express', 'typescript'],
          database: usesDatabase ? 'sqlite' : undefined,
        },
      },
      database: usesDatabase ? { type: 'sqlite', entities: scenario.entities } : undefined,
      api_type: usesDatabase ? 'rest' : undefined,
    });

    expect(result.success).toBe(true);
    expect(result.files.length).toBeGreaterThan(10);
    expect(result.files.every(file => file.content.trim().length > 0)).toBe(true);
    expect(result.files.some(file => `${file.path}/${file.filename}`.startsWith(scenario.expectedPrefix))).toBe(true);
    if (scenario.forbiddenPrefix) {
      expect(result.files.some(file => `${file.path}/${file.filename}`.startsWith(scenario.forbiddenPrefix))).toBe(false);
    }
    assertUniquePaths(result.files);

    for (const generated of result.files.filter(file => file.filename.endsWith('.json'))) {
      expect(() => JSON.parse(generated.content)).not.toThrow();
    }

    if (scenario.projectType !== ProjectType.FRONTEND) {
      const firstEntity = scenario.entities[0]!.toLowerCase();
      const model = findFile(result.files, 'backend/src/models', `${firstEntity}.model.ts`);
      const repository = findFile(result.files, 'backend/src/repositories', `${firstEntity}.repository.ts`);
      const envExample = findFile(result.files, 'backend', '.env.example');
      const descriptionField = scenario.entities[0] === 'Review'
        ? 'description: string;'
        : 'description?: string | null;';
      expect(model.content).toContain(descriptionField);
      expect(repository.content).not.toContain("mode: 'insensitive'");
      expect(envExample.content).toContain('DATABASE_URL=file:./dev.db');
      const backendPackage = JSON.parse(findFile(result.files, 'backend', 'package.json').content);
      expect(backendPackage.scripts['db:setup']).toBe('node scripts/setup-database.js');
      expect(backendPackage.scripts.predev).toBe('npm run db:setup');
      expect(findFile(result.files, 'backend/scripts', 'setup-database.js').content).toContain("fs.openSync(databaseFile, 'a')");
    }

    const rootPackage = JSON.parse(findFile(result.files, '', 'package.json').content);
    expect(rootPackage.workspaces).toEqual(scenario.expectedWorkspace);
    expect(rootPackage.scripts.build).toBe(
      scenario.expectedWorkspace.length === 2
        ? 'npm run build --workspace=frontend && npm run build --workspace=backend'
        : `npm run build --workspace=${scenario.expectedWorkspace[0]}`
    );
  });

  it('keeps Task, Project and Team aligned with the generated CRUD backend', async () => {
    const result = await codeGenerator.generate({
      projectName: 'TeamTasks',
      projectType: ProjectType.FULLSTACK,
      entities: ['Task', 'Project', 'Team'],
      requirements: {
        description: 'Sistema de tarefas, projetos e equipes com SQLite',
        features: ['Task CRUD', 'Project CRUD', 'Team CRUD'],
        tech_stack: { frontend: ['react'], backend: ['express'], database: 'sqlite' },
      },
      database: { type: 'sqlite', entities: ['Task', 'Project', 'Team'] },
      api_type: 'rest',
    });
    const schema = findFile(result.files, 'backend/prisma', 'schema.prisma').content;
    const migration = result.files.find(file => file.filename === 'migration.sql')!.content;
    const seed = findFile(result.files, 'backend/prisma', 'seed.ts').content;
    for (const entity of ['Task', 'Project', 'Team']) {
      expect(schema).toContain(`model ${entity} {`);
      expect(migration).toContain(`"${entity.toLowerCase()}s"`);
    }
    expect(schema).not.toContain('model Category');
    expect(seed).toContain('prisma.task.create');
    expect(seed).toContain('prisma.project.create');
    expect(seed).toContain('prisma.team.create');
  });

  it('keeps domain field nullability aligned between Prisma and TypeScript', async () => {
    const result = await codeGenerator.generate({
      projectName: 'FrameFlow',
      projectType: ProjectType.FULLSTACK,
      entities: ['Review', 'Comment'],
      requirements: {
        description: 'Workspace audiovisual com revisões e comentários por timecode',
        features: ['Version review', 'Timecode comments'],
        tech_stack: { frontend: ['react'], backend: ['express'], database: 'sqlite' },
      },
      database: { type: 'sqlite', entities: ['Review', 'Comment'] },
      api_type: 'rest',
    });

    const schema = findFile(result.files, 'backend/prisma', 'schema.prisma').content;
    const reviewModel = findFile(result.files, 'backend/src/models', 'review.model.ts').content;
    const commentModel = findFile(result.files, 'backend/src/models', 'comment.model.ts').content;

    expect(schema).toMatch(/model Review[\s\S]*description String(?:\s|$)/);
    expect(reviewModel).toContain('description: string;');
    expect(schema).toMatch(/model Comment[\s\S]*description String\?/);
    expect(commentModel).toContain('description?: string | null;');
  });

  it('generates a CRM fullstack workspace with four related domain entities', async () => {
    const result = await codeGenerator.generate({
      projectName: 'Vértice',
      projectType: ProjectType.FULLSTACK,
      entities: ['Contact', 'Company', 'Deal', 'Task'],
      requirements: {
        description: 'CRM fullstack em português com contatos, empresas, negócios, tarefas, dashboard e autenticação',
        features: ['Contact CRUD', 'Company CRUD', 'Deal CRUD', 'Task CRUD', 'Dashboard', 'Authentication'],
        tech_stack: {
          frontend: ['react', 'typescript'],
          backend: ['node', 'express', 'typescript'],
          database: 'sqlite',
        },
        authentication: true,
        testing: true,
      },
      database: { type: 'postgresql', entities: ['Contact', 'Company', 'Deal', 'Task'] },
      authentication: true,
      api_type: 'rest',
      options: {
        language: 'typescript',
        includeTests: true,
        generateTests: true,
        optimizeCode: true,
        analyzeQuality: true,
      },
    });

    expect(result.success).toBe(true);
    assertUniquePaths(result.files);
    expect(findFile(result.files, '', 'package.json')).toBeDefined();
    expect(JSON.parse(findFile(result.files, 'backend', 'package.json').content).name).toBe('vertice-api');
    for (const entity of ['contact', 'company', 'deal', 'task']) {
      expect(findFile(result.files, 'backend/src/models', `${entity}.model.ts`)).toBeDefined();
      expect(findFile(result.files, 'backend/src/routes', `${entity}.routes.ts`)).toBeDefined();
    }
  });
});
