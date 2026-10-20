import { spawn, spawnSync, type ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import AxeBuilder from '@axe-core/playwright';
import { chromium, type Browser } from '@playwright/test';
import { codeGenerator, ProjectType, type GeneratedFile } from '../../src/generation/code-generator';
import { uiGenerator, type GeneratedUIFile } from '../../src/generation/ui-generator';
import { analyzeVisualIntent, visualFingerprint } from '../../src/generation/visual-intent';

const npmCli = process.env['npm_execpath'];
const chromeExecutable = process.env['ORUS_BROWSER_EXECUTABLE'] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

if (!npmCli) throw new Error('npm_execpath is required to run browser E2E tests');

interface BrowserScenario {
  name: string;
  prompt: string;
  entities: string[];
  features: string[];
  generationType?: 'LANDING_PAGE';
  expectedArchetype: string;
  expectedExperience?: string;
}

interface MaterializedFile {
  path: string;
  content: string;
  filename?: string;
  name?: string;
}

interface BrowserSignature {
  name: string;
  fingerprint: string;
  shell: string;
  action: string;
  experience: string;
  primaryView: string;
  landingVariant: string;
  primaryColor: string;
}

const scenarios: BrowserScenario[] = [
  {
    name: 'landing-luxury',
    prompt: 'Landing page premium de luxo para a joalheria Aurea, escura, dourada, editorial, exatamente quatro seções',
    entities: ['Collection'],
    features: ['Hero editorial', 'Coleções', 'Método', 'Contato'],
    generationType: 'LANDING_PAGE',
    expectedArchetype: 'commerce',
  },
  {
    name: 'clinic-care',
    prompt: 'Clínica Serena para pacientes, agenda e continuidade do cuidado, tema claro verde, split view e ação junto ao conteúdo',
    entities: ['Patient', 'Appointment', 'CarePlan'],
    features: ['Patient records', 'Appointment calendar', 'Care plan workflow'],
    expectedArchetype: 'healthcare',
  },
  {
    name: 'crm-revenue',
    prompt: 'CRM Atlas com pipeline comercial kanban, oportunidades, contatos e receita, menu lateral compacto e barra de comandos',
    entities: ['Company', 'Contact', 'Deal', 'Activity'],
    features: ['Sales pipeline', 'Contact relationship', 'Activity workflow'],
    expectedArchetype: 'crm',
  },
  {
    name: 'finance-ledger',
    prompt: 'Fintech Lume para transações, faturas e clientes, ledger denso, tema claro azul marinho e navegação superior',
    entities: ['Transaction', 'Invoice', 'Customer'],
    features: ['Transaction ledger', 'Invoice workflow', 'Financial overview'],
    expectedArchetype: 'finance',
  },
  {
    name: 'field-command',
    prompt: 'Dashboard operacional Terra para ordens de serviço em campo, equipes, inspeções e incidentes, central de comando com rail compacto',
    entities: ['WorkOrder', 'Crew', 'Inspection', 'Incident'],
    features: ['Work order workflow', 'Crew dispatch', 'Inspection timeline'],
    expectedArchetype: 'dashboard',
  },
  {
    name: 'marketplace-catalog',
    prompt: 'Marketplace Brisa com catálogo, vendedores, pedidos e checkout, mobile-first coral com navegação inferior e cards de produto',
    entities: ['Product', 'Seller', 'Order', 'Category'],
    features: ['Product catalog', 'Seller management', 'Order workflow'],
    expectedArchetype: 'commerce',
  },
  {
    name: 'content-studio',
    prompt: 'Estúdio editorial Prisma para pautas, autores, publicações e calendário de conteúdo, canvas imersivo cobalto e galeria',
    entities: ['Story', 'Author', 'Publication', 'Campaign'],
    features: ['Editorial calendar', 'Publication workflow', 'Author collaboration'],
    expectedArchetype: 'creative',
  },
  {
    name: 'talent-recruiting',
    prompt: 'Sistema Talento Vivo com vagas, candidatos, processo seletivo e entrevistas',
    entities: ['JobOpening', 'Candidate', 'Application', 'Interview'],
    features: ['Job catalog', 'Candidate directory', 'Hiring pipeline', 'Interview calendar'],
    expectedArchetype: 'generic',
    expectedExperience: 'talent-hub',
  },
  {
    name: 'learning-campus',
    prompt: 'Plataforma Aprende+ com catálogo de cursos, matrículas, progresso de aprendizagem e avaliações acadêmicas',
    entities: ['Course', 'Lesson', 'Student', 'Enrollment', 'Assessment'],
    features: ['Course catalog', 'Enrollment workflow', 'Learning progress', 'Assessments'],
    expectedArchetype: 'generic',
    expectedExperience: 'learning-campus',
  },
  {
    name: 'logistics-network',
    prompt: 'Aplicação Rota Clara para remessas e entregas, gestão de frota, planejamento de rotas e rastreamento logístico',
    entities: ['Shipment', 'Delivery', 'Vehicle', 'DeliveryRoute', 'TrackingEvent'],
    features: ['Shipment workflow', 'Fleet directory', 'Route planning', 'Tracking timeline'],
    expectedArchetype: 'generic',
    expectedExperience: 'logistics-control',
  },
  {
    name: 'live-event',
    prompt: 'Aplicativo Festival Vivo com programação de eventos, ingressos e inscrições e credenciamento',
    entities: ['Event', 'EventSession', 'Ticket', 'Attendee', 'CheckIn'],
    features: ['Event schedule', 'Ticket workflow', 'Attendee directory', 'Check-in'],
    expectedArchetype: 'generic',
    expectedExperience: 'event-stage',
  },
  {
    name: 'restaurant-service',
    prompt: 'Sistema Mesa Autoral com reservas de mesas, cardápio, pedidos do restaurante e painel da cozinha',
    entities: ['Reservation', 'Guest', 'MenuItem', 'RestaurantOrder', 'KitchenTicket'],
    features: ['Reservation calendar', 'Menu catalog', 'Order workflow', 'Kitchen queue'],
    expectedArchetype: 'generic',
    expectedExperience: 'hospitality-service',
  },
];

function targetPath(root: string, file: MaterializedFile): string {
  const filename = file.filename || file.name;
  if (!filename) throw new Error(`Generated file has no filename: ${file.path}`);
  const target = path.resolve(root, file.path || '', filename);
  const relative = path.relative(root, target);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Generated path escapes project root: ${file.path}/${filename}`);
  return target;
}

async function materialize(root: string, files: MaterializedFile[]): Promise<void> {
  for (const file of files) {
    const target = targetPath(root, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, file.content, 'utf8');
  }
}

function runNpm(args: string[], cwd: string): void {
  const result = spawnSync(process.execPath, [npmCli!, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CI: '1' },
    timeout: args[0] === 'install' ? 600000 : 240000,
  });
  if (result.status !== 0) {
    throw new Error([`npm ${args.join(' ')} failed in ${cwd}`, result.error?.stack, result.stdout, result.stderr].filter(Boolean).join('\n'));
  }
}

async function waitForUrl(url: string, child: ChildProcess): Promise<void> {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Preview exited with ${child.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Preview did not become ready: ${url}`);
}

