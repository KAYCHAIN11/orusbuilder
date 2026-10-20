import { randomUUID } from 'crypto';
import { requirementsExtractor } from '../prompt/requirements-extractor';
import { analyzeVisualIntent, type ProductArchetype, type VisualIntent } from '../generation/visual-intent';
import { PRODUCT_BLUEPRINT_SCHEMA_VERSION, validateProductBlueprintContract } from './product-blueprint-contract';

export type BlueprintDepth = 'essential' | 'product' | 'complete';
export type BlueprintStatus = 'draft' | 'ready' | 'generating' | 'implemented' | 'outdated';
export type CapabilityStrategy = 'custom' | 'workflow' | 'crud' | 'integration' | 'computed' | 'content';

export interface BlueprintEvidence {
  source: 'user' | 'document' | 'inference';
  excerpt: string;
  confidence: number;
}

export interface ProductPersona {
  id: string;
  name: string;
  goals: string[];
  permissions: string[];
}

export interface ProductCapability {
  id: string;
  name: string;
  purpose: string;
  strategy: CapabilityStrategy;
  priority: 'must' | 'should' | 'could';
  actors: string[];
  entities: string[];
  rules: string[];
  acceptanceCriteria: string[];
  evidence: BlueprintEvidence[];
}

export interface ProductJourney {
  id: string;
  name: string;
  actorId: string;
  trigger: string;
  steps: string[];
  capabilityIds: string[];
  outcome: string;
}

export interface ProductScreen {
  id: string;
  name: string;
  route: string;
  purpose: string;
  layout: string;
  capabilityIds: string[];
  componentIds: string[];
  states: string[];
}

export interface ProductComponent {
  id: string;
  name: string;
  category: 'navigation' | 'layout' | 'input' | 'data-display' | 'feedback' | 'domain';
  purpose: string;
  variants: string[];
  states: string[];
  screenIds: string[];
}

export interface ProductDataEntity {
  id: string;
  name: string;
  purpose: string;
  capabilityIds: string[];
}

export interface ProductAcceptanceCriterion {
  id: string;
  statement: string;
  capabilityId: string;
  testType: 'unit' | 'integration' | 'journey';
  required: boolean;
  kind: 'persistence' | 'workflow' | 'calculation' | 'integration' | 'content' | 'custom' | 'state-handling';
  entity?: string;
  route?: string;
  assertions: string[];
}

export interface ProductBlueprint {
  schemaVersion: string;
  blueprintId: string;
  projectId: string;
  version: number;
  status: BlueprintStatus;
  depth: BlueprintDepth;
  source: {
    type: 'prompt' | 'document' | 'hybrid';
    prompt: string;
    documentIds: string[];
  };
  product: {
    name: string;
    summary: string;
    problem: string;
    valueProposition: string;
    audience: string[];
    goals: string[];
    outOfScope: string[];
  };
  visualIntent: VisualIntent;
  personas: ProductPersona[];
  capabilities: ProductCapability[];
  journeys: ProductJourney[];
  screens: ProductScreen[];
  components: ProductComponent[];
  data: ProductDataEntity[];
  architecture: {
    frontend: string[];
    backend: string[];
    database?: string;
    authentication: boolean;
    api: 'rest' | 'graphql';
  };
  acceptanceCriteria: ProductAcceptanceCriterion[];
  assumptions: string[];
  openQuestions: string[];
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBlueprintInput {
  prompt: string;
  projectId?: string;
  sourceType?: 'prompt' | 'document' | 'hybrid';
  documentIds?: string[];
  depth?: BlueprintDepth;
  visualIntent?: VisualIntent;
  productName?: string;
}

interface ProfileCapability {
  name: string;
  purpose: string;
  strategy: CapabilityStrategy;
  entities: string[];
}

interface ProfileScreen {
  name: string;
  route: string;
  purpose: string;
  layout: string;
  capabilities: string[];
  components: string[];
}

interface ProductProfile {
  audience: string[];
  problem: string;
  value: string;
  entities: string[];
  capabilities: ProfileCapability[];
  screens: ProfileScreen[];
}

interface ExplicitCapabilityPattern extends ProfileCapability {
  pattern: RegExp;
  route: string;
  layout: string;
  components: string[];
  coreDomain?: boolean;
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values));
}

function nextStableId(prefix: string, used: Set<string>): string {
  let index = 1;
  while (used.has(`${prefix}-${String(index).padStart(3, '0')}`)) index++;
  const id = `${prefix}-${String(index).padStart(3, '0')}`;
  used.add(id);
  return id;
}

