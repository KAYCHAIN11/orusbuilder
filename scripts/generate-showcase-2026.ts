import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ProductBlueprintPlanner } from '../backend/src/blueprint/product-blueprint';
import { codeGenerator, ProjectType, type GeneratedFile } from '../backend/src/generation/code-generator';
import { uiGenerator, type GeneratedUIFile } from '../backend/src/generation/ui-generator';

type Scenario = {
  slug: string;
  name: string;
  type: 'landing' | 'fullstack';
  prompt: string;
  entities: string[];
  features: string[];
};

const scenarios: Scenario[] = [
  {
    slug: 'nocturne-atelier',
    name: 'Nocturne Atelier',
    type: 'landing',
    prompt: 'Landing page editorial de luxo para Nocturne Atelier, uma casa brasileira de mobiliário colecionável. Visual cinematográfico escuro, preto mineral, marfim e cobre, tipografia serifada monumental, composição assimétrica, muito espaço negativo e detalhes de galeria. Exatamente quatro seções: manifesto hero, coleção selecionada, processo artesanal e visita ao atelier. Evitar dashboard, cards SaaS e gradientes genéricos.',
    entities: ['Collection'],
    features: ['Manifesto editorial', 'Coleção selecionada', 'Processo artesanal', 'Agendamento de visita'],
  },
  {
    slug: 'northstar-control',
    name: 'Northstar Control',
    type: 'fullstack',
    prompt: 'Central operacional fullstack Northstar Control para logística de cadeia fria. Deve acompanhar remessas e entregas, gestão de frota, planejamento de rotas, rastreamento logístico, sensores de temperatura e incidentes críticos. Visual escuro de sala de comando, azul noite, ciano elétrico e sinais âmbar, rail compacto, mapa operacional dominante, timeline de exceções e ações contextuais próximas aos dados. Criar fluxos de despacho, monitoramento, tratamento de incidente e confirmação de entrega. Não usar dashboard CRUD genérico.',
    entities: ['Shipment', 'Vehicle', 'DeliveryRoute', 'SensorReading', 'TrackingEvent', 'Incident'],
    features: ['Shipment workflow', 'Fleet directory', 'Route planning', 'Temperature monitoring', 'Tracking timeline', 'Incident response'],
  },
  {
    slug: 'lumen-academy',
    name: 'Lumen Academy',
    type: 'fullstack',
    prompt: 'Plataforma fullstack Lumen Academy para formação criativa. Deve possuir catálogo de cursos, trilhas, aulas, matrículas, progresso, avaliações e certificados. Identidade clara e otimista com azul cobalto, amarelo solar e fundos marfim; navegação superior, capas editoriais grandes, catálogo visual em mosaico e página inicial semelhante a um campus digital, não a um painel administrativo. Criar jornadas de descoberta, matrícula, continuidade da aula, avaliação e conclusão.',
    entities: ['Course', 'LearningPath', 'Lesson', 'Student', 'Enrollment', 'Assessment', 'Certificate'],
    features: ['Course catalog', 'Learning paths', 'Enrollment workflow', 'Lesson player', 'Learning progress', 'Assessments', 'Certificates'],
  },
  {
    slug: 'amparo-care',
    name: 'Amparo Care',
    type: 'fullstack',
    prompt: 'Aplicação clínica fullstack Amparo Care para cuidado materno e acompanhamento pós-parto. Incluir pacientes, profissionais, agenda, plano de cuidado, registros clínicos, retornos, tarefas e alertas. Visual acolhedor e sofisticado em argila, rosa queimado, ameixa e creme, formas orgânicas, tipografia humana e composição de jornada. A tela inicial deve priorizar agenda do dia, pacientes que exigem atenção e continuidade do cuidado. Criar calendário, linha do tempo clínica e permissões por papel.',
    entities: ['Patient', 'Professional', 'Appointment', 'CarePlan', 'ClinicalRecord', 'FollowUp', 'CareTask', 'CareAlert'],
    features: ['Clinical calendar', 'Patient directory', 'Care plan workflow', 'Clinical timeline', 'Follow-up workflow', 'Care alerts', 'Role permissions'],
  },
  {
    slug: 'frameflow-studio',
    name: 'FrameFlow Studio',
    type: 'fullstack',
    prompt: 'Workspace criativo fullstack FrameFlow Studio para produtoras audiovisuais. Gerenciar projetos, cenas, takes, ativos de mídia, revisões, comentários, aprovações e entregas. Visual imersivo inspirado em sala de edição, grafite, violeta intenso e verde-lima pontual; canvas central, filmstrip horizontal, painéis flutuantes e galeria de ativos. A página inicial deve abrir o trabalho em andamento, não métricas genéricas. Criar fluxo de revisão com versões, comentários por timecode e aprovação do cliente.',
    entities: ['Production', 'Scene', 'Take', 'MediaAsset', 'Review', 'Comment', 'Approval', 'Delivery'],
    features: ['Production workspace', 'Scene planning', 'Media asset library', 'Version review', 'Timecode comments', 'Client approval', 'Delivery workflow'],
  },
  {
    slug: 'atlas-treasury',
    name: 'Atlas Treasury',
    type: 'fullstack',
    prompt: 'Sistema financeiro fullstack Atlas Treasury para tesouraria de empresas em crescimento. Incluir contas, transações, faturas, centros de custo, previsões de caixa, conciliação, aprovações e alertas. Interface densa e precisa com azul petróleo, branco frio e verde esmeralda, navegação superior, ledger tabular dominante, filtros avançados, command bar e painéis bento apenas para síntese. Criar fluxos de conciliação, aprovação de pagamento, projeção e fechamento mensal com papéis e auditoria.',
    entities: ['Account', 'Transaction', 'Invoice', 'CostCenter', 'CashForecast', 'Reconciliation', 'Approval', 'FinancialAlert'],
    features: ['Transaction ledger', 'Invoice workflow', 'Cost centers', 'Cash forecasting', 'Reconciliation workflow', 'Payment approval', 'Financial alerts', 'Audit trail'],
  },
];