async function stopProcessTree(child: ChildProcess): Promise<void> {
  if (!child.pid || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { encoding: 'utf8', windowsHide: true });
  } else {
    child.kill('SIGTERM');
  }
}

async function generateScenario(scenario: BrowserScenario): Promise<{ files: Array<GeneratedFile | GeneratedUIFile>; fingerprint: string; archetype: string }> {
  if (scenario.generationType === 'LANDING_PAGE') {
    const result = await uiGenerator.generate({
      framework: 'react',
      generationType: 'LANDING_PAGE',
      entities: scenario.entities,
      requirements: {
        description: scenario.prompt,
        features: scenario.features,
        tech_stack: { frontend: ['react', 'typescript'] },
      },
    });
    if (!result.success || !result.metadata.visualIntent) throw new Error(`UI generation failed: ${scenario.name}`);
    return {
      files: result.files,
      fingerprint: visualFingerprint(result.metadata.visualIntent),
      archetype: result.metadata.visualIntent.archetype,
    };
  }

  const result = await codeGenerator.generate({
    projectName: scenario.name,
    projectType: ProjectType.FRONTEND,
    entities: scenario.entities,
    requirements: {
      description: scenario.prompt,
      features: scenario.features,
      tech_stack: { frontend: ['react', 'typescript'] },
    },
  });
  if (!result.success) throw new Error(`Code generation failed: ${scenario.name}`);
  const visualIntent = analyzeVisualIntent(scenario.prompt);
  return {
    files: result.files,
    fingerprint: visualFingerprint(visualIntent),
    archetype: visualIntent.archetype,
  };
}

