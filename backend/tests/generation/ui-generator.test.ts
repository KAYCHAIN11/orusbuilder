import { uiGenerator, UIGenerationInput } from '../../src/generation/ui-generator';
import { ProductBlueprintPlanner } from '../../src/blueprint/product-blueprint';

const baseInput: UIGenerationInput = {
  framework: 'react',
  requirements: {
    description: 'Interface moderna e responsiva',
    features: [],
    tech_stack: { frontend: ['react', 'typescript'] },
  },
  entities: ['produto'],
};

const filePaths = (files: Array<{ path: string; name: string }>) =>
  files.map((file) => [file.path, file.name].filter(Boolean).join('/'));

describe('UIGenerator specialized packages', () => {
  it('creates a complete buildable landing-page workspace', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      generationType: 'LANDING_PAGE',
    });
    const paths = filePaths(result.files);

    expect(result.success).toBe(true);
    expect(paths).toEqual(expect.arrayContaining([
      'package.json',
      'frontend/package.json',
      'frontend/tsconfig.json',
      'frontend/index.html',
      'frontend/src/index.tsx',
      'frontend/src/App.tsx',
      'frontend/src/pages/LandingPage.tsx',
      '.orus/visual-assets.json',
      'frontend/public/brand-mark.svg',
      'frontend/public/visual-card.svg',
    ]));
    expect(paths.some((path) => path.includes('ListPage'))).toBe(false);
    expect(result.metadata.visualIntent?.style).toBe('premium');
    expect(result.metadata.componentPlan).toEqual(expect.arrayContaining(['hero', 'cta']));
    expect(result.metadata.visualAudit?.checks['assetProvenance']).toBe(true);
    expect(result.files.some(file => file.content.includes('https://placehold.co'))).toBe(false);
  });

  it('turns visual language in the prompt into an applied design system', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      generationType: 'LANDING_PAGE',
      requirements: {
        ...baseInput.requirements,
        description: 'Landing page de luxo para uma joalheria chamada Aurea, escura e dourada',
      },
    });
    const landing = result.files.find(file => file.name === 'LandingPage.tsx');
    const tailwind = result.files.find(file => file.name === 'tailwind.config.js');

    expect(result.metadata.visualIntent?.palette.name).toBe('obsidian-gold');
    expect(landing?.content).toContain('Aurea');
    expect(landing?.content).toContain('from-black via-neutral-950 to-amber-950');
    expect(landing?.content).toContain('bg-amber-500 hover:bg-amber-400 text-neutral-950');
    expect(landing?.content).toContain('data-landing-variant="editorial"');
    expect(landing?.content).toContain('Peças que atravessam o tempo');
    expect(tailwind?.content).toContain("display: ['Playfair Display'");
  });

  it('creates an asymmetric editorial composition for a luxury brand', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      generationType: 'LANDING_PAGE',
      requirements: {
        ...baseInput.requirements,
        description: 'Landing page editorial de luxo para a joalheria chamada Maison Aurea, escura, dourada e sofisticada',
      },
    });
    const landing = result.files.find(file => file.name === 'LandingPage.tsx');

    expect(result.metadata.visualIntent).toMatchObject({ style: 'luxury', archetype: 'commerce' });
    expect(landing?.content).toContain('data-landing-variant="editorial"');
    expect(landing?.content).toContain('lg:text-[7.4rem]');
    expect(landing?.content).toContain('Selected work');
    expect(landing?.content).toContain('Peças que atravessam o tempo');
    expect(landing?.content).toContain('Agende uma apresentação privada');
  });

  it('creates a product showcase composition for an expressive commerce brand', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      generationType: 'LANDING_PAGE',
      requirements: {
        ...baseInput.requirements,
        description: 'Landing page divertida e vibrante para a loja de skincare chamada VIVA, com catálogo e cores coral e laranja',
      },
    });
    const landing = result.files.find(file => file.name === 'LandingPage.tsx');

    expect(result.metadata.visualIntent).toMatchObject({ style: 'playful', archetype: 'commerce' });
    expect(landing?.content).toContain('data-landing-variant="showcase"');
    expect(landing?.content).toContain('Cuidado gostoso de usar');
    expect(landing?.content).toContain('Montar meu ritual');
    expect(landing?.content).toContain('Ativos que fazem sentido');
    expect(landing?.content).toContain("item === 1 ? '-rotate-3'");
    expect(landing?.content).toContain('from-stone-950 via-orange-950 to-rose-900 text-white');
  });

  it('creates a product-led trust composition for a healthcare service', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      generationType: 'LANDING_PAGE',
      requirements: {
        ...baseInput.requirements,
        description: 'Landing page acolhedora e premium para a clínica chamada Serena, com tema claro em verde e teal e cuidado contínuo',
      },
    });
    const landing = result.files.find(file => file.name === 'LandingPage.tsx');

    expect(result.metadata.visualIntent).toMatchObject({ archetype: 'healthcare', colorMode: 'light' });
    expect(landing?.content).toContain('data-landing-variant="product"');
    expect(landing?.content).toContain('Cuidado que começa antes da consulta');
    expect(landing?.content).toContain('Live workspace');
    expect(landing?.content).toContain('Cuidado contínuo');
  });

  it('creates a four-section architecture landing from the requested identity', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      generationType: 'LANDING_PAGE',
      requirements: {
        ...baseInput.requirements,
        description: 'Landing editorial para a Casa Aurora, estúdio de arquitetura sustentável, tema claro em areia, terracota e verde oliva, com exatamente quatro seções.',
      },
    });
    const landing = result.files.find(file => file.name === 'LandingPage.tsx');

    expect(result.metadata.visualIntent).toMatchObject({
      brandName: 'Casa Aurora',
      palette: { name: 'earth-atelier' },
      typography: { display: 'Playfair Display' },
    });
    expect(landing?.content).toContain('Espaços que respiram com o lugar');
    expect(landing?.content).toContain('Casa Pátio');
    expect(landing?.content?.match(/<section/g)).toHaveLength(4);
    expect(landing?.content).not.toContain('prêmios de design');
  });

  it('preserves the product, palette and requested sections of an automation landing page', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      generationType: 'LANDING_PAGE',
      requirements: {
        ...baseInput.requirements,
        description: 'Crie uma landing page premium para a NEXA, uma plataforma de automação com inteligência artificial. Use tema escuro e gradientes violeta e azul. Inclua benefícios para automação inteligente, decisões orientadas por dados e integrações. Mostre como funciona em três passos.',
      },
    });
    const landing = result.files.find(file => file.name === 'LandingPage.tsx');

    expect(result.metadata.visualIntent).toMatchObject({
      brandName: 'NEXA',
      style: 'premium',
      colorMode: 'dark',
    });
    expect(result.metadata.visualIntent?.evidence).toContain('palette:explicit-blue');
    expect(landing?.content).toContain('NEXA');
    expect(landing?.content).toContain('Automação inteligente');
    expect(landing?.content).toContain('Decisões orientadas por dados');
    expect(landing?.content).toContain('Integrações sem atrito');
    expect(landing?.content).toContain('Da ideia à automação em três passos');
    expect(landing?.content).toContain('id="process"');
    expect(landing?.content).not.toContain('Orus Studio');
  });

  it('creates only one domain component plus its runnable preview scaffold', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      generationType: 'COMPONENT',
    });
    const paths = filePaths(result.files);
    const domainComponents = paths.filter((path) => path.startsWith('frontend/src/components/'));

    expect(result.success).toBe(true);
    expect(paths).toContain('package.json');
    expect(paths).toContain('frontend/package.json');
    expect(domainComponents).toEqual(['frontend/src/components/ProdutoCard.tsx']);
    expect(paths.some((path) => path.includes('/pages/'))).toBe(false);
  });

  it('unwraps the backend response envelope in the generated dashboard', async () => {
    const result = await uiGenerator.generate(baseInput);
    const home = result.files.find(file => file.name === 'HomePage.tsx');
    const navbar = result.files.find(file => file.name === 'Navbar.tsx');
    const layout = result.files.find(file => file.name === 'Layout.tsx');

    expect(home?.content).toContain('response.data?.data');
    expect(navbar?.content).toContain('data-navigation=');
    expect(layout?.content).toContain('data-shell=');
    expect(layout?.content).toContain('data-screen-layout={screenLayout}');
    expect(layout?.content).toContain('const SCREEN_LAYOUTS: readonly ScreenLayoutEntry[] = []');
  });

  it('generates functional local CRUD persistence for frontend-only previews', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      persistence: 'local',
      entities: ['patient'],
      requirements: {
        ...baseInput.requirements,
        description: 'Aplicação Clinia para cadastrar e acompanhar pacientes',
      },
    });
    const api = result.files.find(file => file.name === 'api.ts');
    const form = result.files.find(file => file.name === 'PatientForm.tsx');
    const list = result.files.find(file => file.name === 'PatientList.tsx');
    const app = result.files.find(file => file.name === 'App.tsx');
    const detail = result.files.find(file => file.name === 'PatientDetailPage.tsx');

    expect(api?.content).toContain("const storageKey = (resource: string) => 'orus:' + resource");
    expect(api?.content).toContain('localStorage.setItem');
    expect(api?.content).toContain('post(path: string, payload: any)');
    expect(api?.content).toContain('delete(path: string)');
    expect(api?.content).toContain('globalThis.crypto?.randomUUID?.()');
    expect(api?.content).not.toContain('Math.random()');
    expect(api?.content).not.toContain("import axios from 'axios'");
    expect(form?.content).toContain('Nome');
    expect(form?.content).toContain('Salvar Paciente');
    expect(form?.content).toContain('Não foi possível salvar. Tente novamente.');
    expect(form?.content).toContain("api.put('/api/patients/' + id, formData)");
    expect(list?.content).toContain('Buscar pacientes...');
    expect(filePaths(result.files)).toContain('frontend/src/pages/PatientEditPage.tsx');
    expect(app?.content).toContain('path="/patients/:id/edit"');
    expect(detail?.content).toContain("active: 'Ativo'");
  });

  it('keeps the network API client for fullstack generation', async () => {
    const result = await uiGenerator.generate({ ...baseInput, persistence: 'api' });
    const api = result.files.find(file => file.name === 'api.ts');

    expect(api?.content).toContain("import axios from 'axios'");
    expect(api?.content).toContain('axios.create');
    expect(api?.content).not.toContain('const storageKey');
  });

  it('localizes CRM entities and keeps native controls aligned with the generated palette', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      entities: ['contact', 'company', 'deal', 'task'],
      persistence: 'api',
      requirements: {
        ...baseInput.requirements,
        description: 'CRM Vértice em português com interface clara, contatos, empresas, negócios e tarefas',
      },
    });
    const navbar = result.files.find(file => file.name === 'Navbar.tsx');
    const form = result.files.find(file => file.name === 'ContactForm.tsx');
    const detail = result.files.find(file => file.name === 'ContactDetailPage.tsx');
    const theme = result.files.find(file => file.name === 'theme.css');
    const manifest = JSON.parse(result.files.find(file => file.name === 'design-system.json')?.content || '{}');
    const home = result.files.find(file => file.name === 'HomePage.tsx');
    const pipeline = result.files.find(file => file.name === 'DealList.tsx');
    const dealForm = result.files.find(file => file.name === 'DealForm.tsx');
    const pageChannels = String(manifest.visualIntent?.palette?.cssPage || '').split(/\s+/).map(Number);
    const expectedScheme = pageChannels.reduce((sum: number, channel: number) => sum + channel, 0) / pageChannels.length >= 128
      ? 'light'
      : 'dark';

    expect(navbar?.content).toContain('Contatos');
    expect(navbar?.content).toContain('Empresas');
    expect(navbar?.content).toContain('Negócios');
    expect(form?.content).toContain('Salvar Contato');
    expect(form?.content).toContain('bg-[rgb(var(--orus-panel))]');
    expect(detail?.content).toContain('api.get(`/api/contacts/${id}`)');
    expect(detail?.content).toContain('api.delete(`/api/contacts/${id}`)');
    expect(theme?.content).toContain(`color-scheme: ${expectedScheme}`);
    expect(manifest.visualIntent).toMatchObject({
      archetype: 'crm',
      experience: { pattern: 'revenue-pipeline', primaryDataView: 'kanban' },
    });
    expect(['revenue-emerald', 'trust-blue', 'ink-paper']).toContain(manifest.visualIntent.palette.name);
    expect(home?.content).toContain('Radar comercial');
    expect(home?.content).toContain('Previsão de receita');
    expect(pipeline?.content).toContain('Pipeline comercial');
    expect(pipeline?.content).toContain("['negotiation', 'Negociação']");
    expect(pipeline?.content).toContain("['lost', 'Perdido']");
    expect(dealForm?.content).toContain('Etapa do funil');
    expect(dealForm?.content).toContain('Probabilidade (%)');
    expect(dealForm?.content).toContain('Previsão de fechamento');
  });

  it('composes healthcare and CRM with different structures and domain fields', async () => {
    const crm = await uiGenerator.generate({
      ...baseInput,
      entities: ['contact', 'company', 'deal', 'task'],
      requirements: { ...baseInput.requirements, description: 'CRM para equipe comercial com pipeline de vendas e oportunidades' },
    });
    const healthcare = await uiGenerator.generate({
      ...baseInput,
      entities: ['patient', 'appointment'],
      requirements: { ...baseInput.requirements, description: 'Sistema para clínica com pacientes, agenda e atendimentos' },
    });
    const crmList = crm.files.find(file => file.name === 'DealList.tsx');
    const clinicList = healthcare.files.find(file => file.name === 'AppointmentList.tsx');
    const patientForm = healthcare.files.find(file => file.name === 'PatientForm.tsx');
    const appointmentForm = healthcare.files.find(file => file.name === 'AppointmentForm.tsx');

    expect(crmList?.content).toContain('Pipeline comercial');
    expect(crmList?.content).toContain('stageDeals');
    expect(clinicList?.content).toContain('Agenda clínica');
    expect(clinicList?.content).toContain('toLocaleTimeString');
    expect(crmList?.content).not.toBe(clinicList?.content);
    expect(patientForm?.content).toContain('Data de nascimento');
    expect(patientForm?.content).toContain('Observações clínicas');
    expect(appointmentForm?.content).toContain('Data e horário');
    expect(appointmentForm?.content).toContain('Profissional');
  });

  it('materializes and applies a prompt-driven design system to a full application', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      requirements: {
        ...baseInput.requirements,
        description: 'Dashboard minimalista para produtos chamado Atlas, com menu lateral compacto',
      },
    });
    const manifest = result.files.find(file => file.path === '.orus' && file.name === 'design-system.json');
    const theme = result.files.find(file => file.name === 'theme.css');
    const navbar = result.files.find(file => file.name === 'Navbar.tsx');
    const home = result.files.find(file => file.name === 'HomePage.tsx');

    expect(result.metadata.visualIntent).toMatchObject({
      style: 'minimal',
      navigation: 'sidebar',
      density: 'compact',
      brandName: 'Atlas',
    });
    expect(JSON.parse(manifest?.content || '{}')).toMatchObject({
      schemaVersion: '2.0.0',
      constraints: { rawColorsAllowed: false },
    });
    expect(theme?.content).toContain('--orus-primary: 17 24 39');
    expect(navbar?.content).toContain('fixed inset-y-0 left-0');
    expect(navbar?.content).toContain('Atlas');
    expect(navbar?.content).toContain('data-navigation="compact-rail"');
    expect(navbar?.content).toContain('fixed inset-x-0 bottom-0');
    expect(home?.content).toContain('bg-[rgb(var(--orus-panel))]');
    expect(home?.content).not.toContain('bg-white');
  });

  it.each([
    ['Sistema clínico Serena com split view, ação junto ao conteúdo, agenda e pacientes', 'split-workspace', 'inline', 'data-navigation="split-workspace"'],
    ['Loja Vitta mobile-first com tabs inferiores, botão flutuante, catálogo e pedidos', 'bottom-navigation', 'floating', 'data-navigation="bottom-tabs"'],
    ['Estúdio criativo Prisma imersivo em canvas com ação no menu e portfólio', 'canvas', 'navigation', 'data-navigation="floating-canvas"'],
    ['Dashboard financeiro Ledger com menu lateral compacto, barra de comandos e transações', 'compact-rail', 'command-bar', 'data-navigation="compact-rail"'],
    ['SaaS Orbit com navegação superior, ação junto ao conteúdo, tarefas e equipe', 'top-navigation', 'inline', 'data-navigation="top-navigation"'],
    ['CRM Vértice com sidebar, botão flutuante, contatos e pipeline', 'sidebar-workspace', 'floating', 'data-navigation="sidebar-workspace"'],
  ])('generates a distinct application composition from the prompt: %s', async (description, shell, actionPlacement, navigationMarker) => {
    const result = await uiGenerator.generate({
      ...baseInput,
      requirements: { ...baseInput.requirements, description },
    });
    const navbar = result.files.find(file => file.name === 'Navbar.tsx');
    const layout = result.files.find(file => file.name === 'Layout.tsx');
    const home = result.files.find(file => file.name === 'HomePage.tsx');
    const experiencePlan = JSON.parse(result.files.find(file => file.name === 'experience-plan.json')?.content || '{}');

    expect(result.metadata.visualIntent?.composition).toMatchObject({ shell, actionPlacement });
    expect(result.metadata.visualAudit?.checks['compositionContract']).toBe(true);
    expect(navbar?.content).toContain(navigationMarker);
    expect(layout?.content).toContain(`data-shell="${shell}"`);
    expect(home?.content).toContain(`data-action-placement="${actionPlacement}"`);
    expect(experiencePlan.composition).toMatchObject({ shell, actionPlacement });
  });

  it('generates brand identity first and composes different domain experiences', async () => {
    const finance = await uiGenerator.generate({
      ...baseInput,
      entities: ['transaction'],
      requirements: {
        ...baseInput.requirements,
        description: 'Fintech chamada Ledger com investimentos, transações e visão patrimonial',
      },
    });
    const healthcare = await uiGenerator.generate({
      ...baseInput,
      entities: ['appointment'],
      requirements: {
        ...baseInput.requirements,
        description: 'Plataforma Clinia para clínicas, agenda, pacientes e prontuários',
      },
    });
    const financeHome = finance.files.find(file => file.name === 'HomePage.tsx');
    const healthcareHome = healthcare.files.find(file => file.name === 'HomePage.tsx');
    const identity = finance.files.find(file => file.path === '.orus' && file.name === 'brand-identity.json');
    const experience = healthcare.files.find(file => file.path === '.orus' && file.name === 'experience-plan.json');

    expect(filePaths(finance.files)).toEqual(expect.arrayContaining([
      '.orus/brand-identity.json', '.orus/experience-plan.json', '.orus/design-system.json',
    ]));
    expect(JSON.parse(identity?.content || '{}')).toMatchObject({
      brandName: 'Ledger',
      archetype: 'finance',
      identity: { promise: expect.any(String) },
    });
    expect(JSON.parse(experience?.content || '{}')).toMatchObject({
      experience: { pattern: 'care-hub', primaryDataView: 'calendar' },
    });
    expect(financeHome?.content).toContain('Visão financeira');
    expect(financeHome?.content).toContain('Tendência financeira');
    expect(healthcareHome?.content).toContain('Central de cuidado');
    expect(healthcareHome?.content).toContain('Agenda de hoje');
    expect(financeHome?.content).not.toBe(healthcareHome?.content);
  });

  it('does not create CRUD pages from generic product or clinic wording', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      entities: undefined,
      requirements: {
        ...baseInput.requirements,
        description: 'Aplicação Clinia para uma clínica moderna. O produto deve ter agenda e pacientes.',
      },
    });
    const paths = filePaths(result.files);

    expect(paths).toContain('frontend/src/pages/ScheduleListPage.tsx');
    expect(paths).toContain('frontend/src/pages/PatientListPage.tsx');
    expect(paths).not.toContain('frontend/src/pages/ProductListPage.tsx');
    expect(paths).not.toContain('frontend/src/pages/ClinicListPage.tsx');
  });

  it('connects generated authentication pages to the backend response contract', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      requirements: {
        ...baseInput.requirements,
        description: 'Aplicação com login, cadastro e autenticação JWT',
        features: ['autenticação', 'registro de usuário'],
      },
    });
    const paths = filePaths(result.files);
    const app = result.files.find(file => file.name === 'App.tsx');
    const login = result.files.find(file => file.name === 'LoginPage.tsx');
    const register = result.files.find(file => file.name === 'RegisterPage.tsx');
    const authContext = result.files.find(file => file.name === 'AuthContext.tsx');
    const authHook = result.files.find(file => file.name === 'useAuth.ts');
    const navbar = result.files.find(file => file.name === 'Navbar.tsx');

    expect(paths).toContain('frontend/src/pages/RegisterPage.tsx');
    expect(app?.content).toContain('path="/register"');
    expect(app?.content).toContain('<AuthProvider>');
    expect(app?.content).toContain('<Router>');
    expect(app?.content).not.toContain('v7_startTransition');
    expect(app?.content).toContain('<ProtectedRoute>');
    expect(app?.content).toContain('<Navigate to="/login" replace />');
    expect(login?.content).toContain('await login(email, password)');
    expect(login?.content).toContain('Bem-vindo de volta');
    expect(login?.content).toContain("'Entrar'");
    expect(register?.content).toContain('await register(email, password, name)');
    expect(register?.content).toContain('Crie sua conta');
    expect(navbar?.content).toContain('LogoutButton');
    expect(navbar?.content).toContain('Sair');
    expect(authHook?.content).toContain("export { useAuth } from '../contexts/AuthContext'");
    expect(authContext?.content).toContain("api.post('/api/auth/login'");
    expect(authContext?.content).toContain("api.post('/api/auth/register'");
    expect(authContext?.content).toContain("api.get('/api/auth/me'");
    expect(authContext?.content).toContain('res.data.data');
    expect(authContext?.content).toContain("import.meta.env.VITE_ORUS_PREVIEW_MODE === 'true'");
    expect(authContext?.content).toContain("id: 'orus-preview-user'");
    expect(authContext?.content).toContain('if (previewMode) return');
    expect(app?.content).toContain('return previewMode || isAuthenticated');
    expect(app?.content).toContain('previewMode ? <Navigate to="/" replace /> : <LoginPage />');
  });

  it('uses the same plural resource contract across routes, navigation and API calls', async () => {
    const result = await uiGenerator.generate({
      ...baseInput,
      entities: ['Company', 'Activity', 'WorkOrder'],
    });
    const app = result.files.find(file => file.name === 'App.tsx');
    const hooks = result.files.find(file => file.name === 'useApi.ts');
    const companyForm = result.files.find(file => file.name === 'CompanyForm.tsx');
    const workOrderForm = result.files.find(file => file.name === 'WorkOrderForm.tsx');

    expect(app?.content).toContain('path="/companies"');
    expect(app?.content).toContain('path="/activities"');
    expect(app?.content).toContain('path="/work-orders"');
    expect(hooks?.content).toContain("api.get('/api/companies')");
    expect(hooks?.content).toContain("api.get('/api/activities')");
    expect(hooks?.content).toContain("api.get('/api/work-orders')");
    expect(companyForm?.content).toContain("api.post('/api/companies'");
    expect(workOrderForm?.content).toContain("api.post('/api/work-orders'");
    expect(app?.content).not.toContain('/companys');
  });

  it('uses backend-calculated summaries for computed Blueprint capabilities', async () => {
    const productBlueprint = await new ProductBlueprintPlanner().create({
      prompt: 'Sistema operacional com relatórios e análises de indicadores',
    });
    const result = await uiGenerator.generate({
      ...baseInput,
      entities: ['Report'],
      persistence: 'api',
      productBlueprint,
      requirements: {
        ...baseInput.requirements,
        description: productBlueprint.product.summary,
        features: productBlueprint.capabilities.map(capability => capability.name),
      },
    });
    const computedPage = result.files.find(file => file.content.includes('/insights/summary'));

    expect(computedPage?.content).toContain("Promise.all([api.get('/api/reports')");
    expect(computedPage?.content).toContain('summary?.numericTotals');
    expect(computedPage?.content).toContain('summary?.byState');
  });

  it('materializes structurally different commerce layouts from the Blueprint', async () => {
    const productBlueprint = await new ProductBlueprintPlanner().create({
      prompt: 'Marketplace Aurora com catálogo, carrinho, checkout, pagamentos Pix, Stripe, integrações e pedidos',
    });
    const result = await uiGenerator.generate({
      ...baseInput,
      productBlueprint,
      persistence: 'api',
      entities: productBlueprint.data.map(entity => entity.name),
      requirements: {
        ...baseInput.requirements,
        description: productBlueprint.product.summary,
        features: productBlueprint.capabilities.map(capability => capability.name),
      },
    });
    const page = (route: string) => {
      const screen = productBlueprint.screens.find(item => item.route === route)!;
      return result.files.find(file => file.content.includes(`data-blueprint-screen="${screen.id}"`))?.content || '';
    };
    const home = result.files.find(file => file.name === 'HomePage.tsx')?.content || '';
    expect(home).toContain('data-experience-pattern="commerce-pulse"');
    expect(home).toContain('Conversão em movimento');
    expect(page('/checkout')).toContain('lg:grid-cols-[1fr_340px]');
    expect(page('/payments')).toContain('Operação financeira');
    expect(page('/integrations')).toContain('Configurar');
    expect(new Set(['/', '/checkout', '/payments', '/integrations'].map(route => page(route))).size).toBe(4);
  });

  it.each([
    ['recruiting', 'Sistema Talento Vivo com vagas, candidatos, processo seletivo em pipeline e entrevistas.', ['/jobs', '/candidates', '/hiring', '/interviews'], ['catalog', 'directory', 'kanban', 'calendar'], 'talent-hub'],
    ['education', 'Plataforma Aprende+ com catálogo de cursos, matrículas, progresso de aprendizagem e avaliações acadêmicas.', ['/courses', '/enrollments', '/progress', '/assessments'], ['catalog', 'directory', 'analytics', 'stepper'], 'learning-campus'],
    ['logistics', 'Aplicação Rota Clara para remessas e entregas, gestão de frota, planejamento de rotas e rastreamento logístico.', ['/shipments', '/fleet', '/routes', '/tracking'], ['timeline', 'directory', 'command-center'], 'logistics-control'],
    ['events', 'Aplicativo Festival Vivo com programação de eventos, ingressos e inscrições e credenciamento na entrada.', ['/events', '/tickets', '/check-in'], ['calendar', 'checkout', 'command-center'], 'event-stage'],
    ['restaurant', 'Sistema Mesa Autoral com reservas de mesas, cardápio, pedidos do restaurante e painel da cozinha.', ['/reservations', '/menu', '/restaurant-orders', '/kitchen'], ['calendar', 'catalog', 'kanban', 'command-center'], 'hospitality-service'],
  ])('materializes the %s Blueprint as domain-specific screens', async (_domain, prompt, routes, layouts, experiencePattern) => {
    const productBlueprint = await new ProductBlueprintPlanner().create({ prompt });
    const result = await uiGenerator.generate({
      ...baseInput,
      productBlueprint,
      persistence: 'api',
      entities: productBlueprint.data.map(entity => entity.name),
      requirements: {
        ...baseInput.requirements,
        description: productBlueprint.product.summary,
        features: productBlueprint.capabilities.map(capability => capability.name),
      },
    });
    const app = result.files.find(file => file.name === 'App.tsx')?.content || '';
    const home = result.files.find(file => file.name === 'HomePage.tsx')?.content || '';
    const generatedPages = result.files.filter(file => file.name.endsWith('WorkspacePage.tsx')).map(file => file.content).join('\n');

    expect(result.success).toBe(true);
    routes.forEach(route => expect(app).toContain(`path="${route}"`));
    layouts.forEach(layout => expect(generatedPages).toContain(`data-layout="${layout}"`));
    expect(home).toContain(`data-experience-pattern="${experiencePattern}"`);
    expect(generatedPages).not.toContain('data-entity="Item"');
  });
});