const outputRoot = path.resolve('examples/showcase-2026');
const planner = new ProductBlueprintPlanner();
const regenerate = process.env.ORUS_REGENERATE === 'true';

function target(root: string, file: GeneratedFile | GeneratedUIFile): string {
  const name = 'filename' in file ? file.filename : file.name;
  const destination = path.resolve(root, file.path || '', name);
  const relative = path.relative(root, destination);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Unsafe generated path: ${destination}`);
  return destination;
}

async function writeFiles(root: string, files: Array<GeneratedFile | GeneratedUIFile>): Promise<void> {
  for (const file of files) {
    const destination = target(root, file);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, file.content, 'utf8');
  }
}

async function prepareProjectRoot(projectRoot: string): Promise<void> {
  const relative = path.relative(outputRoot, projectRoot);
  if (relative.startsWith('..') || path.isAbsolute(relative) || path.dirname(relative) !== '.') {
    throw new Error(`Unsafe showcase root: ${projectRoot}`);
  }

  try {
    await fs.access(projectRoot);
    if (!regenerate) throw new Error(`Showcase project already exists: ${relative}`);
    for (const generatedPath of ['frontend/src', 'frontend/dist', 'backend/src', 'backend/prisma', '.orus']) {
      await fs.rm(path.join(projectRoot, generatedPath), { recursive: true, force: true });
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Showcase project already exists')) throw error;
  }
}

async function main(): Promise<void> {
await fs.mkdir(outputRoot, { recursive: true });
const collection = [];

for (const scenario of scenarios) {
  const projectRoot = path.join(outputRoot, scenario.slug);
  await prepareProjectRoot(projectRoot);
  const blueprint = await planner.create({
    prompt: scenario.prompt,
    projectId: scenario.slug,
    sourceType: 'prompt',
    depth: 'comprehensive',
  });
  const requirements = {
    description: scenario.prompt,
    features: scenario.features,
    tech_stack: scenario.type === 'landing'
      ? { frontend: ['react', 'typescript'] }
      : { frontend: ['react', 'typescript'], backend: ['node', 'express', 'typescript'], database: 'sqlite' },
  };
  const result = scenario.type === 'landing'
    ? await uiGenerator.generate({
        framework: 'react',
        generationType: 'LANDING_PAGE',
        requirements,
        entities: scenario.entities,
        visualIntent: blueprint.visualIntent,
        productBlueprint: blueprint,
      })
    : await codeGenerator.generate({
        projectName: scenario.name.replace(/\s+/g, ''),
        projectType: ProjectType.FULLSTACK,
        entities: scenario.entities,
        requirements,
        database: { type: 'sqlite', entities: scenario.entities },
        api_type: 'rest',
        authentication: true,
        visualIntent: blueprint.visualIntent,
        productBlueprint: blueprint,
      });
  if (!result.success) throw new Error(`Generation failed: ${scenario.slug}`);
  await writeFiles(projectRoot, result.files);
  await fs.mkdir(path.join(projectRoot, '.orus'), { recursive: true });
  await fs.writeFile(path.join(projectRoot, '.orus', 'product-blueprint.json'), JSON.stringify(blueprint, null, 2), 'utf8');
  await fs.writeFile(path.join(projectRoot, '.orus', 'showcase.json'), JSON.stringify({
    version: 1,
    generatedAt: new Date().toISOString(),
    generator: scenario.type === 'landing' ? 'UIGenerator' : 'CodeGenerator',
    type: scenario.type,
    visualFingerprint: blueprint.visualIntent,
    prompt: scenario.prompt,
    build: 'pending',
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(projectRoot, 'PROMPT.md'), `# ${scenario.name}\n\n${scenario.prompt}\n`, 'utf8');
  collection.push({ slug: scenario.slug, name: scenario.name, type: scenario.type, projectRoot, files: result.files.length });
}

await fs.writeFile(path.join(outputRoot, 'manifest.json'), JSON.stringify(collection, null, 2), 'utf8');
}

void main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