describe('Generated interface browser matrix', () => {
  let browser: Browser;
  const roots: string[] = [];
  const signatures: BrowserSignature[] = [];

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await fs.access(chromeExecutable);
    browser = await chromium.launch({ headless: true, executablePath: chromeExecutable });
  });

  afterAll(async () => {
    await browser?.close();
    for (const root of roots) {
      const relative = path.relative(os.tmpdir(), root);
      if (!relative.startsWith('orus-browser-') || relative.includes(path.sep)) throw new Error(`Unsafe temporary directory: ${root}`);
      await fs.rm(root, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
    }
    jest.restoreAllMocks();
  });

  it.each(scenarios)('renders $name as a responsive and accessible production build', async scenario => {
    const generated = await generateScenario(scenario);
    expect(generated.archetype).toBe(scenario.expectedArchetype);

    const root = await fs.mkdtemp(path.join(os.tmpdir(), `orus-browser-${scenario.name}-`));
    roots.push(root);
    await materialize(root, generated.files);
    runNpm(['install', '--prefer-offline', '--no-audit', '--no-fund'], root);
    runNpm(['run', 'build'], root);

    const port = 43220 + scenarios.indexOf(scenario);
    const preview = spawn(process.execPath, [npmCli!, 'run', 'preview', '--workspace=frontend', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
      cwd: root,
      env: { ...process.env, CI: '1' },
      stdio: 'ignore',
      windowsHide: true,
    });
    const url = `http://127.0.0.1:${port}`;

    try {
      await waitForUrl(url, preview);
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const pageErrors: string[] = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.route('**/api/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) }));
      const response = await page.goto(url, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      expect(pageErrors).toEqual([]);
      expect(await page.locator('h1').count()).toBeGreaterThan(0);
      expect(await page.locator('body').innerText()).not.toHaveLength(0);

      const desktopOverflow = await page.evaluate<number>('document.documentElement.scrollWidth - document.documentElement.clientWidth');
      expect(desktopOverflow).toBeLessThanOrEqual(2);
      expect((await page.screenshot({ fullPage: true })).byteLength).toBeGreaterThan(10000);

      const signature = await page.evaluate<Omit<BrowserSignature, 'name' | 'fingerprint'>>(`(() => {
        const shell = document.querySelector('[data-shell]');
        const experience = document.querySelector('[data-experience-pattern]');
        const landing = document.querySelector('[data-landing-variant]');
        return {
          shell: shell?.dataset.shell || '',
          action: shell?.dataset.actionPlacement || '',
          experience: experience?.dataset.experiencePattern || '',
          primaryView: experience?.dataset.primaryView || '',
          landingVariant: landing?.dataset.landingVariant || '',
          primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--orus-primary').trim(),
        };
      })()`);
      if (scenario.expectedExperience) expect(signature.experience).toBe(scenario.expectedExperience);
      signatures.push({ name: scenario.name, fingerprint: generated.fingerprint, ...signature });

      const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const blockingViolations = accessibility.violations
        .filter(violation => violation.impact === 'critical' || violation.impact === 'serious')
        .map(violation => ({ id: violation.id, targets: violation.nodes.map(node => node.target) }));
      expect(blockingViolations).toEqual([]);

      await page.setViewportSize({ width: 390, height: 844 });
      await page.reload({ waitUntil: 'networkidle' });
      expect(pageErrors).toEqual([]);
      const mobileOverflow = await page.evaluate<number>('document.documentElement.scrollWidth - document.documentElement.clientWidth');
      expect(mobileOverflow).toBeLessThanOrEqual(2);
      expect((await page.screenshot({ fullPage: true })).byteLength).toBeGreaterThan(5000);
      await context.close();
    } finally {
      await stopProcessTree(preview);
    }
  }, 900000);

  it('produces materially distinct visual and composition signatures', () => {
    expect(signatures).toHaveLength(scenarios.length);
    expect(new Set(signatures.map(signature => signature.fingerprint)).size).toBe(scenarios.length);
    expect(new Set(signatures.map(signature => [
      signature.shell,
      signature.action,
      signature.experience,
      signature.primaryView,
      signature.landingVariant,
      signature.primaryColor,
    ].join(':'))).size).toBeGreaterThanOrEqual(6);
  });
});
