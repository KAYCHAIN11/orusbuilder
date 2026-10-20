import { ProductBlueprintPlanner } from '../../src/blueprint/product-blueprint';
import { requirementsExtractor } from '../../src/prompt/requirements-extractor';
import { uiGenerator } from '../../src/generation/ui-generator';
import { codeGenerator, ProjectType } from '../../src/generation/code-generator';

const extractedRequirements = {
  functional: [],
  nonFunctional: [],
  technical: [],
  ui: [],
  data: [],
  integration: [],
  constraints: [],
  metadata: {
    extractionTime: 1,
    source: 'hybrid' as const,
    totalRequirements: 0,
    confidence: 0.9,
  },
};

describe('ProductBlueprintPlanner', () => {
  beforeEach(() => {
    jest.spyOn(requirementsExtractor, 'extract').mockResolvedValue(extractedRequirements);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('turns explicit healthcare requirements into capabilities, screens and data', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({
      projectId: 'serena',
      prompt: 'Crie a clínica Serena com agenda, prontuário, notificações de retorno, relatórios gerenciais, login e papéis e permissões.',
    });

    expect(blueprint.visualIntent.archetype).toBe('healthcare');
    expect(blueprint.capabilities.map(capability => capability.name)).toEqual(expect.arrayContaining([
      'Agenda clínica',
      'Prontuário',
      'Notificações',
      'Relatórios e análises',
      'Papéis e permissões',
    ]));
    expect(blueprint.screens.map(screen => screen.route)).toEqual(expect.arrayContaining([
      '/appointments',
      '/notifications',
      '/reports',
      '/access',
    ]));
    expect(blueprint.data.map(entity => entity.name)).toEqual(expect.arrayContaining([
      'Patient',
      'Appointment',
      'Notification',
      'Report',
      'Role',
    ]));
    expect(blueprint.capabilities.find(capability => capability.entities.includes('Appointment'))?.rules).toEqual(expect.arrayContaining([
      'A professional cannot have overlapping active appointments',
    ]));
    expect(blueprint.acceptanceCriteria.find(criterion => criterion.entity === 'Appointment' && criterion.kind === 'workflow')?.statement).toContain('overlapping');
    expect(blueprint.architecture.authentication).toBe(true);
    expect(new ProductBlueprintPlanner().validate(blueprint)).toMatchObject({ valid: true, score: 100 });
  });

  it('models commerce as workflows instead of a uniform CRUD', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({
      prompt: 'Marketplace Aurora com catálogo, carrinho, checkout, pagamento Pix, Stripe, webhooks e acompanhamento de pedidos.',
    });

    const strategies = new Set(blueprint.capabilities.map(capability => capability.strategy));
    expect(blueprint.visualIntent.archetype).toBe('commerce');
    expect(Array.from(strategies)).toEqual(expect.arrayContaining(['custom', 'workflow', 'crud', 'integration']));
    expect(blueprint.capabilities.map(capability => capability.name)).toEqual(expect.arrayContaining(['Pagamentos', 'Integrações']));
    expect(blueprint.screens.map(screen => screen.layout)).toEqual(expect.arrayContaining(['catalog', 'checkout', 'payment-operations', 'integration-hub']));
  });

  it('replaces a generic dashboard core with explicit field-service domain capabilities', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({
      prompt: 'Aplicação Fluxo Norte para manutenção em campo com ordens de serviço, ativos e equipamentos, técnicos, agenda de visitas, checklist de inspeção, anexos, notificações, relatórios e papéis de acesso.',
      depth: 'complete',
    });

    expect(blueprint.capabilities.map(capability => capability.name)).toEqual(expect.arrayContaining([
      'Ordens de serviço',
      'Ativos e equipamentos',
      'Equipe de campo',
      'Agenda de visitas',
      'Inspeções e checklists',
    ]));
    expect(blueprint.data.map(entity => entity.name)).toEqual(expect.arrayContaining([
      'WorkOrder', 'Asset', 'Technician', 'Visit', 'Inspection',
    ]));
    expect(blueprint.data.map(entity => entity.name)).not.toEqual(expect.arrayContaining(['Task', 'Project']));
    expect(blueprint.screens.map(screen => screen.route)).toEqual(expect.arrayContaining([
      '/work-orders', '/assets', '/technicians', '/visits', '/inspections',
    ]));
    expect(new ProductBlueprintPlanner().validate(blueprint)).toMatchObject({ valid: true, score: 100 });
  });

  it('extracts appointments and customers from a generic scheduling request', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({
      prompt: 'Crie um sistema fullstack de agendamentos e clientes com calendário, SQLite e autenticação JWT',
    });

    expect(blueprint.capabilities.map(capability => capability.name)).toEqual(expect.arrayContaining([
      'Agendamentos',
      'Clientes',
    ]));
    expect(blueprint.data.map(entity => entity.name)).toEqual(expect.arrayContaining([
      'Appointment',
      'Customer',
    ]));
    expect(blueprint.data.map(entity => entity.name)).not.toEqual(expect.arrayContaining([
      'Task',
      'Project',
      'Workspace',
    ]));
    expect(blueprint.screens.map(screen => screen.route)).toEqual(expect.arrayContaining([
      '/appointments',
      '/customers',
    ]));
    expect(new ProductBlueprintPlanner().validate(blueprint)).toMatchObject({ valid: true, score: 100 });
  });

  it.each([
    {
      domain: 'recruiting',
      prompt: 'Sistema Talento Vivo com vagas, candidatos, processo seletivo em pipeline, entrevistas e relatórios de contratação.',
      capabilities: ['Vagas', 'Candidatos', 'Processo seletivo', 'Entrevistas'],
      entities: ['JobOpening', 'Candidate', 'Application', 'Interview'],
      routes: ['/jobs', '/candidates', '/hiring', '/interviews'],
      layouts: ['catalog', 'directory', 'kanban', 'calendar'],
    },
    {
      domain: 'education',
      prompt: 'Plataforma Aprende+ com catálogo de cursos, matrículas, progresso de aprendizagem e avaliações acadêmicas.',
      capabilities: ['Catálogo de cursos', 'Matrículas', 'Progresso de aprendizagem', 'Avaliações acadêmicas'],
      entities: ['Course', 'Lesson', 'Enrollment', 'Student', 'LearningProgress', 'Assessment', 'Submission'],
      routes: ['/courses', '/enrollments', '/progress', '/assessments'],
      layouts: ['catalog', 'directory', 'analytics', 'stepper'],
    },
    {
      domain: 'logistics',
      prompt: 'Aplicação Rota Clara para remessas e entregas, gestão de frota, planejamento de rotas e rastreamento logístico.',
      capabilities: ['Remessas e entregas', 'Frota', 'Planejamento de rotas', 'Rastreamento logístico'],
      entities: ['Shipment', 'Delivery', 'Vehicle', 'Driver', 'DeliveryRoute', 'TrackingEvent'],
      routes: ['/shipments', '/fleet', '/routes', '/tracking'],
      layouts: ['timeline', 'directory', 'command-center'],
    },
    {
      domain: 'events',
      prompt: 'Aplicativo Festival Vivo com programação de eventos, ingressos e inscrições e credenciamento na entrada.',
      capabilities: ['Programação de eventos', 'Ingressos e inscrições', 'Credenciamento'],
      entities: ['Event', 'EventSession', 'Ticket', 'Attendee', 'CheckIn'],
      routes: ['/events', '/tickets', '/check-in'],
      layouts: ['calendar', 'checkout', 'command-center'],
    },
    {
      domain: 'restaurant',
      prompt: 'Sistema Mesa Autoral com reservas de mesas, cardápio, pedidos do restaurante e painel da cozinha.',
      capabilities: ['Reservas de mesas', 'Cardápio', 'Operação de pedidos do restaurante', 'Cozinha'],
      entities: ['Reservation', 'Guest', 'MenuItem', 'RestaurantOrder', 'KitchenTicket'],
      routes: ['/reservations', '/menu', '/restaurant-orders', '/kitchen'],
      layouts: ['calendar', 'catalog', 'kanban', 'command-center'],
    },
  ])('builds a domain-specific $domain product instead of the generic CRUD recipe', async scenario => {
    const blueprint = await new ProductBlueprintPlanner().create({
      prompt: scenario.prompt,
      depth: 'complete',
    });

    expect(blueprint.capabilities.map(capability => capability.name)).toEqual(expect.arrayContaining(scenario.capabilities));
    expect(blueprint.data.map(entity => entity.name)).toEqual(expect.arrayContaining(scenario.entities));
    expect(blueprint.data.map(entity => entity.name)).not.toEqual(expect.arrayContaining(['Item', 'Task', 'Project', 'Workspace']));
    expect(blueprint.screens.map(screen => screen.route)).toEqual(expect.arrayContaining(scenario.routes));
    expect(blueprint.screens.map(screen => screen.layout)).toEqual(expect.arrayContaining(scenario.layouts));
    expect(new Set(blueprint.capabilities.map(capability => capability.strategy)).size).toBeGreaterThanOrEqual(2);
    expect(new ProductBlueprintPlanner().validate(blueprint)).toMatchObject({ valid: true, score: 100 });
  });

  it('recognizes a naturally enumerated cold-chain logistics scope', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({
      prompt: 'Central operacional Northstar para cadeia fria com remessas, veículos, rotas, sensores de temperatura e eventos de rastreamento.',
      depth: 'complete',
    });

    expect(blueprint.capabilities.map(capability => capability.name)).toEqual(expect.arrayContaining([
      'Remessas e entregas', 'Frota', 'Planejamento de rotas', 'Rastreamento logístico',
    ]));
    expect(blueprint.data.map(entity => entity.name)).toEqual(expect.arrayContaining([
      'Shipment', 'Delivery', 'Vehicle', 'DeliveryRoute', 'TrackingEvent',
    ]));
  });

  it('derives a product model from an uncatalogued domain instead of falling back to Item', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({
      prompt: 'Sistema Acervo Vivo para bibliotecas, com catálogo de obras, empréstimos com prazo e devolução, reservas e cálculo automático de multas.',
      depth: 'complete',
    });

    expect(blueprint.visualIntent.archetype).toBe('generic');
    expect(blueprint.capabilities.map(capability => capability.name)).toEqual(expect.arrayContaining([
      'Catálogo de obras',
      'Empréstimos com prazo',
      'Devolução',
      'Reservas',
      'Cálculo automático de multas',
    ]));
    expect(blueprint.capabilities.map(capability => capability.strategy)).toEqual(expect.arrayContaining([
      'content',
      'workflow',
      'computed',
    ]));
    expect(blueprint.data.map(entity => entity.name)).toEqual(expect.arrayContaining([
      'Obra',
      'Emprestimo',
      'Devolucao',
      'Reserva',
      'Multa',
    ]));
    expect(blueprint.data.map(entity => entity.name)).not.toContain('Item');
    expect(blueprint.screens.map(screen => screen.route)).toEqual(expect.arrayContaining([
      '/obras',
      '/emprestimos',
      '/devolucao',
      '/reservas',
      '/multas',
    ]));
    expect(blueprint.capabilities.filter(capability => capability.priority === 'must').every(capability =>
      capability.evidence.some(evidence => evidence.source === 'user')
    )).toBe(true);
    expect(new ProductBlueprintPlanner().validate(blueprint)).toMatchObject({ valid: true, score: 100 });
  });

  it.each([
    {
      domain: 'animal welfare',
      prompt: 'Plataforma Pata Segura com cadastro de animais, triagem veterinária, candidaturas de adoção, visitas e acompanhamento pós-adoção.',
      entities: ['Animal', 'TriagemVeterinaria', 'Candidatura', 'Visita', 'AcompanhamentoPosAdocao'],
      strategies: ['crud', 'workflow'],
    },
    {
      domain: 'construction',
      prompt: 'Sistema Canteiro Vivo com diário de obra, medições, controle de materiais, aprovações e histórico de ocorrências.',
      entities: ['Obra', 'Medicao', 'Material', 'Aprovacao', 'Ocorrencia'],
      strategies: ['content', 'computed', 'workflow'],
    },
  ])('preserves semantic fidelity for the open $domain domain', async scenario => {
    const blueprint = await new ProductBlueprintPlanner().create({ prompt: scenario.prompt, depth: 'complete' });

    expect(blueprint.data.map(entity => entity.name)).toEqual(expect.arrayContaining(scenario.entities));
    expect(blueprint.capabilities.map(capability => capability.strategy)).toEqual(expect.arrayContaining(scenario.strategies));
    expect(blueprint.data.map(entity => entity.name)).not.toEqual(expect.arrayContaining(['Item', 'Task', 'Project', 'Workspace']));
    expect(blueprint.capabilities.filter(capability => capability.priority === 'must').every(capability =>
      capability.evidence.some(evidence => evidence.source === 'user')
    )).toBe(true);
    expect(new ProductBlueprintPlanner().validate(blueprint)).toMatchObject({ valid: true, score: 100 });
  });

  it('evolves the current blueprint without replacing its identity or domain', async () => {
    const planner = new ProductBlueprintPlanner();
    const current = await planner.create({
      projectId: 'agenda-viva',
      prompt: 'Crie o sistema Agenda Viva para agendamentos e clientes com calendário, SQLite e autenticação JWT',
    });
    const evolved = await planner.evolve(
      current,
      'Adicione relatórios de ocupação e indicadores por profissional',
    );

    expect(evolved.version).toBe(current.version + 1);
    expect(evolved.blueprintId).toBe(current.blueprintId);
    expect(evolved.product.name).toBe(current.product.name);
    expect(evolved.visualIntent).toEqual(current.visualIntent);
    expect(evolved.capabilities.map(capability => capability.name)).toEqual(expect.arrayContaining([
      'Agendamentos',
      'Clientes',
      'Relatórios e análises',
    ]));
    expect(evolved.data.map(entity => entity.name)).toEqual(expect.arrayContaining([
      'Appointment',
      'Customer',
      'Report',
    ]));
    expect(evolved.data.map(entity => entity.name)).not.toContain('Product');
  });

  it('keeps scheduling as the core when adding payments and analytics', async () => {
    const planner = new ProductBlueprintPlanner();
    const current = await planner.create({ prompt: 'Sistema de agendamentos e clientes com autenticação JWT' });
    const evolved = await planner.evolve(current, 'Adicione pagamentos e analytics ao sistema e corrija os indicadores');

    expect(evolved.visualIntent).toEqual(current.visualIntent);
    expect(evolved.data.map(entity => entity.name)).toEqual(expect.arrayContaining(['Appointment', 'Customer', 'Payment', 'Report']));
    expect(evolved.data.map(entity => entity.name)).not.toEqual(expect.arrayContaining(['Account', 'Transaction']));
    expect(planner.validate(evolved).valid).toBe(true);
  });

  it('preserves stable identifiers and documented decisions while evolving a blueprint', async () => {
    const planner = new ProductBlueprintPlanner();
    const current = await planner.create({
      projectId: 'documented-clinic',
      sourceType: 'document',
      documentIds: ['extraction-core-v7'],
      prompt: 'Clínica Serena com agenda, pacientes, prontuário e autenticação JWT',
    });
    const capability = current.capabilities.find(item => item.name === 'Agenda clínica')!;
    const screen = current.screens.find(item => item.capabilityIds.includes(capability.id))!;
    const component = current.components.find(item => item.screenIds.includes(screen.id))!;
    const entity = current.data.find(item => item.capabilityIds.includes(capability.id))!;
    const criterion = current.acceptanceCriteria.find(item => item.capabilityId === capability.id && item.kind !== 'state-handling')!;
    const originalCapabilityId = capability.id;
    const originalScreenId = screen.id;
    const originalComponentId = component.id;
    capability.id = 'CAP-DOCUMENTED-AGENDA';
    capability.rules.push('Appointments require a responsible professional and cannot overlap');
    screen.id = 'SCREEN-DOCUMENTED-AGENDA';
    component.id = 'COMP-DOCUMENTED-AGENDA';
    entity.id = 'DATA-DOCUMENTED-APPOINTMENT';
    criterion.id = 'AC-DOCUMENTED-AGENDA';
    criterion.statement = 'Scheduling preserves the documented conflict policy';
    criterion.assertions = ['overlapping appointments are rejected'];
    current.screens.forEach(item => {
      item.capabilityIds = item.capabilityIds.map(id => id === originalCapabilityId ? capability.id : id);
      item.componentIds = item.componentIds.map(id => id === originalComponentId ? component.id : id);
    });
    current.components.forEach(item => {
      item.screenIds = item.screenIds.map(id => id === originalScreenId ? screen.id : id);
    });
    current.data.forEach(item => {
      item.capabilityIds = item.capabilityIds.map(id => id === originalCapabilityId ? capability.id : id);
    });
    current.acceptanceCriteria.forEach(item => {
      item.capabilityId = item.capabilityId === originalCapabilityId ? capability.id : item.capabilityId;
    });
    current.journeys.forEach(item => {
      item.capabilityIds = item.capabilityIds.map(id => id === originalCapabilityId ? capability.id : id);
    });

    const evolved = await planner.evolve(current, 'Adicione relatórios operacionais por profissional e período');

    expect(evolved.source).toMatchObject({ type: 'document', documentIds: ['extraction-core-v7'] });
    expect(evolved.capabilities.find(item => item.name === 'Agenda clínica')).toMatchObject({
      id: 'CAP-DOCUMENTED-AGENDA',
      rules: expect.arrayContaining(['Appointments require a responsible professional and cannot overlap']),
    });
    expect(evolved.screens.find(item => item.route === screen.route)?.id).toBe('SCREEN-DOCUMENTED-AGENDA');
    expect(evolved.components.find(item => item.name === component.name)?.id).toBe('COMP-DOCUMENTED-AGENDA');
    expect(evolved.data.find(item => item.name === entity.name)?.id).toBe('DATA-DOCUMENTED-APPOINTMENT');
    expect(evolved.acceptanceCriteria.find(item => item.id === 'AC-DOCUMENTED-AGENDA')).toMatchObject({
      statement: 'Scheduling preserves the documented conflict policy',
      assertions: ['overlapping appointments are rejected'],
    });
    expect(evolved.capabilities.map(item => item.name)).toContain('Relatórios e análises');
    expect(planner.validate(evolved)).toMatchObject({ valid: true, score: 100 });
  });

  it('drives generated navigation and entities from the blueprint', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({
      prompt: 'CRM chamado Orbit com pipeline comercial, mensagens, relatórios, notificações e login.',
    });
    const result = await uiGenerator.generate({
      framework: 'react',
      requirements: {
        description: blueprint.source.prompt,
        features: blueprint.capabilities.map(capability => capability.purpose),
        tech_stack: { frontend: ['react', 'typescript'] },
      },
      productBlueprint: blueprint,
      visualIntent: blueprint.visualIntent,
      persistence: 'local',
    });
    const app = result.files.find(file => file.name === 'App.tsx');
    const navbar = result.files.find(file => file.name === 'Navbar.tsx');
    const messages = result.files.find(file => file.name === 'MensagensWorkspacePage.tsx');
    const reports = result.files.find(file => file.name === 'RelatoriosEAnalisesWorkspacePage.tsx');

    expect(result.success).toBe(true);
    expect(app?.content).toContain('path="/messages"');
    expect(app?.content).toContain('path="/reports"');
    expect(app?.content).toContain('<MensagensWorkspacePage />');
    expect(app?.content).not.toContain("import MessageListPage from './pages/MessageListPage'");
    expect(app?.content).not.toContain("import ReportListPage from './pages/ReportListPage'");
    expect(messages?.content).toContain('lg:grid-cols-[320px_1fr]');
    expect(messages?.content).toContain('stateLabels[visible[0].status]');
    expect(messages?.content).toContain('transitions[item.status]');
    expect(messages?.content).toContain("api.get('/api/messages')");
    expect(messages?.content).toContain("api.put('/api/messages/' + encodeURIComponent(item.id)");
    expect(messages?.content).toContain("const resourcePath = \"messages\"");
    expect(messages?.content).toContain("to={'/' + resourcePath + '/new'}");
    expect(messages?.content).not.toContain('const initialItems');
    expect(reports?.content).toContain('Registros consolidados');
    expect(reports?.content).toContain('nextSummary.numericTotals[field]');
    expect(reports?.content).not.toContain('/api/reports/insights/summary');
    expect(reports?.content).not.toContain('18400');
    expect(navbar?.content).toContain('Pipeline');
    expect(navbar?.content).toContain('Mensagens');
    expect(navbar?.content).toContain('Relatórios e análises');
  });

  it('ships the versioned blueprint with a fullstack project', async () => {
    const blueprint = await new ProductBlueprintPlanner().create({
      projectId: 'aurora-market',
      prompt: 'Marketplace Aurora com catálogo, carrinho, checkout, pagamentos Pix, notificações, login e relatórios.',
    });
    const result = await codeGenerator.generate({
      projectName: 'Aurora Market',
      projectType: ProjectType.FULLSTACK,
      requirements: {
        description: blueprint.source.prompt,
        features: blueprint.capabilities.map(capability => capability.purpose),
        tech_stack: {
          frontend: ['react', 'typescript'],
          backend: ['express', 'typescript'],
          database: 'sqlite',
        },
        authentication: blueprint.architecture.authentication,
        testing: true,
      },
      entities: blueprint.data.map(entity => entity.name),
      visualIntent: blueprint.visualIntent,
      productBlueprint: blueprint,
      database: { type: 'sqlite', entities: blueprint.data.map(entity => entity.name) },
      authentication: blueprint.architecture.authentication,
      api_type: blueprint.architecture.api,
      options: { generateTests: true, generateDocs: true },
    });
    const manifest = result.files.find(file => file.name === 'product-blueprint.json');
    const acceptancePlan = result.files.find(file => file.name === 'acceptance-plan.json');
    const app = result.files.find(file => file.name === 'App.tsx');

    expect(result.success).toBe(true);
    expect(JSON.parse(manifest?.content || '{}')).toMatchObject({
      schemaVersion: '1.0.0',
      blueprintId: blueprint.blueprintId,
      version: 1,
      status: 'ready',
    });
    expect(JSON.parse(acceptancePlan?.content || '{}')).toMatchObject({
      blueprintId: blueprint.blueprintId,
      criteria: expect.arrayContaining([
        expect.objectContaining({ id: expect.stringMatching(/^AC-/), assertions: expect.any(Array) }),
      ]),
    });
    expect(app?.content).toContain('path="/checkout"');
    expect(app?.content).toContain('path="/payments"');
    expect(app?.content).toContain('path="/notifications"');
    expect(result.files.some(file => file.path.includes('backend'))).toBe(true);
  });
});