function reconcileEvolution(current: ProductBlueprint, evolved: ProductBlueprint): ProductBlueprint {
  const capabilityIds = new Map<string, string>();
  const usedCapabilityIds = new Set(current.capabilities.map(item => item.id));
  const matchedCapabilities = new Set<string>();
  const capabilities = evolved.capabilities.map(item => {
    const previous = current.capabilities.find(candidate => normalize(candidate.name) === normalize(item.name));
    const id = previous?.id || nextStableId('CAP', usedCapabilityIds);
    capabilityIds.set(item.id, id);
    if (previous) matchedCapabilities.add(previous.id);
    return previous ? {
      ...item,
      id,
      rules: uniqueValues([...previous.rules, ...item.rules]),
      acceptanceCriteria: uniqueValues([...previous.acceptanceCriteria, ...item.acceptanceCriteria]),
      evidence: [...previous.evidence, ...item.evidence.filter(evidence => !previous.evidence.some(existing => existing.source === evidence.source && existing.excerpt === evidence.excerpt))],
    } : { ...item, id };
  });
  capabilities.push(...current.capabilities.filter(item => !matchedCapabilities.has(item.id)));

  const personaIds = new Map<string, string>();
  const usedPersonaIds = new Set(current.personas.map(item => item.id));
  const matchedPersonas = new Set<string>();
  const personas = evolved.personas.map(item => {
    const previous = current.personas.find(candidate => normalize(candidate.name) === normalize(item.name));
    const id = previous?.id || nextStableId('PERSONA', usedPersonaIds);
    personaIds.set(item.id, id);
    if (previous) matchedPersonas.add(previous.id);
    return previous ? {
      ...item,
      id,
      goals: uniqueValues([...previous.goals, ...item.goals]),
      permissions: uniqueValues([...previous.permissions, ...item.permissions]),
    } : { ...item, id };
  });
  personas.push(...current.personas.filter(item => !matchedPersonas.has(item.id)));

  const screenIds = new Map<string, string>();
  const usedScreenIds = new Set(current.screens.map(item => item.id));
  const matchedScreens = new Set<string>();
  const screens = evolved.screens.map(item => {
    const previous = current.screens.find(candidate => candidate.route === item.route || normalize(candidate.name) === normalize(item.name));
    const id = previous?.id || nextStableId('SCREEN', usedScreenIds);
    screenIds.set(item.id, id);
    if (previous) matchedScreens.add(previous.id);
    const mappedCapabilityIds = item.capabilityIds.map(capabilityId => capabilityIds.get(capabilityId) || capabilityId);
    return previous ? {
      ...item,
      id,
      capabilityIds: uniqueValues([...previous.capabilityIds, ...mappedCapabilityIds]),
      componentIds: [...previous.componentIds, ...item.componentIds],
      states: uniqueValues([...previous.states, ...item.states]),
    } : { ...item, id, capabilityIds: mappedCapabilityIds };
  });
  screens.push(...current.screens.filter(item => !matchedScreens.has(item.id)));

  const componentIds = new Map<string, string>();
  const usedComponentIds = new Set(current.components.map(item => item.id));
  const matchedComponents = new Set<string>();
  const components = evolved.components.map(item => {
    const mappedScreenIds = item.screenIds.map(screenId => screenIds.get(screenId) || screenId);
    const previous = current.components.find(candidate => normalize(candidate.name) === normalize(item.name));
    const id = previous?.id || nextStableId('COMP', usedComponentIds);
    componentIds.set(item.id, id);
    if (previous) matchedComponents.add(previous.id);
    return previous ? {
      ...item,
      id,
      variants: uniqueValues([...previous.variants, ...item.variants]),
      states: uniqueValues([...previous.states, ...item.states]),
      screenIds: uniqueValues([...previous.screenIds, ...mappedScreenIds]),
    } : { ...item, id, screenIds: mappedScreenIds };
  });
  components.push(...current.components.filter(item => !matchedComponents.has(item.id)));
  for (const screen of screens) {
    screen.componentIds = uniqueValues(screen.componentIds.map(componentId => componentIds.get(componentId) || componentId));
  }

  const usedDataIds = new Set(current.data.map(item => item.id));
  const matchedData = new Set<string>();
  const data = evolved.data.map(item => {
    const previous = current.data.find(candidate => normalize(candidate.name) === normalize(item.name));
    const id = previous?.id || nextStableId('DATA', usedDataIds);
    if (previous) matchedData.add(previous.id);
    const mappedCapabilityIds = item.capabilityIds.map(capabilityId => capabilityIds.get(capabilityId) || capabilityId);
    return previous ? {
      ...item,
      id,
      capabilityIds: uniqueValues([...previous.capabilityIds, ...mappedCapabilityIds]),
    } : { ...item, id, capabilityIds: mappedCapabilityIds };
  });
  data.push(...current.data.filter(item => !matchedData.has(item.id)));

  const usedCriterionIds = new Set(current.acceptanceCriteria.map(item => item.id));
  const matchedCriteria = new Set<string>();
  const acceptanceCriteria = evolved.acceptanceCriteria.map(item => {
    const capabilityId = capabilityIds.get(item.capabilityId) || item.capabilityId;
    const previous = current.acceptanceCriteria.find(candidate =>
      candidate.capabilityId === capabilityId && candidate.kind === item.kind && candidate.testType === item.testType
    );
    const id = previous?.id || nextStableId('AC', usedCriterionIds);
    if (previous) matchedCriteria.add(previous.id);
    return previous ? { ...item, ...previous, id, capabilityId } : { ...item, id, capabilityId };
  });
  acceptanceCriteria.push(...current.acceptanceCriteria.filter(item => !matchedCriteria.has(item.id)));

  const usedJourneyIds = new Set(current.journeys.map(item => item.id));
  const matchedJourneys = new Set<string>();
  const journeys = evolved.journeys.map(item => {
    const mappedCapabilityIds = item.capabilityIds.map(capabilityId => capabilityIds.get(capabilityId) || capabilityId);
    const previous = current.journeys.find(candidate =>
      normalize(candidate.name) === normalize(item.name) || candidate.capabilityIds.some(capabilityId => mappedCapabilityIds.includes(capabilityId))
    );
    const id = previous?.id || nextStableId('FLOW', usedJourneyIds);
    if (previous) matchedJourneys.add(previous.id);
    return previous ? {
      ...item,
      ...previous,
      id,
      actorId: personaIds.get(item.actorId) || previous.actorId,
      capabilityIds: uniqueValues([...previous.capabilityIds, ...mappedCapabilityIds]),
    } : { ...item, id, actorId: personaIds.get(item.actorId) || item.actorId, capabilityIds: mappedCapabilityIds };
  });
  journeys.push(...current.journeys.filter(item => !matchedJourneys.has(item.id)));

  return {
    ...evolved,
    product: {
      ...evolved.product,
      audience: uniqueValues([...current.product.audience, ...evolved.product.audience]),
      goals: uniqueValues([...current.product.goals, ...evolved.product.goals]),
      outOfScope: uniqueValues([...current.product.outOfScope, ...evolved.product.outOfScope]),
    },
    personas,
    capabilities,
    journeys,
    screens,
    components,
    data,
    architecture: {
      ...evolved.architecture,
      frontend: uniqueValues([...current.architecture.frontend, ...evolved.architecture.frontend]),
      backend: uniqueValues([...current.architecture.backend, ...evolved.architecture.backend]),
      database: evolved.architecture.database || current.architecture.database,
      authentication: current.architecture.authentication || evolved.architecture.authentication,
    },
    acceptanceCriteria,
    assumptions: uniqueValues([...current.assumptions, ...evolved.assumptions]),
    openQuestions: uniqueValues([...current.openQuestions, ...evolved.openQuestions]),
  };
}

function capabilityAcceptanceCriteria(capability: ProfileCapability): string[] {
  const entity = capability.entities[0] || capability.name;
  const primaryEntity = normalize(entity);
  const specialized: Record<string, string> = {
    appointment: 'Appointments require a responsible professional and reject overlapping persisted time ranges',
    message: 'Messages preserve sender, recipient and content while allowing only declared delivery transitions',
    report: 'Report indicators are calculated from all persisted source records and expose grouped totals',
    integration: 'Integration configuration validates endpoints and persists connection state with actionable failures',
    payment: 'Payments preserve amount and method while allowing only declared financial status transitions',
    role: 'Access policies persist explicit scopes and permissions and can be changed only by administrators',
  };
  const primary: Record<CapabilityStrategy, string> = {
    crud: `${entity} records can be created, loaded, updated and removed through persistent APIs`,
    workflow: `${entity} records can move only through allowed persisted workflow transitions`,
    computed: `${capability.name} indicators are calculated from persisted source records`,
    integration: `${capability.name} configuration and connection state are persisted with actionable failures`,
    content: `${entity} content can be created, loaded and opened from persistent storage`,
    custom: `${capability.name} completes its declared domain outcome with persisted data`,
  };
  return [specialized[primaryEntity] || primary[capability.strategy], `${capability.name} handles loading, empty, success and error states`];
}

function capabilityRules(capability: ProfileCapability): string[] {
  const entity = normalize(capability.entities[0] || '');
  const specialized: Record<string, string[]> = {
    appointment: ['A professional cannot have overlapping active appointments', 'Cancelled appointments do not block availability'],
    message: ['Delivery status follows the declared message workflow', 'Sender, recipient and content are required'],
    report: ['Summaries include every persisted record', 'Numeric totals are calculated on the server'],
    integration: ['Endpoints must be valid URLs', 'Connection failures remain explicit states'],
    payment: ['Amount cannot be negative', 'Payment state follows the declared financial workflow'],
    role: ['Only administrators can change access policies', 'Every policy declares scope and permissions'],
  };
  return specialized[entity] || (capability.strategy === 'workflow' ? ['Transitions must follow the defined domain workflow'] : []);
}

function acceptanceKind(strategy: CapabilityStrategy, index: number): ProductAcceptanceCriterion['kind'] {
  if (index > 0) return 'state-handling';
  const kinds: Record<CapabilityStrategy, ProductAcceptanceCriterion['kind']> = {
    crud: 'persistence',
    workflow: 'workflow',
    computed: 'calculation',
    integration: 'integration',
    content: 'content',
    custom: 'custom',
  };
  return kinds[strategy];
}

