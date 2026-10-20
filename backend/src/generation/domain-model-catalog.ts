export type DomainFieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'url'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'relation'
  | 'select';

export interface DomainFieldOption {
  value: string;
  pt: string;
  en: string;
}

export interface DomainField {
  name: string;
  kind: DomainFieldKind;
  prismaType: 'String' | 'Int' | 'Float' | 'DateTime' | 'Boolean';
  tsType: 'string' | 'number' | 'boolean' | 'Date | string';
  required: boolean;
  pt: string;
  en: string;
  placeholderPt?: string;
  placeholderEn?: string;
  defaultValue?: string | number | boolean;
  options?: DomainFieldOption[];
  summary?: boolean;
  relationTo?: string;
  relationLabel?: string;
}

export interface DomainRelation {
  field: string;
  target: string;
  required: boolean;
  labelPt: string;
  labelEn: string;
}

export interface DomainWorkflow {
  field: string;
  initial: string;
  transitions: Record<string, string[]>;
}

const option = (value: string, pt: string, en: string): DomainFieldOption => ({ value, pt, en });

const baseFields: DomainField[] = [
  { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Nome', en: 'Name', placeholderPt: 'Digite o nome', placeholderEn: 'Enter a name', summary: true },
  { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Descrição', en: 'Description', placeholderPt: 'Adicione contexto e observações', placeholderEn: 'Add context and notes' },
  { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'active', options: [option('active', 'Ativo', 'Active'), option('pending', 'Pendente', 'Pending'), option('inactive', 'Inativo', 'Inactive')], summary: true },
];

const catalog: Record<string, DomainField[]> = {
  contact: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Nome completo', en: 'Full name', placeholderPt: 'Ex.: Marina Costa', placeholderEn: 'E.g. Marina Costa', summary: true },
    { name: 'email', kind: 'email', prismaType: 'String', tsType: 'string', required: true, pt: 'E-mail', en: 'Email', placeholderPt: 'marina@empresa.com', placeholderEn: 'marina@company.com', summary: true },
    { name: 'phone', kind: 'phone', prismaType: 'String', tsType: 'string', required: false, pt: 'Telefone', en: 'Phone', placeholderPt: '(11) 99999-9999', placeholderEn: '+1 555 000 0000' },
    { name: 'role', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Cargo', en: 'Role', placeholderPt: 'Ex.: Diretora comercial', placeholderEn: 'E.g. Sales director', summary: true },
    { name: 'companyId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Empresa', en: 'Company', relationTo: 'Company', relationLabel: 'name' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Notas', en: 'Notes', placeholderPt: 'Contexto do relacionamento', placeholderEn: 'Relationship context' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'lead', options: [option('lead', 'Lead', 'Lead'), option('active', 'Cliente ativo', 'Active customer'), option('inactive', 'Inativo', 'Inactive')], summary: true },
  ],
  company: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Empresa', en: 'Company', placeholderPt: 'Razão social ou nome fantasia', placeholderEn: 'Company name', summary: true },
    { name: 'industry', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Segmento', en: 'Industry', placeholderPt: 'Ex.: Tecnologia', placeholderEn: 'E.g. Technology', summary: true },
    { name: 'website', kind: 'url', prismaType: 'String', tsType: 'string', required: false, pt: 'Site', en: 'Website', placeholderPt: 'https://empresa.com', placeholderEn: 'https://company.com' },
    { name: 'size', kind: 'select', prismaType: 'String', tsType: 'string', required: false, pt: 'Porte', en: 'Size', options: [option('small', 'Pequena', 'Small'), option('medium', 'Média', 'Medium'), option('enterprise', 'Grande empresa', 'Enterprise')], summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Contexto comercial', en: 'Commercial context' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'prospect', options: [option('prospect', 'Prospect', 'Prospect'), option('active', 'Cliente', 'Customer'), option('inactive', 'Inativa', 'Inactive')], summary: true },
  ],
  deal: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Oportunidade', en: 'Opportunity', placeholderPt: 'Ex.: Expansão anual', placeholderEn: 'E.g. Annual expansion', summary: true },
    { name: 'value', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Valor', en: 'Value', defaultValue: 0, summary: true },
    { name: 'stage', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Etapa do funil', en: 'Pipeline stage', defaultValue: 'lead', options: [option('lead', 'Entrada', 'Lead'), option('qualification', 'Qualificação', 'Qualification'), option('proposal', 'Proposta', 'Proposal'), option('negotiation', 'Negociação', 'Negotiation'), option('won', 'Ganho', 'Won'), option('lost', 'Perdido', 'Lost')], summary: true },
    { name: 'probability', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Probabilidade (%)', en: 'Probability (%)', defaultValue: 20, summary: true },
    { name: 'expectedClose', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Previsão de fechamento', en: 'Expected close' },
    { name: 'companyId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Empresa', en: 'Company', relationTo: 'Company', relationLabel: 'name' },
    { name: 'contactId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Contato responsável', en: 'Primary contact', relationTo: 'Contact', relationLabel: 'name' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Próximo passo', en: 'Next step' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Ritmo', en: 'Momentum', defaultValue: 'active', options: [option('active', 'Em andamento', 'Active'), option('pending', 'Requer atenção', 'Needs attention'), option('inactive', 'Pausado', 'Paused')], summary: true },
  ],
  task: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Tarefa', en: 'Task', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Descrição', en: 'Description' },
    { name: 'dueDate', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Prazo', en: 'Due date', summary: true },
    { name: 'priority', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Prioridade', en: 'Priority', defaultValue: 'medium', options: [option('low', 'Baixa', 'Low'), option('medium', 'Média', 'Medium'), option('high', 'Alta', 'High')], summary: true },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'pending', options: [option('pending', 'A fazer', 'To do'), option('active', 'Em andamento', 'In progress'), option('done', 'Concluída', 'Done')], summary: true },
  ],
  patient: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Nome completo', en: 'Full name', summary: true },
    { name: 'email', kind: 'email', prismaType: 'String', tsType: 'string', required: false, pt: 'E-mail', en: 'Email' },
    { name: 'phone', kind: 'phone', prismaType: 'String', tsType: 'string', required: false, pt: 'Telefone', en: 'Phone', summary: true },
    { name: 'birthDate', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Data de nascimento', en: 'Birth date', summary: true },
    { name: 'document', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Documento', en: 'Document' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações clínicas', en: 'Clinical notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'active', options: [option('active', 'Em acompanhamento', 'Active'), option('pending', 'Retorno pendente', 'Follow-up due'), option('inactive', 'Inativo', 'Inactive')], summary: true },
  ],
  appointment: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Paciente / atendimento', en: 'Patient / appointment', summary: true },
    { name: 'scheduledAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Data e horário', en: 'Date and time', summary: true },
    { name: 'durationMinutes', kind: 'number', prismaType: 'Int', tsType: 'number', required: true, pt: 'Duração em minutos', en: 'Duration in minutes', defaultValue: 30, summary: true },
    { name: 'professional', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Profissional', en: 'Professional', summary: true },
    { name: 'patientId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Paciente', en: 'Patient', relationTo: 'Patient', relationLabel: 'name' },
    { name: 'type', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Tipo', en: 'Type', defaultValue: 'consultation', options: [option('consultation', 'Consulta', 'Consultation'), option('return', 'Retorno', 'Follow-up'), option('procedure', 'Procedimento', 'Procedure')], summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações', en: 'Notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'scheduled', options: [option('scheduled', 'Agendado', 'Scheduled'), option('confirmed', 'Confirmado', 'Confirmed'), option('completed', 'Concluído', 'Completed'), option('cancelled', 'Cancelado', 'Cancelled')], summary: true },
  ],
  product: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Produto', en: 'Product', summary: true },
    { name: 'sku', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'SKU', en: 'SKU', summary: true },
    { name: 'price', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Preço', en: 'Price', defaultValue: 0, summary: true },
    { name: 'stock', kind: 'number', prismaType: 'Int', tsType: 'number', required: true, pt: 'Estoque', en: 'Stock', defaultValue: 0, summary: true },
    { name: 'categoryId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Categoria', en: 'Category', relationTo: 'Category', relationLabel: 'name' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Descrição', en: 'Description' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Disponibilidade', en: 'Availability', defaultValue: 'active', options: [option('active', 'Disponível', 'Available'), option('low_stock', 'Estoque baixo', 'Low stock'), option('inactive', 'Indisponível', 'Unavailable')], summary: true },
  ],
  order: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Pedido', en: 'Order', summary: true },
    { name: 'customerId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Cliente', en: 'Customer', relationTo: 'Customer', relationLabel: 'name' },
    { name: 'total', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Total', en: 'Total', defaultValue: 0, summary: true },
    { name: 'placedAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Data do pedido', en: 'Placed at', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações', en: 'Notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Etapa', en: 'Stage', defaultValue: 'pending', options: [option('pending', 'Recebido', 'Received'), option('paid', 'Pago', 'Paid'), option('shipped', 'Enviado', 'Shipped'), option('completed', 'Concluído', 'Completed'), option('cancelled', 'Cancelado', 'Cancelled')], summary: true },
  ],
  customer: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Cliente', en: 'Customer', summary: true },
    { name: 'email', kind: 'email', prismaType: 'String', tsType: 'string', required: true, pt: 'E-mail', en: 'Email', summary: true },
    { name: 'phone', kind: 'phone', prismaType: 'String', tsType: 'string', required: false, pt: 'Telefone', en: 'Phone' },
    { name: 'lifetimeValue', kind: 'currency', prismaType: 'Float', tsType: 'number', required: false, pt: 'Valor acumulado', en: 'Lifetime value', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Preferências', en: 'Preferences' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'active', options: [option('active', 'Ativo', 'Active'), option('vip', 'VIP', 'VIP'), option('inactive', 'Inativo', 'Inactive')], summary: true },
  ],
  transaction: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Lançamento', en: 'Transaction', summary: true },
    { name: 'amount', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Valor', en: 'Amount', defaultValue: 0, summary: true },
    { name: 'type', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Tipo', en: 'Type', defaultValue: 'income', options: [option('income', 'Entrada', 'Income'), option('expense', 'Saída', 'Expense')], summary: true },
    { name: 'occurredAt', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Data', en: 'Date', summary: true },
    { name: 'category', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Categoria', en: 'Category', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Descrição', en: 'Description' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Conciliação', en: 'Reconciliation', defaultValue: 'pending', options: [option('pending', 'Pendente', 'Pending'), option('completed', 'Conciliada', 'Reconciled'), option('cancelled', 'Cancelada', 'Cancelled')], summary: true },
  ],
  project: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Projeto', en: 'Project', summary: true },
    { name: 'clientId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Cliente', en: 'Client', relationTo: 'Client', relationLabel: 'name' },
    { name: 'budget', kind: 'currency', prismaType: 'Float', tsType: 'number', required: false, pt: 'Orçamento', en: 'Budget', summary: true },
    { name: 'deadline', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Prazo', en: 'Deadline', summary: true },
    { name: 'progress', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Progresso (%)', en: 'Progress (%)', defaultValue: 0, summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Escopo', en: 'Scope' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Fase', en: 'Phase', defaultValue: 'planning', options: [option('planning', 'Planejamento', 'Planning'), option('active', 'Em produção', 'In production'), option('review', 'Revisão', 'Review'), option('completed', 'Entregue', 'Delivered')], summary: true },
  ],
  post: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Título', en: 'Title', summary: true },
    { name: 'slug', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Slug', en: 'Slug', summary: true },
    { name: 'author', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Autor', en: 'Author', summary: true },
    { name: 'publishedAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Publicação', en: 'Published at', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Conteúdo', en: 'Content' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status editorial', en: 'Editorial status', defaultValue: 'draft', options: [option('draft', 'Rascunho', 'Draft'), option('review', 'Em revisão', 'In review'), option('published', 'Publicado', 'Published')], summary: true },
  ],
  workorder: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Ordem de serviço', en: 'Work order', summary: true },
    { name: 'priority', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Prioridade', en: 'Priority', defaultValue: 'medium', options: [option('low', 'Baixa', 'Low'), option('medium', 'Média', 'Medium'), option('high', 'Alta', 'High'), option('critical', 'Crítica', 'Critical')], summary: true },
    { name: 'scheduledAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Execução prevista', en: 'Scheduled at', summary: true },
    { name: 'slaDueAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Limite do SLA', en: 'SLA due at' },
    { name: 'location', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Local', en: 'Location' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Escopo do serviço', en: 'Service scope' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Etapa', en: 'Stage', defaultValue: 'open', options: [option('open', 'Aberta', 'Open'), option('assigned', 'Atribuída', 'Assigned'), option('in_progress', 'Em execução', 'In progress'), option('blocked', 'Bloqueada', 'Blocked'), option('completed', 'Concluída', 'Completed'), option('cancelled', 'Cancelada', 'Cancelled')], summary: true },
  ],
  asset: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Ativo', en: 'Asset', summary: true },
    { name: 'serialNumber', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Número de série', en: 'Serial number', summary: true },
    { name: 'category', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Categoria', en: 'Category' },
    { name: 'location', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Localização', en: 'Location' },
    { name: 'lastMaintenanceAt', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Última manutenção', en: 'Last maintenance' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações técnicas', en: 'Technical notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Condição', en: 'Condition', defaultValue: 'operational', options: [option('operational', 'Operacional', 'Operational'), option('maintenance', 'Em manutenção', 'In maintenance'), option('inactive', 'Inativo', 'Inactive')], summary: true },
  ],
  technician: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Técnico', en: 'Technician', summary: true },
    { name: 'email', kind: 'email', prismaType: 'String', tsType: 'string', required: true, pt: 'E-mail', en: 'Email', summary: true },
    { name: 'phone', kind: 'phone', prismaType: 'String', tsType: 'string', required: false, pt: 'Telefone', en: 'Phone' },
    { name: 'specialty', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Especialidade', en: 'Specialty', summary: true },
    { name: 'region', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Região', en: 'Region' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Competências e observações', en: 'Skills and notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Disponibilidade', en: 'Availability', defaultValue: 'available', options: [option('available', 'Disponível', 'Available'), option('assigned', 'Em atendimento', 'Assigned'), option('offline', 'Indisponível', 'Offline')], summary: true },
  ],
  visit: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Visita', en: 'Visit', summary: true },
    { name: 'scheduledAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Data e horário', en: 'Date and time', summary: true },
    { name: 'address', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Endereço', en: 'Address', summary: true },
    { name: 'technician', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Técnico responsável', en: 'Assigned technician' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Instruções', en: 'Instructions' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'scheduled', options: [option('scheduled', 'Agendada', 'Scheduled'), option('en_route', 'Em deslocamento', 'En route'), option('in_progress', 'Em atendimento', 'In progress'), option('completed', 'Concluída', 'Completed'), option('cancelled', 'Cancelada', 'Cancelled')], summary: true },
  ],
  inspection: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Inspeção', en: 'Inspection', summary: true },
    { name: 'performedAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Realizada em', en: 'Performed at' },
    { name: 'score', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Pontuação', en: 'Score', defaultValue: 0, summary: true },
    { name: 'evidenceUrl', kind: 'url', prismaType: 'String', tsType: 'string', required: false, pt: 'Evidência', en: 'Evidence' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Resultado e não conformidades', en: 'Result and nonconformities' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Etapa', en: 'Stage', defaultValue: 'draft', options: [option('draft', 'Rascunho', 'Draft'), option('in_progress', 'Em inspeção', 'In progress'), option('approved', 'Aprovada', 'Approved'), option('rejected', 'Reprovada', 'Rejected')], summary: true },
  ],
  notification: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Título', en: 'Title', summary: true },
    { name: 'channel', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Canal', en: 'Channel', defaultValue: 'in_app', options: [option('in_app', 'No aplicativo', 'In app'), option('email', 'E-mail', 'Email'), option('sms', 'SMS', 'SMS')], summary: true },
    { name: 'recipient', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Destinatário', en: 'Recipient' },
    { name: 'scheduledAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Agendada para', en: 'Scheduled for' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Mensagem', en: 'Message' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Entrega', en: 'Delivery', defaultValue: 'pending', options: [option('pending', 'Pendente', 'Pending'), option('sent', 'Enviada', 'Sent'), option('read', 'Lida', 'Read'), option('failed', 'Falhou', 'Failed')], summary: true },
  ],
  report: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Relatório', en: 'Report', summary: true },
    { name: 'metric', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Indicador', en: 'Metric', summary: true },
    { name: 'value', kind: 'number', prismaType: 'Float', tsType: 'number', required: true, pt: 'Valor', en: 'Value', defaultValue: 0, summary: true },
    { name: 'periodStart', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Início do período', en: 'Period start' },
    { name: 'periodEnd', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Fim do período', en: 'Period end' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Interpretação', en: 'Interpretation' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Atualização', en: 'Freshness', defaultValue: 'current', options: [option('current', 'Atual', 'Current'), option('stale', 'Desatualizado', 'Stale'), option('archived', 'Arquivado', 'Archived')], summary: true },
  ],
  message: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Assunto', en: 'Subject', summary: true },
    { name: 'sender', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Remetente', en: 'Sender', summary: true },
    { name: 'recipient', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Destinatário', en: 'Recipient' },
    { name: 'sentAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Enviada em', en: 'Sent at', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Mensagem', en: 'Message' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'draft', options: [option('draft', 'Rascunho', 'Draft'), option('sent', 'Enviada', 'Sent'), option('read', 'Lida', 'Read'), option('archived', 'Arquivada', 'Archived')], summary: true },
  ],
  fileasset: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Arquivo', en: 'File', summary: true },
    { name: 'url', kind: 'url', prismaType: 'String', tsType: 'string', required: true, pt: 'URL', en: 'URL' },
    { name: 'mimeType', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Tipo de mídia', en: 'Media type', summary: true },
    { name: 'size', kind: 'number', prismaType: 'Int', tsType: 'number', required: true, pt: 'Tamanho em bytes', en: 'Size in bytes', defaultValue: 0 },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Descrição', en: 'Description' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Processamento', en: 'Processing', defaultValue: 'ready', options: [option('processing', 'Processando', 'Processing'), option('ready', 'Disponível', 'Ready'), option('failed', 'Falhou', 'Failed')], summary: true },
  ],
  subscription: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Assinatura', en: 'Subscription', summary: true },
    { name: 'plan', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Plano', en: 'Plan', summary: true },
    { name: 'amount', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Valor recorrente', en: 'Recurring amount', defaultValue: 0, summary: true },
    { name: 'renewsAt', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Próxima renovação', en: 'Renews at' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações', en: 'Notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'trial', options: [option('trial', 'Teste', 'Trial'), option('active', 'Ativa', 'Active'), option('past_due', 'Pagamento pendente', 'Past due'), option('cancelled', 'Cancelada', 'Cancelled')], summary: true },
  ],
  integration: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Integração', en: 'Integration', summary: true },
    { name: 'provider', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Provedor', en: 'Provider', summary: true },
    { name: 'endpoint', kind: 'url', prismaType: 'String', tsType: 'string', required: false, pt: 'Endpoint', en: 'Endpoint' },
    { name: 'lastSyncAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Última sincronização', en: 'Last sync' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Configuração', en: 'Configuration' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Conexão', en: 'Connection', defaultValue: 'disconnected', options: [option('disconnected', 'Desconectada', 'Disconnected'), option('connected', 'Conectada', 'Connected'), option('error', 'Com erro', 'Error')], summary: true },
  ],
  role: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Papel', en: 'Role', summary: true },
    { name: 'scope', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Escopo', en: 'Scope', defaultValue: 'workspace', options: [option('workspace', 'Workspace', 'Workspace'), option('project', 'Projeto', 'Project'), option('organization', 'Organização', 'Organization')], summary: true },
    { name: 'permissions', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Permissões', en: 'Permissions', placeholderPt: 'Ex.: patients:read, appointments:write', placeholderEn: 'E.g. patients:read, appointments:write' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Descrição', en: 'Description' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'active', options: [option('active', 'Ativo', 'Active'), option('inactive', 'Inativo', 'Inactive')], summary: true },
  ],
  payment: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Pagamento', en: 'Payment', summary: true },
    { name: 'amount', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Valor', en: 'Amount', defaultValue: 0, summary: true },
    { name: 'method', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Método', en: 'Method', defaultValue: 'pix', options: [option('pix', 'Pix', 'Pix'), option('card', 'Cartão', 'Card'), option('bank_slip', 'Boleto', 'Bank slip')], summary: true },
    { name: 'paidAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Pago em', en: 'Paid at' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Referência', en: 'Reference' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'pending', options: [option('pending', 'Pendente', 'Pending'), option('authorized', 'Autorizado', 'Authorized'), option('paid', 'Pago', 'Paid'), option('refunded', 'Estornado', 'Refunded'), option('failed', 'Falhou', 'Failed')], summary: true },
  ],
  automation: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Automação', en: 'Automation', summary: true },
    { name: 'trigger', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Gatilho', en: 'Trigger', summary: true },
    { name: 'action', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Ação', en: 'Action', summary: true },
    { name: 'runCount', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Execuções', en: 'Run count', defaultValue: 0 },
    { name: 'lastRunAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Última execução', en: 'Last run' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Regras', en: 'Rules' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'draft', options: [option('draft', 'Rascunho', 'Draft'), option('active', 'Ativa', 'Active'), option('paused', 'Pausada', 'Paused'), option('failed', 'Com falha', 'Failed')], summary: true },
  ],
  invoice: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Fatura', en: 'Invoice', summary: true },
    { name: 'amount', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Valor', en: 'Amount', defaultValue: 0, summary: true },
    { name: 'dueDate', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Vencimento', en: 'Due date', summary: true },
    { name: 'paidAt', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Pagamento', en: 'Paid at' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Descrição', en: 'Description' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'open', options: [option('open', 'Em aberto', 'Open'), option('paid', 'Paga', 'Paid'), option('overdue', 'Vencida', 'Overdue'), option('cancelled', 'Cancelada', 'Cancelled')], summary: true },
  ],
  review: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Revisão', en: 'Review', summary: true },
    { name: 'reviewer', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Responsável', en: 'Reviewer', summary: true },
    { name: 'rating', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Avaliação', en: 'Rating', defaultValue: 0, summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Feedback', en: 'Feedback' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Decisão', en: 'Decision', defaultValue: 'pending', options: [option('pending', 'Pendente', 'Pending'), option('changes_requested', 'Ajustes solicitados', 'Changes requested'), option('approved', 'Aprovada', 'Approved')], summary: true },
  ],
  jobopening: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Título da vaga', en: 'Job title', summary: true },
    { name: 'department', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Área', en: 'Department', summary: true },
    { name: 'location', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Localidade', en: 'Location' },
    { name: 'workMode', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Modelo de trabalho', en: 'Work model', defaultValue: 'hybrid', options: [option('onsite', 'Presencial', 'On-site'), option('hybrid', 'Híbrido', 'Hybrid'), option('remote', 'Remoto', 'Remote')], summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Requisitos e responsabilidades', en: 'Requirements and responsibilities' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'draft', options: [option('draft', 'Rascunho', 'Draft'), option('open', 'Aberta', 'Open'), option('paused', 'Pausada', 'Paused'), option('closed', 'Encerrada', 'Closed')], summary: true },
  ],
  candidate: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Nome completo', en: 'Full name', summary: true },
    { name: 'email', kind: 'email', prismaType: 'String', tsType: 'string', required: true, pt: 'E-mail', en: 'Email', summary: true },
    { name: 'phone', kind: 'phone', prismaType: 'String', tsType: 'string', required: false, pt: 'Telefone', en: 'Phone' },
    { name: 'headline', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Perfil profissional', en: 'Professional headline', summary: true },
    { name: 'resumeUrl', kind: 'url', prismaType: 'String', tsType: 'string', required: false, pt: 'Currículo', en: 'Resume' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Competências e observações', en: 'Skills and notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Disponibilidade', en: 'Availability', defaultValue: 'available', options: [option('available', 'Disponível', 'Available'), option('in_process', 'Em processo', 'In process'), option('hired', 'Contratado', 'Hired'), option('archived', 'Arquivado', 'Archived')], summary: true },
  ],
  application: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Candidatura', en: 'Application', summary: true },
    { name: 'candidateId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Candidato', en: 'Candidate', relationTo: 'Candidate', relationLabel: 'name' },
    { name: 'jobOpeningId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Vaga', en: 'Job opening', relationTo: 'JobOpening', relationLabel: 'name' },
    { name: 'appliedAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Data da candidatura', en: 'Applied at', summary: true },
    { name: 'score', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Aderência (%)', en: 'Match score (%)', defaultValue: 0, summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Parecer', en: 'Assessment' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Etapa', en: 'Stage', defaultValue: 'applied', options: [option('applied', 'Inscrito', 'Applied'), option('screening', 'Triagem', 'Screening'), option('interview', 'Entrevista', 'Interview'), option('offer', 'Proposta', 'Offer'), option('hired', 'Contratado', 'Hired'), option('rejected', 'Não selecionado', 'Rejected')], summary: true },
  ],
  interview: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Entrevista', en: 'Interview', summary: true },
    { name: 'candidateId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Candidato', en: 'Candidate', relationTo: 'Candidate', relationLabel: 'name' },
    { name: 'scheduledAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Data e horário', en: 'Date and time', summary: true },
    { name: 'interviewer', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Entrevistador', en: 'Interviewer', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Roteiro e avaliação', en: 'Guide and evaluation' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'scheduled', options: [option('scheduled', 'Agendada', 'Scheduled'), option('completed', 'Realizada', 'Completed'), option('cancelled', 'Cancelada', 'Cancelled')], summary: true },
  ],
  course: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Curso', en: 'Course', summary: true },
    { name: 'category', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Categoria', en: 'Category', summary: true },
    { name: 'durationHours', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Carga horária', en: 'Duration in hours', defaultValue: 0, summary: true },
    { name: 'instructor', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Instrutor', en: 'Instructor' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Ementa', en: 'Syllabus' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Publicação', en: 'Publication', defaultValue: 'draft', options: [option('draft', 'Rascunho', 'Draft'), option('published', 'Publicado', 'Published'), option('archived', 'Arquivado', 'Archived')], summary: true },
  ],
  lesson: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Aula', en: 'Lesson', summary: true },
    { name: 'courseId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Curso', en: 'Course', relationTo: 'Course', relationLabel: 'name' },
    { name: 'position', kind: 'number', prismaType: 'Int', tsType: 'number', required: true, pt: 'Ordem', en: 'Position', defaultValue: 1, summary: true },
    { name: 'contentUrl', kind: 'url', prismaType: 'String', tsType: 'string', required: false, pt: 'Conteúdo', en: 'Content' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Resumo da aula', en: 'Lesson summary' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Disponibilidade', en: 'Availability', defaultValue: 'draft', options: [option('draft', 'Rascunho', 'Draft'), option('published', 'Publicada', 'Published'), option('archived', 'Arquivada', 'Archived')], summary: true },
  ],
  student: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Estudante', en: 'Student', summary: true },
    { name: 'email', kind: 'email', prismaType: 'String', tsType: 'string', required: true, pt: 'E-mail', en: 'Email', summary: true },
    { name: 'registrationCode', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Matrícula', en: 'Registration code', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações', en: 'Notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'active', options: [option('active', 'Ativo', 'Active'), option('paused', 'Pausado', 'Paused'), option('inactive', 'Inativo', 'Inactive')], summary: true },
  ],
  enrollment: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Matrícula', en: 'Enrollment', summary: true },
    { name: 'studentId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Estudante', en: 'Student', relationTo: 'Student', relationLabel: 'name' },
    { name: 'courseId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Curso', en: 'Course', relationTo: 'Course', relationLabel: 'name' },
    { name: 'enrolledAt', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Data da matrícula', en: 'Enrolled at', summary: true },
    { name: 'progress', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Progresso (%)', en: 'Progress (%)', defaultValue: 0, summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações', en: 'Notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'active', options: [option('active', 'Em andamento', 'Active'), option('completed', 'Concluída', 'Completed'), option('cancelled', 'Cancelada', 'Cancelled')], summary: true },
  ],
  learningprogress: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Progresso', en: 'Progress', summary: true },
    { name: 'enrollmentId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Matrícula', en: 'Enrollment', relationTo: 'Enrollment', relationLabel: 'name' },
    { name: 'completedLessons', kind: 'number', prismaType: 'Int', tsType: 'number', required: true, pt: 'Aulas concluídas', en: 'Completed lessons', defaultValue: 0, summary: true },
    { name: 'percentage', kind: 'number', prismaType: 'Int', tsType: 'number', required: true, pt: 'Conclusão (%)', en: 'Completion (%)', defaultValue: 0, summary: true },
    { name: 'lastActivityAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Última atividade', en: 'Last activity' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações', en: 'Notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Ritmo', en: 'Pace', defaultValue: 'on_track', options: [option('on_track', 'Em dia', 'On track'), option('attention', 'Requer atenção', 'Needs attention'), option('completed', 'Concluído', 'Completed')], summary: true },
  ],
  assessment: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Avaliação', en: 'Assessment', summary: true },
    { name: 'courseId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Curso', en: 'Course', relationTo: 'Course', relationLabel: 'name' },
    { name: 'dueAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Prazo', en: 'Due at', summary: true },
    { name: 'maximumScore', kind: 'number', prismaType: 'Float', tsType: 'number', required: true, pt: 'Nota máxima', en: 'Maximum score', defaultValue: 10, summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Instruções', en: 'Instructions' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'draft', options: [option('draft', 'Rascunho', 'Draft'), option('open', 'Aberta', 'Open'), option('closed', 'Encerrada', 'Closed')], summary: true },
  ],
  submission: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Entrega', en: 'Submission', summary: true },
    { name: 'assessmentId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Avaliação', en: 'Assessment', relationTo: 'Assessment', relationLabel: 'name' },
    { name: 'submittedAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Enviada em', en: 'Submitted at', summary: true },
    { name: 'score', kind: 'number', prismaType: 'Float', tsType: 'number', required: false, pt: 'Nota', en: 'Score', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Resposta e feedback', en: 'Response and feedback' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Correção', en: 'Grading', defaultValue: 'pending', options: [option('pending', 'Pendente', 'Pending'), option('submitted', 'Entregue', 'Submitted'), option('graded', 'Corrigida', 'Graded'), option('returned', 'Devolvida', 'Returned')], summary: true },
  ],
  shipment: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Remessa', en: 'Shipment', summary: true },
    { name: 'trackingCode', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Código de rastreio', en: 'Tracking code', summary: true },
    { name: 'origin', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Origem', en: 'Origin' },
    { name: 'destination', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Destino', en: 'Destination', summary: true },
    { name: 'estimatedDeliveryAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Previsão de entrega', en: 'Estimated delivery', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Volumes e observações', en: 'Packages and notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Etapa', en: 'Stage', defaultValue: 'created', options: [option('created', 'Criada', 'Created'), option('dispatched', 'Despachada', 'Dispatched'), option('in_transit', 'Em trânsito', 'In transit'), option('delivered', 'Entregue', 'Delivered'), option('exception', 'Com ocorrência', 'Exception')], summary: true },
  ],
  delivery: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Entrega', en: 'Delivery', summary: true },
    { name: 'shipmentId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Remessa', en: 'Shipment', relationTo: 'Shipment', relationLabel: 'name' },
    { name: 'address', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Endereço', en: 'Address', summary: true },
    { name: 'scheduledAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Janela de entrega', en: 'Delivery window', summary: true },
    { name: 'proofUrl', kind: 'url', prismaType: 'String', tsType: 'string', required: false, pt: 'Comprovante', en: 'Proof of delivery' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Instruções', en: 'Instructions' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'scheduled', options: [option('scheduled', 'Programada', 'Scheduled'), option('en_route', 'Em rota', 'En route'), option('delivered', 'Entregue', 'Delivered'), option('failed', 'Não entregue', 'Failed')], summary: true },
  ],
  vehicle: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Veículo', en: 'Vehicle', summary: true },
    { name: 'plate', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Placa', en: 'License plate', summary: true },
    { name: 'capacity', kind: 'number', prismaType: 'Float', tsType: 'number', required: false, pt: 'Capacidade', en: 'Capacity', summary: true },
    { name: 'lastMaintenanceAt', kind: 'date', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Última manutenção', en: 'Last maintenance' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações', en: 'Notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Disponibilidade', en: 'Availability', defaultValue: 'available', options: [option('available', 'Disponível', 'Available'), option('assigned', 'Em rota', 'Assigned'), option('maintenance', 'Em manutenção', 'Maintenance'), option('inactive', 'Inativo', 'Inactive')], summary: true },
  ],
  driver: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Motorista', en: 'Driver', summary: true },
    { name: 'phone', kind: 'phone', prismaType: 'String', tsType: 'string', required: true, pt: 'Telefone', en: 'Phone', summary: true },
    { name: 'licenseNumber', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Habilitação', en: 'License number' },
    { name: 'region', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Região', en: 'Region' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações', en: 'Notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Disponibilidade', en: 'Availability', defaultValue: 'available', options: [option('available', 'Disponível', 'Available'), option('assigned', 'Em rota', 'Assigned'), option('offline', 'Indisponível', 'Offline')], summary: true },
  ],
  deliveryroute: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Rota', en: 'Route', summary: true },
    { name: 'vehicleId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Veículo', en: 'Vehicle', relationTo: 'Vehicle', relationLabel: 'name' },
    { name: 'scheduledAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Saída prevista', en: 'Scheduled departure', summary: true },
    { name: 'stops', kind: 'number', prismaType: 'Int', tsType: 'number', required: true, pt: 'Paradas', en: 'Stops', defaultValue: 0, summary: true },
    { name: 'distance', kind: 'number', prismaType: 'Float', tsType: 'number', required: false, pt: 'Distância', en: 'Distance' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Sequência e restrições', en: 'Sequence and constraints' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Etapa', en: 'Stage', defaultValue: 'planning', options: [option('planning', 'Planejamento', 'Planning'), option('dispatched', 'Despachada', 'Dispatched'), option('in_progress', 'Em execução', 'In progress'), option('completed', 'Concluída', 'Completed')], summary: true },
  ],
  trackingevent: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Evento de rastreio', en: 'Tracking event', summary: true },
    { name: 'shipmentId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Remessa', en: 'Shipment', relationTo: 'Shipment', relationLabel: 'name' },
    { name: 'occurredAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Ocorrido em', en: 'Occurred at', summary: true },
    { name: 'location', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Local', en: 'Location' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Detalhes', en: 'Details' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Tipo', en: 'Type', defaultValue: 'update', options: [option('update', 'Atualização', 'Update'), option('exception', 'Ocorrência', 'Exception'), option('delivered', 'Entrega', 'Delivered')], summary: true },
  ],
  event: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Evento', en: 'Event', summary: true },
    { name: 'startsAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Início', en: 'Starts at', summary: true },
    { name: 'endsAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Término', en: 'Ends at' },
    { name: 'venue', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Local', en: 'Venue', summary: true },
    { name: 'capacity', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Capacidade', en: 'Capacity' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Descrição', en: 'Description' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'draft', options: [option('draft', 'Rascunho', 'Draft'), option('published', 'Publicado', 'Published'), option('live', 'Em andamento', 'Live'), option('finished', 'Encerrado', 'Finished'), option('cancelled', 'Cancelado', 'Cancelled')], summary: true },
  ],
  eventsession: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Sessão', en: 'Session', summary: true },
    { name: 'eventId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Evento', en: 'Event', relationTo: 'Event', relationLabel: 'name' },
    { name: 'startsAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Início', en: 'Starts at', summary: true },
    { name: 'speaker', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Palestrante', en: 'Speaker', summary: true },
    { name: 'room', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Sala', en: 'Room' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Resumo', en: 'Summary' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'scheduled', options: [option('scheduled', 'Programada', 'Scheduled'), option('live', 'Em andamento', 'Live'), option('completed', 'Concluída', 'Completed'), option('cancelled', 'Cancelada', 'Cancelled')], summary: true },
  ],
  ticket: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Ingresso', en: 'Ticket', summary: true },
    { name: 'eventId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Evento', en: 'Event', relationTo: 'Event', relationLabel: 'name' },
    { name: 'code', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Código', en: 'Code', summary: true },
    { name: 'price', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Preço', en: 'Price', defaultValue: 0, summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Lote e condições', en: 'Batch and conditions' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'available', options: [option('available', 'Disponível', 'Available'), option('reserved', 'Reservado', 'Reserved'), option('issued', 'Emitido', 'Issued'), option('used', 'Utilizado', 'Used'), option('cancelled', 'Cancelado', 'Cancelled')], summary: true },
  ],
  attendee: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Participante', en: 'Attendee', summary: true },
    { name: 'email', kind: 'email', prismaType: 'String', tsType: 'string', required: true, pt: 'E-mail', en: 'Email', summary: true },
    { name: 'phone', kind: 'phone', prismaType: 'String', tsType: 'string', required: false, pt: 'Telefone', en: 'Phone' },
    { name: 'company', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Empresa', en: 'Company' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Preferências', en: 'Preferences' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Inscrição', en: 'Registration', defaultValue: 'registered', options: [option('registered', 'Inscrito', 'Registered'), option('confirmed', 'Confirmado', 'Confirmed'), option('checked_in', 'Presente', 'Checked in'), option('cancelled', 'Cancelado', 'Cancelled')], summary: true },
  ],
  checkin: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Credenciamento', en: 'Check-in', summary: true },
    { name: 'ticketId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Ingresso', en: 'Ticket', relationTo: 'Ticket', relationLabel: 'name' },
    { name: 'checkedInAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Entrada', en: 'Checked in at', summary: true },
    { name: 'gate', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Acesso', en: 'Gate' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Observações', en: 'Notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Validação', en: 'Validation', defaultValue: 'pending', options: [option('pending', 'Pendente', 'Pending'), option('approved', 'Aprovada', 'Approved'), option('denied', 'Negada', 'Denied')], summary: true },
  ],
  reservation: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Reserva', en: 'Reservation', summary: true },
    { name: 'guestId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Cliente', en: 'Guest', relationTo: 'Guest', relationLabel: 'name' },
    { name: 'scheduledAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Data e horário', en: 'Date and time', summary: true },
    { name: 'partySize', kind: 'number', prismaType: 'Int', tsType: 'number', required: true, pt: 'Pessoas', en: 'Party size', defaultValue: 2, summary: true },
    { name: 'tableNumber', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Mesa', en: 'Table' },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Preferências e restrições', en: 'Preferences and restrictions' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Situação', en: 'Status', defaultValue: 'requested', options: [option('requested', 'Solicitada', 'Requested'), option('confirmed', 'Confirmada', 'Confirmed'), option('seated', 'Acomodada', 'Seated'), option('completed', 'Concluída', 'Completed'), option('cancelled', 'Cancelada', 'Cancelled'), option('no_show', 'Não compareceu', 'No show')], summary: true },
  ],
  guest: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Cliente', en: 'Guest', summary: true },
    { name: 'phone', kind: 'phone', prismaType: 'String', tsType: 'string', required: true, pt: 'Telefone', en: 'Phone', summary: true },
    { name: 'email', kind: 'email', prismaType: 'String', tsType: 'string', required: false, pt: 'E-mail', en: 'Email' },
    { name: 'visits', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Visitas', en: 'Visits', defaultValue: 0, summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Preferências', en: 'Preferences' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Relacionamento', en: 'Relationship', defaultValue: 'active', options: [option('active', 'Ativo', 'Active'), option('vip', 'VIP', 'VIP'), option('inactive', 'Inativo', 'Inactive')], summary: true },
  ],
  menuitem: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Item do cardápio', en: 'Menu item', summary: true },
    { name: 'categoryId', kind: 'relation', prismaType: 'String', tsType: 'string', required: false, pt: 'Categoria', en: 'Category', relationTo: 'Category', relationLabel: 'name' },
    { name: 'price', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Preço', en: 'Price', defaultValue: 0, summary: true },
    { name: 'preparationMinutes', kind: 'number', prismaType: 'Int', tsType: 'number', required: false, pt: 'Tempo de preparo', en: 'Preparation time', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: true, pt: 'Descrição e ingredientes', en: 'Description and ingredients' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Disponibilidade', en: 'Availability', defaultValue: 'available', options: [option('available', 'Disponível', 'Available'), option('sold_out', 'Esgotado', 'Sold out'), option('inactive', 'Inativo', 'Inactive')], summary: true },
  ],
  restaurantorder: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Pedido', en: 'Order', summary: true },
    { name: 'channel', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Canal', en: 'Channel', defaultValue: 'dining_room', options: [option('dining_room', 'Salão', 'Dining room'), option('takeaway', 'Retirada', 'Takeaway'), option('delivery', 'Delivery', 'Delivery')], summary: true },
    { name: 'tableNumber', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Mesa', en: 'Table' },
    { name: 'total', kind: 'currency', prismaType: 'Float', tsType: 'number', required: true, pt: 'Total', en: 'Total', defaultValue: 0, summary: true },
    { name: 'placedAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: true, pt: 'Criado em', en: 'Placed at', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Itens e observações', en: 'Items and notes' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Etapa', en: 'Stage', defaultValue: 'received', options: [option('received', 'Recebido', 'Received'), option('preparing', 'Em preparo', 'Preparing'), option('ready', 'Pronto', 'Ready'), option('served', 'Entregue', 'Served'), option('cancelled', 'Cancelado', 'Cancelled')], summary: true },
  ],
  kitchenticket: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Comanda de preparo', en: 'Kitchen ticket', summary: true },
    { name: 'restaurantOrderId', kind: 'relation', prismaType: 'String', tsType: 'string', required: true, pt: 'Pedido', en: 'Order', relationTo: 'RestaurantOrder', relationLabel: 'name' },
    { name: 'station', kind: 'text', prismaType: 'String', tsType: 'string', required: false, pt: 'Praça', en: 'Station', summary: true },
    { name: 'startedAt', kind: 'datetime', prismaType: 'DateTime', tsType: 'Date | string', required: false, pt: 'Início do preparo', en: 'Started at' },
    { name: 'priority', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Prioridade', en: 'Priority', defaultValue: 'normal', options: [option('normal', 'Normal', 'Normal'), option('priority', 'Prioridade', 'Priority'), option('urgent', 'Urgente', 'Urgent')], summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Itens e instruções', en: 'Items and instructions' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Etapa', en: 'Stage', defaultValue: 'queued', options: [option('queued', 'Na fila', 'Queued'), option('preparing', 'Em preparo', 'Preparing'), option('ready', 'Pronto', 'Ready'), option('delivered', 'Entregue', 'Delivered')], summary: true },
  ],
  category: [
    { name: 'name', kind: 'text', prismaType: 'String', tsType: 'string', required: true, pt: 'Categoria', en: 'Category', summary: true },
    { name: 'description', kind: 'textarea', prismaType: 'String', tsType: 'string', required: false, pt: 'Descrição', en: 'Description' },
    { name: 'status', kind: 'select', prismaType: 'String', tsType: 'string', required: true, pt: 'Status', en: 'Status', defaultValue: 'active', options: [option('active', 'Ativa', 'Active'), option('inactive', 'Inativa', 'Inactive')], summary: true },
  ],
};

const workflows: Record<string, DomainWorkflow> = {
  deal: { field: 'stage', initial: 'lead', transitions: { lead: ['qualification', 'lost'], qualification: ['proposal', 'lost'], proposal: ['negotiation', 'won', 'lost'], negotiation: ['won', 'lost'], won: [], lost: ['lead'] } },
  appointment: { field: 'status', initial: 'scheduled', transitions: { scheduled: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'], completed: [], cancelled: ['scheduled'] } },
  order: { field: 'status', initial: 'pending', transitions: { pending: ['paid', 'cancelled'], paid: ['shipped', 'cancelled'], shipped: ['completed'], completed: [], cancelled: [] } },
  project: { field: 'status', initial: 'planning', transitions: { planning: ['active'], active: ['review'], review: ['active', 'completed'], completed: [] } },
  post: { field: 'status', initial: 'draft', transitions: { draft: ['review'], review: ['draft', 'published'], published: ['draft'] } },
  task: { field: 'status', initial: 'pending', transitions: { pending: ['active', 'done'], active: ['pending', 'done'], done: ['active'] } },
  workorder: { field: 'status', initial: 'open', transitions: { open: ['assigned', 'cancelled'], assigned: ['in_progress', 'open', 'cancelled'], in_progress: ['blocked', 'completed'], blocked: ['in_progress', 'cancelled'], completed: [], cancelled: ['open'] } },
  technician: { field: 'status', initial: 'available', transitions: { available: ['assigned', 'offline'], assigned: ['available', 'offline'], offline: ['available'] } },
  visit: { field: 'status', initial: 'scheduled', transitions: { scheduled: ['en_route', 'cancelled'], en_route: ['in_progress', 'cancelled'], in_progress: ['completed'], completed: [], cancelled: ['scheduled'] } },
  inspection: { field: 'status', initial: 'draft', transitions: { draft: ['in_progress'], in_progress: ['approved', 'rejected'], approved: [], rejected: ['in_progress'] } },
  notification: { field: 'status', initial: 'pending', transitions: { pending: ['sent', 'failed'], sent: ['read'], read: [], failed: ['pending'] } },
  message: { field: 'status', initial: 'draft', transitions: { draft: ['sent'], sent: ['read', 'archived'], read: ['archived'], archived: [] } },
  subscription: { field: 'status', initial: 'trial', transitions: { trial: ['active', 'cancelled'], active: ['past_due', 'cancelled'], past_due: ['active', 'cancelled'], cancelled: [] } },
  payment: { field: 'status', initial: 'pending', transitions: { pending: ['authorized', 'failed'], authorized: ['paid', 'failed'], paid: ['refunded'], refunded: [], failed: ['pending'] } },
  automation: { field: 'status', initial: 'draft', transitions: { draft: ['active'], active: ['paused', 'failed'], paused: ['active'], failed: ['draft'] } },
  invoice: { field: 'status', initial: 'open', transitions: { open: ['paid', 'overdue', 'cancelled'], overdue: ['paid', 'cancelled'], paid: [], cancelled: [] } },
  review: { field: 'status', initial: 'pending', transitions: { pending: ['changes_requested', 'approved'], changes_requested: ['pending', 'approved'], approved: [] } },
  jobopening: { field: 'status', initial: 'draft', transitions: { draft: ['open'], open: ['paused', 'closed'], paused: ['open', 'closed'], closed: [] } },
  candidate: { field: 'status', initial: 'available', transitions: { available: ['in_process', 'archived'], in_process: ['available', 'hired', 'archived'], hired: ['archived'], archived: ['available'] } },
  application: { field: 'status', initial: 'applied', transitions: { applied: ['screening', 'rejected'], screening: ['interview', 'rejected'], interview: ['offer', 'rejected'], offer: ['hired', 'rejected'], hired: [], rejected: ['screening'] } },
  interview: { field: 'status', initial: 'scheduled', transitions: { scheduled: ['completed', 'cancelled'], completed: [], cancelled: ['scheduled'] } },
  course: { field: 'status', initial: 'draft', transitions: { draft: ['published'], published: ['archived', 'draft'], archived: ['draft'] } },
  lesson: { field: 'status', initial: 'draft', transitions: { draft: ['published'], published: ['archived', 'draft'], archived: ['draft'] } },
  enrollment: { field: 'status', initial: 'active', transitions: { active: ['completed', 'cancelled'], completed: [], cancelled: ['active'] } },
  assessment: { field: 'status', initial: 'draft', transitions: { draft: ['open'], open: ['closed'], closed: ['open'] } },
  submission: { field: 'status', initial: 'pending', transitions: { pending: ['submitted'], submitted: ['graded', 'returned'], graded: ['returned'], returned: ['submitted'] } },
  shipment: { field: 'status', initial: 'created', transitions: { created: ['dispatched'], dispatched: ['in_transit', 'exception'], in_transit: ['delivered', 'exception'], delivered: [], exception: ['in_transit', 'delivered'] } },
  delivery: { field: 'status', initial: 'scheduled', transitions: { scheduled: ['en_route', 'failed'], en_route: ['delivered', 'failed'], delivered: [], failed: ['scheduled'] } },
  vehicle: { field: 'status', initial: 'available', transitions: { available: ['assigned', 'maintenance', 'inactive'], assigned: ['available', 'maintenance'], maintenance: ['available', 'inactive'], inactive: ['available'] } },
  driver: { field: 'status', initial: 'available', transitions: { available: ['assigned', 'offline'], assigned: ['available', 'offline'], offline: ['available'] } },
  deliveryroute: { field: 'status', initial: 'planning', transitions: { planning: ['dispatched'], dispatched: ['in_progress'], in_progress: ['completed'], completed: [] } },
  event: { field: 'status', initial: 'draft', transitions: { draft: ['published', 'cancelled'], published: ['live', 'cancelled'], live: ['finished'], finished: [], cancelled: ['draft'] } },
  eventsession: { field: 'status', initial: 'scheduled', transitions: { scheduled: ['live', 'cancelled'], live: ['completed'], completed: [], cancelled: ['scheduled'] } },
  ticket: { field: 'status', initial: 'available', transitions: { available: ['reserved', 'issued', 'cancelled'], reserved: ['available', 'issued', 'cancelled'], issued: ['used', 'cancelled'], used: [], cancelled: [] } },
  attendee: { field: 'status', initial: 'registered', transitions: { registered: ['confirmed', 'cancelled'], confirmed: ['checked_in', 'cancelled'], checked_in: [], cancelled: ['registered'] } },
  checkin: { field: 'status', initial: 'pending', transitions: { pending: ['approved', 'denied'], approved: [], denied: ['pending'] } },
  reservation: { field: 'status', initial: 'requested', transitions: { requested: ['confirmed', 'cancelled'], confirmed: ['seated', 'cancelled', 'no_show'], seated: ['completed'], completed: [], cancelled: ['requested'], no_show: [] } },
  restaurantorder: { field: 'status', initial: 'received', transitions: { received: ['preparing', 'cancelled'], preparing: ['ready', 'cancelled'], ready: ['served'], served: [], cancelled: [] } },
  kitchenticket: { field: 'status', initial: 'queued', transitions: { queued: ['preparing'], preparing: ['ready'], ready: ['delivered'], delivered: [] } },
};

export function getEntityFields(entity: string): DomainField[] {
  return (catalog[entity.toLowerCase()] || baseFields).map(field => ({
    ...field,
    options: field.options?.map(item => ({ ...item })),
  }));
}

export function getEntityExtraFields(entity: string): DomainField[] {
  return getEntityFields(entity).filter(field => !['name', 'description', 'status'].includes(field.name));
}

export function getEntityRelations(entity: string): DomainRelation[] {
  return getEntityFields(entity)
    .filter(field => field.kind === 'relation' && field.relationTo)
    .map(field => ({
      field: field.name,
      target: field.relationTo!,
      required: field.required,
      labelPt: field.pt,
      labelEn: field.en,
    }));
}

export function getEntityWorkflow(entity: string): DomainWorkflow | undefined {
  const workflow = workflows[entity.toLowerCase()];
  return workflow ? { ...workflow, transitions: Object.fromEntries(Object.entries(workflow.transitions).map(([key, values]) => [key, [...values]])) } : undefined;
}