function singularizeDomainWord(value: string): string {
  const word = normalize(value).replace(/[^a-z0-9]/g, '');
  if (word.endsWith('coes')) return `${word.slice(0, -4)}cao`;
  if (word.endsWith('oes')) return `${word.slice(0, -3)}ao`;
  if (word.endsWith('ais')) return `${word.slice(0, -3)}al`;
  if (word.endsWith('eis')) return `${word.slice(0, -3)}el`;
  if (word.endsWith('is') && word.length > 4) return `${word.slice(0, -2)}il`;
  if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
  return word;
}

function toDomainIdentifier(value: string): string {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(part => singularizeDomainWord(part))
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');
}

function inferredCapabilityStrategy(value: string): CapabilityStrategy {
  const text = normalize(value);
  if (/\b(calculo|indicador|metric|analise|previsao|pontuacao|ranking|medicoes)\b/.test(text)) return 'computed';
  if (/\b(integracao|webhook|sincronizacao|importacao)\b/.test(text)) return 'integration';
  if (/\b(catalogo|conteudo|document|publicacao|acervo|galeria|diario|historico)\b/.test(text)) return 'content';
  if (/\b(reserv|emprestim|devolu|aprov|solicit|agend|fila|fluxo|processo|rastreamento|controle|candidatur|visita|acompanh|triagem)/.test(text)) return 'workflow';
  return 'crud';
}

function inferredCapabilityLayout(value: string, strategy: CapabilityStrategy): string {
  const text = normalize(value);
  if (/\b(agenda|agendamento|reserva|calendario)\b/.test(text)) return 'calendar';
  if (/\b(catalogo|acervo|galeria|vitrine)\b/.test(text)) return 'catalog';
  if (/\b(rastreamento|historico|linha do tempo|devolucao)\b/.test(text)) return 'timeline';
  if (strategy === 'computed') return 'analytics';
  if (strategy === 'workflow') return 'kanban';
  return 'directory';
}

function inferOpenDomainCapabilities(prompt: string): ExplicitCapabilityPattern[] {
  const listMatches = Array.from(prompt.matchAll(/\b(?:com|incluindo|deve ter|precisa de|que permita)\s+([^.;\n]+)/gi));
  const fragments = listMatches.flatMap(match => match[1]!
    .split(/\s*,\s*|\s+e\s+(?=(?:c[aá]lculo|controle|gest[aã]o|cadastro|cat[aá]logo|reservas?|empr[eé]stimos?|devolu[cç][aã]o|aprova[cç][aã]o|rastreamento|painel|agenda|hist[oó]rico|fidelidade|acompanhamento)\b)/i));
  const ignored = /\b(visual|tema|cores?|tipografia|premium|moderno|responsivo|frontend|backend|typescript|react|node|banco de dados|login|autentica[cç][aã]o)\b/i;
  const seen = new Set<string>();
  const inferred: ExplicitCapabilityPattern[] = [];

  for (const raw of fragments) {
    const phrase = raw.trim().replace(/^(um|uma|o|a|os|as)\s+/i, '').replace(/\s+/g, ' ');
    if (!phrase || phrase.length < 3 || phrase.length > 80 || ignored.test(phrase)) continue;
    const normalizedPhrase = normalize(phrase);
    if (seen.has(normalizedPhrase)) continue;
    seen.add(normalizedPhrase);

    const governed = phrase.match(/^(?:cat[aá]logo|c[aá]lculo(?: autom[aá]tico)?|gest[aã]o|controle|acompanhamento|painel|cadastro|di[aá]rio|hist[oó]rico)\s+de\s+(.+)$/i)?.[1];
    const entityPhrase = (governed || phrase).split(/\s+(?:com|por|para)\s+/i)[0]!.split(/\s+de\s+/i)[0]!;
    const entity = toDomainIdentifier(entityPhrase);
    if (!entity || entity.length > 48) continue;
    const strategy = inferredCapabilityStrategy(phrase);
    const layout = inferredCapabilityLayout(phrase, strategy);
    const base = toDomainIdentifier(phrase) || entity;
    const name = `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`;
    inferred.push({
      name,
      purpose: `Executar ${phrase} conforme o fluxo descrito pelo usuário`,
      strategy,
      entities: [entity],
      pattern: /$^/,
      route: `/${normalize(entityPhrase).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      layout,
      components: [`${base}Workspace`, `${base}Filters`, `${base}Details`],
      coreDomain: true,
    });
    if (inferred.length === 6) break;
  }

  return inferred;
}

const explicitCapabilityPatterns: ExplicitCapabilityPattern[] = [
  { name: 'Agendamentos', purpose: 'Organizar horários, confirmações e responsáveis pelo atendimento', strategy: 'workflow', entities: ['Appointment', 'Customer'], pattern: /\b(agendamentos?|appointments?|agenda de atendimentos?)\b/i, route: '/appointments', layout: 'calendar', components: ['AppointmentCalendar', 'AppointmentDrawer', 'ScheduleFilters'], coreDomain: true },
  { name: 'Clientes', purpose: 'Manter o contexto e o histórico dos clientes atendidos', strategy: 'crud', entities: ['Customer'], pattern: /\b(clientes?|customers?)\b/i, route: '/customers', layout: 'directory', components: ['CustomerDirectory', 'CustomerSearch', 'CustomerProfile'], coreDomain: true },
  { name: 'Ordens de serviço', purpose: 'Planejar e executar ordens por prioridade, status e SLA', strategy: 'workflow', entities: ['WorkOrder', 'Asset', 'Technician'], pattern: /\b(ordens? de servi[cç]o|work orders?|service orders?)\b/i, route: '/work-orders', layout: 'kanban', components: ['WorkOrderBoard', 'PriorityQueue', 'SlaSignals'], coreDomain: true },
  { name: 'Ativos e equipamentos', purpose: 'Manter o contexto operacional dos ativos atendidos', strategy: 'crud', entities: ['Asset'], pattern: /\b(ativos? e equipamentos?|cadastro de ativos?|equipamentos?|assets?)\b/i, route: '/assets', layout: 'directory', components: ['AssetDirectory', 'AssetStatus', 'MaintenanceHistory'], coreDomain: true },
  { name: 'Equipe de campo', purpose: 'Distribuir responsabilidades entre técnicos e equipes', strategy: 'workflow', entities: ['Technician'], pattern: /\b(t[eé]cnicos?|equipe de campo|equipes de manuten[cç][aã]o|field team)\b/i, route: '/technicians', layout: 'directory', components: ['TechnicianDirectory', 'AvailabilityBoard', 'AssignmentPanel'], coreDomain: true },
  { name: 'Agenda de visitas', purpose: 'Organizar visitas técnicas e deslocamentos da equipe', strategy: 'workflow', entities: ['Visit', 'Technician', 'WorkOrder'], pattern: /\b(agenda de visitas?|visitas? t[eé]cnicas?|field visits?|rotas? de atendimento)\b/i, route: '/visits', layout: 'calendar', components: ['VisitCalendar', 'RouteTimeline', 'VisitDrawer'], coreDomain: true },
  { name: 'Inspeções e checklists', purpose: 'Executar inspeções rastreáveis durante o atendimento', strategy: 'workflow', entities: ['Inspection', 'Asset', 'WorkOrder'], pattern: /\b(checklists?|inspe[cç][aã]o|inspe[cç][oõ]es)\b/i, route: '/inspections', layout: 'stepper', components: ['InspectionChecklist', 'EvidenceCapture', 'CompletionSummary'], coreDomain: true },
  { name: 'Vagas', purpose: 'Publicar e acompanhar oportunidades com requisitos e responsáveis', strategy: 'content', entities: ['JobOpening'], pattern: /\b(vagas?|oportunidades? de emprego|job openings?|open positions?)\b/i, route: '/jobs', layout: 'catalog', components: ['JobCatalog', 'JobFilters', 'JobEditor'], coreDomain: true },
  { name: 'Candidatos', purpose: 'Organizar perfis, competências e histórico de candidatos', strategy: 'crud', entities: ['Candidate'], pattern: /\b(candidatos?|talentos?|applicants?)\b/i, route: '/candidates', layout: 'directory', components: ['CandidateDirectory', 'TalentSearch', 'CandidateProfile'], coreDomain: true },
  { name: 'Processo seletivo', purpose: 'Conduzir candidaturas pelas etapas definidas de recrutamento', strategy: 'workflow', entities: ['Application', 'Candidate', 'JobOpening'], pattern: /\b(processo seletivo|pipeline de recrutamento|recrutamento e sele[cç][aã]o|hiring pipeline|recruitment pipeline)\b/i, route: '/hiring', layout: 'kanban', components: ['HiringBoard', 'ApplicationCard', 'StageFilters'], coreDomain: true },
  { name: 'Entrevistas', purpose: 'Planejar entrevistas, participantes e avaliações', strategy: 'workflow', entities: ['Interview', 'Candidate'], pattern: /\b(entrevistas?|interviews?)\b/i, route: '/interviews', layout: 'calendar', components: ['InterviewCalendar', 'InterviewDrawer', 'EvaluationPanel'], coreDomain: true },
  { name: 'Catálogo de cursos', purpose: 'Organizar cursos, trilhas e conteúdos de aprendizagem', strategy: 'content', entities: ['Course', 'Lesson'], pattern: /\b(cat[aá]logo de cursos?|cursos? e aulas?|trilhas? de aprendizagem|course catalog|learning paths?)\b/i, route: '/courses', layout: 'catalog', components: ['CourseCatalog', 'LearningPathFilter', 'CourseEditor'], coreDomain: true },
  { name: 'Matrículas', purpose: 'Relacionar estudantes a cursos e acompanhar sua situação acadêmica', strategy: 'workflow', entities: ['Enrollment', 'Student', 'Course'], pattern: /\b(matr[ií]culas?|inscri[cç][oõ]es? em cursos?|enrollments?)\b/i, route: '/enrollments', layout: 'directory', components: ['EnrollmentDirectory', 'StudentSearch', 'EnrollmentDrawer'], coreDomain: true },
  { name: 'Progresso de aprendizagem', purpose: 'Medir avanço, conclusão e engajamento por estudante', strategy: 'computed', entities: ['LearningProgress', 'Enrollment'], pattern: /\b(progresso de aprendizagem|progresso dos alunos|acompanhamento acad[eê]mico|learning progress|course progress)\b/i, route: '/progress', layout: 'analytics', components: ['ProgressOverview', 'CompletionChart', 'LearnerSignals'], coreDomain: true },
  { name: 'Avaliações acadêmicas', purpose: 'Aplicar avaliações e registrar entregas e resultados', strategy: 'workflow', entities: ['Assessment', 'Submission'], pattern: /\b(avalia[cç][oõ]es? acad[eê]micas?|provas? e atividades?|quizzes?|assessments?)\b/i, route: '/assessments', layout: 'stepper', components: ['AssessmentBuilder', 'SubmissionQueue', 'GradePanel'], coreDomain: true },
  { name: 'Remessas e entregas', purpose: 'Coordenar remessas desde a expedição até a confirmação de entrega', strategy: 'workflow', entities: ['Shipment', 'Delivery'], pattern: /\b(remessas?(?:\s+e\s+entregas?)?|gest[aã]o de entregas?|expedi[cç][aã]o e entrega|shipments?(?:\s+and\s+deliveries)?|delivery operations)\b/i, route: '/shipments', layout: 'timeline', components: ['ShipmentTimeline', 'DeliveryStatus', 'ExceptionQueue'], coreDomain: true },
  { name: 'Frota', purpose: 'Manter veículos, motoristas e disponibilidade operacional', strategy: 'crud', entities: ['Vehicle', 'Driver'], pattern: /\b(gest[aã]o de frota|frotas?|ve[ií]culos?(?:\s+e\s+motoristas?)?|fleet management)\b/i, route: '/fleet', layout: 'directory', components: ['FleetDirectory', 'VehicleStatus', 'DriverRoster'], coreDomain: true },
  { name: 'Planejamento de rotas', purpose: 'Planejar rotas e distribuir entregas por capacidade e prioridade', strategy: 'workflow', entities: ['DeliveryRoute', 'Shipment', 'Vehicle'], pattern: /\b(planejamento de rotas?|roteiriza[cç][aã]o|rotas?(?:\s+de\s+entrega)?|route planning|dispatch routes?)\b/i, route: '/routes', layout: 'command-center', components: ['RoutePlanner', 'DispatchMap', 'CapacityPanel'], coreDomain: true },
  { name: 'Rastreamento logístico', purpose: 'Registrar eventos de rastreamento e comunicar exceções operacionais', strategy: 'content', entities: ['TrackingEvent', 'Shipment'], pattern: /\b(rastreamento log[ií]stico|eventos? de rastreamento|rastreio de entregas?|tracking de pedidos?|shipment tracking|delivery tracking)\b/i, route: '/tracking', layout: 'timeline', components: ['TrackingTimeline', 'ShipmentLookup', 'ExceptionDetails'], coreDomain: true },
  { name: 'Programação de eventos', purpose: 'Organizar eventos, sessões, espaços e programação', strategy: 'content', entities: ['Event', 'EventSession'], pattern: /\b(programa[cç][aã]o de eventos?|eventos? e sess[oõ]es|agenda do evento|event schedule|event sessions?)\b/i, route: '/events', layout: 'calendar', components: ['EventSchedule', 'SessionCatalog', 'VenueFilter'], coreDomain: true },
  { name: 'Ingressos e inscrições', purpose: 'Gerenciar lotes, inscrições e emissão de ingressos', strategy: 'workflow', entities: ['Ticket', 'Attendee', 'Event'], pattern: /\b(ingressos? e inscri[cç][oõ]es|venda de ingressos?|participantes? do evento|ticketing|event registration)\b/i, route: '/tickets', layout: 'checkout', components: ['TicketSelector', 'RegistrationFlow', 'AttendeeDirectory'], coreDomain: true },
  { name: 'Credenciamento', purpose: 'Validar ingressos e registrar a entrada de participantes', strategy: 'workflow', entities: ['CheckIn', 'Ticket'], pattern: /\b(credenciamento|check-?in do evento|controle de entrada|attendee check-?in)\b/i, route: '/check-in', layout: 'command-center', components: ['CheckInScanner', 'EntryStatus', 'AttendanceSignals'], coreDomain: true },
  { name: 'Reservas de mesas', purpose: 'Organizar disponibilidade, horários e preferências dos clientes', strategy: 'workflow', entities: ['Reservation', 'Guest'], pattern: /\b(reservas? de mesas?|reserva de restaurante|restaurant reservations?|table booking)\b/i, route: '/reservations', layout: 'calendar', components: ['ReservationCalendar', 'TableAvailability', 'GuestDrawer'], coreDomain: true },
  { name: 'Cardápio', purpose: 'Manter itens, categorias, preços e disponibilidade do cardápio', strategy: 'content', entities: ['MenuItem', 'Category'], pattern: /\b(card[aá]pio|menu do restaurante|itens? do menu|restaurant menu)\b/i, route: '/menu', layout: 'catalog', components: ['MenuCatalog', 'CategoryNavigation', 'MenuItemEditor'], coreDomain: true },
  { name: 'Operação de pedidos do restaurante', purpose: 'Conduzir pedidos do salão ou delivery até a entrega', strategy: 'workflow', entities: ['RestaurantOrder', 'MenuItem'], pattern: /\b(pedidos? do restaurante|pedidos? do sal[aã]o|comandas?|restaurant orders?|food orders?)\b/i, route: '/restaurant-orders', layout: 'kanban', components: ['OrderBoard', 'OrderTicket', 'ServiceFilters'], coreDomain: true },
  { name: 'Cozinha', purpose: 'Priorizar preparos e sincronizar a cozinha com atendimento e delivery', strategy: 'workflow', entities: ['KitchenTicket', 'RestaurantOrder'], pattern: /\b(painel da cozinha|opera[cç][aã]o da cozinha|fila de preparo|kitchen display|kitchen operations?)\b/i, route: '/kitchen', layout: 'command-center', components: ['KitchenQueue', 'PreparationTimer', 'StationFilter'], coreDomain: true },
  { name: 'Notificações', purpose: 'Entregar alertas relevantes dentro do produto', strategy: 'workflow', entities: ['Notification'], pattern: /\b(notific|alerta|lembrete|reminder)/i, route: '/notifications', layout: 'inbox', components: ['NotificationInbox', 'NotificationPreferences'] },
  { name: 'Relatórios e análises', purpose: 'Transformar dados operacionais em decisões', strategy: 'computed', entities: ['Report'], pattern: /\b(relat[oó]rio|analytics|an[aá]lise|indicador|m[eé]trica)/i, route: '/reports', layout: 'analytics', components: ['ReportBuilder', 'MetricCanvas', 'ExportActions'] },
  { name: 'Mensagens', purpose: 'Conectar participantes em conversas contextualizadas', strategy: 'workflow', entities: ['Message'], pattern: /\b(chat|mensage|conversa|inbox)/i, route: '/messages', layout: 'conversation', components: ['ConversationList', 'MessageThread', 'MessageComposer'] },
  { name: 'Arquivos', purpose: 'Organizar uploads e documentos associados ao trabalho', strategy: 'content', entities: ['FileAsset'], pattern: /\b(upload|arquivo|documento|anexo|m[ií]dia)/i, route: '/files', layout: 'asset-library', components: ['FileLibrary', 'UploadDropzone', 'FilePreview'] },
  { name: 'Assinaturas', purpose: 'Gerenciar planos, recorrência e acesso contratado', strategy: 'workflow', entities: ['Subscription', 'Plan'], pattern: /\b(assinatura|subscription|plano recorrente|recorr[eê]ncia)/i, route: '/subscriptions', layout: 'billing', components: ['PlanSelector', 'SubscriptionSummary', 'BillingHistory'] },
  { name: 'Papéis e permissões', purpose: 'Controlar acesso por responsabilidade', strategy: 'custom', entities: ['Role'], pattern: /\b(permiss|pap[eé]is|roles?|controle de acesso)/i, route: '/access', layout: 'permission-matrix', components: ['RoleDirectory', 'PermissionMatrix', 'AccessAudit'] },
  { name: 'Integrações', purpose: 'Conectar serviços externos ao fluxo principal', strategy: 'integration', entities: ['Integration'], pattern: /\b(integra[cç][aã]o|webhook|api externa|zapier|stripe|whatsapp)/i, route: '/integrations', layout: 'integration-hub', components: ['IntegrationCatalog', 'ConnectionStatus', 'WebhookLog'] },
  { name: 'Pagamentos', purpose: 'Processar e acompanhar transações financeiras', strategy: 'integration', entities: ['Payment'], pattern: /\b(pagamento|payment|pix|cart[aã]o|boleto)/i, route: '/payments', layout: 'payment-operations', components: ['PaymentSummary', 'PaymentTimeline', 'RefundActions'] },
  { name: 'Automação inteligente', purpose: 'Aplicar inteligência artificial ao fluxo solicitado', strategy: 'computed', entities: ['Automation'], pattern: /\b(intelig[eê]ncia artificial|\bia\b|\bai\b|recomenda[cç][aã]o|agente)/i, route: '/automation', layout: 'automation-studio', components: ['AutomationCanvas', 'RecommendationPanel', 'ExecutionHistory'] },
  { name: 'Exportação de dados', purpose: 'Exportar informações com filtros e rastreabilidade', strategy: 'workflow', entities: ['ExportJob'], pattern: /\b(export|csv|excel|pdf)/i, route: '/exports', layout: 'export-center', components: ['ExportBuilder', 'ExportHistory'] },
];

const profiles: Record<ProductArchetype, ProductProfile> = {
  commerce: {
    audience: ['Cliente', 'Operador da loja'],
    problem: 'Descobrir, comprar e acompanhar produtos sem fricção',
    value: 'Uma jornada de compra coerente da descoberta ao pós-venda',
    entities: ['Product', 'Category', 'Cart', 'Order', 'Customer'],
    capabilities: [
      { name: 'Descoberta de produtos', purpose: 'Explorar, buscar e filtrar o catálogo', strategy: 'custom', entities: ['Product', 'Category'] },
      { name: 'Carrinho', purpose: 'Montar e revisar uma intenção de compra', strategy: 'workflow', entities: ['Cart', 'Product'] },
      { name: 'Checkout', purpose: 'Confirmar dados, entrega e pagamento', strategy: 'workflow', entities: ['Cart', 'Order', 'Customer'] },
      { name: 'Operação de pedidos', purpose: 'Acompanhar o ciclo de atendimento do pedido', strategy: 'workflow', entities: ['Order'] },
      { name: 'Gestão de catálogo', purpose: 'Manter produtos, categorias, preço e estoque', strategy: 'crud', entities: ['Product', 'Category'] },
    ],
    screens: [
      { name: 'Vitrine', route: '/', purpose: 'Descoberta e seleção de produtos', layout: 'catalog', capabilities: ['Descoberta de produtos'], components: ['StorefrontHeader', 'ProductGrid', 'CategoryFilter', 'SearchBar'] },
      { name: 'Produto', route: '/products/:id', purpose: 'Decisão de compra', layout: 'split-focus', capabilities: ['Descoberta de produtos', 'Carrinho'], components: ['ProductGallery', 'ProductSummary', 'AddToCart'] },
      { name: 'Carrinho', route: '/cart', purpose: 'Revisar a compra', layout: 'checkout', capabilities: ['Carrinho'], components: ['CartItems', 'OrderSummary'] },
      { name: 'Checkout', route: '/checkout', purpose: 'Concluir a compra', layout: 'stepper', capabilities: ['Checkout'], components: ['CheckoutStepper', 'AddressForm', 'PaymentForm'] },
      { name: 'Pedidos', route: '/orders', purpose: 'Acompanhar pedidos', layout: 'timeline', capabilities: ['Operação de pedidos'], components: ['OrderTimeline', 'OrderStatus'] },
    ],
  },
  healthcare: {
    audience: ['Profissional de saúde', 'Recepção'],
    problem: 'Coordenar agenda e continuidade do cuidado com contexto',
    value: 'Atendimentos organizados em torno da jornada do paciente',
    entities: ['Patient', 'Appointment', 'ClinicalRecord', 'Professional'],
    capabilities: [
      { name: 'Agenda clínica', purpose: 'Organizar horários, profissionais e confirmações', strategy: 'workflow', entities: ['Appointment', 'Professional', 'Patient'] },
      { name: 'Cadastro de pacientes', purpose: 'Manter dados essenciais do paciente', strategy: 'crud', entities: ['Patient'] },
      { name: 'Prontuário', purpose: 'Registrar e consultar a linha do tempo clínica', strategy: 'custom', entities: ['ClinicalRecord', 'Patient'] },
      { name: 'Continuidade do cuidado', purpose: 'Planejar retornos e pendências', strategy: 'workflow', entities: ['Appointment', 'Patient'] },
    ],
    screens: [
      { name: 'Central de cuidado', route: '/', purpose: 'Priorizar agenda e pacientes', layout: 'care-hub', capabilities: ['Agenda clínica', 'Continuidade do cuidado'], components: ['DailyAgenda', 'CareAlerts', 'PatientQueue'] },
      { name: 'Agenda', route: '/appointments', purpose: 'Gerenciar atendimentos', layout: 'calendar', capabilities: ['Agenda clínica'], components: ['Calendar', 'AppointmentDrawer', 'ProfessionalFilter'] },
      { name: 'Pacientes', route: '/patients', purpose: 'Localizar pacientes', layout: 'directory', capabilities: ['Cadastro de pacientes'], components: ['PatientDirectory', 'PatientSearch'] },
      { name: 'Paciente', route: '/patients/:id', purpose: 'Acompanhar histórico e plano de cuidado', layout: 'timeline', capabilities: ['Prontuário', 'Continuidade do cuidado'], components: ['PatientHeader', 'ClinicalTimeline', 'FollowUpPanel'] },
    ],
  },
  crm: {
    audience: ['Representante comercial', 'Gestor comercial'],
    problem: 'Transformar relacionamentos e oportunidades em progresso previsível',
    value: 'Contexto comercial conectado a próximas ações',
    entities: ['Contact', 'Company', 'Deal', 'Activity'],
    capabilities: [
      { name: 'Relacionamentos', purpose: 'Centralizar contatos e empresas', strategy: 'crud', entities: ['Contact', 'Company'] },
      { name: 'Pipeline comercial', purpose: 'Avançar oportunidades por etapas', strategy: 'workflow', entities: ['Deal', 'Company', 'Contact'] },
      { name: 'Próximas ações', purpose: 'Organizar atividades de acompanhamento', strategy: 'workflow', entities: ['Activity', 'Deal'] },
      { name: 'Previsão de receita', purpose: 'Calcular valor ponderado do pipeline', strategy: 'computed', entities: ['Deal'] },
    ],
    screens: [
      { name: 'Visão comercial', route: '/', purpose: 'Ler receita, risco e ações', layout: 'revenue-overview', capabilities: ['Previsão de receita', 'Próximas ações'], components: ['RevenueForecast', 'RiskSignals', 'NextActions'] },
      { name: 'Pipeline', route: '/deals', purpose: 'Gerenciar oportunidades por etapa', layout: 'kanban', capabilities: ['Pipeline comercial'], components: ['DealBoard', 'DealCard', 'PipelineFilters'] },
      { name: 'Relacionamentos', route: '/contacts', purpose: 'Consultar contatos e empresas', layout: 'directory', capabilities: ['Relacionamentos'], components: ['ContactDirectory', 'CompanyContext'] },
      { name: 'Atividades', route: '/activities', purpose: 'Executar acompanhamentos', layout: 'timeline', capabilities: ['Próximas ações'], components: ['ActivityTimeline', 'ActivityComposer'] },
    ],
  },
  finance: {
    audience: ['Responsável financeiro', 'Gestor'],
    problem: 'Entender movimentações, compromissos e resultado',
    value: 'Decisões financeiras baseadas em uma visão reconciliada',
    entities: ['Transaction', 'Account', 'Invoice', 'Budget'],
    capabilities: [
      { name: 'Movimentações', purpose: 'Registrar e conciliar entradas e saídas', strategy: 'workflow', entities: ['Transaction', 'Account'] },
      { name: 'Contas e faturas', purpose: 'Acompanhar valores a pagar e receber', strategy: 'workflow', entities: ['Invoice'] },
      { name: 'Orçamento', purpose: 'Comparar planejado e realizado', strategy: 'computed', entities: ['Budget', 'Transaction'] },
      { name: 'Indicadores financeiros', purpose: 'Consolidar saldo e tendências', strategy: 'computed', entities: ['Transaction', 'Invoice'] },
    ],
    screens: [
      { name: 'Visão financeira', route: '/', purpose: 'Acompanhar saldo e compromissos', layout: 'wealth-overview', capabilities: ['Indicadores financeiros', 'Orçamento'], components: ['BalanceHero', 'CashFlowChart', 'BudgetProgress'] },
      { name: 'Movimentações', route: '/transactions', purpose: 'Conciliar transações', layout: 'ledger', capabilities: ['Movimentações'], components: ['TransactionLedger', 'ReconciliationFilters'] },
      { name: 'Faturas', route: '/invoices', purpose: 'Acompanhar vencimentos', layout: 'timeline', capabilities: ['Contas e faturas'], components: ['InvoiceTimeline', 'DueDateCalendar'] },
    ],
  },
  creative: {
    audience: ['Criador', 'Cliente'],
    problem: 'Organizar trabalhos, entregas e revisão criativa',
    value: 'Uma experiência visual para apresentar e conduzir projetos',
    entities: ['Project', 'Asset', 'Client', 'Review'],
    capabilities: [
      { name: 'Portfólio', purpose: 'Apresentar trabalhos e estudos de caso', strategy: 'content', entities: ['Project', 'Asset'] },
      { name: 'Produção criativa', purpose: 'Organizar projetos e entregas', strategy: 'workflow', entities: ['Project', 'Asset'] },
      { name: 'Revisão', purpose: 'Coletar contexto e aprovação', strategy: 'workflow', entities: ['Review', 'Project'] },
    ],
    screens: [
      { name: 'Estúdio', route: '/', purpose: 'Destacar trabalhos e entregas', layout: 'immersive-canvas', capabilities: ['Portfólio', 'Produção criativa'], components: ['FeaturedProject', 'ProjectGallery', 'DeliveryRail'] },
      { name: 'Projetos', route: '/projects', purpose: 'Acompanhar produção', layout: 'gallery', capabilities: ['Produção criativa'], components: ['ProjectGallery', 'ProgressFilter'] },
      { name: 'Revisão', route: '/reviews', purpose: 'Conduzir aprovações', layout: 'split-focus', capabilities: ['Revisão'], components: ['AssetPreview', 'ReviewThread', 'ApprovalActions'] },
    ],
  },
  dashboard: {
    audience: ['Operador', 'Gestor'], problem: 'Priorizar e executar trabalho operacional', value: 'Uma central acionável do que exige atenção', entities: ['Task', 'Project', 'Activity'],
    capabilities: [
      { name: 'Fluxo operacional', purpose: 'Organizar trabalho por estágio', strategy: 'workflow', entities: ['Task'] },
      { name: 'Acompanhamento', purpose: 'Medir progresso e pendências', strategy: 'computed', entities: ['Task', 'Project'] },
      { name: 'Atividade recente', purpose: 'Manter contexto das mudanças', strategy: 'content', entities: ['Activity'] },
    ],
    screens: [
      { name: 'Central operacional', route: '/', purpose: 'Priorizar trabalho', layout: 'command-center', capabilities: ['Fluxo operacional', 'Acompanhamento'], components: ['WorkBoard', 'PrioritySignals', 'ProgressMetrics'] },
      { name: 'Trabalho', route: '/tasks', purpose: 'Executar tarefas', layout: 'kanban', capabilities: ['Fluxo operacional'], components: ['TaskBoard', 'TaskCard', 'TaskFilters'] },
    ],
  },
  saas: {
    audience: ['Usuário', 'Administrador'], problem: 'Executar um fluxo de trabalho especializado', value: 'Um espaço de produto centrado na tarefa principal', entities: ['Workspace', 'Member', 'Task'],
    capabilities: [
      { name: 'Workspace', purpose: 'Centralizar o trabalho do produto', strategy: 'custom', entities: ['Workspace'] },
      { name: 'Colaboração', purpose: 'Organizar participantes e responsabilidades', strategy: 'workflow', entities: ['Member', 'Task'] },
      { name: 'Configuração', purpose: 'Administrar preferências do produto', strategy: 'crud', entities: ['Workspace', 'Member'] },
    ],
    screens: [
      { name: 'Workspace', route: '/', purpose: 'Executar o trabalho principal', layout: 'product-workspace', capabilities: ['Workspace', 'Colaboração'], components: ['WorkspaceHeader', 'FocusPanel', 'ActivityRail'] },
      { name: 'Equipe', route: '/members', purpose: 'Gerenciar colaboração', layout: 'directory', capabilities: ['Colaboração'], components: ['MemberDirectory', 'RoleFilter'] },
    ],
  },
  generic: {
    audience: ['Usuário'], problem: 'Executar o objetivo descrito pelo usuário', value: 'Uma experiência coerente com o fluxo solicitado', entities: ['Item'],
    capabilities: [{ name: 'Fluxo principal', purpose: 'Executar a principal tarefa do produto', strategy: 'custom', entities: ['Item'] }],
    screens: [{ name: 'Experiência principal', route: '/', purpose: 'Executar o fluxo principal', layout: 'editorial-overview', capabilities: ['Fluxo principal'], components: ['PrimaryWorkspace', 'ActionPanel', 'FeedbackState'] }],
  },
};

const normalize = (value: string): string => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function inferDepth(prompt: string): BlueprintDepth {
  const text = normalize(prompt);
  if (prompt.length > 1200 || /(microservic|websocket|multi-tenant|multitenant|compliance|roadmap|permissoes|integracoes)/.test(text)) return 'complete';
  if (prompt.length > 350 || /(autentic|dashboard|workflow|pagamento|relatorio|notific|perfil|admin)/.test(text)) return 'product';
  return 'essential';
}

function hasAuthentication(prompt: string): boolean {
  return /(login|autentic|cadastro|conta|usuario|usuário|permiss|role|admin)/i.test(prompt);
}

function architectureFor(prompt: string, authentication: boolean): ProductBlueprint['architecture'] {
  const text = normalize(prompt);
  const database = text.includes('postgres') ? 'postgresql' : text.includes('mongo') ? 'mongodb' : text.includes('mysql') ? 'mysql' : text.includes('sqlite') ? 'sqlite' : 'sqlite';
  return {
    frontend: [text.includes('next') ? 'next.js' : 'react', 'typescript'],
    backend: [text.includes('python') ? 'python' : 'node.js', text.includes('graphql') ? 'graphql' : 'express'],
    database,
    authentication,
    api: text.includes('graphql') ? 'graphql' : 'rest',
  };
}

export class ProductBlueprintPlanner {
  async evolve(current: ProductBlueprint, change: string, sourcePrompt?: string): Promise<ProductBlueprint> {
    const prompt = [sourcePrompt || current.source.prompt, change].filter(Boolean).join('\n\n');
    const changesVisualDirection = /\b(marca|brand|visual|estilos?|styles?|paletas?|palettes?|cor|cores|colors?|tipografia|fonts?|temas?|themes?|layouts?|navegacao|navigation|dark|light|premium|luxo|minimalista|minimal|brutalista|brutal|editorial)\b/i.test(normalize(change));
    const evolved = await this.create({
      prompt,
      projectId: current.projectId,
      sourceType: current.source.type,
      documentIds: current.source.documentIds,
      depth: current.depth,
      visualIntent: changesVisualDirection ? undefined : current.visualIntent,
    });
    const changesProductName = /(chamad[oa]|chama-se|called|named|marca|brand)/i.test(change);
    const reconciled = reconcileEvolution(current, evolved);
    return {
      ...reconciled,
      blueprintId: current.blueprintId,
      projectId: current.projectId,
      version: current.version + 1,
      product: {
        ...reconciled.product,
        name: changesProductName ? reconciled.product.name : current.product.name,
      },
      visualIntent: changesVisualDirection ? reconciled.visualIntent : current.visualIntent,
      source: {
        type: current.source.type,
        prompt,
        documentIds: current.source.documentIds,
      },
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  async create(input: ProductBlueprintInput): Promise<ProductBlueprint> {
    const prompt = input.prompt.trim();
    if (!prompt) throw new Error('Product Blueprint requires a prompt or extracted document content');
    const visualIntent = input.visualIntent || analyzeVisualIntent(prompt);
    const profile = profiles[visualIntent.archetype];
    const depth = input.depth || inferDepth(prompt);
    const authentication = hasAuthentication(prompt);
    const extraction = await requirementsExtractor.extract({ text: prompt });
    const catalogExtensions = explicitCapabilityPatterns.filter(extension =>
      extension.pattern.test(prompt) &&
      !profile.capabilities.some(capability => normalize(capability.name) === normalize(extension.name))
    );
    const inferredExtensions = catalogExtensions.some(extension => extension.coreDomain) || !['dashboard', 'saas', 'generic'].includes(visualIntent.archetype)
      ? []
      : inferOpenDomainCapabilities(prompt).filter(inferred =>
        !catalogExtensions.some(extension => normalize(extension.name) === normalize(inferred.name))
      );
    const extensions = [...catalogExtensions, ...inferredExtensions];
    const coreExtensions = extensions.filter(extension => extension.coreDomain);
    const replacesGenericCore = coreExtensions.length > 0 && ['dashboard', 'saas', 'generic'].includes(visualIntent.archetype);
    const profileCapabilities = replacesGenericCore
      ? profile.capabilities.filter(capability => normalize(capability.name) === normalize('Atividade recente'))
      : profile.capabilities;
    const profileScreens = replacesGenericCore
      ? profile.screens
        .filter(screen => screen.route === '/')
        .map(screen => ({ ...screen, capabilities: coreExtensions.slice(0, 3).map(extension => extension.name) }))
      : profile.screens;
    const capabilityProfiles = [...profileCapabilities, ...extensions];
    const screenProfiles: ProfileScreen[] = [
      ...profileScreens,
      ...extensions.map(extension => ({
        name: extension.name,
        route: extension.route,
        purpose: extension.purpose,
        layout: extension.layout,
        capabilities: [extension.name],
        components: extension.components,
      })),
    ];
    const personas: ProductPersona[] = profile.audience.map((name, index) => ({
      id: `PERSONA-${String(index + 1).padStart(3, '0')}`,
      name,
      goals: index === 0 ? [profile.value] : ['Administrar e acompanhar a operação'],
      permissions: authentication ? (index === 0 ? ['member'] : ['admin']) : ['public'],
    }));
    const capabilities: ProductCapability[] = capabilityProfiles.map((capability, index) => ({
      id: `CAP-${String(index + 1).padStart(3, '0')}`,
      name: capability.name,
      purpose: capability.purpose,
      strategy: capability.strategy,
      priority: (index < 3 || index >= profileCapabilities.length) && screenProfiles.some(screen => screen.capabilities.includes(capability.name))
        ? 'must'
        : 'should',
      actors: personas.map(persona => persona.id),
      entities: capability.entities,
      rules: capabilityRules(capability),
      acceptanceCriteria: capabilityAcceptanceCriteria(capability),
      evidence: [{
        source: index >= profileCapabilities.length ? 'user' : 'inference',
        excerpt: index >= profileCapabilities.length ? capability.name : `${visualIntent.archetype}:${capability.name}`,
        confidence: index >= profileCapabilities.length ? 0.96 : 0.82,
      }],
    }));
    const screens: ProductScreen[] = screenProfiles.map((screen, index) => ({
      id: `SCREEN-${String(index + 1).padStart(3, '0')}`,
      name: screen.name,
      route: screen.route,
      purpose: screen.purpose,
      layout: screen.layout,
      capabilityIds: capabilities.filter(capability => screen.capabilities.includes(capability.name)).map(capability => capability.id),
      componentIds: screen.components.map((_, componentIndex) => `COMP-${String(screenProfiles.slice(0, index).reduce((sum, item) => sum + item.components.length, 0) + componentIndex + 1).padStart(3, '0')}`),
      states: ['loading', 'empty', 'ready', 'error'],
    }));
    const components: ProductComponent[] = [];
    for (const screen of screenProfiles) {
      const target = screens.find(item => item.name === screen.name)!;
      screen.components.forEach((name, index) => components.push({
        id: target.componentIds[index]!, name, category: 'domain', purpose: `${name} on ${screen.name}`,
        variants: ['default'], states: ['loading', 'empty', 'ready', 'error'], screenIds: [target.id],
      }));
    }
    const profileEntities = replacesGenericCore
      ? profileCapabilities.flatMap(capability => capability.entities)
      : profile.entities;
    const entityNames = Array.from(new Set([...profileEntities, ...extensions.flatMap(extension => extension.entities)]));
    const data = entityNames.map((name, index) => ({
      id: `DATA-${String(index + 1).padStart(3, '0')}`,
      name,
      purpose: `Support ${capabilities.filter(capability => capability.entities.includes(name)).map(capability => capability.name).join(', ')}`,
      capabilityIds: capabilities.filter(capability => capability.entities.includes(name)).map(capability => capability.id),
    }));
    const acceptanceCriteria: ProductAcceptanceCriterion[] = capabilities.flatMap((capability, capabilityIndex) => {
      const route = screens.find(screen => screen.capabilityIds.includes(capability.id))?.route;
      const entity = capability.entities[0];
      return capability.acceptanceCriteria.map((statement, index) => ({
        id: `AC-${String((capabilityIndex * 2) + index + 1).padStart(3, '0')}`,
        statement,
        capabilityId: capability.id,
        testType: index === 0 ? 'journey' as const : 'integration' as const,
        required: capability.priority === 'must',
        kind: acceptanceKind(capability.strategy, index),
        ...(entity ? { entity } : {}),
        ...(route ? { route } : {}),
        assertions: index === 0
          ? ['operation reaches the declared outcome', 'server response is reflected in the interface', 'result remains available after reload']
          : ['loading state is visible', 'empty state is useful', 'errors are actionable', 'success state uses persisted data'],
      }));
    });
    const mustCapabilities = capabilities.filter(capability => capability.priority === 'must');
    const journeyCandidates = [
      ...mustCapabilities.filter(capability => capability.evidence.some(evidence => evidence.source === 'user')),
      ...mustCapabilities.filter(capability => capability.evidence.every(evidence => evidence.source !== 'user')),
    ];
    const journeys = journeyCandidates.slice(0, depth === 'essential' ? 1 : depth === 'product' ? 3 : journeyCandidates.length).map((capability, index) => ({
      id: `FLOW-${String(index + 1).padStart(3, '0')}`,
      name: capability.name,
      actorId: personas[0]!.id,
      trigger: `The user starts ${capability.name}`,
      steps: [`Open the relevant workspace`, capability.purpose, 'Review the result and receive feedback'],
      capabilityIds: [capability.id],
      outcome: capability.acceptanceCriteria[0]!,
    }));
    const now = new Date().toISOString();
    const confidence = Math.round(((extraction.metadata.confidence + 0.82) / 2) * 100) / 100;
    return {
      schemaVersion: PRODUCT_BLUEPRINT_SCHEMA_VERSION,
      blueprintId: `blueprint-${randomUUID()}`,
      projectId: input.projectId || `project-${randomUUID()}`,
      version: 1,
      status: 'ready',
      depth,
      source: { type: input.sourceType || 'prompt', prompt, documentIds: input.documentIds || [] },
      product: {
        name: input.productName?.trim() || visualIntent.brandName,
        summary: prompt,
        problem: profile.problem,
        valueProposition: profile.value,
        audience: profile.audience,
        goals: capabilities.filter(capability => capability.priority === 'must').map(capability => capability.purpose),
        outOfScope: [],
      },
      visualIntent,
      personas,
      capabilities,
      journeys,
      screens,
      components,
      data,
      architecture: architectureFor(prompt, authentication),
      acceptanceCriteria,
      assumptions: extraction.metadata.confidence < 0.8 ? ['Low-confidence requirements must be reviewed in the workspace'] : [],
      openQuestions: [],
      confidence,
      createdAt: now,
      updatedAt: now,
    };
  }

  validate(blueprint: ProductBlueprint): { valid: boolean; score: number; errors: string[] } {
    const errors: string[] = [];
    if (!blueprint.product.name) errors.push('Product name is required');
    if (blueprint.capabilities.length === 0) errors.push('At least one capability is required');
    if (blueprint.screens.length === 0) errors.push('At least one screen is required');
    if (blueprint.components.length === 0) errors.push('At least one component is required');
    for (const capability of blueprint.capabilities.filter(item => item.priority === 'must')) {
      if (!blueprint.acceptanceCriteria.some(criterion => criterion.capabilityId === capability.id && criterion.required)) errors.push(`${capability.id} requires an acceptance criterion`);
      if (!blueprint.screens.some(screen => screen.capabilityIds.includes(capability.id))) errors.push(`${capability.id} is not represented by a screen`);
    }
    errors.push(...validateProductBlueprintContract(blueprint).errors);
    const totalChecks = 4 + blueprint.capabilities.filter(item => item.priority === 'must').length * 2;
    return { valid: errors.length === 0, score: Math.max(0, Math.round(((totalChecks - errors.length) / totalChecks) * 100)), errors };
  }
}

export const productBlueprintPlanner = new ProductBlueprintPlanner();
