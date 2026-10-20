/*
* ═══════════════════════════════════════════════════════════════
* 🧬 COGNITIVE AGENT CODE DNA - ORUS BUILDER UI GENERATOR
* ═══════════════════════════════════════════════════════════════
*
* 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
* ⏰ CREATED: 2025-10-04T21:00:00-03:00
* 🔄 LAST_MODIFIED: 2025-10-28T00:05:00-03:00
* 🏷️ COMPONENT_HASH: orus.builder.generation.ui.20251028.v3.FIXED
*
* ═══════════════════════════════════════════════════════════════
* COMPONENT PURPOSE & FUNCTIONALITY
* ═══════════════════════════════════════════════════════════════
*
* WHAT IT DOES: Automatic React/UI component generation
* WHY IT EXISTS: Create modern, responsive interfaces
* HOW IT WORKS: Template-based + state management + styling
* COGNITIVE IMPACT: +900% UI creation speed
*
* 🔥 FIXES v3.0:
* - Compatible with code-generator input format
* - Generates 15-20 complete React components
* - Tailwind CSS styling
* - TypeScript + Hooks
* - Responsive design
* - Files array output compatible with extractFiles()
*
* ═══════════════════════════════════════════════════════════════
*/

import { logger } from '../utils/logger';
import { analyzeVisualIntent, VisualIntent } from './visual-intent';
import { planUIComponents, UI_COMPONENT_CATALOG } from './ui-component-catalog';
import { DomainField, getEntityFields, getEntityWorkflow } from './domain-model-catalog';
import { auditGeneratedVisuals, VisualAuditResult } from './visual-quality-auditor';
import type { ProductBlueprint, ProductCapability, ProductScreen } from '../blueprint/product-blueprint';
import { toEntityIdentifier, toResourcePath } from './resource-naming';

// ═══════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface ProjectRequirements {
  description: string;
  features: string[];
  tech_stack: {
    frontend?: string[];
  };
}

export interface UIGenerationInput {
  framework: string;
  generationType?: 'LANDING_PAGE' | 'COMPONENT';
  persistence?: 'api' | 'local';
  requirements: ProjectRequirements;
  architecture?: any;
  api?: any;
  /** Optional visual plan prepared by Trinity/Cognitive Engine. */
  visualIntent?: VisualIntent;
  productBlueprint?: ProductBlueprint;
  /**
   * Entidades de domínio já detectadas (ex: extraídas por IA do prompt original).
   * Quando presente, tem prioridade sobre extractEntities(), que só reconhece
   * um dicionário fixo PT/EN e nunca bate com entidades fora dele.
   */
  entities?: string[];
}

export interface GeneratedUIFile {
  path: string;
  name: string;
  content: string;
  type: string;
  metadata?: {
    isRoot?: boolean;
  };
}

export interface UIGenerationResult {
  success: boolean;
  files: GeneratedUIFile[]; // ✅ PRIMARY format
  components?: GeneratedUIFile[]; // ✅ FALLBACK format
  pages?: Record<string, string>; // ✅ FALLBACK format
  metadata: {
    filesGenerated: number;
    componentsCount: number;
    pagesCount: number;
    visualIntent?: VisualIntent;
    componentPlan?: string[];
    visualAudit?: VisualAuditResult;
  };
}

// ═══════════════════════════════════════════════════════════════
// UI GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════

class UIGenerator {
  private version = '3.FIXED';

/**
 * Main generation method - FULLY COMPATIBLE
 */
public async generate(input: UIGenerationInput): Promise<UIGenerationResult> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎨 [UIGenerator] STARTING GENERATION v3.FIXED');
  console.log(`[UIGenerator] Framework: ${input.framework}`);
  console.log(`[UIGenerator] Features: ${input.requirements?.features?.length || 0}`);
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    // ✅ Step 1: Prefer entidades já detectadas (ex: via IA) sobre a extração
    // por dicionário fixo, que nunca bate com entidades fora dele.
    const blueprintEntities = input.productBlueprint?.data.map(entity => entity.name) || [];
    const entities = blueprintEntities.length > 0
      ? blueprintEntities.map(toEntityIdentifier)
      : (input.entities && input.entities.length > 0)
        ? input.entities.map(toEntityIdentifier)
        : this.extractEntities(input.requirements);
    const hasAuth = this.checkAuthRequired(input.requirements);
    const visualIntent = input.visualIntent || analyzeVisualIntent(
      input.requirements?.description || '',
      input.generationType
    );
    const componentPlan = planUIComponents(visualIntent, input.generationType);

    // ✅ generationType decide QUAL pacote de arquivos gerar. Antes desse fix,
    // esse campo era aceito mas nunca lido - LANDING_PAGE e COMPONENT sempre
    // caíam no mesmo scaffold de app CRUD completo (lista/detalhe/criar +
    // navbar), mesmo quando o pedido era só um componente ou uma landing page.
    const generationType = input.generationType;

    if (generationType === 'LANDING_PAGE') {
      return this.buildLandingPageResult(input, visualIntent, componentPlan);
    }

    if (generationType === 'COMPONENT') {
      return this.buildSingleComponentResult(input, entities, visualIntent, componentPlan);
    }

    // ✅ Step 2: Generate all UI files
    const files: GeneratedUIFile[] = [];

    // Core App files
    files.push(this.generateApp(entities, hasAuth, input.productBlueprint));
    files.push(this.generateIndex());
    files.push(this.generateMainCSS(visualIntent));
    files.push(...this.generateDesignSystemFiles(visualIntent, componentPlan));
    files.push(...this.generateVisualAssetFiles(visualIntent));
    
    // Pages for each entity
    entities.forEach(entity => {
      files.push(this.generateListPage(entity, visualIntent.locale, input.productBlueprint));
      files.push(this.generateDetailPage(entity, visualIntent.locale));
      files.push(this.generateCreatePage(entity, visualIntent.locale));
      files.push(this.generateEditPage(entity, visualIntent.locale));
    });
    input.productBlueprint?.screens
      .filter(screen => screen.route !== '/' && !screen.route.includes(':'))
      .forEach(screen => files.push(this.generateBlueprintScreenPage(screen, input.productBlueprint!, visualIntent, input.persistence || 'api')));
    
    // Common pages
    files.push(this.generateExperienceHomePage(entities, visualIntent));
    
    if (hasAuth) {
      files.push(this.generateLoginPage(visualIntent.locale));
      files.push(this.generateRegisterPage(visualIntent.locale));
    }
    
    // Components
    entities.forEach(entity => {
      files.push(this.generateListComponent(entity, visualIntent));
      files.push(this.generateFormComponent(entity, visualIntent.locale));
      files.push(this.generateCardComponent(entity, visualIntent.locale));
    });
    
    // Common components
    files.push(this.generateNavbar(entities, hasAuth, visualIntent, input.productBlueprint));
    files.push(this.generateLayout(visualIntent, input.productBlueprint));
    files.push(this.generateButton());
    files.push(this.generateInput());
    
    // Hooks
    files.push(this.generateApiHook(entities));
    
    if (hasAuth) {
      files.push(this.generateAuthHook());
      files.push(this.generateAuthContext()); 
    }
    
    // Utils
    files.push(this.generateApiClient(input.persistence || 'api'));
    
    // Types
    entities.forEach(entity => {
      files.push(this.generateTypes(entity));
    });

    // 🔥 ADICIONAR 3 ARQUIVOS OBRIGATÓRIOS PARA VITE
    files.push(this.generateIndexHtml(visualIntent));
    files.push(this.generateViteConfig());
    files.push(this.generateTsconfigNode());

    const themedFiles = this.applyVisualTokens(files);
    const visualAudit = auditGeneratedVisuals(themedFiles, visualIntent);
    const result: UIGenerationResult = {
      success: true,
      files: themedFiles,
      components: themedFiles.filter(f => f.path.includes('components')),
      pages: this.extractPages(themedFiles),
      metadata: {
        filesGenerated: themedFiles.length,
        componentsCount: themedFiles.filter(f => f.path.includes('components')).length,
        pagesCount: themedFiles.filter(f => f.path.includes('pages')).length,
        visualIntent,
        componentPlan,
        visualAudit
      }
    };

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ [UIGenerator] GENERATION COMPLETE');
    console.log(`[UIGenerator] Files: ${files.length}`);
    console.log(`[UIGenerator] Components: ${result.metadata.componentsCount}`);
    console.log(`[UIGenerator] Pages: ${result.metadata.pagesCount}`);
    console.log('[UIGenerator] ✅ Added: index.html, vite.config.ts, tsconfig.node.json');
    console.log('═══════════════════════════════════════════════════════════════');

    return result;

  } catch (error) {
    console.error('❌ [UIGenerator] GENERATION FAILED:', (error as Error).message);
    return this.createFallbackResult();
  }
}

  // ═══════════════════════════════════════════════════════════════
  // LANDING_PAGE package - hero/features/testimonials/CTA, sem CRUD
  // ═══════════════════════════════════════════════════════════════

  private buildLandingPageResult(
    input: UIGenerationInput,
    visualIntent: VisualIntent,
    componentPlan: string[]
  ): UIGenerationResult {
    console.log('[UIGenerator] Building LANDING_PAGE package (hero/features/testimonials/CTA)');

    const files: GeneratedUIFile[] = [
      this.generateWorkspacePackage(),
      this.generateFrontendPackage(),
      this.generateTsconfig(),
      this.generateTailwindConfig(visualIntent),
      this.generatePostcssConfig(),
      this.generateLandingApp(),
      this.generateLandingPageComponent(input, visualIntent),
      this.generateIndex(),
      this.generateMainCSS(visualIntent),
      ...this.generateDesignSystemFiles(visualIntent, componentPlan),
      ...this.generateVisualAssetFiles(visualIntent),
      this.generateIndexHtml(visualIntent),
      this.generateViteConfig(),
      this.generateTsconfigNode()
    ];

    const themedFiles = files;
    const visualAudit = auditGeneratedVisuals(themedFiles, visualIntent);
    return {
      success: true,
      files: themedFiles,
      components: themedFiles.filter(f => f.path.includes('components')),
      pages: this.extractPages(themedFiles),
      metadata: {
        filesGenerated: themedFiles.length,
        componentsCount: themedFiles.filter(f => f.path.includes('components')).length,
        pagesCount: themedFiles.filter(f => f.path.includes('pages')).length,
        visualIntent,
        componentPlan,
        visualAudit
      }
    };
  }

  private generateLandingApp(): GeneratedUIFile {
    const content = `
import LandingPage from './pages/LandingPage';

function App() {
  return <LandingPage />;
}

export default App;
    `.trim();

    return { path: 'frontend/src', name: 'App.tsx', content, type: 'tsx' };
  }

  private generateLandingPageComponent(input: UIGenerationInput, visualIntent: VisualIntent): GeneratedUIFile {
    const originalPrompt = (input.requirements?.description || '').replace(/\*\//g, '');
    const normalizedPrompt = originalPrompt.toLocaleLowerCase('pt-BR');
    const palette = visualIntent.palette;
    const isPt = visualIntent.locale === 'pt-BR';
    const isAutomationAI = /automa(?:ç|c)[aã]o|automation|automatizar/.test(normalizedPrompt)
      && /intelig[eê]ncia artificial|\bia\b|\bai\b/.test(normalizedPrompt);
    if (!isAutomationAI) {
      return this.generateAdaptiveLandingPage(visualIntent, normalizedPrompt);
    }
    const requestsProcess = /como funciona|how it works|(?:tr[eê]s|3) passos/.test(normalizedPrompt);
    const copy = isPt ? {
      navAction: 'Começar agora',
      eyebrow: isAutomationAI ? 'Automação inteligente para empresas' : 'Uma experiência criada para se destacar',
      headline: isAutomationAI
        ? 'Transforme processos complexos em resultados extraordinários'
        : 'Transforme uma boa ideia em uma experiência memorável',
      description: isAutomationAI
        ? `${visualIntent.brandName} conecta inteligência artificial, dados e integrações para sua empresa operar com mais velocidade e precisão.`
        : 'Design refinado, performance e clareza trabalhando juntos para conquistar confiança desde o primeiro contato.',
      primaryAction: isAutomationAI ? 'Automatizar agora' : 'Experimentar grátis',
      secondaryAction: isAutomationAI ? 'Ver como funciona' : 'Conhecer recursos',
      featuresTitle: isAutomationAI ? 'Inteligência aplicada ao seu crescimento' : 'Tudo que você precisa, sem o excesso',
      thirdSectionTitle: requestsProcess ? 'Da ideia à automação em três passos' : 'Criado para equipes exigentes',
      ctaTitle: isAutomationAI ? 'Sua próxima vantagem começa agora' : 'Pronto para elevar o seu produto?',
      ctaDescription: isAutomationAI
        ? `Descubra como a ${visualIntent.brandName} pode acelerar sua operação.`
        : 'Comece hoje. Nenhum cartão de crédito é necessário.',
      emailPlaceholder: 'voce@empresa.com',
      submit: isAutomationAI ? 'Solicitar demonstração' : 'Quero começar',
    } : {
      navAction: 'Get started',
      eyebrow: isAutomationAI ? 'Intelligent automation for modern companies' : 'An experience designed to stand out',
      headline: isAutomationAI ? 'Turn complex processes into extraordinary results' : 'Turn a strong idea into a memorable experience',
      description: isAutomationAI
        ? `${visualIntent.brandName} connects AI, data, and integrations so your company can move faster with precision.`
        : 'Refined design, performance, and clarity working together to earn trust from the very first interaction.',
      primaryAction: isAutomationAI ? 'Automate now' : 'Start for free',
      secondaryAction: requestsProcess ? 'See how it works' : 'Explore features',
      featuresTitle: isAutomationAI ? 'Intelligence applied to your growth' : 'Everything you need, without the clutter',
      thirdSectionTitle: requestsProcess ? 'From idea to automation in three steps' : 'Built for teams with high standards',
      ctaTitle: isAutomationAI ? 'Your next advantage starts now' : 'Ready to elevate your product?',
      ctaDescription: isAutomationAI ? `Discover how ${visualIntent.brandName} can accelerate your operation.` : 'Start today. No credit card required.',
      emailPlaceholder: 'you@company.com',
      submit: isAutomationAI ? 'Request a demo' : 'Get started',
    };
    const features = isAutomationAI
      ? (isPt ? [
          { number: '01', title: 'Automação inteligente', description: 'Fluxos que aprendem com a operação e eliminam tarefas repetitivas.' },
          { number: '02', title: 'Decisões orientadas por dados', description: 'Insights claros e acionáveis para decidir com velocidade e confiança.' },
          { number: '03', title: 'Integrações sem atrito', description: 'Conecte as ferramentas do seu negócio em uma operação contínua.' },
        ] : [
          { number: '01', title: 'Intelligent automation', description: 'Workflows that learn from your operation and remove repetitive work.' },
          { number: '02', title: 'Data-driven decisions', description: 'Clear, actionable insights for faster and more confident decisions.' },
          { number: '03', title: 'Seamless integrations', description: 'Connect your business tools into one continuous operation.' },
        ])
      : (isPt ? [
          { number: '01', title: 'Rápido por natureza', description: 'Performance desde o primeiro dia para manter cada interação fluida.' },
          { number: '02', title: 'Seguro e confiável', description: 'Boas práticas de segurança incorporadas em todas as camadas.' },
          { number: '03', title: 'Simples de dominar', description: 'Uma experiência intuitiva que reduz atrito e valoriza o conteúdo.' },
        ] : [
          { number: '01', title: 'Fast by default', description: 'Performance from day one, keeping every interaction fluid.' },
          { number: '02', title: 'Secure and reliable', description: 'Security best practices incorporated into every layer.' },
          { number: '03', title: 'Simple to master', description: 'An intuitive experience that removes friction and highlights the content.' },
        ]);
    const steps = isPt ? [
      { number: '01', title: 'Conecte', description: 'Integre dados, sistemas e equipes em poucos minutos.' },
      { number: '02', title: 'Configure', description: 'Defina objetivos e deixe a inteligência adaptar os fluxos.' },
      { number: '03', title: 'Escale', description: 'Acompanhe os resultados e amplie o que gera mais valor.' },
    ] : [
      { number: '01', title: 'Connect', description: 'Bring data, systems, and teams together in minutes.' },
      { number: '02', title: 'Configure', description: 'Set goals and let intelligence adapt the workflows.' },
      { number: '03', title: 'Scale', description: 'Track results and expand what creates the most value.' },
    ];
    const secondaryActionClasses = visualIntent.colorMode === 'dark'
      ? 'text-white hover:bg-white/10 border-white/15'
      : 'text-gray-800 hover:bg-black/5 border-black/10';

    const content = `
import { useState } from 'react';

const FEATURES = ${JSON.stringify(features, null, 2)};

const STEPS = ${JSON.stringify(steps, null, 2)};

export default function LandingPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen ${palette.page} ${palette.text} font-body selection:bg-violet-500/30">
      <header className="${palette.heroGradient} border-b ${palette.border}">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display font-bold text-lg tracking-tight">${visualIntent.brandName}</span>
          <a href="#cta" className="text-sm font-semibold ${palette.text} opacity-80 hover:opacity-100 transition-opacity">${copy.navAction}</a>
        </div>
      </header>

      <section className="${palette.heroGradient} px-6 pt-24 pb-28 text-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,.18),transparent_25%),radial-gradient(circle_at_80%_30%,rgba(139,92,246,.35),transparent_30%)]" />
        <div className="relative max-w-5xl mx-auto">
        <p className="inline-flex px-4 py-1.5 rounded-full border ${palette.border} ${palette.primarySoft} text-xs font-semibold uppercase tracking-[0.18em]">${copy.eyebrow}</p>
        <h1 className="mt-7 font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] leading-[1.04] ${palette.text}">
          ${copy.headline}
        </h1>
        <p className="mt-7 text-lg sm:text-xl ${palette.textMuted} max-w-2xl mx-auto leading-relaxed">
          ${copy.description}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#cta" className="w-full sm:w-auto px-7 py-3.5 ${palette.primary} ${palette.primaryHover} ${palette.primaryText} font-semibold rounded-xl shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5">
            ${copy.primaryAction}
          </a>
          <a href="${requestsProcess ? '#process' : '#features'}" className="w-full sm:w-auto px-7 py-3.5 rounded-xl border font-semibold ${secondaryActionClasses} transition-colors">
            ${copy.secondaryAction} →
          </a>
        </div>
        </div>
      </section>

      <section id="features" className="${palette.surfaceMuted} py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center ${palette.text}">${copy.featuresTitle}</h2>
          <div className="mt-12 grid sm:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="${palette.surface} rounded-3xl border ${palette.border} shadow-xl shadow-black/5 p-7 transition-transform hover:-translate-y-1">
                <span className="text-xs font-bold tracking-widest ${palette.accent}">{f.number}</span>
                <h3 className="mt-5 font-display text-xl font-semibold ${palette.text}">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed ${palette.textMuted}">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="py-24 ${palette.page}">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center ${palette.text}">${copy.thirdSectionTitle}</h2>
          <div className="mt-12 grid sm:grid-cols-3 gap-5">
            {STEPS.map((step) => (
              <div key={step.number} className="relative ${palette.surface} rounded-3xl border ${palette.border} shadow-sm p-7">
                <span className="text-xs font-bold tracking-widest ${palette.accent}">{step.number}</span>
                <h3 className="mt-5 font-display text-xl font-semibold ${palette.text}">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed ${palette.textMuted}">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="${palette.heroGradient} py-20 border-y ${palette.border}">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold ${palette.text}">${copy.ctaTitle}</h2>
          <p className="mt-3 ${palette.textMuted}">${copy.ctaDescription}</p>
          <form className="mt-6 flex flex-col sm:flex-row gap-3 justify-center" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="${copy.emailPlaceholder}"
              aria-label="Email"
              className="px-4 py-3.5 rounded-xl w-full sm:w-72 bg-white text-gray-950 border border-white/20 outline-none focus:ring-4 focus:ring-white/20"
            />
            <button type="submit" className="px-6 py-3.5 ${palette.primary} ${palette.primaryHover} ${palette.primaryText} font-semibold rounded-xl transition-colors shadow-lg">
              ${copy.submit}
            </button>
          </form>
        </div>
      </section>

      <footer className="py-9 text-center text-sm ${palette.textMuted} ${palette.page}">
        © {new Date().getFullYear()} ${visualIntent.brandName}. ${isPt ? 'Todos os direitos reservados.' : 'All rights reserved.'}
      </footer>
    </div>
  );
}
    `.trim();

    return { path: 'frontend/src/pages', name: 'LandingPage.tsx', content, type: 'tsx' };
  }

  private generateAdaptiveLandingPage(visualIntent: VisualIntent, normalizedPrompt: string): GeneratedUIFile {
    const palette = visualIntent.palette;
    const isPt = visualIntent.locale === 'pt-BR';
    const variant = visualIntent.style === 'luxury' || visualIntent.style === 'editorial' || visualIntent.archetype === 'creative'
      ? 'editorial'
      : visualIntent.archetype === 'commerce' || visualIntent.style === 'playful'
        ? 'showcase'
        : 'product';
    const profiles: Record<string, {
      eyebrow: string;
      headline: string;
      description: string;
      primary: string;
      secondary: string;
      proof: string;
      quote: string;
      quoteAuthor: string;
      ctaTitle: string;
      ctaDescription: string;
      benefits: Array<{ number: string; title: string; description: string }>;
      stats: Array<{ value: string; label: string }>;
      steps: Array<{ number: string; title: string; description: string }>;
    }> = isPt ? {
      finance: {
        eyebrow: 'Inteligência financeira, sem ruído',
        headline: 'Decisões mais claras para um patrimônio em movimento.',
        description: `${visualIntent.brandName} reúne visão, contexto e precisão para transformar dados financeiros em próximos passos confiáveis.`,
        primary: 'Conhecer a plataforma', secondary: 'Explorar a experiência', proof: 'Clareza para decisões que não podem esperar.',
        quote: 'Finalmente conseguimos enxergar o presente e planejar o próximo movimento no mesmo lugar.', quoteAuthor: 'Liderança financeira',
        ctaTitle: 'Seu próximo movimento começa com clareza.', ctaDescription: 'Converse com nossa equipe e descubra uma nova forma de acompanhar suas decisões.',
        benefits: [
          { number: '01', title: 'Visão patrimonial viva', description: 'Saldos, tendências e objetivos organizados em uma leitura contínua.' },
          { number: '02', title: 'Risco com contexto', description: 'Sinais importantes aparecem no momento certo, sem excesso de informação.' },
          { number: '03', title: 'Decisões explicáveis', description: 'Cada recomendação vem acompanhada do contexto necessário para agir.' },
        ],
        stats: [{ value: '360°', label: 'visão consolidada' }, { value: '24/7', label: 'sinais relevantes' }, { value: '1 lugar', label: 'para decidir' }],
        steps: [{ number: '01', title: 'Conecte', description: 'Reúna contas e objetivos.' }, { number: '02', title: 'Entenda', description: 'Visualize cenários com clareza.' }, { number: '03', title: 'Avance', description: 'Transforme sinais em decisões.' }],
      },
      healthcare: {
        eyebrow: 'Tecnologia a serviço do cuidado',
        headline: 'Cuidado que começa antes da consulta e continua depois dela.',
        description: `${visualIntent.brandName} aproxima equipes e pacientes em uma jornada mais humana, coordenada e segura.`,
        primary: 'Conhecer a experiência', secondary: 'Ver como funciona', proof: 'Feito para cuidar de pessoas, não de processos.',
        quote: 'Nossa equipe ganhou tempo para o que realmente importa: acompanhar cada pessoa com atenção.', quoteAuthor: 'Equipe de cuidado',
        ctaTitle: 'Uma jornada de cuidado mais próxima.', ctaDescription: 'Descubra como sua equipe pode coordenar cada etapa sem perder o vínculo humano.',
        benefits: [
          { number: '01', title: 'Cuidado contínuo', description: 'Cada contato mantém o contexto e dá sequência à jornada do paciente.' },
          { number: '02', title: 'Equipe coordenada', description: 'Agenda, prioridades e informações essenciais no mesmo fluxo.' },
          { number: '03', title: 'Confiança em cada etapa', description: 'Comunicação clara e sinais importantes sempre visíveis.' },
        ],
        stats: [{ value: '1 jornada', label: 'do início ao retorno' }, { value: '24h', label: 'de continuidade' }, { value: '+ cuidado', label: 'menos atrito' }],
        steps: [{ number: '01', title: 'Acolha', description: 'Organize a entrada do paciente.' }, { number: '02', title: 'Acompanhe', description: 'Mantenha o contexto vivo.' }, { number: '03', title: 'Cuide', description: 'Antecipe o próximo passo.' }],
      },
      jewelry: {
        eyebrow: 'Joias feitas para permanecer',
        headline: 'Peças que atravessam o tempo e guardam histórias.',
        description: `${visualIntent.brandName} reúne design autoral, materiais nobres e uma curadoria criada para celebrar momentos que não se repetem.`,
        primary: 'Explorar a coleção', secondary: 'Conhecer o atelier', proof: 'Raridade, origem e acabamento revelados em cada detalhe.',
        quote: 'Cada peça chegou com a presença de uma joia única e a delicadeza de algo feito especialmente para mim.', quoteAuthor: 'Cliente da maison',
        ctaTitle: 'Encontre a joia que contará a sua história.', ctaDescription: 'Agende uma apresentação privada e descubra peças selecionadas para o seu momento.',
        benefits: [
          { number: '01', title: 'Curadoria rara', description: 'Peças escolhidas por desenho, proporção e caráter, além da tendência.' },
          { number: '02', title: 'Origem transparente', description: 'Materiais, lapidação e acabamento apresentados com clareza.' },
          { number: '03', title: 'Atendimento privado', description: 'Uma experiência pessoal para escolher com tempo e confiança.' },
        ],
        stats: [{ value: '18k', label: 'ouro certificado' }, { value: '1 de 1', label: 'seleção pessoal' }, { value: 'para sempre', label: 'assistência da maison' }],
        steps: [{ number: '01', title: 'Descubra', description: 'Conheça peças e histórias.' }, { number: '02', title: 'Experimente', description: 'Agende uma apresentação privada.' }, { number: '03', title: 'Celebre', description: 'Leve uma joia com significado.' }],
      },
      skincare: {
        eyebrow: 'Sua pele, seu ritual, sua luz',
        headline: 'Cuidado gostoso de usar. Resultado fácil de sentir.',
        description: `${visualIntent.brandName} transforma ativos eficazes em uma rotina leve, vibrante e simples de manter todos os dias.`,
        primary: 'Montar meu ritual', secondary: 'Conhecer os ativos', proof: 'Fórmulas inteligentes para uma rotina que cabe na vida real.',
        quote: 'Minha rotina ficou mais simples, minha pele mais confortável e eu finalmente entendi o que estava usando.', quoteAuthor: 'Comunidade VIVA',
        ctaTitle: 'Sua próxima descoberta começa na pele.', ctaDescription: 'Receba lançamentos, rituais e escolhas feitas para o seu momento.',
        benefits: [
          { number: '01', title: 'Ativos que fazem sentido', description: 'Ingredientes explicados sem mistério e combinados com intenção.' },
          { number: '02', title: 'Rotina descomplicada', description: 'Poucos passos, texturas prazerosas e constância possível.' },
          { number: '03', title: 'Escolha mais segura', description: 'Orientação clara para encontrar o cuidado certo para sua pele.' },
        ],
        stats: [{ value: '95%', label: 'amou a textura' }, { value: '3 passos', label: 'para cuidar' }, { value: '30 dias', label: 'para experimentar' }],
        steps: [{ number: '01', title: 'Descubra', description: 'Conte o momento da sua pele.' }, { number: '02', title: 'Combine', description: 'Monte um ritual possível.' }, { number: '03', title: 'Sinta', description: 'Acompanhe sua evolução.' }],
      },
      commerce: {
        eyebrow: 'Uma nova forma de desejar',
        headline: 'Produtos com presença. Uma experiência feita para converter.',
        description: `${visualIntent.brandName} transforma descoberta em desejo com uma vitrine rápida, expressiva e simples de comprar.`,
        primary: 'Explorar coleção', secondary: 'Conhecer a marca', proof: 'Curadoria, contexto e conversão no mesmo ritmo.',
        quote: 'A experiência deixou de parecer uma loja e passou a transmitir o valor real de cada peça.', quoteAuthor: 'Direção de marca',
        ctaTitle: 'Descubra o que merece fazer parte da sua história.', ctaDescription: 'Receba lançamentos, seleções especiais e acesso antecipado.',
        benefits: [
          { number: '01', title: 'Curadoria com intenção', description: 'Coleções organizadas para descoberta rápida e escolhas seguras.' },
          { number: '02', title: 'Detalhes que convencem', description: 'Produto, história e valor apresentados sem distrações.' },
          { number: '03', title: 'Compra sem atrito', description: 'Da primeira impressão ao checkout em poucos passos.' },
        ],
        stats: [{ value: '48h', label: 'para envio' }, { value: '30 dias', label: 'para trocar' }, { value: '4,9/5', label: 'experiência' }],
        steps: [{ number: '01', title: 'Descubra', description: 'Encontre sua próxima escolha.' }, { number: '02', title: 'Conheça', description: 'Veja cada detalhe e história.' }, { number: '03', title: 'Leve', description: 'Compre com segurança.' }],
      },
      creative: {
        eyebrow: 'Estratégia, forma e movimento',
        headline: 'Ideias que ocupam espaço e marcas que permanecem.',
        description: `${visualIntent.brandName} cria identidades e experiências digitais que transformam intenção em presença cultural.`,
        primary: 'Ver projetos', secondary: 'Iniciar uma conversa', proof: 'Trabalho autoral para negócios que não querem parecer iguais.',
        quote: 'O processo revelou uma marca que já existia em nós, mas ainda não tinha forma.', quoteAuthor: 'Fundadora parceira',
        ctaTitle: 'Vamos criar algo impossível de ignorar.', ctaDescription: 'Conte o momento da sua marca. Nós desenhamos o próximo capítulo.',
        benefits: [
          { number: '01', title: 'Estratégia de marca', description: 'Uma ideia central forte para orientar voz, forma e experiência.' },
          { number: '02', title: 'Direção visual', description: 'Sistemas expressivos que mantêm coerência sem perder energia.' },
          { number: '03', title: 'Experiência digital', description: 'Produtos e narrativas que convidam as pessoas a permanecer.' },
        ],
        stats: [{ value: '12', label: 'prêmios de design' }, { value: '7 países', label: 'com projetos ativos' }, { value: '94%', label: 'de recorrência' }],
        steps: [{ number: '01', title: 'Escutamos', description: 'Encontramos a tensão essencial.' }, { number: '02', title: 'Criamos', description: 'Damos forma a uma direção única.' }, { number: '03', title: 'Lançamos', description: 'Construímos presença no mundo.' }],
      },
      architecture: {
        eyebrow: 'Arquitetura para viver melhor',
        headline: 'Espaços que respiram com o lugar e atravessam o tempo.',
        description: `${visualIntent.brandName} combina matéria, clima e modos de viver para criar uma arquitetura brasileira sensível, durável e essencial.`,
        primary: 'Agendar uma conversa', secondary: 'Conhecer projetos', proof: 'Projetos guiados pelo lugar, pela luz e por quem vai habitá-los.',
        quote: 'A casa nasceu do terreno e da nossa rotina. Cada escolha parece inevitável, simples e profundamente nossa.', quoteAuthor: 'Família Casa Pátio',
        ctaTitle: 'Vamos imaginar o espaço que ainda não existe.', ctaDescription: 'Conte onde você está e como deseja viver. A primeira conversa começa pelo essencial.',
        benefits: [
          { number: '01', title: 'Casa Pátio', description: 'Volumes baixos, ventilação cruzada e um jardim que organiza a vida cotidiana.' },
          { number: '02', title: 'Refúgio da Serra', description: 'Pedra, madeira e sombra desenham uma relação silenciosa com a paisagem.' },
          { number: '03', title: 'Ateliê Urbano', description: 'Estrutura existente e novos usos reunidos com precisão e baixo impacto.' },
        ],
        stats: [{ value: '18', label: 'projetos construídos' }, { value: '42%', label: 'menos energia' }, { value: '6 biomas', label: 'como referência' }],
        steps: [{ number: '01', title: 'Escuta e território', description: 'Entendemos rotina, clima, terreno e recursos disponíveis.' }, { number: '02', title: 'Conceito e matéria', description: 'Transformamos restrições em uma direção espacial clara.' }, { number: '03', title: 'Projeto e obra', description: 'Detalhamos e acompanhamos cada decisão até o espaço existir.' }],
      },
      saas: {
        eyebrow: 'Trabalho conectado, progresso visível',
        headline: 'Menos atrito entre uma boa ideia e o trabalho concluído.',
        description: `${visualIntent.brandName} organiza projetos, decisões e automações em um espaço que sua equipe realmente entende.`,
        primary: 'Começar gratuitamente', secondary: 'Ver o produto', proof: 'Um workspace claro para equipes que se movem rápido.',
        quote: 'Saímos de cinco ferramentas e finalmente passamos a trabalhar com o mesmo contexto.', quoteAuthor: 'Liderança de produto',
        ctaTitle: 'Transforme intenção em progresso.', ctaDescription: 'Comece com sua equipe e organize o próximo projeto em minutos.',
        benefits: [
          { number: '01', title: 'Foco compartilhado', description: 'Prioridades e decisões permanecem claras para todo o time.' },
          { number: '02', title: 'Fluxos adaptáveis', description: 'Organize o trabalho sem forçar sua equipe a um único método.' },
          { number: '03', title: 'Progresso automático', description: 'Atualizações e rotinas acontecem sem trabalho repetitivo.' },
        ],
        stats: [{ value: '42%', label: 'menos retrabalho' }, { value: '3,2x', label: 'mais visibilidade' }, { value: '8h', label: 'poupadas por semana' }],
        steps: [{ number: '01', title: 'Organize', description: 'Reúna trabalho e contexto.' }, { number: '02', title: 'Colabore', description: 'Decida no mesmo fluxo.' }, { number: '03', title: 'Evolua', description: 'Automatize o que se repete.' }],
      },
      generic: {
        eyebrow: 'Uma experiência com intenção',
        headline: 'Uma presença digital que deixa claro por que sua marca importa.',
        description: `${visualIntent.brandName} combina narrativa, clareza e performance em uma experiência construída para gerar confiança.`,
        primary: 'Começar agora', secondary: 'Conhecer a proposta', proof: 'Design, conteúdo e tecnologia trabalhando na mesma direção.',
        quote: 'A nova experiência tornou nossa proposta simples de entender e difícil de esquecer.', quoteAuthor: 'Cliente parceiro',
        ctaTitle: 'Pronto para construir a próxima versão?', ctaDescription: 'Conte sua ideia e descubra como transformar intenção em resultado.',
        benefits: [
          { number: '01', title: 'Clareza desde o início', description: 'Uma mensagem forte orienta cada ponto de contato.' },
          { number: '02', title: 'Experiência coerente', description: 'Forma e função trabalham juntas em qualquer tela.' },
          { number: '03', title: 'Resultado mensurável', description: 'Cada escolha aproxima a pessoa da próxima ação.' },
        ],
        stats: [{ value: '100%', label: 'responsivo' }, { value: '< 2s', label: 'para encantar' }, { value: '1 visão', label: 'em toda a jornada' }],
        steps: [{ number: '01', title: 'Entenda', description: 'Alinhe intenção e público.' }, { number: '02', title: 'Construa', description: 'Transforme estratégia em experiência.' }, { number: '03', title: 'Evolua', description: 'Aprenda e refine continuamente.' }],
      },
    } : {
      generic: {
        eyebrow: 'A deliberately different experience', headline: 'A digital presence that makes your value impossible to miss.',
        description: `${visualIntent.brandName} brings narrative, clarity, and performance together in one confident experience.`,
        primary: 'Get started', secondary: 'Discover the approach', proof: 'Design, content, and technology moving in one direction.',
        quote: 'The new experience made our value easier to understand and harder to forget.', quoteAuthor: 'Partner company',
        ctaTitle: 'Ready to build what comes next?', ctaDescription: 'Share your idea and turn intent into a clear next step.',
        benefits: [{ number: '01', title: 'Clarity first', description: 'A strong message guides every touchpoint.' }, { number: '02', title: 'Coherent experience', description: 'Form and function move together across every screen.' }, { number: '03', title: 'Measurable outcomes', description: 'Every choice brings people closer to action.' }],
        stats: [{ value: '100%', label: 'responsive' }, { value: '< 2s', label: 'to make an impression' }, { value: '1 vision', label: 'across the journey' }],
        steps: [{ number: '01', title: 'Understand', description: 'Align audience and intent.' }, { number: '02', title: 'Build', description: 'Turn strategy into experience.' }, { number: '03', title: 'Evolve', description: 'Learn and continuously refine.' }],
      },
    };
    const commerceProfile = /joalher|joia|jewelry|atelier|maison/.test(normalizedPrompt)
      ? 'jewelry'
      : /skincare|cosm[eé]tic|beleza|beauty|pele/.test(normalizedPrompt)
        ? 'skincare'
        : 'commerce';
    const profileKey = /arquitet|architecture|urbanismo|interiores/.test(normalizedPrompt)
      ? 'architecture'
      : visualIntent.archetype === 'commerce' ? commerceProfile : visualIntent.archetype;
    const profile = profiles[profileKey] ?? profiles['generic']!;
    const heroStat = profile.stats[0]!;
    const heroIsLight = /from-(?:gray-50|stone-100)|via-white/.test(palette.heroGradient);
    const heroText = heroIsLight ? palette.text : 'text-white';
    const heroMuted = heroIsLight ? palette.textMuted : 'text-white/70';
    const secondaryClasses = !heroIsLight
      ? 'border-white/15 text-white hover:bg-white/10'
      : 'border-black/10 text-gray-900 hover:bg-black/5';
    const strictFourSections = /(?:exatamente|exactly)\s+(?:quatro|4|four)\s+(?:se[cç][oõ]es|sections)/.test(normalizedPrompt);
    const statsSection = strictFourSections
      ? ''
      : `<section className="border-y ${palette.border} ${palette.page}"><div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-3 gap-4">{STATS.map((stat) => <div key={stat.label} className="text-center"><strong className="block font-display text-2xl sm:text-3xl ${palette.text}">{stat.value}</strong><span className="text-[11px] sm:text-xs uppercase tracking-wider ${palette.textMuted}">{stat.label}</span></div>)}</div></section>`;
    const hero = variant === 'editorial' ? `
      <section className="${palette.heroGradient} px-6 pt-20 pb-24 overflow-hidden relative">
        <div className="absolute -top-32 right-[-10%] w-[34rem] h-[34rem] rounded-full border border-white/10 opacity-50" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.25fr_.75fr] gap-16 items-end relative">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] ${palette.accent}">${profile.eyebrow}</p>
            <h1 className="mt-8 font-display text-6xl sm:text-7xl lg:text-[7.4rem] leading-[.88] tracking-[-0.055em] ${heroText}">${profile.headline}</h1>
            <p className="mt-9 max-w-xl text-lg leading-relaxed ${heroMuted}">${profile.description}</p>
            <div className="mt-10 flex flex-wrap gap-3"><a href="#cta" className="px-7 py-3.5 ${palette.primary} ${palette.primaryHover} ${palette.primaryText} font-semibold rounded-full">${profile.primary}</a><a href="#work" className="px-7 py-3.5 border rounded-full font-semibold ${secondaryClasses}">${profile.secondary}</a></div>
          </div>
          <div className="lg:pb-3">
            <div className="border-t ${palette.border} pt-5 flex justify-between text-xs uppercase tracking-[.2em] ${heroMuted}"><span>Selected work</span><span>№ 01—03</span></div>
            <div className="mt-6 ${palette.surface} border ${palette.border} rounded-[2rem] p-7 min-h-80 flex flex-col justify-between shadow-2xl shadow-black/20 rotate-2 hover:rotate-0 transition-transform duration-500">
              <span className="text-xs font-bold uppercase tracking-[.2em] ${palette.accent}">${visualIntent.identity.signature}</span>
              <div><p className="font-display text-3xl ${palette.text}">${profile.proof}</p><p className="mt-4 text-sm ${palette.textMuted}">${visualIntent.identity.promise}</p></div>
            </div>
          </div>
        </div>
      </section>` : variant === 'showcase' ? `
      <section className="${palette.heroGradient} px-6 pt-16 pb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto text-center relative">
          <p className="inline-flex px-4 py-2 rounded-full ${palette.primarySoft} text-xs font-bold uppercase tracking-[.2em]">${profile.eyebrow}</p>
          <h1 className="mt-7 max-w-5xl mx-auto font-display text-5xl sm:text-7xl lg:text-8xl leading-[.95] tracking-[-.05em] ${heroText}">${profile.headline}</h1>
          <p className="mt-7 max-w-2xl mx-auto text-lg ${heroMuted}">${profile.description}</p>
          <div className="mt-9 flex justify-center flex-wrap gap-3"><a href="#cta" className="px-8 py-4 ${palette.primary} ${palette.primaryHover} ${palette.primaryText} font-bold rounded-2xl shadow-xl">${profile.primary}</a><a href="#work" className="px-8 py-4 border rounded-2xl font-bold ${secondaryClasses}">${profile.secondary}</a></div>
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 items-end max-w-5xl mx-auto">
            {[0,1,2,3].map((item) => <div key={item} className={'${palette.surface} border ${palette.border} rounded-[2rem] p-4 shadow-2xl flex items-end ' + (item % 2 === 0 ? 'h-64 ' : 'h-80 ') + (item === 1 ? '-rotate-3' : item === 2 ? 'rotate-3' : '')}><div className="w-full rounded-2xl h-24 bg-gradient-to-br from-white/30 to-transparent border ${palette.border}" /></div>)}
          </div>
        </div>
      </section>` : `
      <section className="${palette.heroGradient} px-6 py-20 lg:py-28 overflow-hidden relative">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_15%_20%,rgba(255,255,255,.16),transparent_24%),radial-gradient(circle_at_85%_70%,rgba(45,212,191,.22),transparent_28%)]" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <div><p className="text-xs font-bold uppercase tracking-[.24em] ${palette.accent}">${profile.eyebrow}</p><h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl leading-[.98] tracking-[-.045em] ${heroText}">${profile.headline}</h1><p className="mt-7 max-w-xl text-lg leading-relaxed ${heroMuted}">${profile.description}</p><div className="mt-9 flex flex-wrap gap-3"><a href="#cta" className="px-7 py-3.5 ${palette.primary} ${palette.primaryHover} ${palette.primaryText} font-semibold rounded-xl shadow-xl">${profile.primary}</a><a href="#work" className="px-7 py-3.5 border rounded-xl font-semibold ${secondaryClasses}">${profile.secondary}</a></div></div>
          <div className="${palette.surface} border ${palette.border} rounded-[2rem] p-3 shadow-2xl shadow-black/25 lg:rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="rounded-[1.5rem] ${palette.surfaceMuted} border ${palette.border} overflow-hidden"><div className="h-12 border-b ${palette.border} flex items-center px-5 gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"/><span className="w-2.5 h-2.5 rounded-full bg-amber-400"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"/><span className="ml-auto text-[10px] uppercase tracking-widest ${palette.textMuted}">Live workspace</span></div><div className="p-6 grid grid-cols-3 gap-3"><div className="col-span-2 h-40 rounded-2xl ${palette.primarySoft} p-5 flex flex-col justify-between"><span className="text-xs font-bold uppercase tracking-widest">Overview</span><div className="flex items-end gap-2 h-20">{[40,65,50,88,72,96,82].map((height) => <span key={height} style={{height: height + '%'}} className="flex-1 ${palette.primary} rounded-t-md opacity-80" />)}</div></div><div className="h-40 rounded-2xl ${palette.surface} border ${palette.border} p-4"><span className="text-3xl font-display font-bold ${palette.text}">${heroStat.value}</span><p className="mt-2 text-xs ${palette.textMuted}">${heroStat.label}</p></div><div className="col-span-3 h-20 rounded-2xl ${palette.surface} border ${palette.border} flex items-center px-5 gap-3"><span className="w-10 h-10 rounded-xl ${palette.primarySoft}"/><div className="flex-1"><div className="w-2/3 h-2 rounded-full ${palette.primarySoft}"/><div className="mt-2 w-1/2 h-2 rounded-full ${palette.primarySoft} opacity-60"/></div><span className="text-xs font-semibold ${palette.accent}">On track</span></div></div></div>
          </div>
        </div>
      </section>`;
    const content = `
import { useState } from 'react';

const BENEFITS = ${JSON.stringify(profile.benefits, null, 2)};
const STATS = ${JSON.stringify(profile.stats, null, 2)};
const STEPS = ${JSON.stringify(profile.steps, null, 2)};

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div data-landing-variant="${variant}" className="min-h-screen ${palette.page} ${palette.text} font-body selection:bg-violet-500/30">
      <header className="${palette.heroGradient} ${heroText} border-b ${palette.border}"><div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"><a href="#" className="font-display font-bold text-xl tracking-tight">${visualIntent.brandName}</a><nav className="hidden md:flex items-center gap-8 text-sm ${heroMuted}"><a href="#work" className="hover:opacity-70">${isPt ? 'Diferenciais' : 'Benefits'}</a><a href="#method" className="hover:opacity-70">${isPt ? 'Como funciona' : 'How it works'}</a></nav><a href="#cta" className="text-sm font-bold px-5 py-2.5 rounded-full ${palette.primarySoft}">${profile.primary}</a></div></header>
${hero}
      ${statsSection}
      <section id="work" className="py-24 ${palette.surfaceMuted}"><div className="max-w-7xl mx-auto px-6"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] ${palette.accent}">${visualIntent.identity.visualMetaphor}</p><h2 className="mt-5 font-display text-4xl sm:text-6xl tracking-[-.04em] ${palette.text}">${profile.proof}</h2></div><div className="mt-14 grid md:grid-cols-3 gap-5">{BENEFITS.map((benefit, index) => <article key={benefit.title} className={'${palette.surface} border ${palette.border} rounded-[2rem] p-7 min-h-64 flex flex-col ' + (${variant === 'editorial'} && index === 0 ? 'md:col-span-2 ' : '') + (${variant === 'showcase'} && index === 1 ? 'md:-translate-y-6' : '')}><span className="text-xs font-bold tracking-[.2em] ${palette.accent}">{benefit.number}</span><div className="mt-auto"><h3 className="font-display text-2xl ${palette.text}">{benefit.title}</h3><p className="mt-3 leading-relaxed ${palette.textMuted}">{benefit.description}</p></div></article>)}</div></div></section>
      <section id="method" className="py-24 ${palette.page}"><div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[.85fr_1.15fr] gap-16"><div><p className="text-xs font-bold uppercase tracking-[.22em] ${palette.accent}">${isPt ? 'Nossa abordagem' : 'Our approach'}</p><blockquote className="mt-6 font-display text-3xl sm:text-4xl leading-tight ${palette.text}">“${profile.quote}”</blockquote><p className="mt-5 text-sm ${palette.textMuted}">— ${profile.quoteAuthor}</p></div><div className="border-t ${palette.border}">{STEPS.map((step) => <div key={step.number} className="grid grid-cols-[3rem_1fr] gap-4 py-6 border-b ${palette.border}"><span className="text-xs font-bold ${palette.accent}">{step.number}</span><div><h3 className="font-display text-xl ${palette.text}">{step.title}</h3><p className="mt-1 ${palette.textMuted}">{step.description}</p></div></div>)}</div></div></section>
      <section id="cta" className="${palette.heroGradient} px-6 py-24 border-y ${palette.border}"><div className="max-w-4xl mx-auto text-center"><h2 className="font-display text-4xl sm:text-6xl tracking-[-.04em] ${heroText}">${profile.ctaTitle}</h2><p className="mt-5 text-lg ${heroMuted}">${profile.ctaDescription}</p>{submitted ? <div className="mt-9 inline-flex px-6 py-4 rounded-2xl ${palette.primarySoft} font-semibold">${isPt ? 'Recebido. Em breve entraremos em contato.' : 'Received. We will be in touch soon.'}</div> : <form className="mt-9 max-w-xl mx-auto flex flex-col sm:flex-row gap-3" onSubmit={(event) => { event.preventDefault(); if (email) setSubmitted(true); }}><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="${isPt ? 'seu@email.com' : 'you@email.com'}" aria-label="Email" className="flex-1 px-5 py-4 rounded-2xl bg-white text-gray-950 border-0 outline-none focus:ring-4 focus:ring-white/20"/><button className="px-7 py-4 ${palette.primary} ${palette.primaryHover} ${palette.primaryText} font-bold rounded-2xl">${isPt ? 'Quero conversar' : 'Start a conversation'}</button></form>}</div></section>
      <footer className="${palette.page}"><div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row gap-4 justify-between text-sm ${palette.textMuted}"><span className="font-display font-bold ${palette.text}">${visualIntent.brandName}</span><span>© {new Date().getFullYear()} · ${isPt ? 'Criado com intenção.' : 'Designed with intent.'}</span></div></footer>
    </div>
  );
}
    `.trim();
    return { path: 'frontend/src/pages', name: 'LandingPage.tsx', content, type: 'tsx' };
  }

  // ═══════════════════════════════════════════════════════════════
  // COMPONENT package - só o componente pedido, sem scaffold de CRUD
  // ═══════════════════════════════════════════════════════════════

  private buildSingleComponentResult(
    input: UIGenerationInput,
    entities: string[],
    visualIntent: VisualIntent,
    componentPlan: string[]
  ): UIGenerationResult {
    console.log('[UIGenerator] Building COMPONENT package (single reusable component, no CRUD scaffold)');

    const entity = entities[0] || 'item';
    const Entity = this.capitalize(entity);

    const files: GeneratedUIFile[] = [
      this.generateWorkspacePackage(),
      this.generateFrontendPackage(),
      this.generateTsconfig(),
      this.generateTailwindConfig(visualIntent),
      this.generatePostcssConfig(),
      this.generateComponentPreviewApp(Entity, visualIntent),
      this.generatePresentationCard(entity, visualIntent),
      this.generateIndex(),
      this.generateMainCSS(visualIntent),
      ...this.generateDesignSystemFiles(visualIntent, componentPlan),
      ...this.generateVisualAssetFiles(visualIntent),
      this.generateIndexHtml(visualIntent),
      this.generateViteConfig(),
      this.generateTsconfigNode()
    ];

    const themedFiles = files;
    const visualAudit = auditGeneratedVisuals(themedFiles, visualIntent);
    return {
      success: true,
      files: themedFiles,
      components: themedFiles.filter(f => f.path.includes('components')),
      pages: this.extractPages(themedFiles),
      metadata: {
        filesGenerated: themedFiles.length,
        componentsCount: themedFiles.filter(f => f.path.includes('components')).length,
        pagesCount: themedFiles.filter(f => f.path.includes('pages')).length,
        visualIntent,
        componentPlan,
        visualAudit
      }
    };
  }

  private generateComponentPreviewApp(Entity: string, visualIntent: VisualIntent): GeneratedUIFile {
    const content = `
import ${Entity}Card from './components/${Entity}Card';

function App() {
  return (
    <div className="min-h-screen ${visualIntent.palette.heroGradient} flex items-center justify-center p-8 font-body">
      <${Entity}Card
        imageUrl="/visual-card.svg"
        title="Sample ${Entity}"
        subtitle="A short description goes here"
        price="$29.90"
        actionLabel="Buy now"
        onAction={() => alert('Action clicked')}
      />
    </div>
  );
}

export default App;
    `.trim();

    return { path: 'frontend/src', name: 'App.tsx', content, type: 'tsx' };
  }

  private generatePresentationCard(entity: string, visualIntent: VisualIntent): GeneratedUIFile {
    const Entity = this.capitalize(entity);
    const palette = visualIntent.palette;
    const content = `
interface ${Entity}CardProps {
  imageUrl?: string;
  title: string;
  subtitle?: string;
  price?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ${Entity}Card({
  imageUrl,
  title,
  subtitle,
  price,
  actionLabel = 'Buy now',
  onAction,
}: ${Entity}CardProps) {
  return (
    <article className="${palette.surface} ${palette.text} rounded-3xl border ${palette.border} shadow-2xl shadow-black/20 hover:-translate-y-1 transition-all overflow-hidden w-full max-w-sm">
      {imageUrl && (
        <img src={imageUrl} alt={title} className="w-full h-44 object-cover" />
      )}
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold ${palette.text}">{title}</h3>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed ${palette.textMuted} line-clamp-2">{subtitle}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          {price && (
            <span className="text-lg font-bold ${palette.text}">{price}</span>
          )}
          <button
            onClick={onAction}
            className="px-4 py-2.5 ${palette.primary} ${palette.primaryHover} ${palette.primaryText} text-sm font-semibold rounded-xl shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-white/20"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
    `.trim();

    return { path: 'frontend/src/components', name: `${Entity}Card.tsx`, content, type: 'tsx' };
  }

  /** Minimal workspace files shared by specialized, runnable UI packages. */
  private generateWorkspacePackage(): GeneratedUIFile {
    return {
      path: '',
      name: 'package.json',
      type: 'json',
      metadata: { isRoot: true },
      content: JSON.stringify({
        name: 'orus-generated-ui',
        version: '1.0.0',
        private: true,
        workspaces: ['frontend'],
        scripts: {
          dev: 'npm run dev --workspace=frontend',
          build: 'npm run build --workspace=frontend',
          preview: 'npm run preview --workspace=frontend',
          test: 'npm run test --workspace=frontend'
        }
      }, null, 2)
    };
  }

  private generateFrontendPackage(): GeneratedUIFile {
    return {
      path: 'frontend',
      name: 'package.json',
      type: 'json',
      content: JSON.stringify({
        name: 'orus-generated-ui-frontend',
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc --noEmit && vite build',
          preview: 'vite preview',
          test: 'vitest run'
        },
        dependencies: {
          react: '^18.3.1',
          'react-dom': '^18.3.1'
        },
        devDependencies: {
          '@types/node': '^20.11.19',
          '@types/react': '^18.2.66',
          '@types/react-dom': '^18.2.22',
          '@vitejs/plugin-react': '^4.7.0',
          autoprefixer: '^10.6.1',
          postcss: '^8.5.28',
          tailwindcss: '^3.4.19',
          typescript: '^5.9.3',
          vite: '^5.4.21',
          vitest: '^2.1.9'
        }
      }, null, 2)
    };
  }

  private generateTsconfig(): GeneratedUIFile {
    return {
      path: 'frontend',
      name: 'tsconfig.json',
      type: 'json',
      content: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          allowJs: false,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          module: 'ESNext',
          moduleResolution: 'Bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          types: ['vite/client'],
          jsx: 'react-jsx'
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }]
      }, null, 2)
    };
  }

  private generateTailwindConfig(visualIntent?: VisualIntent): GeneratedUIFile {
    const intent = visualIntent || analyzeVisualIntent('');
    return {
      path: 'frontend',
      name: 'tailwind.config.js',
      type: 'javascript',
      content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['${intent.typography.display}', 'sans-serif'],
        body: ['${intent.typography.body}', 'sans-serif'],
      },
      colors: {
        brand: 'rgb(var(--color-primary) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}`
    };
  }

  private generatePostcssConfig(): GeneratedUIFile {
    return {
      path: 'frontend',
      name: 'postcss.config.js',
      type: 'javascript',
      content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
    };
  }

  /**
   * Extract entities from requirements
   */
  // ✅ FIX A+10: Expanded entity list + Portuguese → English normalization
  // Prompts em Português (remédio, medicamento, horário, etc.) são mapeados
  // para seus equivalentes em inglês antes da detecção, garantindo consistência
  // entre frontend e backend.
  private extractEntities(requirements: ProjectRequirements): string[] {
    const raw = (requirements.description + ' ' + requirements.features.join(' ')).toLowerCase();
    const normalizedRaw = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const hasProductDomain = /\b(produtos|products|catalogo|catalog|estoque|inventory|sku|checkout|carrinho|cart|e-?commerce|loja|store)\b/.test(normalizedRaw)
      || /\b(gerir|gerenciar|gestao|cadastro|vender|manage)\s+(?:de\s+)?(?:o\s+)?produto\b/.test(normalizedRaw);
    const hasClinicDomain = /\b(clinicas|clinics|hospitais|hospitals)\b/.test(normalizedRaw)
      || /\b(gerir|gerenciar|gestao|cadastro|manage)\s+(?:de\s+)?clinica\b/.test(normalizedRaw);

    // Portuguese → English normalization map
    const ptToEn: Record<string, string> = {
      // Saúde / Medicamentos
      'remedio': 'medication', 'remédio': 'medication', 'medicamento': 'medication',
      'medicamentos': 'medication', 'remedios': 'medication', 'remédios': 'medication',
      'dose': 'dose', 'doses': 'dose', 'comprimido': 'medication', 'comprimidos': 'medication',
      'receita': 'prescription', 'receitas': 'prescription', 'prescricao': 'prescription',
      'paciente': 'patient', 'pacientes': 'patient',
      // Tempo / Agendamento
      'horario': 'schedule', 'horário': 'schedule', 'horarios': 'schedule', 'horários': 'schedule',
      'agendamento': 'schedule', 'agenda': 'schedule', 'alarme': 'schedule', 'alarmes': 'schedule',
      'lembrete': 'reminder', 'lembretes': 'reminder',
      'consulta': 'appointment', 'consultas': 'appointment',
      // Entidades comuns
      'tarefa': 'task', 'tarefas': 'task',
      'usuario': 'user', 'usuário': 'user', 'usuarios': 'user', 'usuários': 'user',
      'projeto': 'project', 'projetos': 'project',
      'produto': 'product', 'produtos': 'product',
      'pedido': 'order', 'pedidos': 'order',
      'cliente': 'customer', 'clientes': 'customer',
      'postagem': 'post', 'postagens': 'post',
      'comentario': 'comment', 'comentário': 'comment',
      'categoria': 'category', 'categorias': 'category',
      'pagamento': 'payment', 'pagamentos': 'payment',
      'carrinho': 'cart',
      'estoque': 'inventory', 'inventario': 'inventory', 'inventário': 'inventory',
      'nota': 'note', 'notas': 'note',
      'relatorio': 'report', 'relatório': 'report',
      'funcionario': 'employee', 'funcionário': 'employee',
      'empresa': 'company', 'empresas': 'company',
      'contato': 'contact', 'contatos': 'contact',
      'venda': 'sale', 'vendas': 'sale',
      'medico': 'doctor', 'médico': 'doctor', 'medicos': 'doctor',
      'hospital': 'hospital', 'clinica': 'clinic', 'clínica': 'clinic',
    };

    // Apply normalization
    let text = raw;
    for (const [pt, en] of Object.entries(ptToEn)) {
      text = text.replace(new RegExp(`\\b${pt}\\b`, 'g'), en);
    }

    const commonEntities = [
      'task', 'user', 'project', 'item', 'product', 'order',
      'customer', 'post', 'comment', 'category', 'payment',
      'cart', 'inventory', 'note', 'todo',
      // Health domain
      'medication', 'schedule', 'dose', 'prescription', 'patient',
      'reminder', 'appointment', 'doctor', 'hospital', 'clinic',
      // Business domain
      'sale', 'report', 'employee', 'company', 'contact',
    ];

    const found = commonEntities.filter(entity => {
      if (entity === 'product' && !hasProductDomain) return false;
      if ((entity === 'clinic' || entity === 'hospital') && !hasClinicDomain) return false;
      return new RegExp(`\\b${entity}s?\\b`).test(text);
    });
    console.log(`[UIGenerator] Entities detected: ${found.join(', ') || 'none → item'}`);
    return found.length > 0 ? found : ['item'];
  }

  /**
   * Check if authentication is required
   */
  // ✅ FIX B: Added Portuguese auth keywords
  private checkAuthRequired(requirements: ProjectRequirements): boolean {
    const text = (requirements.description + ' ' + requirements.features.join(' ')).toLowerCase();
    return text.includes('auth') || text.includes('login') || text.includes('user') ||
      text.includes('autenticacao') || text.includes('autenticação') ||
      text.includes('usuario') || text.includes('usuário') ||
      text.includes('senha') || text.includes('cadastro') || text.includes('registro');
  }

  /**
   * Generate App.tsx
   */
  private generateApp(entities: string[], hasAuth: boolean, productBlueprint?: ProductBlueprint): GeneratedUIFile {
    const blueprintScreens = productBlueprint?.screens.filter(screen => screen.route !== '/' && !screen.route.includes(':')) || [];
    const routeImports = entities.map(e => {
      const Entity = this.capitalize(e);
      const blueprintScreen = blueprintScreens.find(screen => screen.route === `/${toResourcePath(e)}`);
      return [
        blueprintScreen ? '' : `import ${Entity}ListPage from './pages/${Entity}ListPage';`,
        `import ${Entity}DetailPage from './pages/${Entity}DetailPage';`,
        `import ${Entity}CreatePage from './pages/${Entity}CreatePage';`,
        `import ${Entity}EditPage from './pages/${Entity}EditPage';`,
      ].filter(Boolean).join('\n');
    }).join('\n');
    const blueprintImports = blueprintScreens
      .map(screen => `import ${this.blueprintPageName(screen)} from './pages/${this.blueprintPageName(screen)}';`)
      .join('\n');

    const routes = entities.map(e => {
      const Entity = this.capitalize(e);
      const resourcePath = toResourcePath(e);
      const blueprintScreen = blueprintScreens.find(screen => screen.route === `/${resourcePath}`);
      const listComponent = blueprintScreen ? this.blueprintPageName(blueprintScreen) : `${Entity}ListPage`;
      const view = (component: string) => hasAuth
        ? `<ProtectedRoute><Layout><${component} /></Layout></ProtectedRoute>`
        : `<Layout><${component} /></Layout>`;
      return [
        `        <Route path="/${resourcePath}" element={${view(listComponent)}} />`,
        `        <Route path="/${resourcePath}/new" element={${view(`${Entity}CreatePage`)}} />`,
        `        <Route path="/${resourcePath}/:id/edit" element={${view(`${Entity}EditPage`)}} />`,
        `        <Route path="/${resourcePath}/:id" element={${view(`${Entity}DetailPage`)}} />`,
      ].join('\n');
    }).join('\n');

    const entityListRoutes = new Set(entities.map(entity => `/${toResourcePath(entity)}`));
    const aliasRoutes = blueprintScreens
      .filter(screen => !screen.route.includes(':') && !entityListRoutes.has(screen.route))
      .map(screen => {
        const component = this.blueprintPageName(screen);
        const view = hasAuth
          ? `<ProtectedRoute><Layout><${component} /></Layout></ProtectedRoute>`
          : `<Layout><${component} /></Layout>`;
        return `        <Route path="${screen.route}" element={${view}} />`;
      })
      .filter(Boolean)
      .join('\n') || '';

    const content = `
${hasAuth ? "import type { ReactNode } from 'react';" : ''}
import { BrowserRouter as Router, Routes, Route${hasAuth ? ', Navigate' : ''} } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
${hasAuth ? "import LoginPage from './pages/LoginPage';\nimport RegisterPage from './pages/RegisterPage';\nimport { AuthProvider, useAuth } from './contexts/AuthContext';" : ''}
${routeImports}
${blueprintImports}

${hasAuth ? "const previewMode = import.meta.env.VITE_ORUS_PREVIEW_MODE === 'true';\n" : ''}
${hasAuth ? `function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-[rgb(var(--orus-page))] text-[rgb(var(--orus-muted))]">Carregando...</div>;
  return previewMode || isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}` : ''}

function App() {
  return (
    <Router>
      ${hasAuth ? '<AuthProvider>' : ''}
        <Routes>
          <Route path="/" element={${hasAuth ? '<ProtectedRoute><Layout><HomePage /></Layout></ProtectedRoute>' : '<Layout><HomePage /></Layout>'}} />
${hasAuth ? "          <Route path=\"/login\" element={previewMode ? <Navigate to=\"/\" replace /> : <LoginPage />} />\n          <Route path=\"/register\" element={previewMode ? <Navigate to=\"/\" replace /> : <RegisterPage />} />" : ''}
${routes}
${aliasRoutes}
        </Routes>
      ${hasAuth ? '</AuthProvider>' : ''}
    </Router>
  );
}

export default App;
    `.trim();

    return {
      path: 'frontend/src',
      name: 'App.tsx',
      content: content,
      type: 'tsx'
    };
  }

  /**
   * Generate index.tsx
   */
  private generateIndex(): GeneratedUIFile {
    const content = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import './design-system/theme.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
    `.trim();

    return {
      path: 'frontend/src',
      name: 'index.tsx',
      content: content,
      type: 'tsx'
    };
  }

  /**
   * Materializes the visual contract inside every generated project.
   * The JSON file is the agent-readable source of truth; the CSS file is the
   * runtime representation consumed by the generated interface.
   */
  private generateDesignSystemFiles(
    visualIntent: VisualIntent,
    componentPlan: string[]
  ): GeneratedUIFile[] {
    const selectedComponents = UI_COMPONENT_CATALOG.filter(component =>
      componentPlan.includes(component.id)
    ).map(component => ({
      ...component,
      selectedVariant: component.id === visualIntent.experience.primaryDataView
        ? component.variants[0]
        : component.id === 'app-shell'
          ? visualIntent.navigation
          : component.id === 'card'
            ? ({ quiet: 'standard', outlined: 'interactive', elevated: 'metric', layered: 'media' } as const)[visualIntent.experience.componentShape]
            : component.variants[0],
    }));
    const manifest = {
      schemaVersion: '2.0.0',
      generator: 'orus-ui-generator',
      planningOrder: ['brand-identity', 'product-experience', 'components', 'screens'],
      visualIntent,
      components: selectedComponents,
      constraints: {
        accessibility: 'WCAG 2.2 AA',
        responsive: 'mobile-first',
        requiredStates: ['loading', 'empty', 'error', 'disabled', 'focus'],
        rawColorsAllowed: false,
      },
    };
    const palette = visualIntent.palette;
    const primaryText = visualIntent.style === 'luxury' || visualIntent.style === 'glass'
      ? '10 10 10'
      : '255 255 255';
    const pageChannels = palette.cssPage.split(/\s+/).map(Number).filter(Number.isFinite);
    const resolvedColorScheme = pageChannels.length > 0
      && pageChannels.reduce((sum, channel) => sum + channel, 0) / pageChannels.length >= 128
      ? 'light'
      : 'dark';

    return [
      {
        path: '.orus',
        name: 'brand-identity.json',
        type: 'json',
        content: JSON.stringify({
          schemaVersion: '1.0.0',
          brandName: visualIntent.brandName,
          style: visualIntent.style,
          archetype: visualIntent.archetype,
          identity: visualIntent.identity,
          typography: visualIntent.typography,
          palette,
        }, null, 2),
      },
      {
        path: '.orus',
        name: 'experience-plan.json',
        type: 'json',
        content: JSON.stringify({
          schemaVersion: '1.0.0',
          brandName: visualIntent.brandName,
          experience: visualIntent.experience,
          composition: visualIntent.composition,
          navigation: visualIntent.navigation,
          density: visualIntent.density,
          motion: visualIntent.motion,
          componentPlan,
        }, null, 2),
      },
      {
        path: '.orus',
        name: 'design-system.json',
        type: 'json',
        content: JSON.stringify(manifest, null, 2),
      },
      {
        path: 'frontend/src/design-system',
        name: 'theme.css',
        type: 'css',
        content: `/* Generated from .orus/design-system.json. Do not hard-code colors in components. */
:root {
  color-scheme: ${resolvedColorScheme};
  --orus-primary: ${palette.cssPrimary};
  --orus-primary-hover: ${palette.cssPrimaryHover};
  --orus-primary-soft: ${palette.cssPrimarySoft};
  --orus-on-primary: ${primaryText};
  --orus-accent: ${palette.cssAccent};
  --orus-page: ${palette.cssPage};
  --orus-panel: ${palette.cssSurface};
  --orus-panel-muted: ${palette.cssSurfaceMuted};
  --orus-text: ${palette.cssText};
  --orus-text-muted: ${palette.cssTextMuted};
  --orus-border: ${palette.cssBorder};
  --orus-radius: ${visualIntent.radius === 'sharp' ? '0.375rem' : visualIntent.radius === 'soft' ? '0.75rem' : '1rem'};
  --orus-density: ${visualIntent.density === 'compact' ? '0.75' : visualIntent.density === 'spacious' ? '1.2' : '1'};
}

body {
  background: rgb(var(--orus-page));
  color: rgb(var(--orus-text));
}

::selection {
  background: rgb(var(--orus-primary) / 0.3);
}

:focus-visible {
  outline: 3px solid rgb(var(--orus-accent) / 0.55);
  outline-offset: 3px;
}
`.trim(),
      },
    ];
  }

  private generateVisualAssetFiles(visualIntent: VisualIntent): GeneratedUIFile[] {
    const palette = visualIntent.palette;
    const brandMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="title"><title>Generated brand mark</title><rect width="64" height="64" rx="18" fill="rgb(${palette.cssPrimary})"/><path d="M17 34c7-18 23-18 30 0-7 18-23 18-30 0Z" fill="rgb(${palette.cssAccent})"/><circle cx="32" cy="32" r="7" fill="rgb(${palette.cssSurface})"/></svg>`;
    const visualCard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-labelledby="title description"><title>Generated visual</title><desc>Abstract brand composition</desc><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="rgb(${palette.cssPrimary})"/><stop offset="1" stop-color="rgb(${palette.cssAccent})"/></linearGradient></defs><rect width="800" height="600" fill="rgb(${palette.cssPage})"/><rect x="64" y="64" width="672" height="472" rx="48" fill="url(#g)"/><circle cx="610" cy="180" r="126" fill="rgb(${palette.cssSurface})" fill-opacity=".22"/><path d="M120 430C260 250 410 520 680 220" fill="none" stroke="rgb(${palette.cssSurface})" stroke-width="24" stroke-linecap="round" stroke-opacity=".72"/></svg>`;
    const manifest = {
      schemaVersion: '1.0.0',
      policy: 'offline-first',
      externalAssetsAllowed: false,
      assets: [
        {
          id: 'brand-mark',
          path: 'frontend/public/brand-mark.svg',
          purpose: 'favicon-and-brand-signature',
          source: 'generated-by-orus',
          license: 'project-license',
          format: 'svg',
          fallback: 'text-brand-name',
        },
        {
          id: 'visual-card',
          path: 'frontend/public/visual-card.svg',
          purpose: 'local-content-visual',
          source: 'generated-by-orus',
          license: 'project-license',
          format: 'svg',
          fallback: 'semantic-gradient',
        },
      ],
    };
    return [
      { path: '.orus', name: 'visual-assets.json', type: 'json', content: JSON.stringify(manifest, null, 2) },
      { path: 'frontend/public', name: 'brand-mark.svg', type: 'svg', content: brandMark },
      { path: 'frontend/public', name: 'visual-card.svg', type: 'svg', content: visualCard },
    ];
  }

  /**
   * Converts legacy palette classes in proven templates to semantic tokens.
   * Structure remains deterministic while the prompt controls the visual
   * language through theme.css.
   */
  private applyVisualTokens(files: GeneratedUIFile[]): GeneratedUIFile[] {
    const replacements: Array<[string, string]> = [
      ['bg-indigo-600 hover:bg-indigo-700 text-white', 'bg-[rgb(var(--orus-primary))] hover:bg-[rgb(var(--orus-primary-hover))] text-[rgb(var(--orus-on-primary))]'],
      ['bg-indigo-600', 'bg-[rgb(var(--orus-primary))]'],
      ['bg-indigo-500', 'bg-[rgb(var(--orus-primary))]'],
      ['hover:bg-indigo-700', 'hover:bg-[rgb(var(--orus-primary-hover))]'],
      ['hover:bg-indigo-600', 'hover:bg-[rgb(var(--orus-primary-hover))]'],
      ['bg-indigo-50', 'bg-[rgb(var(--orus-primary-soft))]'],
      ['bg-indigo-100', 'bg-[rgb(var(--orus-primary-soft))]'],
      ['bg-indigo-200', 'bg-[rgb(var(--orus-primary-soft))]'],
      ['text-indigo-800', 'text-[rgb(var(--orus-accent))]'],
      ['text-indigo-700', 'text-[rgb(var(--orus-accent))]'],
      ['text-indigo-600', 'text-[rgb(var(--orus-accent))]'],
      ['border-indigo-300', 'border-[rgb(var(--orus-primary))]'],
      ['focus:ring-indigo-500', 'focus:ring-[rgb(var(--orus-primary))]'],
      ['bg-white', 'bg-[rgb(var(--orus-panel))]'],
      ['bg-gray-50', 'bg-[rgb(var(--orus-panel-muted))]'],
      ['bg-gray-100', 'bg-[rgb(var(--orus-panel-muted))]'],
      ['bg-gray-200', 'bg-[rgb(var(--orus-border))]'],
      ['text-gray-900', 'text-[rgb(var(--orus-text))]'],
      ['text-gray-800', 'text-[rgb(var(--orus-text))]'],
      ['text-gray-700', 'text-[rgb(var(--orus-text))]'],
      ['text-gray-600', 'text-[rgb(var(--orus-text-muted))]'],
      ['text-gray-500', 'text-[rgb(var(--orus-text-muted))]'],
      ['text-gray-400', 'text-[rgb(var(--orus-text-muted))]'],
      ['border-gray-300', 'border-[rgb(var(--orus-border))]'],
      ['border-gray-200', 'border-[rgb(var(--orus-border))]'],
      ['border-gray-100', 'border-[rgb(var(--orus-border))]'],
      ['border-gray-50', 'border-[rgb(var(--orus-border))]'],
      ['divide-gray-100', 'divide-[rgb(var(--orus-border))]'],
      ['hover:bg-gray-50', 'hover:bg-[rgb(var(--orus-panel-muted))]'],
      ['hover:bg-gray-100', 'hover:bg-[rgb(var(--orus-panel-muted))]'],
      ['hover:text-gray-900', 'hover:text-[rgb(var(--orus-text))]'],
      ['hover:text-gray-700', 'hover:text-[rgb(var(--orus-text))]'],
    ];

    return files.map(file => {
      if (file.type !== 'tsx' && file.type !== 'typescript') return file;
      let content = file.content;
      for (const [legacyToken, semanticToken] of replacements) {
        const escaped = legacyToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        content = content.replace(
          new RegExp(`(^|[^A-Za-z0-9_/-])${escaped}(?![A-Za-z0-9_/-])`, 'g'),
          `$1${semanticToken}`
        );
      }
      return { ...file, content };
    });
  }

  /**
   * Generate index.css with Tailwind
   */
  // ✅ FIX Q: Richer base CSS with smooth scroll, font stack, scrollbar style
  private generateMainCSS(visualIntent?: VisualIntent): GeneratedUIFile {
    const intent = visualIntent || analyzeVisualIntent('');
    const content = `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: ${intent.palette.cssPrimary};
    --color-surface: ${intent.palette.cssPage};
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    font-family: '${intent.typography.body}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: rgb(var(--orus-page));
    color: rgb(var(--orus-text));
  }

  h1, h2, h3 {
    font-family: '${intent.typography.display}', '${intent.typography.body}', sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgb(var(--orus-border)); border-radius: 999px; }
  ::-webkit-scrollbar-thumb:hover { background: rgb(var(--orus-text-muted)); }
}

@layer utilities {
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
    `.trim();

    return {
      path: 'frontend/src',
      name: 'index.css',
      content: content,
      type: 'css'
    };
  }

  private generateExperienceHomePage(entities: string[], visualIntent: VisualIntent): GeneratedUIFile {
    const mainEntity = visualIntent.archetype === 'crm' && entities.includes('deal')
      ? 'deal'
      : visualIntent.archetype === 'healthcare' && entities.includes('appointment')
        ? 'appointment'
        : entities[0] || 'item';
    const Entity = this.capitalize(mainEntity);
    const mainResourcePath = toResourcePath(mainEntity);
    const isPt = visualIntent.locale === 'pt-BR';
    const entityLabel = this.entityLabel(mainEntity, visualIntent.locale);
    const entityPlural = this.entityLabel(mainEntity, visualIntent.locale, true);
    const pattern = visualIntent.experience.pattern;
    const copy = isPt ? {
      eyebrow: visualIntent.identity.promise,
      title: pattern === 'wealth-overview' ? 'Visão financeira'
        : pattern === 'revenue-pipeline' ? 'Radar comercial'
        : pattern === 'care-hub' ? 'Central de cuidado'
        : pattern === 'commerce-pulse' ? 'Pulso do negócio'
        : pattern === 'creative-studio' ? 'Studio em movimento'
        : pattern === 'talent-hub' ? 'Central de talentos'
        : pattern === 'learning-campus' ? 'Campus de aprendizagem'
        : pattern === 'logistics-control' ? 'Controle de operações'
        : pattern === 'event-stage' ? 'Palco do evento'
        : pattern === 'hospitality-service' ? 'Ritmo do serviço'
        : pattern === 'command-center' ? 'Central de operação'
        : pattern === 'product-workspace' ? 'Workspace da equipe'
        : 'Visão geral',
      subtitle: pattern === 'wealth-overview' ? 'Patrimônio, movimentações e sinais importantes em uma única leitura.'
        : pattern === 'revenue-pipeline' ? 'Receita, etapas do funil e próximas ações em uma leitura comercial decisiva.'
        : pattern === 'care-hub' ? 'Prioridades, agenda e continuidade do atendimento sem perder contexto.'
        : pattern === 'commerce-pulse' ? 'Conversão, pedidos e catálogo conectados ao que exige ação agora.'
        : pattern === 'creative-studio' ? 'Projetos, entregas e referências organizados como um portfólio vivo.'
        : pattern === 'talent-hub' ? 'Vagas, candidatos e entrevistas conectados à próxima decisão de contratação.'
        : pattern === 'learning-campus' ? 'Conteúdo, progresso e avaliações reunidos em uma jornada clara de aprendizagem.'
        : pattern === 'logistics-control' ? 'Rotas, remessas e exceções acompanhadas do despacho até a entrega.'
        : pattern === 'event-stage' ? 'Programação, ingressos e presença sincronizados em torno da experiência ao vivo.'
        : pattern === 'hospitality-service' ? 'Reservas, salão e cozinha no mesmo compasso de atendimento.'
        : pattern === 'command-center' ? 'Acompanhe gargalos, responsáveis e progresso em tempo real.'
        : pattern === 'product-workspace' ? 'Foco, progresso e colaboração reunidos em um espaço acionável.'
        : 'Tudo que importa para avançar, com contexto e clareza.',
      action: `Novo ${entityLabel}`,
      total: 'Total', active: 'Em andamento', pending: 'Exigem atenção', recent: 'Nesta semana',
      recentTitle: 'Atividade recente', viewAll: 'Ver todos', empty: 'Ainda não há registros.', first: 'Criar o primeiro',
    } : {
      eyebrow: visualIntent.identity.promise,
      title: pattern === 'wealth-overview' ? 'Financial overview'
        : pattern === 'revenue-pipeline' ? 'Revenue radar'
        : pattern === 'care-hub' ? 'Care center'
        : pattern === 'commerce-pulse' ? 'Business pulse'
        : pattern === 'creative-studio' ? 'Studio in motion'
        : pattern === 'talent-hub' ? 'Talent hub'
        : pattern === 'learning-campus' ? 'Learning campus'
        : pattern === 'logistics-control' ? 'Operations control'
        : pattern === 'event-stage' ? 'Event stage'
        : pattern === 'hospitality-service' ? 'Service rhythm'
        : pattern === 'command-center' ? 'Operations center'
        : pattern === 'product-workspace' ? 'Team workspace'
        : 'Overview',
      subtitle: pattern === 'wealth-overview' ? 'Wealth, transactions and important signals in one clear view.'
        : pattern === 'revenue-pipeline' ? 'Revenue, pipeline stages and next actions in one decisive commercial view.'
        : pattern === 'care-hub' ? 'Priorities, schedule and continuity of care without losing context.'
        : pattern === 'commerce-pulse' ? 'Conversion, orders and catalog connected to what needs action now.'
        : pattern === 'creative-studio' ? 'Projects, deliveries and references organized as a living portfolio.'
        : pattern === 'talent-hub' ? 'Open roles, candidates and interviews connected to the next hiring decision.'
        : pattern === 'learning-campus' ? 'Content, progress and assessments gathered into a clear learning journey.'
        : pattern === 'logistics-control' ? 'Routes, shipments and exceptions tracked from dispatch to delivery.'
        : pattern === 'event-stage' ? 'Schedule, tickets and attendance synchronized around the live experience.'
        : pattern === 'hospitality-service' ? 'Reservations, dining room and kitchen moving in one service rhythm.'
        : pattern === 'command-center' ? 'Track bottlenecks, owners and progress in real time.'
        : pattern === 'product-workspace' ? 'Focus, progress and collaboration in one actionable space.'
        : 'Everything that matters to move forward, with context and clarity.',
      action: `New ${entityLabel}`,
      total: 'Total', active: 'In progress', pending: 'Needs attention', recent: 'This week',
      recentTitle: 'Recent activity', viewAll: 'View all', empty: 'No records yet.', first: 'Create the first',
    };
    const spotlight = this.generateExperienceSpotlight(pattern, mainEntity, entityPlural, isPt);
    const actionLink = (classes: string) => `<Link to="/${mainResourcePath}/new" className="${classes}"><span aria-hidden="true">＋</span>${copy.action}</Link>`;
    const primaryActionClasses = 'inline-flex items-center justify-center gap-2 rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] px-5 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[rgb(var(--orus-primary-hover))]';
    const titleBlock = `<div className="max-w-3xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[rgb(var(--orus-accent))]">${copy.eyebrow}</p><h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--orus-text))] sm:text-4xl">${copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">${copy.subtitle}</p></div>`;
    const header = visualIntent.composition.actionPlacement === 'inline'
      ? `<header className="grid gap-7 border-b border-[rgb(var(--orus-border))] pb-8 lg:grid-cols-[1fr_.45fr] lg:items-end">${titleBlock}<div className="flex flex-col items-start gap-4 lg:items-end"><p className="max-w-xs text-sm leading-6 text-[rgb(var(--orus-text-muted))] lg:text-right">${visualIntent.identity.visualMetaphor}</p>${actionLink(primaryActionClasses)}</div></header>`
      : visualIntent.composition.actionPlacement === 'command-bar'
        ? `<header>${titleBlock}</header><section className="flex flex-col gap-3 rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3 px-2"><span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--orus-accent))]"/><span className="text-xs font-semibold uppercase tracking-[.16em] text-[rgb(var(--orus-text-muted))]">${visualIntent.experience.screenPriorities[0]}</span></div>${actionLink(primaryActionClasses)}</section>`
        : visualIntent.composition.actionPlacement === 'header'
          ? `<header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">${titleBlock}${actionLink(primaryActionClasses)}</header>`
          : `<header>${titleBlock}</header>`;
    const floatingAction = visualIntent.composition.actionPlacement === 'floating'
      ? actionLink(`${primaryActionClasses} fixed bottom-6 right-6 z-40 rounded-full px-6 shadow-2xl`)
      : '';
    const content = `
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

interface RecentItem { id: string; name: string; status?: string; stage?: string; value?: number; scheduledAt?: string; professional?: string; createdAt?: string; }

export default function HomePage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/${mainResourcePath}')
      .then((response) => setItems(Array.isArray(response.data) ? response.data : (response.data?.data || [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: items.length,
    active: items.filter((item) => item.status === 'active').length,
    pending: items.filter((item) => item.status === 'pending').length,
    recent: items.slice(-7).length,
  };
  const recentItems = items.slice(0, 6);

  if (loading) {
    return <div className="grid min-h-[45vh] place-items-center"><div className="h-11 w-11 animate-spin rounded-full border-2 border-[rgb(var(--orus-primary))] border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-7 lg:space-y-9" data-shell="${visualIntent.composition.shell}" data-action-placement="${visualIntent.composition.actionPlacement}" data-experience-pattern="${visualIntent.experience.pattern}" data-primary-view="${visualIntent.experience.primaryDataView}">
      ${header}

      ${spotlight}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['${copy.total}', stats.total], ['${copy.active}', stats.active],
          ['${copy.pending}', stats.pending], ['${copy.recent}', stats.recent],
        ].map(([label, value], index) => (
          <article key={String(label)} className="group rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5 transition hover:-translate-y-0.5 hover:border-[rgb(var(--orus-primary))]">
            <div className="mb-7 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">{label}</span><span className="h-2 w-2 rounded-full bg-[rgb(var(--orus-primary))] opacity-40 group-hover:opacity-100" /></div>
            <p className="font-display text-3xl font-bold text-[rgb(var(--orus-text))]">{value}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[rgb(var(--orus-panel-muted))]"><div className="h-full rounded-full bg-[rgb(var(--orus-primary))]" style={{ width: (30 + index * 17) + '%' }} /></div>
          </article>
        ))}
      </section>

      <section className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">${entityPlural}</p><h2 className="mt-1 text-xl font-bold text-[rgb(var(--orus-text))]">${copy.recentTitle}</h2></div>
          <Link to="/${mainResourcePath}" className="text-sm font-semibold text-[rgb(var(--orus-accent))]">${copy.viewAll} →</Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] px-6 py-12 text-center">
            <p className="text-sm text-[rgb(var(--orus-text-muted))]">${copy.empty}</p>
            <Link to="/${mainResourcePath}/new" className="mt-3 inline-block text-sm font-semibold text-[rgb(var(--orus-accent))]">${copy.first} →</Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentItems.map((item, index) => (
              <Link key={item.id} to={'/${mainResourcePath}/' + item.id} className="group rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] p-4 transition hover:border-[rgb(var(--orus-primary))]">
                <div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-[calc(var(--orus-radius)*.75)] bg-[rgb(var(--orus-primary-soft))] font-bold text-[rgb(var(--orus-accent))]">{(item.name || '${entityLabel}')[0].toUpperCase()}</span><span className="text-xs text-[rgb(var(--orus-text-muted))]">0{index + 1}</span></div>
                <p className="mt-5 font-semibold text-[rgb(var(--orus-text))] group-hover:text-[rgb(var(--orus-accent))]">{item.name}</p>
                <p className="mt-1 text-xs capitalize text-[rgb(var(--orus-text-muted))]">{item.status || '${isPt ? 'pronto para começar' : 'ready to start'}'}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
      ${floatingAction}
    </div>
  );
}
    `.trim();
    return { path: 'frontend/src/pages', name: 'HomePage.tsx', content, type: 'tsx' };
  }

  private generateExperienceSpotlight(
    pattern: VisualIntent['experience']['pattern'],
    entity: string,
    Entity: string,
    isPt: boolean
  ): string {
    const resourcePath = toResourcePath(entity);
    if (pattern === 'wealth-overview') {
      return `<section className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.35)] bg-gradient-to-br from-slate-950 via-slate-900 to-[rgb(var(--orus-primary))] p-6 text-white shadow-2xl sm:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[rgb(var(--orus-accent))] opacity-20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-white/60">${isPt ? 'Posição consolidada' : 'Consolidated position'}</p><p className="mt-4 font-display text-5xl font-semibold tracking-tight">{stats.total.toLocaleString()}</p><p className="mt-2 text-sm text-white/65">${isPt ? `${Entity}s monitorados em tempo real` : `${Entity}s monitored in real time`}</p></div><div><svg viewBox="0 0 520 150" className="h-36 w-full" aria-label="${isPt ? 'Tendência financeira' : 'Financial trend'}"><defs><linearGradient id="trend" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white" stopOpacity=".32"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient></defs><path d="M0 130 C70 125 78 74 146 92 S245 118 303 60 S418 84 520 18 V150 H0Z" fill="url(#trend)"/><path d="M0 130 C70 125 78 74 146 92 S245 118 303 60 S418 84 520 18" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/></svg><div className="flex justify-between text-[11px] uppercase tracking-wider text-white/45"><span>Jan</span><span>Mar</span><span>Mai</span><span>${isPt ? 'Hoje' : 'Today'}</span></div></div></div>
      </section>`;
    }
    if (pattern === 'revenue-pipeline') {
      return `<section className="space-y-4"><div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><article className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.25)] bg-gradient-to-br from-slate-950 via-emerald-950 to-[rgb(var(--orus-primary))] p-7 text-white"><div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5"/><p className="text-xs font-bold uppercase tracking-[.22em] text-amber-300">${isPt ? 'Previsão de receita' : 'Revenue forecast'}</p><p className="mt-5 font-display text-4xl font-bold">{new Intl.NumberFormat('${isPt ? 'pt-BR' : 'en-US'}', { style: 'currency', currency: '${isPt ? 'BRL' : 'USD'}', maximumFractionDigits: 0 }).format(items.reduce((sum, item) => sum + Number(item.value || 0), 0))}</p><p className="mt-2 text-sm text-white/65">${isPt ? 'valor distribuído pelo pipeline ativo' : 'value distributed across the active pipeline'}</p></article><article className="rounded-[calc(var(--orus-radius)*1.25)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">${isPt ? 'Sinal comercial' : 'Commercial signal'}</p><p className="mt-5 font-display text-4xl font-bold text-[rgb(var(--orus-primary))]">{items.filter(item => item.stage === 'won').length}</p><p className="mt-1 text-sm text-[rgb(var(--orus-text-muted))]">${isPt ? 'oportunidades ganhas' : 'won opportunities'}</p><div className="mt-7 h-2 rounded-full bg-[rgb(var(--orus-panel-muted))]"><div className="h-full w-2/3 rounded-full bg-[rgb(var(--orus-accent))]"/></div></article></div><div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{[['${isPt ? 'Entrada' : 'Lead'}','lead'],['${isPt ? 'Qualificação' : 'Qualification'}','qualification'],['${isPt ? 'Proposta' : 'Proposal'}','proposal'],['${isPt ? 'Negociação' : 'Negotiation'}','negotiation'],['${isPt ? 'Ganhos' : 'Won'}','won'],['${isPt ? 'Perdidos' : 'Lost'}','lost']].map(([label, stage]) => <Link key={stage} to="/${resourcePath}" className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-4 transition hover:-translate-y-0.5 hover:border-[rgb(var(--orus-primary))]"><div className="mb-5 flex items-center justify-between"><span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--orus-primary))]"/><span className="text-xs font-bold text-[rgb(var(--orus-text-muted))]">{items.filter(item => item.stage === stage).length}</span></div><p className="text-xs font-semibold uppercase tracking-wider">{label}</p></Link>)}</div></section>`;
    }
    if (pattern === 'care-hub') {
      return `<section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]"><div className="rounded-[calc(var(--orus-radius)*1.2)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-accent))]">${isPt ? 'Agenda de hoje' : "Today's schedule"}</p><h2 className="mt-1 text-2xl font-bold">${isPt ? 'Próximos atendimentos' : 'Upcoming care'}</h2></div><span className="rounded-full bg-[rgb(var(--orus-primary-soft))] px-3 py-1 text-xs font-semibold text-[rgb(var(--orus-accent))]">{recentItems.length} ${isPt ? 'na agenda' : 'scheduled'}</span></div><div className="space-y-2">{(recentItems.length ? recentItems.slice(0, 3) : [{ id: 'sample', name: '${isPt ? 'Agenda disponível' : 'Schedule available'}', status: '${isPt ? 'aguardando' : 'waiting'}' }]).map((item, index) => <div key={item.id} className="grid grid-cols-[52px_1fr_auto] items-center gap-4 rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-3"><span className="text-sm font-bold text-[rgb(var(--orus-accent))]">{String(9 + index).padStart(2, '0')}:00</span><div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-[rgb(var(--orus-text-muted))]">{item.status || '${isPt ? 'confirmado' : 'confirmed'}'}</p></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>)}</div></div><div className="rounded-[calc(var(--orus-radius)*1.2)] bg-[rgb(var(--orus-primary))] p-6 text-[rgb(var(--orus-on-primary))]"><p className="text-xs font-bold uppercase tracking-wider opacity-95">${isPt ? 'Continuidade' : 'Continuity'}</p><p className="mt-5 font-display text-4xl font-bold">{stats.active}</p><p className="mt-2 text-sm opacity-95">${isPt ? 'acompanhamentos ativos' : 'active follow-ups'}</p><div className="mt-10 space-y-3 text-sm"><div className="flex justify-between"><span className="opacity-95">${isPt ? 'Em dia' : 'On track'}</span><strong>{Math.max(stats.total - stats.pending, 0)}</strong></div><div className="h-2 rounded-full bg-black/15"><div className="h-full w-3/4 rounded-full bg-white/80" /></div></div></div></section>`;
    }
    if (pattern === 'commerce-pulse') {
      return `<section className="grid overflow-hidden rounded-[calc(var(--orus-radius)*1.2)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] lg:grid-cols-[1.15fr_.85fr]"><div className="relative min-h-64 bg-gradient-to-br from-[rgb(var(--orus-primary))] to-[rgb(var(--orus-accent))] p-7 text-white"><div className="absolute right-5 top-5 h-28 w-28 rounded-full border border-white/20"/><p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">${isPt ? 'Conversão em movimento' : 'Conversion in motion'}</p><p className="mt-5 max-w-md font-display text-4xl font-bold leading-tight">${isPt ? 'Da descoberta à compra, sem perder o ritmo.' : 'From discovery to purchase, without losing momentum.'}</p><Link to="/${resourcePath}" className="mt-8 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[rgb(var(--orus-primary))]">${isPt ? 'Explorar catálogo' : 'Explore catalog'} →</Link></div><div className="p-7"><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">${isPt ? 'Fluxo de pedidos' : 'Order flow'}</p><div className="mt-6 space-y-5">{[['${isPt ? 'Recebidos' : 'Received'}', stats.total, 'w-full'], ['${isPt ? 'Em separação' : 'Packing'}', stats.active, 'w-2/3'], ['${isPt ? 'Pendências' : 'Pending'}', stats.pending, 'w-1/3']].map(([label, value, width]) => <div key={String(label)}><div className="mb-2 flex justify-between text-sm"><span>{label}</span><strong>{value}</strong></div><div className="h-2 rounded-full bg-[rgb(var(--orus-panel-muted))]"><div className={'h-full rounded-full bg-[rgb(var(--orus-primary))] ' + width} /></div></div>)}</div></div></section>`;
    }
    if (pattern === 'creative-studio') {
      return `<section className="grid auto-rows-[160px] gap-4 md:grid-cols-3"><article className="relative row-span-2 overflow-hidden rounded-[calc(var(--orus-radius)*1.3)] bg-gradient-to-br from-[rgb(var(--orus-primary))] to-[rgb(var(--orus-accent))] p-7 text-white md:col-span-2"><div className="absolute -bottom-20 -right-16 h-72 w-72 rotate-12 rounded-[32%] border-[32px] border-white/10"/><p className="text-xs font-bold uppercase tracking-[.22em] text-white/65">${isPt ? 'Trabalho em destaque' : 'Featured work'}</p><h2 className="mt-5 max-w-lg font-display text-4xl font-bold leading-tight">${isPt ? 'Ideias ganham forma quando visão e execução compartilham o mesmo espaço.' : 'Ideas take shape when vision and execution share the same space.'}</h2><p className="absolute bottom-7 left-7 text-sm text-white/70">{stats.active} ${isPt ? 'projetos ativos' : 'active projects'}</p></article><article className="rounded-[calc(var(--orus-radius)*1.3)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><p className="text-xs uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">${isPt ? 'Entregas' : 'Deliveries'}</p><p className="mt-4 font-display text-4xl font-bold">{stats.recent}</p></article><article className="rounded-[calc(var(--orus-radius)*1.3)] bg-[rgb(var(--orus-panel-muted))] p-6"><p className="text-xs uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">${isPt ? 'Em revisão' : 'In review'}</p><p className="mt-4 font-display text-4xl font-bold text-[rgb(var(--orus-accent))]">{stats.pending}</p></article></section>`;
    }
    if (pattern === 'talent-hub') {
      return `<section className="grid gap-4 xl:grid-cols-[.7fr_1.3fr]"><aside className="rounded-[calc(var(--orus-radius)*1.25)] bg-[rgb(var(--orus-text))] p-7 text-[rgb(var(--orus-page))]"><p className="text-xs font-bold uppercase tracking-[.22em] opacity-55">${isPt ? 'Pulso de talentos' : 'Talent pulse'}</p><p className="mt-6 font-display text-5xl font-bold">{stats.total}</p><p className="mt-2 text-sm opacity-65">${isPt ? 'perfis no radar' : 'profiles on the radar'}</p><div className="mt-10 flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-[rgb(var(--orus-accent))]"/><span className="text-sm">{stats.recent} ${isPt ? 'movimentos recentes' : 'recent moves'}</span></div></aside><div className="rounded-[calc(var(--orus-radius)*1.25)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><div className="grid gap-3 md:grid-cols-3">{[['${isPt ? 'Descoberta' : 'Discovery'}', stats.total], ['${isPt ? 'Em conversa' : 'In conversation'}', stats.active], ['${isPt ? 'Decisão' : 'Decision'}', stats.pending]].map(([label, value], index) => <article key={String(label)} className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-4"><span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">{label}</span><p className="mt-5 font-display text-3xl font-bold">{value}</p><div className="mt-4 h-1 rounded-full bg-[rgb(var(--orus-border))]"><div className="h-full rounded-full bg-[rgb(var(--orus-primary))]" style={{ width: (45 + index * 20) + '%' }}/></div></article>)}</div><div className="mt-4 flex flex-wrap gap-2">{recentItems.slice(0, 4).map(item => <Link key={item.id} to={'/${resourcePath}/' + item.id} className="rounded-full border border-[rgb(var(--orus-border))] px-4 py-2 text-xs font-semibold">{item.name}</Link>)}</div></div></section>`;
    }
    if (pattern === 'learning-campus') {
      return `<section className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.4)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-7 sm:p-9"><div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-bl from-[rgb(var(--orus-primary-soft))] to-transparent"/><div className="relative grid gap-9 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-[rgb(var(--orus-accent))]">${isPt ? 'Trilha em andamento' : 'Learning path'}</p><h2 className="mt-5 max-w-xl font-display text-4xl font-bold leading-tight">${isPt ? 'Conhecimento organizado em marcos que convidam a continuar.' : 'Knowledge organized into milestones that invite progress.'}</h2><div className="mt-8 flex gap-8"><div><strong className="font-display text-3xl">{stats.total}</strong><p className="text-xs text-[rgb(var(--orus-text-muted))]">${isPt ? 'trilhas' : 'paths'}</p></div><div><strong className="font-display text-3xl">{stats.recent}</strong><p className="text-xs text-[rgb(var(--orus-text-muted))]">${isPt ? 'avanços' : 'milestones'}</p></div></div></div><div className="relative space-y-4 border-l-2 border-[rgb(var(--orus-primary-soft))] pl-7">{recentItems.slice(0, 4).map((item, index) => <Link key={item.id} to={'/${resourcePath}/' + item.id} className="relative block rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-4"><span className="absolute -left-[2.15rem] top-5 grid h-5 w-5 place-items-center rounded-full bg-[rgb(var(--orus-primary))] text-[9px] font-bold text-[rgb(var(--orus-on-primary))]">{index + 1}</span><strong className="text-sm">{item.name}</strong><p className="mt-1 text-xs text-[rgb(var(--orus-text-muted))]">{item.status || '${isPt ? 'disponível' : 'available'}'}</p></Link>)}</div></div></section>`;
    }
    if (pattern === 'logistics-control') {
      return `<section className="overflow-hidden rounded-[calc(var(--orus-radius)*1.2)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-text))] text-[rgb(var(--orus-page))]"><div className="grid lg:grid-cols-[1.35fr_.65fr]"><div className="relative min-h-72 p-7"><div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgb(var(--orus-border)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--orus-border)) 1px, transparent 1px)', backgroundSize: '36px 36px' }}/><div className="relative"><p className="text-xs font-bold uppercase tracking-[.22em] text-[rgb(var(--orus-accent))]">${isPt ? 'Rede em movimento' : 'Network in motion'}</p><div className="mt-10 flex items-center gap-3">{[0,1,2,3].map((point) => <div key={point} className="flex flex-1 items-center gap-3"><span className="h-4 w-4 shrink-0 rounded-full border-4 border-[rgb(var(--orus-primary-soft))] bg-[rgb(var(--orus-primary))]"/>{point < 3 && <span className="h-px flex-1 bg-[rgb(var(--orus-border))]"/>}</div>)}</div><p className="mt-10 max-w-lg font-display text-3xl font-bold">${isPt ? 'Do despacho à confirmação, cada exceção permanece visível.' : 'From dispatch to confirmation, every exception stays visible.'}</p></div></div><aside className="border-t border-white/10 bg-white/5 p-7 lg:border-l lg:border-t-0"><p className="text-xs uppercase tracking-wider opacity-55">${isPt ? 'Agora' : 'Now'}</p><p className="mt-5 font-display text-5xl font-bold">{stats.total}</p><p className="mt-1 text-sm opacity-60">${isPt ? 'operações monitoradas' : 'monitored operations'}</p><div className="mt-8 space-y-3">{recentItems.slice(0, 3).map(item => <Link key={item.id} to={'/${resourcePath}/' + item.id} className="block rounded-[var(--orus-radius)] border border-white/10 p-3 text-sm font-semibold">{item.name}</Link>)}</div></aside></div></section>`;
    }
    if (pattern === 'event-stage') {
      return `<section className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.4)] bg-gradient-to-br from-[rgb(var(--orus-primary))] via-[rgb(var(--orus-accent))] to-[rgb(var(--orus-text))] p-7 text-white sm:p-10"><div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border-[38px] border-white/10"/><p className="text-xs font-bold uppercase tracking-[.3em] text-white/65">${isPt ? 'Experiência ao vivo' : 'Live experience'}</p><div className="relative mt-8 grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="font-display text-6xl font-bold">{stats.total}</p><p className="mt-2 text-sm text-white/70">${isPt ? 'momentos programados' : 'scheduled moments'}</p></div><div className="grid gap-3 sm:grid-cols-2">{recentItems.slice(0, 4).map((item, index) => <Link key={item.id} to={'/${resourcePath}/' + item.id} className="rounded-[var(--orus-radius)] border border-white/15 bg-white/10 p-4 backdrop-blur"><span className="text-[10px] font-bold uppercase tracking-wider text-white/60">0{index + 1}</span><p className="mt-4 font-semibold">{item.name}</p><p className="mt-1 text-xs text-white/60">{item.status || '${isPt ? 'programado' : 'scheduled'}'}</p></Link>)}</div></div></section>`;
    }
    if (pattern === 'hospitality-service') {
      return `<section className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]"><article className="rounded-[calc(var(--orus-radius)*1.3)] bg-[rgb(var(--orus-primary))] p-7 text-[rgb(var(--orus-on-primary))]"><p className="text-xs font-bold uppercase tracking-[.24em] opacity-95">${isPt ? 'Serviço desta noite' : "Tonight's service"}</p><p className="mt-6 max-w-md font-display text-4xl font-bold leading-tight">${isPt ? 'Salão e cozinha compartilham o mesmo ritmo.' : 'Dining room and kitchen share the same rhythm.'}</p><div className="mt-10 flex gap-8"><div><strong className="font-display text-3xl">{stats.total}</strong><p className="text-xs opacity-95">${isPt ? 'reservas' : 'reservations'}</p></div><div><strong className="font-display text-3xl">{stats.pending}</strong><p className="text-xs opacity-95">${isPt ? 'atenções' : 'attention'}</p></div></div></article><div className="grid gap-3 sm:grid-cols-2">{recentItems.slice(0, 4).map((item, index) => <Link key={item.id} to={'/${resourcePath}/' + item.id} className="flex min-h-32 flex-col justify-between rounded-[calc(var(--orus-radius)*1.1)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--orus-accent))]">${isPt ? 'Mesa' : 'Table'} {index + 1}</span><span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--orus-primary))]"/></div><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-[rgb(var(--orus-text-muted))]">{item.status || '${isPt ? 'confirmada' : 'confirmed'}'}</p></div></Link>)}</div></section>`;
    }
    if (pattern === 'command-center') {
      return `<section className="rounded-[calc(var(--orus-radius)*1.2)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-accent))]">${isPt ? 'Fluxo operacional' : 'Operational flow'}</p><h2 className="mt-1 text-xl font-bold">${isPt ? 'Trabalho por estágio' : 'Work by stage'}</h2></div><span className="text-xs text-[rgb(var(--orus-text-muted))]">${isPt ? 'Atualizado agora' : 'Updated now'}</span></div><div className="grid gap-3 md:grid-cols-3">{[['${isPt ? 'Entrada' : 'Intake'}', 'pending'], ['${isPt ? 'Em progresso' : 'In progress'}', 'active'], ['${isPt ? 'Concluídos' : 'Completed'}', 'done']].map(([label, status]) => <div key={status} className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-3"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider">{label}</span><span className="rounded-full bg-[rgb(var(--orus-panel))] px-2 py-0.5 text-xs">{items.filter((item) => item.status === status).length}</span></div>{items.filter((item) => item.status === status).slice(0, 2).map((item) => <Link key={item.id} to={'/${resourcePath}/' + item.id} className="mb-2 block rounded-[calc(var(--orus-radius)*.8)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-3 text-sm font-semibold shadow-sm">{item.name}</Link>)}{items.filter((item) => item.status === status).length === 0 && <div className="rounded-[calc(var(--orus-radius)*.8)] border border-dashed border-[rgb(var(--orus-border))] px-3 py-6 text-center text-xs text-[rgb(var(--orus-text-muted))]">${isPt ? 'Espaço livre' : 'Open space'}</div>}</div>)}</div></section>`;
    }
    return `<section className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.25)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6 sm:p-8"><div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[rgb(var(--orus-primary-soft))] to-transparent opacity-70"/><div className="relative grid gap-8 lg:grid-cols-[1fr_.8fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[rgb(var(--orus-accent))]">${isPt ? 'Foco da equipe' : 'Team focus'}</p><h2 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight">${isPt ? 'Transforme prioridades em progresso visível.' : 'Turn priorities into visible progress.'}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[rgb(var(--orus-text-muted))]">${isPt ? 'Uma leitura clara do trabalho ativo, das próximas decisões e do ritmo da operação.' : 'A clear view of active work, upcoming decisions and operating pace.'}</p></div><div className="space-y-3">{recentItems.slice(0, 3).map((item, index) => <Link key={item.id} to={'/${resourcePath}/' + item.id} className="flex items-center gap-4 rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] p-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-[rgb(var(--orus-primary))] text-xs font-bold text-[rgb(var(--orus-on-primary))]">{index + 1}</span><div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-[rgb(var(--orus-text-muted))]">{item.status || '${isPt ? 'próxima ação' : 'next action'}'}</p></div></Link>)}</div></div></section>`;
  }

/**
 * Generate Home Page — polished dashboard
 * ✅ FIX E: Consistent paths /${mainEntity}s and /${mainEntity}s/new
 */
private generateHomePage(entities: string[]): GeneratedUIFile {
  const mainEntity = entities[0] || 'item';
  const mainResourcePath = toResourcePath(mainEntity);
  const Entity = this.capitalize(mainEntity);
  const otherEntities = entities.slice(1, 4);

  const otherLinks = otherEntities.map(e =>
    `          <Link to="/${e}s" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
            ${this.capitalize(e)}s
          </Link>`
  ).join('\n');

  const content = `
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

interface Stats {
  total: number;
  active: number;
  pending: number;
  recent: number;
}

interface RecentItem {
  id: string;
  name: string;
  status?: string;
  createdAt?: string;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, pending: 0, recent: 0 });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/${mainResourcePath}').catch(() => ({ data: [] })),
    ]).then(([itemsRes]) => {
      const items: RecentItem[] = Array.isArray(itemsRes.data)
        ? itemsRes.data
        : (Array.isArray(itemsRes.data?.data) ? itemsRes.data.data : []);
      setStats({
        total: items.length,
        active: items.filter((i: any) => i.status === 'active').length,
        pending: items.filter((i: any) => i.status === 'pending').length,
        recent: items.slice(-7).length,
      });
      setRecentItems(items.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total ${Entity}s', value: stats.total, color: 'bg-blue-500', icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
    { label: 'Active', value: stats.active, color: 'bg-emerald-500', icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { label: 'Pending', value: stats.pending, color: 'bg-amber-500', icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { label: 'This Week', value: stats.recent, color: 'bg-violet-500', icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )},
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of your ${Entity}s and activity</p>
        </div>
        <Link
          to="/${mainResourcePath}/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New ${Entity}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
            <div className={\`\${card.color} rounded-xl p-3 flex-shrink-0\`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Grid: Recent + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Recent ${Entity}s</h2>
            <Link to="/${mainResourcePath}" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all →</Link>
          </div>
          {recentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-sm">No ${mainEntity}s yet.</p>
              <Link to="/${mainResourcePath}/new" className="mt-3 text-indigo-600 hover:underline text-sm font-medium">Create your first one →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentItems.map((item) => (
                <Link key={item.id} to={\`/${mainResourcePath}/\${item.id}\`} className="flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                      {(item.name || 'N')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">{item.name}</p>
                      {item.createdAt && <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  {item.status && (
                    <span className={\`text-xs font-medium px-2.5 py-1 rounded-full \${
                      item.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }\`}>
                      {item.status}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link
              to="/${mainResourcePath}"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
            >
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">View all ${Entity}s</span>
            </Link>
            <Link
              to="/${mainResourcePath}/new"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
            >
              <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Create new ${Entity}</span>
            </Link>
${otherLinks}
          </div>
        </div>
      </div>
    </div>
  );
}
`.trim();

  return {
    path: 'frontend/src/pages',
    name: 'HomePage.tsx',
    content: content,
    type: 'tsx'
  };
}

  /**
   * Generate List Page — polished header with back nav
   * ✅ FIX K: Visual upgrade + fixed /new route
   */
  private generateListPage(entity: string, locale: VisualIntent['locale'] = 'en', productBlueprint?: ProductBlueprint): GeneratedUIFile {
    const Entity = this.capitalize(entity);
    const resourcePath = toResourcePath(entity);
    const label = this.entityLabel(entity, locale);
    const pluralLabel = this.entityLabel(entity, locale, true);
    const isPt = locale === 'pt-BR';
    const capability = productBlueprint?.capabilities.find(item =>
      item.entities.some(capabilityEntity => capabilityEntity.toLowerCase() === entity.toLowerCase())
    );
    const subtitle = capability?.purpose || (isPt
      ? `Gerencie ${pluralLabel.toLowerCase()} em um só lugar`
      : `Manage all your ${pluralLabel.toLowerCase()}`);

    const content = `
import { Link } from 'react-router-dom';
import ${Entity}List from '../components/${Entity}List';

export default function ${Entity}ListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">${pluralLabel}</h1>
          <p className="text-sm text-gray-500 mt-0.5">${subtitle}</p>
        </div>
        <Link
          to="/${resourcePath}/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          ${isPt ? 'Novo' : 'New'} ${label}
        </Link>
      </div>
      <${Entity}List />
    </div>
  );
}
    `.trim();

    return {
      path: 'frontend/src/pages',
      name: `${Entity}ListPage.tsx`,
      content: content,
      type: 'tsx'
    };
  }

  /**
   * Generate Detail Page — polished with loading skeleton, edit/delete
   * ✅ FIX L: Visual upgrade
   */
  private generateDetailPage(entity: string, locale: VisualIntent['locale'] = 'en'): GeneratedUIFile {
    const Entity = this.capitalize(entity);
    const resourcePath = toResourcePath(entity);
    const label = this.entityLabel(entity, locale);
    const pluralLabel = this.entityLabel(entity, locale, true);
    const isPt = locale === 'pt-BR';

    const content = `
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { ${Entity} } from '../types/${entity}.types';

export default function ${Entity}DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<${Entity} | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(\`/api/${resourcePath}/\${id}\`)
      .then(res => setItem(res.data?.data ?? res.data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('${isPt ? `Excluir este ${label.toLowerCase()}? Esta ação não pode ser desfeita.` : `Delete this ${label.toLowerCase()}? This cannot be undone.`}')) return;
    setDeleting(true);
    try {
      await api.delete(\`/api/${resourcePath}/\${id}\`);
      navigate('/${resourcePath}');
    } catch {
      alert('${isPt ? 'Não foi possível excluir.' : 'Failed to delete.'}');
      setDeleting(false);
    }
  };

  const statusColor: Record<string, string> = {
    active:   'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending:  'bg-amber-100 text-amber-700 border-amber-200',
    inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const statusLabel: Record<string, string> = ${isPt
    ? "{ active: 'Ativo', pending: 'Pendente', inactive: 'Inativo', done: 'Concluído' }"
    : "{ active: 'Active', pending: 'Pending', inactive: 'Inactive', done: 'Done' }"};

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-8"></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
          <div className="h-7 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">${isPt ? `${label} não encontrado` : `${label} not found`}</h2>
        <p className="text-gray-500 text-sm mt-1">${isPt ? 'Este registro pode ter sido excluído ou não existe.' : "This item may have been deleted or doesn't exist."}</p>
        <Link to="/${resourcePath}" className="mt-5 inline-flex items-center gap-2 text-indigo-600 hover:underline text-sm font-medium">← ${isPt ? `Voltar para ${pluralLabel}` : `Back to ${pluralLabel}`}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/${resourcePath}" className="hover:text-indigo-600 transition-colors">${pluralLabel}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium truncate">{item.name}</span>
      </nav>

      {/* Detail card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl flex-shrink-0">
                {(item.name || 'N')[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                {item.status && (
                  <span className={\`inline-flex mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border \${statusColor[item.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}\`}>
                    {statusLabel[item.status] ?? item.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {item.description && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">${isPt ? 'Descrição' : 'Description'}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {item.createdAt && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">${isPt ? 'Criado em' : 'Created'}</p>
                <p className="text-sm text-gray-700">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            )}
            {item.updatedAt && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">${isPt ? 'Atualizado em' : 'Updated'}</p>
                <p className="text-sm text-gray-700">{new Date(item.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
          <Link
            to={\`/${resourcePath}/\${id}/edit\`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            ${isPt ? 'Editar' : 'Edit'}
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-5 py-2 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 text-sm font-semibold rounded-xl transition-colors"
          >
            {deleting ? '${isPt ? 'Excluindo...' : 'Deleting...'}' : '${isPt ? 'Excluir' : 'Delete'}'}
          </button>
          <Link to="/${resourcePath}" className="ml-auto text-sm text-gray-500 hover:text-gray-700 transition-colors">← ${isPt ? 'Voltar' : 'Back'}</Link>
        </div>
      </div>
    </div>
  );
}
    `.trim();

    return {
      path: 'frontend/src/pages',
      name: `${Entity}DetailPage.tsx`,
      content: content,
      type: 'tsx'
    };
  }

  /**
   * Generate Create Page — polished with breadcrumb + card wrapper
   * ✅ FIX M: Visual upgrade
   */
  private generateCreatePage(entity: string, locale: VisualIntent['locale'] = 'en'): GeneratedUIFile {
    const Entity = this.capitalize(entity);
    const resourcePath = toResourcePath(entity);
    const label = this.entityLabel(entity, locale);
    const pluralLabel = this.entityLabel(entity, locale, true);
    const isPt = locale === 'pt-BR';

    const content = `
import { Link } from 'react-router-dom';
import ${Entity}Form from '../components/${Entity}Form';

export default function ${Entity}CreatePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/${resourcePath}" className="hover:text-indigo-600 transition-colors">${pluralLabel}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">${isPt ? 'Novo' : 'New'} ${label}</span>
      </nav>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">${isPt ? 'Criar' : 'Create'} ${label}</h1>
          <p className="text-sm text-gray-500 mt-1">${isPt ? `Preencha os dados para criar um novo ${label.toLowerCase()}.` : `Fill in the details below to create a new ${label.toLowerCase()}.`}</p>
        </div>
        <${Entity}Form />
      </div>
    </div>
  );
}
    `.trim();

    return {
      path: 'frontend/src/pages',
      name: `${Entity}CreatePage.tsx`,
      content: content,
      type: 'tsx'
    };
  }

  private generateEditPage(entity: string, locale: VisualIntent['locale'] = 'en'): GeneratedUIFile {
    const Entity = this.capitalize(entity);
    const resourcePath = toResourcePath(entity);
    const label = this.entityLabel(entity, locale);
    const pluralLabel = this.entityLabel(entity, locale, true);
    const isPt = locale === 'pt-BR';
    const content = `
import { Link } from 'react-router-dom';
import ${Entity}Form from '../components/${Entity}Form';

export default function ${Entity}EditPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/${resourcePath}" className="hover:text-indigo-600 transition-colors">${pluralLabel}</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-gray-900 font-medium">${isPt ? 'Editar' : 'Edit'} ${label}</span>
      </nav>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">${isPt ? 'Editar' : 'Edit'} ${label}</h1>
          <p className="text-sm text-gray-500 mt-1">${isPt ? `Atualize os dados deste ${label.toLowerCase()}.` : `Update this ${label.toLowerCase()}.`}</p>
        </div>
        <${Entity}Form />
      </div>
    </div>
  );
}
    `.trim();
    return { path: 'frontend/src/pages', name: `${Entity}EditPage.tsx`, content, type: 'tsx' };
  }

  /**
   * Generate Login Page — polished centered card
   * ✅ FIX N: Visual upgrade with proper form UX
   */
  private generateLoginPage(locale: VisualIntent['locale']): GeneratedUIFile {
    const isPt = locale === 'pt-BR';
    const copy = isPt
      ? {
          missingToken: 'A resposta de autenticação não incluiu um token',
          invalidCredentials: 'E-mail ou senha inválidos. Tente novamente.',
          title: 'Bem-vindo de volta',
          subtitle: 'Entre na sua conta para continuar',
          password: 'Senha',
          emailPlaceholder: 'voce@empresa.com',
          loading: 'Entrando...',
          submit: 'Entrar',
          noAccount: 'Ainda não tem uma conta?',
          register: 'Criar conta',
        }
      : {
          missingToken: 'Authentication response did not include a token',
          invalidCredentials: 'Invalid email or password. Please try again.',
          title: 'Welcome back',
          subtitle: 'Sign in to your account to continue',
          password: 'Password',
          emailPlaceholder: 'you@example.com',
          loading: 'Signing in...',
          submit: 'Sign in',
          noAccount: "Don't have an account?",
          register: 'Sign up',
        };
    const content = `
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('${copy.invalidCredentials}');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--orus-page))] text-[rgb(var(--orus-text))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-[rgb(var(--orus-primary))] rounded-2xl items-center justify-center mb-4 shadow-lg shadow-black/10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">${copy.title}</h1>
          <p className="text-sm text-[rgb(var(--orus-muted))] mt-1">${copy.subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-[rgb(var(--orus-panel))] rounded-2xl shadow-xl shadow-black/10 border border-[rgb(var(--orus-border))] p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                 placeholder="${copy.emailPlaceholder}"
                 className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] focus:border-transparent transition"
              />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1.5">${copy.password}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                 className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
               className="w-full py-2.5 bg-[rgb(var(--orus-primary))] hover:opacity-90 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
               {loading ? '${copy.loading}' : '${copy.submit}'}
            </button>
          </form>

          <p className="text-center text-sm text-[rgb(var(--orus-muted))]">
            ${copy.noAccount}{' '}
            <Link to="/register" className="text-[rgb(var(--orus-primary))] hover:underline font-medium">${copy.register}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
    `.trim();

    return {
      path: 'frontend/src/pages',
      name: 'LoginPage.tsx',
      content: content,
      type: 'tsx'
    };
  }  /**
   * Generate Button Component — full design-system button
   * ✅ FIX O: Visual upgrade with variants, sizes, loading, icon support
   */
  private generateButton(): GeneratedUIFile {
    const content = `
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost:     'hover:bg-gray-100 text-gray-700',
  outline:   'border border-gray-300 hover:bg-gray-50 text-gray-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={\`inline-flex items-center justify-center font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed \${variantClasses[variant]} \${sizeClasses[size]} \${className}\`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
    `.trim();

    return {
      path: 'frontend/src/components',
      name: 'Button.tsx',
      content: content,
      type: 'tsx'
    };
  }  /**
   * Generate Input Component — design-system input with label, error, hint
   * ✅ FIX P: Visual upgrade
   */
  private generateInput(): GeneratedUIFile {
    const content = `
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={\`w-full \${leftIcon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border \${error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition \${className}\`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
    `.trim();

    return {
      path: 'frontend/src/components',
      name: 'Input.tsx',
      content: content,
      type: 'tsx'
    };
  }

  private generateRegisterPage(locale: VisualIntent['locale']): GeneratedUIFile {
    const isPt = locale === 'pt-BR';
    const copy = isPt
      ? {
          missingToken: 'A resposta de autenticação não incluiu um token',
          error: 'Não foi possível criar a conta. Tente novamente.',
          title: 'Crie sua conta',
          subtitle: 'Preencha seus dados para começar',
          name: 'Nome',
          password: 'Senha',
          loading: 'Criando conta...',
          submit: 'Criar conta',
          hasAccount: 'Já tem uma conta?',
          login: 'Entrar',
        }
      : {
          missingToken: 'Authentication response did not include a token',
          error: 'Unable to create the account. Please try again.',
          title: 'Create your account',
          subtitle: 'Enter your details to get started',
          name: 'Name',
          password: 'Password',
          loading: 'Creating account...',
          submit: 'Create account',
          hasAccount: 'Already have an account?',
          login: 'Sign in',
        };
    const content = `
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || '${copy.error}');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--orus-page))] text-[rgb(var(--orus-text))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-[rgb(var(--orus-primary))] rounded-2xl items-center justify-center mb-4 shadow-lg shadow-black/10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">${copy.title}</h1>
          <p className="text-sm text-[rgb(var(--orus-muted))] mt-1">${copy.subtitle}</p>
        </div>

        <div className="bg-[rgb(var(--orus-panel))] rounded-2xl shadow-xl shadow-black/10 border border-[rgb(var(--orus-border))] p-8 space-y-5">
          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">${copy.name}</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required minLength={2} className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">${copy.password}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))]" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-[rgb(var(--orus-primary))] hover:opacity-90 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition">
              {loading ? '${copy.loading}' : '${copy.submit}'}
            </button>
          </form>
          <p className="text-center text-sm text-[rgb(var(--orus-muted))]">
            ${copy.hasAccount} <Link to="/login" className="text-[rgb(var(--orus-primary))] hover:underline font-medium">${copy.login}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
    `.trim();

    return {
      path: 'frontend/src/pages',
      name: 'RegisterPage.tsx',
      content,
      type: 'tsx'
    };
  }

  /**
   * Generate API Hook
   * ✅ FIX R: Uses /api/ prefix, handles both [] and {data:[]} shapes, adds error + refetch
   */
  private generateApiHook(entities: string[]): GeneratedUIFile {
    const hooks = entities.map(entity => {
      const Entity = this.capitalize(entity);
      const resourcePath = toResourcePath(entity);
      return `
export function use${Entity}s() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.get('/api/${resourcePath}')
      .then(res => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setData(items);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  return { data, loading, error, refetch: fetchData };
}`;
    }).join('\n');

    const content = `
import { useState, useEffect } from 'react';
import api from '../utils/api';
${hooks}
    `.trim();

    return {
      path: 'frontend/src/hooks',
      name: 'useApi.ts',
      content: content,
      type: 'typescript'
    };
  }

  /**
   * Generate Auth Hook
   */
  private generateAuthHook(): GeneratedUIFile {
    const content = `
export { useAuth } from '../contexts/AuthContext';
    `.trim();

    return {
      path: 'frontend/src/hooks',
      name: 'useAuth.ts',
      content: content,
      type: 'typescript'
    };
  }

  /**
   * Generate AuthContext
   */
  private generateAuthContext(): GeneratedUIFile {
    const content = `
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User { id: string; email: string; name: string; role: 'admin' | 'editor' | 'member' | 'viewer'; }

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const previewMode = import.meta.env.VITE_ORUS_PREVIEW_MODE === 'true';
const previewAccessValue = 'orus-preview-token';
const previewUser: User = {
  id: 'orus-preview-user',
  email: 'preview@orus.local',
  name: 'Visitante',
  role: 'admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(previewMode ? previewUser : null);
  const [token, setToken] = useState<string | null>(previewMode ? previewAccessValue : localStorage.getItem('token'));
  const [loading, setLoading] = useState(!previewMode);

  useEffect(() => {
    if (previewMode) {
      api.defaults.headers.common['Authorization'] = \`Bearer \${previewAccessValue}\`;
      return;
    }
    if (token) {
      api.get('/api/auth/me')
        .then(res => setUser(res.data?.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('token', t);
    api.defaults.headers.common['Authorization'] = \`Bearer \${t}\`;
    setToken(t);
    setUser(u);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.post('/api/auth/register', { email, password, name });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('token', t);
    api.defaults.headers.common['Authorization'] = \`Bearer \${t}\`;
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    if (previewMode) return;
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
    `.trim();

    return {
      path: 'frontend/src/contexts',
      name: 'AuthContext.tsx',
      content: content,
      type: 'tsx'
    };
  }

  /**
   * Generate API Client
   */
  private generateApiClient(persistence: 'api' | 'local'): GeneratedUIFile {
    const content = persistence === 'local' ? `
type LocalResponse = { data: { data: any } };

const storageKey = (resource: string) => 'orus:' + resource;

const route = (path: string) => {
  const parts = path.split('?')[0].split('/').filter(Boolean);
  if (parts[0] === 'api') parts.shift();
  return { resource: parts[0] || '', id: parts[1] };
};

const read = (resource: string): any[] => {
  const value = localStorage.getItem(storageKey(resource));
  if (!value) return [];
  try { return JSON.parse(value); } catch { return []; }
};

const write = (resource: string, items: any[]) => {
  localStorage.setItem(storageKey(resource), JSON.stringify(items));
};

const success = (data: any): Promise<LocalResponse> => Promise.resolve({ data: { data } });

const failure = (message: string, status = 400): Promise<never> => {
  const error = new Error(message) as Error & { response: { status: number; data: { message: string } } };
  error.response = { status, data: { message } };
  return Promise.reject(error);
};

let localIdSequence = 0;
const makeId = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + (++localIdSequence).toString(36);

const api = {
  defaults: { headers: { common: {} as Record<string, string> } },

  get(path: string): Promise<LocalResponse> {
    const { resource, id } = route(path);
    if (resource === 'auth' && id === 'me') {
      const user = localStorage.getItem('orus:current-user');
      return user ? success(JSON.parse(user)) : failure('Sessão não encontrada.', 401);
    }
    const items = read(resource);
    if (!id) return success(items);
    const item = items.find(candidate => candidate.id === id);
    return item ? success(item) : failure('Registro não encontrado.', 404);
  },

  post(path: string, payload: any): Promise<LocalResponse> {
    const { resource, id } = route(path);
    if (resource === 'auth' && id === 'register') {
      const users = read('users');
      if (users.some(user => user.email === payload.email)) return failure('Este e-mail já está cadastrado.');
      const user = { id: makeId(), name: payload.name, email: payload.email };
      write('users', [...users, { ...user, password: payload.password }]);
      localStorage.setItem('orus:current-user', JSON.stringify(user));
      return success({ token: 'local-preview-token', user });
    }
    if (resource === 'auth' && id === 'login') {
      const user = read('users').find(candidate => candidate.email === payload.email && candidate.password === payload.password);
      if (!user) return failure('E-mail ou senha inválidos.', 401);
      const safeUser = { id: user.id, name: user.name, email: user.email };
      localStorage.setItem('orus:current-user', JSON.stringify(safeUser));
      return success({ token: 'local-preview-token', user: safeUser });
    }
    const items = read(resource);
    const now = new Date().toISOString();
    const created = { ...payload, id: makeId(), createdAt: now, updatedAt: now };
    write(resource, [...items, created]);
    return success(created);
  },

  put(path: string, payload: any): Promise<LocalResponse> {
    return this.patch(path, payload);
  },

  patch(path: string, payload: any): Promise<LocalResponse> {
    const { resource, id } = route(path);
    if (!id) return failure('Identificador não informado.');
    const items = read(resource);
    const index = items.findIndex(candidate => candidate.id === id);
    if (index < 0) return failure('Registro não encontrado.', 404);
    const updated = { ...items[index], ...payload, id, updatedAt: new Date().toISOString() };
    items[index] = updated;
    write(resource, items);
    return success(updated);
  },

  delete(path: string): Promise<LocalResponse> {
    const { resource, id } = route(path);
    if (!id) return failure('Identificador não informado.');
    const items = read(resource);
    const item = items.find(candidate => candidate.id === id);
    if (!item) return failure('Registro não encontrado.', 404);
    write(resource, items.filter(candidate => candidate.id !== id));
    return success(item);
  },
};

export default api;
    `.trim() : `
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach token from localStorage automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) localStorage.removeItem('token');
    return Promise.reject(err);
  }
);

export default api;
    `.trim();

    return {
      path: 'frontend/src/utils',
      name: 'api.ts',
      content: content,
      type: 'typescript'
    };
  }

  /**
   * Generate Types for entity
   */
  private generateTypes(entity: string): GeneratedUIFile {
    const Entity = this.capitalize(entity);
    const fields = getEntityFields(entity)
      .map(field => `  ${field.name}${field.required ? '' : '?'}: ${field.tsType};`)
      .join('\n');

    const content = `
export interface ${Entity} {
  id: string;
${fields}
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ${Entity}CreateInput = Omit<${Entity}, 'id' | 'createdAt' | 'updatedAt'>;
export type ${Entity}UpdateInput = Partial<${Entity}CreateInput>;
    `.trim();

    return {
      path: 'frontend/src/types',
      name: `${entity}.types.ts`,
      content: content,
      type: 'typescript'
    };
  }

  /**
   * Extract pages for fallback format
   */
  private extractPages(files: GeneratedUIFile[]): Record<string, string> {
    const pages: Record<string, string> = {};
    files.filter(f => f.path.includes('pages')).forEach(file => {
      const name = file.name.replace('.tsx', '');
      pages[name] = file.content;
    });
    return pages;
  }

  /**
   * Create fallback result
   */
  private createFallbackResult(): UIGenerationResult {
    const homeFile = this.generateHomePage(['item']);
    return {
      success: true,
      files: [homeFile],
      components: [],
      pages: { HomePage: homeFile.content },
      metadata: { filesGenerated: 1, componentsCount: 0, pagesCount: 1 }
    };
  }

  // Generate index.html (VITE entry point)
  private generateIndexHtml(visualIntent?: VisualIntent): GeneratedUIFile {
    const intent = visualIntent || analyzeVisualIntent('');
    const fontFamilies = Array.from(new Set([intent.typography.body, intent.typography.display]));
    const fontQuery = fontFamilies
      .map(font => `family=${font.replace(/ /g, '+')}:wght@400;500;600;700`)
      .join('&');
    const content = `<!DOCTYPE html>
<html lang="${intent.locale}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/brand-mark.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${intent.brandName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?${fontQuery}&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>`.trim();

    return {
      path: 'frontend',
      name: 'index.html',
      content: content,
      type: 'html'
    };
  }

  // Generate vite.config.ts
  private generateViteConfig(): GeneratedUIFile {
    const content = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  root: fs.realpathSync(process.cwd()),
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: { outDir: 'dist', sourcemap: false, minify: 'esbuild' },
  optimizeDeps: { include: ['react', 'react-dom'] },
})`.trim();

    return {
      path: 'frontend',
      name: 'vite.config.ts',
      content: content,
      type: 'typescript'
    };
  }

  // Generate tsconfig.node.json
  private generateTsconfigNode(): GeneratedUIFile {
    const content = `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}`.trim();

    return {
      path: 'frontend',
      name: 'tsconfig.node.json',
      content: content,
      type: 'json'
    };
  }

  /**
   * Capitalize helper
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private blueprintPageName(screen: ProductScreen): string {
    const name = screen.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map(part => this.capitalize(part.toLowerCase()))
      .join('');
    return `${name || 'Product'}WorkspacePage`;
  }

  private generateBlueprintScreenPage(screen: ProductScreen, blueprint: ProductBlueprint, visualIntent: VisualIntent, persistence: 'api' | 'local'): GeneratedUIFile {
    const componentName = this.blueprintPageName(screen);
    const capability = blueprint.capabilities.find(item => screen.capabilityIds.includes(item.id)) || blueprint.capabilities[0]!;
    const isPt = visualIntent.locale === 'pt-BR';
    const blueprintEntity = capability.entities.find(entity =>
      blueprint.data.some(item => item.name.toLowerCase() === entity.toLowerCase())
    ) || blueprint.data[0]?.name || capability.entities[0] || 'Item';
    const entity = toEntityIdentifier(blueprintEntity);
    const resourcePath = toResourcePath(entity);
    const workflow = getEntityWorkflow(entity);
    const fields = getEntityFields(entity);
    const stateField = workflow?.field || fields.find(field => field.name === 'status' || field.name === 'stage')?.name || 'status';
    const stateOptions = fields.find(field => field.name === stateField)?.options || [];
    const stateLabels = Object.fromEntries(stateOptions.map(option => [option.value, isPt ? option.pt : option.en]));
    const workflowStates = stateOptions.map(option => option.value);
    const usesWorkflowColumns = capability.strategy === 'workflow' && !['calendar', 'conversation', 'checkout', 'stepper', 'timeline', 'billing'].includes(screen.layout);
    const body = this.generateBlueprintStrategyBody(screen, capability, isPt);
    const usesStateLabels = body.includes('stateLabels');
    const usesWorkflowActions = body.includes('updateState');
    const header = this.generateBlueprintScreenHeader(screen, isPt);
    const content = `
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

type WorkspaceRecord = Record<string, any>;
type WorkspaceItem = { id: string; name: string; detail: string; status: string; record: WorkspaceRecord };
${capability.strategy === 'computed' ? 'type WorkspaceSummary = { total: number; byState: Record<string, number>; numericTotals: Record<string, number> };' : ''}

const screenTitle = ${JSON.stringify(screen.name)};
const screenPurpose = ${JSON.stringify(screen.purpose)};
const capabilityName = ${JSON.stringify(capability.name)};
const resourcePath = ${JSON.stringify(resourcePath)};
const stateField = ${JSON.stringify(stateField)};
${usesWorkflowColumns ? `const workflowStates: string[] = ${JSON.stringify(workflowStates)};` : ''}
${usesStateLabels ? `const stateLabels: Record<string, string> = ${JSON.stringify(stateLabels)};` : ''}
${usesWorkflowActions ? `const transitions: Record<string, string[]> = ${JSON.stringify(workflow?.transitions || {})};` : ''}

const normalizeRecord = (record: WorkspaceRecord, index: number): WorkspaceItem => {
  const status = String(record[stateField] ?? ${JSON.stringify(workflow?.initial || fields.find(field => field.name === stateField)?.defaultValue || '')});
  return {
    id: String(record.id),
    name: String(record.name ?? record.title ?? capabilityName + ' ' + (index + 1)),
    detail: String(record.description ?? record.email ?? record.status ?? screenPurpose),
    status,
    record,
  };
};

export default function ${componentName}() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  ${usesWorkflowActions ? 'const [pendingId, setPendingId] = useState<string | null>(null);' : ''}
  ${capability.strategy === 'computed' ? 'const [summary, setSummary] = useState<WorkspaceSummary | null>(null);' : ''}
  const visible = items.filter(item => (item.name + ' ' + item.detail).toLowerCase().includes(query.toLowerCase()));
  ${usesWorkflowColumns ? 'const columns = [...new Set([...workflowStates, ...visible.map(item => item.status)])];' : ''}

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      ${capability.strategy === 'computed'
        && persistence === 'api' ? `const [response, summaryResponse] = await Promise.all([api.get('/api/${resourcePath}'), api.get('/api/${resourcePath}/insights/summary')]);`
        : `const response = await api.get('/api/${resourcePath}');`}
      const records = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      if (!Array.isArray(records)) throw new Error(${JSON.stringify(isPt ? 'Resposta inválida do servidor.' : 'Invalid server response.')});
      setItems(records.map(normalizeRecord));
      ${capability.strategy === 'computed' ? persistence === 'api' ? `const nextSummary = summaryResponse.data?.data ?? summaryResponse.data;
      if (!nextSummary || !Number.isFinite(nextSummary.total) || !nextSummary.byState || !nextSummary.numericTotals) throw new Error(${JSON.stringify(isPt ? 'Resumo inválido do servidor.' : 'Invalid server summary.')});
      setSummary(nextSummary);` : `const numericFields: string[] = ${JSON.stringify(fields.filter(field => field.kind === 'number' || field.kind === 'currency').map(field => field.name))};
      const nextSummary: WorkspaceSummary = { total: records.length, byState: {}, numericTotals: Object.fromEntries(numericFields.map(field => [field, 0])) };
      for (const record of records) {
        const state = String(record[stateField] || 'unknown');
        nextSummary.byState[state] = (nextSummary.byState[state] || 0) + 1;
        for (const field of numericFields) nextSummary.numericTotals[field] += Number(record[field] || 0);
      }
      setSummary(nextSummary);` : ''}
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ${JSON.stringify(isPt ? 'Não foi possível carregar os dados.' : 'Unable to load data.')});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  ${usesWorkflowActions ? `const updateState = async (item: WorkspaceItem, nextStatus: string) => {
    if (pendingId !== null || !(transitions[item.status] || []).includes(nextStatus)) return;
    setPendingId(item.id);
    setError('');
    try {
      const response = await api.${persistence === 'api' ? 'patch' : 'put'}('/api/${resourcePath}/' + encodeURIComponent(item.id)${persistence === 'api' ? " + '/status'" : ''}, ${persistence === 'api' ? '{ value: nextStatus }' : '{ [stateField]: nextStatus }'});
      const record = response.data?.data ?? response.data;
      if (!record || typeof record !== 'object' || String(record.id) !== item.id) throw new Error(${JSON.stringify(isPt ? 'Resposta inválida do servidor.' : 'Invalid server response.')});
      setItems(current => current.map(candidate => candidate.id === item.id
        ? normalizeRecord(record, current.indexOf(candidate))
        : candidate));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : ${JSON.stringify(isPt ? 'Não foi possível atualizar o registro.' : 'Unable to update record.')});
    } finally {
      setPendingId(null);
    }
  };` : ''}

  return (
    <div className="space-y-7" data-blueprint-screen=${JSON.stringify(screen.id)} data-layout=${JSON.stringify(screen.layout)}>
      ${header}
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-[var(--orus-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void refresh()} className="font-bold">${isPt ? 'Tentar novamente' : 'Try again'}</button></div>}
      <div className="flex items-center gap-3"><input value={query} onChange={event => setQuery(event.target.value)} placeholder=${JSON.stringify(isPt ? 'Filtrar este espaço...' : 'Filter this workspace...')} className="w-full rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--orus-primary))]"/><span className="whitespace-nowrap text-xs text-[rgb(var(--orus-text-muted))]">{visible.length} ${isPt ? 'itens' : 'items'}</span></div>
      {loading ? <div className="grid gap-4 md:grid-cols-3">{[0,1,2].map(item => <div key={item} className="h-40 animate-pulse rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))]" />)}</div> : visible.length === 0 ? <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-6 py-16 text-center"><p className="font-semibold">${isPt ? 'Nenhum registro encontrado' : 'No records found'}</p><Link to={'/' + resourcePath + '/new'} className="mt-3 inline-block text-sm font-bold text-[rgb(var(--orus-primary))]">${isPt ? 'Criar o primeiro registro' : 'Create the first record'}</Link></div> : ${body}}
    </div>
  );
}
    `.trim();
    return { path: 'frontend/src/pages', name: `${componentName}.tsx`, content, type: 'tsx' };
  }

  private generateBlueprintScreenHeader(screen: ProductScreen, isPt: boolean): string {
    const action = isPt ? 'Novo registro' : 'New record';
    if (['checkout', 'stepper', 'split-focus', 'billing', 'payment-operations'].includes(screen.layout)) {
      return `<header className="mx-auto max-w-4xl border-b border-[rgb(var(--orus-border))] pb-7 text-center"><p className="text-xs font-bold uppercase tracking-[.28em] text-[rgb(var(--orus-accent))]">{capabilityName}</p><h1 className="mt-4 font-display text-4xl font-bold text-[rgb(var(--orus-text))] sm:text-5xl">{screenTitle}</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">{screenPurpose}</p><Link to={'/' + resourcePath + '/new'} className="mt-6 inline-flex rounded-full bg-[rgb(var(--orus-primary))] px-6 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))]">${action}</Link></header>`;
    }
    if (['catalog', 'gallery', 'asset-library', 'immersive-canvas', 'automation-studio'].includes(screen.layout)) {
      return `<header className="relative isolate overflow-hidden rounded-[calc(var(--orus-radius)*1.5)] bg-[rgb(var(--orus-text))] px-6 py-10 text-[rgb(var(--orus-page))] sm:px-10"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[rgb(var(--orus-primary))] opacity-35 blur-3xl"/><div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-[rgb(var(--orus-primary-soft))]">{capabilityName}</p><h1 className="mt-4 max-w-3xl font-display text-4xl font-bold sm:text-6xl">{screenTitle}</h1><p className="mt-4 max-w-2xl text-sm leading-6 opacity-70">{screenPurpose}</p></div><Link to={'/' + resourcePath + '/new'} className="w-fit rounded-full bg-[rgb(var(--orus-primary))] px-6 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))]">${action}</Link></div></header>`;
    }
    return `<header className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.25)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6 sm:p-8"><div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[rgb(var(--orus-primary-soft))] to-transparent"/><div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[rgb(var(--orus-accent))]">{capabilityName}</p><h1 className="mt-3 font-display text-3xl font-bold text-[rgb(var(--orus-text))] sm:text-4xl">{screenTitle}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">{screenPurpose}</p></div><Link to={'/' + resourcePath + '/new'} className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] px-5 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))]">${action}</Link></div></header>`;
  }

  private generateBlueprintStrategyBody(screen: ProductScreen, capability: ProductCapability, isPt: boolean): string {
    if (screen.layout === 'calendar') {
      return `<section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,.55fr)]"><div className="overflow-hidden rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]"><div className="grid grid-cols-7 border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] text-center text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">{(${JSON.stringify(isPt ? ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])}).map(day => <span key={day} className="p-3">{day}</span>)}</div><div className="grid min-h-[420px] grid-cols-1 gap-px bg-[rgb(var(--orus-border))] md:grid-cols-2 xl:grid-cols-3">{visible.map(item => <article key={item.id} className="bg-[rgb(var(--orus-panel))] p-5 transition-colors hover:bg-[rgb(var(--orus-primary-soft))]"><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-accent))]">{item.record.scheduledAt ? new Date(item.record.scheduledAt).toLocaleString() : stateLabels[item.status] || item.status}</p><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="mt-3 block font-semibold">{item.name}</Link><p className="mt-2 text-xs leading-5 text-[rgb(var(--orus-text-muted))]">{item.detail}</p><div className="mt-4 flex flex-wrap gap-2">{(transitions[item.status] || []).map(nextStatus => <button key={nextStatus} type="button" disabled={pendingId !== null} onClick={() => void updateState(item, nextStatus)} className="text-xs font-bold text-[rgb(var(--orus-accent))] disabled:opacity-40">{stateLabels[nextStatus] || nextStatus} →</button>)}</div></article>)}</div></div><aside className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-text))] p-6 text-[rgb(var(--orus-page))]"><p className="text-xs font-bold uppercase tracking-[.2em] opacity-55">${isPt ? 'Agenda em foco' : 'Schedule focus'}</p><p className="mt-5 font-display text-5xl font-bold">{visible.length}</p><p className="mt-2 text-sm opacity-65">${isPt ? 'compromissos visíveis' : 'visible appointments'}</p><div className="mt-8 space-y-3">{Object.entries(visible.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {})).map(([status, count]) => <div key={status} className="flex justify-between border-b border-white/10 pb-3 text-sm"><span>{stateLabels[status] || status}</span><strong>{count}</strong></div>)}</div></aside></section>`;
    }
    if (screen.layout === 'conversation') {
      return `<section className="grid min-h-[560px] overflow-hidden rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] lg:grid-cols-[320px_1fr]"><aside className="border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] lg:border-b-0 lg:border-r"><div className="p-4 text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">${isPt ? 'Conversas' : 'Conversations'}</div>{visible.map((item, index) => <Link key={item.id} to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className={'block border-t border-[rgb(var(--orus-border))] p-4 ' + (index === 0 ? 'bg-[rgb(var(--orus-panel))]' : '')}><div className="flex items-center justify-between gap-3"><strong className="truncate text-sm">{item.name}</strong><span className="h-2 w-2 rounded-full bg-[rgb(var(--orus-accent))]"/></div><p className="mt-2 truncate text-xs text-[rgb(var(--orus-text-muted))]">{item.detail}</p></Link>)}</aside><div className="flex flex-col justify-between p-6 sm:p-8"><div>{visible[0] && <><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-accent))]">{stateLabels[visible[0].status] || visible[0].status}</p><h2 className="mt-3 font-display text-2xl font-bold">{visible[0].name}</h2><div className="mt-8 max-w-xl rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary-soft))] p-5 text-sm leading-6">{visible[0].detail}</div><div className="mt-5 flex flex-wrap gap-3">{(transitions[visible[0].status] || []).map(nextStatus => <button key={nextStatus} type="button" disabled={pendingId !== null} onClick={() => void updateState(visible[0], nextStatus)} className="text-xs font-bold text-[rgb(var(--orus-accent))] disabled:opacity-40">{stateLabels[nextStatus] || nextStatus} →</button>)}</div></>}</div><Link to={'/' + resourcePath + '/new'} className="mt-8 flex items-center justify-between rounded-full border border-[rgb(var(--orus-border))] px-5 py-3 text-sm text-[rgb(var(--orus-text-muted))]"><span>${isPt ? 'Escrever mensagem' : 'Write a message'}</span><span>→</span></Link></div></section>`;
    }
    if (screen.layout === 'catalog') {
      return `<section className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{visible.map((item, index) => <Link key={item.id} to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="group"><div className={'aspect-[4/3] rounded-[var(--orus-radius)] bg-gradient-to-br p-6 ' + (index % 3 === 0 ? 'from-[rgb(var(--orus-primary-soft))] to-[rgb(var(--orus-panel-muted))]' : index % 3 === 1 ? 'from-[rgb(var(--orus-panel-muted))] to-[rgb(var(--orus-primary-soft))]' : 'from-[rgb(var(--orus-primary))] to-[rgb(var(--orus-accent))]')}><span className="rounded-full bg-[rgb(var(--orus-panel))]/80 px-3 py-1 text-xs font-bold">{stateLabels[item.status] || item.status}</span></div><div className="mt-4 flex items-start justify-between gap-4"><div><h2 className="font-display text-lg font-bold group-hover:text-[rgb(var(--orus-primary))]">{item.name}</h2><p className="mt-1 text-sm text-[rgb(var(--orus-text-muted))]">{item.detail}</p></div>{typeof item.record.price === 'number' && <strong>{item.record.price.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}</strong>}</div></Link>)}</section>`;
    }
    if (['checkout', 'stepper'].includes(screen.layout)) {
      return `<section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_340px]"><div className="space-y-4">{visible.map((item, index) => <article key={item.id} className="flex gap-5 rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--orus-primary))] text-sm font-bold text-[rgb(var(--orus-on-primary))]">{index + 1}</span><div><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-accent))]">{stateLabels[item.status] || item.status}</p><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="mt-2 block font-semibold">{item.name}</Link><p className="mt-1 text-sm text-[rgb(var(--orus-text-muted))]">{item.detail}</p><div className="mt-3 flex flex-wrap gap-2">{(transitions[item.status] || []).map(nextStatus => <button key={nextStatus} type="button" disabled={pendingId !== null} onClick={() => void updateState(item, nextStatus)} className="text-xs font-bold text-[rgb(var(--orus-accent))] disabled:opacity-40">{stateLabels[nextStatus] || nextStatus} →</button>)}</div></div></article>)}</div><aside className="h-fit rounded-[var(--orus-radius)] bg-[rgb(var(--orus-text))] p-6 text-[rgb(var(--orus-page))]"><p className="text-xs font-bold uppercase tracking-[.2em] opacity-55">${isPt ? 'Resumo' : 'Summary'}</p><p className="mt-6 font-display text-4xl font-bold">{visible.length}</p><p className="mt-2 text-sm opacity-65">${isPt ? 'etapas e registros' : 'steps and records'}</p><Link to={'/' + resourcePath + '/new'} className="mt-8 block rounded-full bg-[rgb(var(--orus-primary))] px-5 py-3 text-center text-sm font-bold text-[rgb(var(--orus-on-primary))]">${isPt ? 'Continuar' : 'Continue'}</Link></aside></section>`;
    }
    if (screen.layout === 'timeline') {
      return `<section className="mx-auto max-w-4xl"><div className="relative border-l border-[rgb(var(--orus-border))] pl-8">{visible.map(item => <article key={item.id} className="relative mb-8 block rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5"><span className="absolute -left-[2.55rem] top-6 h-4 w-4 rounded-full border-4 border-[rgb(var(--orus-page))] bg-[rgb(var(--orus-primary))]"/><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-accent))]">{stateLabels[item.status] || item.status}</p><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="mt-2 block font-semibold">{item.name}</Link><p className="mt-2 text-sm text-[rgb(var(--orus-text-muted))]">{item.detail}</p><div className="mt-4 flex flex-wrap gap-3">{(transitions[item.status] || []).map(nextStatus => <button key={nextStatus} type="button" disabled={pendingId !== null} onClick={() => void updateState(item, nextStatus)} className="text-xs font-bold text-[rgb(var(--orus-accent))] disabled:opacity-40">{stateLabels[nextStatus] || nextStatus} →</button>)}</div></article>)}</div></section>`;
    }
    if (screen.layout === 'permission-matrix') {
      return `<section className="overflow-hidden rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]"><div className="grid grid-cols-[minmax(180px,1fr)_repeat(3,minmax(90px,.35fr))] bg-[rgb(var(--orus-panel-muted))] p-4 text-xs font-bold uppercase tracking-wider"><span>${isPt ? 'Papel' : 'Role'}</span><span>${isPt ? 'Visualizar' : 'View'}</span><span>${isPt ? 'Editar' : 'Edit'}</span><span>${isPt ? 'Administrar' : 'Manage'}</span></div>{visible.map((item, index) => <Link key={item.id} to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="grid grid-cols-[minmax(180px,1fr)_repeat(3,minmax(90px,.35fr))] items-center border-t border-[rgb(var(--orus-border))] p-4 text-sm"><strong>{item.name}</strong>{[0,1,2].map(level => <span key={level} className={'mx-auto h-5 w-5 rounded-full border ' + (index <= level ? 'border-[rgb(var(--orus-primary))] bg-[rgb(var(--orus-primary))]' : 'border-[rgb(var(--orus-border))]')}/>)}</Link>)}</section>`;
    }
    if (['billing', 'payment-operations'].includes(screen.layout)) {
      return `<section className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]"><aside className="rounded-[var(--orus-radius)] bg-gradient-to-br from-[rgb(var(--orus-primary))] to-[rgb(var(--orus-accent))] p-7 text-[rgb(var(--orus-on-primary))]"><p className="text-xs font-bold uppercase tracking-[.2em] opacity-70">${isPt ? 'Operação financeira' : 'Financial operation'}</p><p className="mt-5 font-display text-5xl font-bold">{visible.length}</p><p className="mt-2 text-sm opacity-70">${isPt ? 'registros acompanhados' : 'tracked records'}</p></aside><div className="overflow-hidden rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]">{visible.map(item => <article key={item.id} className="flex items-center justify-between gap-5 border-b border-[rgb(var(--orus-border))] p-5 last:border-0"><div><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="font-bold">{item.name}</Link><p className="mt-1 text-xs text-[rgb(var(--orus-text-muted))]">{item.detail}</p>${capability.strategy === 'workflow' ? `<div className="mt-3 flex flex-wrap gap-2">{(transitions[item.status] || []).map(nextStatus => <button key={nextStatus} type="button" disabled={pendingId !== null} onClick={() => void updateState(item, nextStatus)} className="text-xs font-bold text-[rgb(var(--orus-accent))] disabled:opacity-40">{stateLabels[nextStatus] || nextStatus} →</button>)}</div>` : ''}</div><span className="rounded-full bg-[rgb(var(--orus-primary-soft))] px-3 py-1 text-xs font-bold text-[rgb(var(--orus-primary))]">{stateLabels[item.status] || item.status}</span></article>)}</div></section>`;
    }
    if (screen.layout === 'integration-hub') {
      return `<section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visible.map((item, index) => <article key={item.id} className="relative overflow-hidden rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><span className={'absolute right-5 top-5 h-3 w-3 rounded-full ' + (['active','connected','enabled'].includes(item.status) ? 'bg-emerald-500' : 'bg-amber-400')}/><div className={'flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ' + (index % 2 === 0 ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-primary))]' : 'bg-[rgb(var(--orus-panel-muted))] text-[rgb(var(--orus-accent))]')}>{item.name.slice(0, 1).toUpperCase()}</div><h2 className="mt-5 font-display text-xl font-bold">{item.name}</h2><p className="mt-2 min-h-10 text-sm text-[rgb(var(--orus-text-muted))]">{item.detail}</p><div className="mt-6 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider">{stateLabels[item.status] || item.status}</span><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id) + '/edit'} className="rounded-full border border-[rgb(var(--orus-border))] px-4 py-2 text-xs font-bold">${isPt ? 'Configurar' : 'Configure'}</Link></div></article>)}</section>`;
    }
    if (capability.strategy === 'workflow') {
      return `<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{columns.map(status => <article key={status} className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-4"><div className="mb-4 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wider">{stateLabels[status] || status}</h2><span className="rounded-full bg-[rgb(var(--orus-panel))] px-2 py-1 text-xs">{visible.filter(item => item.status === status).length}</span></div><div className="space-y-3">{visible.filter(item => item.status === status).map(item => <div key={item.id} className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-4"><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="font-semibold">{item.name}</Link><p className="mt-2 text-xs leading-5 text-[rgb(var(--orus-text-muted))]">{item.detail}</p><div className="mt-4 flex flex-wrap gap-3">{(transitions[item.status] || []).map(nextStatus => <button key={nextStatus} type="button" disabled={pendingId !== null} onClick={() => void updateState(item, nextStatus)} className="text-xs font-bold text-[rgb(var(--orus-accent))] disabled:opacity-40">{stateLabels[nextStatus] || nextStatus} →</button>)}<Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id) + '/edit'} className="text-xs font-semibold">${isPt ? 'Editar' : 'Edit'}</Link></div></div>)}</div></article>)}</section>`;
    }
    if (capability.strategy === 'computed') {
      return `<section className="space-y-5"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><article className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><p className="text-xs uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">${isPt ? 'Registros consolidados' : 'Consolidated records'}</p><p className="mt-4 font-display text-3xl font-bold">{summary?.total ?? 0}</p></article>{Object.entries(summary?.numericTotals ?? {}).map(([field, value]) => <article key={field} className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><p className="text-xs uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">{field}</p><p className="mt-4 font-display text-3xl font-bold">{value.toLocaleString()}</p></article>)}</div><div className="grid gap-4 md:grid-cols-2">{Object.entries(summary?.byState ?? {}).map(([status, count]) => <article key={status} className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5"><div className="flex justify-between"><span>{stateLabels[status] || status}</span><strong>{count}</strong></div><progress aria-label={stateLabels[status] || status} value={count} max={Math.max(summary?.total ?? 0, 1)} className="mt-4 h-3 w-full accent-[rgb(var(--orus-primary))]" /></article>)}</div></section>`;
    }
    if (capability.strategy === 'integration') {
      return `<section className="grid gap-4 md:grid-cols-2">{visible.map(item => <article key={item.id} className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5"><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="font-semibold">{item.name}</Link><p className="mt-2 text-sm text-[rgb(var(--orus-text-muted))]">{item.detail}</p><p className="mt-3 text-xs">{stateLabels[item.status] || item.status}</p><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id) + '/edit'} className="mt-6 inline-block rounded-full bg-[rgb(var(--orus-primary-soft))] px-4 py-2 text-xs font-bold text-[rgb(var(--orus-primary))]">${isPt ? 'Editar registro' : 'Edit record'}</Link></article>)}</section>`;
    }
    if (capability.strategy === 'content') {
      return `<section className="grid auto-rows-[180px] gap-4 md:grid-cols-3">{visible.map((item, index) => <Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} key={item.id} className={'relative overflow-hidden rounded-[var(--orus-radius)] p-6 text-white ' + (index % 3 === 0 ? 'md:col-span-2 bg-gradient-to-br from-slate-950 to-[rgb(var(--orus-primary))]' : 'bg-gradient-to-br from-[rgb(var(--orus-primary))] to-[rgb(var(--orus-accent))]')}><p className="text-xs font-bold uppercase tracking-wider opacity-65">{capabilityName}</p><div className="absolute inset-x-6 bottom-6"><h2 className="text-xl font-bold">{item.name}</h2><p className="mt-1 text-xs opacity-70">{item.detail}</p></div></Link>)}</section>`;
    }
    return `<section className="overflow-x-auto rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]"><table className="w-full text-left text-sm"><thead className="bg-[rgb(var(--orus-panel-muted))]"><tr><th className="p-4">${isPt ? 'Nome' : 'Name'}</th><th className="p-4">${isPt ? 'Contexto' : 'Context'}</th><th className="p-4">${isPt ? 'Estado' : 'State'}</th><th className="p-4">${isPt ? 'Ações' : 'Actions'}</th></tr></thead><tbody>{visible.map(item => <tr key={item.id} className="border-t border-[rgb(var(--orus-border))]"><td className="p-4"><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="font-semibold">{item.name}</Link></td><td className="p-4">{item.detail}</td><td className="p-4">{stateLabels[item.status] || item.status}</td><td className="p-4"><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id) + '/edit'} className="font-semibold text-[rgb(var(--orus-primary))]">${isPt ? 'Editar' : 'Edit'}</Link></td></tr>)}</tbody></table></section>`;
  }

  private entityLabel(entity: string, locale: VisualIntent['locale'], plural = false): string {
    const key = entity.toLowerCase();
    const pt: Record<string, [string, string]> = {
      appointment: ['Atendimento', 'Atendimentos'],
      schedule: ['Agendamento', 'Agenda'],
      patient: ['Paciente', 'Pacientes'],
      doctor: ['Profissional', 'Profissionais'],
      medication: ['Medicamento', 'Medicamentos'],
      prescription: ['Prescrição', 'Prescrições'],
      task: ['Tarefa', 'Tarefas'],
      project: ['Projeto', 'Projetos'],
      user: ['Usuário', 'Usuários'],
      customer: ['Cliente', 'Clientes'],
      client: ['Cliente', 'Clientes'],
      product: ['Produto', 'Produtos'],
      order: ['Pedido', 'Pedidos'],
      invoice: ['Fatura', 'Faturas'],
      transaction: ['Transação', 'Transações'],
      report: ['Relatório', 'Relatórios'],
      team: ['Equipe', 'Equipes'],
      contact: ['Contato', 'Contatos'],
      company: ['Empresa', 'Empresas'],
      deal: ['Negócio', 'Negócios'],
      lead: ['Lead', 'Leads'],
      item: ['Item', 'Itens'],
    };
    if (locale === 'pt-BR' && pt[key]) return pt[key]![plural ? 1 : 0];
    const singular = this.capitalize(entity);
    return plural ? `${singular}s` : singular;
  }
  /**
   * Generate List Component — polished with search, skeleton, empty state
   * ✅ FIX J (restored)
   */
  private generateListComponent(entity: string, visualIntent: VisualIntent): GeneratedUIFile {
    if (visualIntent.archetype === 'crm' && entity.toLowerCase() === 'deal') {
      return this.generateDealPipelineComponent(visualIntent.locale);
    }
    if (visualIntent.archetype === 'healthcare' && ['appointment', 'schedule'].includes(entity.toLowerCase())) {
      return this.generateAppointmentAgendaComponent(entity, visualIntent.locale);
    }
    if (visualIntent.archetype === 'commerce' && entity.toLowerCase() === 'product') {
      return this.generateProductCatalogComponent(visualIntent.locale);
    }
    if (visualIntent.archetype === 'finance' && entity.toLowerCase() === 'transaction') {
      return this.generateTransactionLedgerComponent(visualIntent.locale);
    }
    if (visualIntent.archetype === 'creative' && entity.toLowerCase() === 'project') {
      return this.generateProjectGalleryComponent(visualIntent.locale);
    }
    const locale = visualIntent.locale;
    const Entity = this.capitalize(entity);
    const resourcePath = toResourcePath(entity);
    const entitySingular = this.entityLabel(entity, locale);
    const entityPlural = this.entityLabel(entity, locale, true);
    const copy = locale === 'pt-BR'
      ? { search: `Buscar ${entityPlural.toLowerCase()}...`, empty: `Nenhum ${entitySingular.toLowerCase()} encontrado`, retry: 'Tente outro termo de busca', start: `Cadastre o primeiro ${entitySingular.toLowerCase()} para começar`, create: `Cadastrar ${entitySingular.toLowerCase()}` }
      : { search: `Search ${entityPlural.toLowerCase()}...`, empty: `No ${entityPlural.toLowerCase()} found`, retry: 'Try a different search term', start: `Create your first ${entitySingular.toLowerCase()} to get started`, create: `Create first ${entitySingular}` };
    const collectionClass = visualIntent.experience.layout === 'dense-rail'
      ? 'grid grid-cols-1 gap-3'
      : visualIntent.experience.layout === 'editorial-stack'
        ? 'grid grid-cols-1 md:grid-cols-2 gap-8'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5';
    const content = `
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { use${Entity}s } from '../hooks/useApi';
import ${Entity}Card from './${Entity}Card';
import { ${Entity} } from '../types/${entity}.types';

export default function ${Entity}List() {
  const { data: ${entity}s, loading } = use${Entity}s();
  const [search, setSearch] = useState('');

  const filtered = (${entity}s || []).filter((item: ${Entity}) =>
    item.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="${copy.search}"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="font-medium text-gray-900">${copy.empty}</p>
          <p className="text-sm text-gray-500 mt-1">{search ? '${copy.retry}' : '${copy.start}'}</p>
          {!search && (
            <Link to="/${resourcePath}/new" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
              ${copy.create}
            </Link>
          )}
        </div>
      ) : (
        <div className="${collectionClass}">
          {filtered.map((${entity}: ${Entity}) => (
            <${Entity}Card key={${entity}.id} ${entity}={${entity}} />
          ))}
        </div>
      )}
    </div>
  );
}
    `.trim();
    return { path: 'frontend/src/components', name: `${Entity}List.tsx`, content, type: 'tsx' };
  }

  private generateDealPipelineComponent(locale: VisualIntent['locale']): GeneratedUIFile {
    const isPt = locale === 'pt-BR';
    const content = `
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeals } from '../hooks/useApi';
import { Deal } from '../types/deal.types';

const stages = [
  ['lead', '${isPt ? 'Entrada' : 'Lead'}'],
  ['qualification', '${isPt ? 'Qualificação' : 'Qualification'}'],
  ['proposal', '${isPt ? 'Proposta' : 'Proposal'}'],
  ['negotiation', '${isPt ? 'Negociação' : 'Negotiation'}'],
  ['won', '${isPt ? 'Ganho' : 'Won'}'],
  ['lost', '${isPt ? 'Perdido' : 'Lost'}'],
] as const;

export default function DealList() {
  const { data: deals, loading } = useDeals();
  const [search, setSearch] = useState('');
  const filtered = (deals || []).filter((deal: Deal) => deal.name.toLowerCase().includes(search.toLowerCase()));
  const currency = new Intl.NumberFormat('${isPt ? 'pt-BR' : 'en-US'}', { style: 'currency', currency: '${isPt ? 'BRL' : 'USD'}', maximumFractionDigits: 0 });

  if (loading) return <div className="grid min-h-64 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[rgb(var(--orus-primary))] border-t-transparent"/></div>;

  return <div className="space-y-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[rgb(var(--orus-accent))]">${isPt ? 'Pipeline comercial' : 'Sales pipeline'}</p><p className="mt-1 text-sm text-[rgb(var(--orus-text-muted))]">${isPt ? 'Arraste a estratégia; avance cada oportunidade com contexto.' : 'Move every opportunity forward with context.'}</p></div><input value={search} onChange={event => setSearch(event.target.value)} placeholder="${isPt ? 'Buscar oportunidade...' : 'Search opportunities...'}" className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 py-2.5 text-sm outline-none focus:border-[rgb(var(--orus-primary))]"/></div>
    <div className="grid gap-3 overflow-x-auto pb-3 xl:grid-cols-6">{stages.map(([stage, label]) => { const stageDeals = filtered.filter((deal: Deal) => deal.stage === stage); const total = stageDeals.reduce((sum: number, deal: Deal) => sum + Number(deal.value || 0), 0); return <section key={stage} className="min-w-[220px] rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-3"><header className="mb-3 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider">{label}</p><p className="mt-1 text-[11px] text-[rgb(var(--orus-text-muted))]">{currency.format(total)}</p></div><span className="rounded-full bg-[rgb(var(--orus-panel))] px-2 py-0.5 text-xs font-bold">{stageDeals.length}</span></header><div className="space-y-2">{stageDeals.map((deal: Deal) => <Link key={deal.id} to={'/deals/' + deal.id} className="block rounded-[calc(var(--orus-radius)*.8)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgb(var(--orus-primary))]"><p className="text-sm font-semibold">{deal.name}</p><p className="mt-3 font-display text-lg font-bold text-[rgb(var(--orus-primary))]">{currency.format(Number(deal.value || 0))}</p><div className="mt-2 flex justify-between text-[11px] text-[rgb(var(--orus-text-muted))]"><span>{deal.probability || 0}%</span><span>{deal.status || '${isPt ? 'em andamento' : 'active'}'}</span></div></Link>)}{stageDeals.length === 0 && <div className="rounded-[calc(var(--orus-radius)*.8)] border border-dashed border-[rgb(var(--orus-border))] px-3 py-8 text-center text-xs text-[rgb(var(--orus-text-muted))]">${isPt ? 'Sem oportunidades' : 'No opportunities'}</div>}</div></section>; })}</div>
  </div>;
}`.trim();
    return { path: 'frontend/src/components', name: 'DealList.tsx', content, type: 'tsx' };
  }

  private generateAppointmentAgendaComponent(entity: string, locale: VisualIntent['locale']): GeneratedUIFile {
    const Entity = this.capitalize(entity);
    const resourcePath = toResourcePath(entity);
    const isPt = locale === 'pt-BR';
    const timeField = entity.toLowerCase() === 'appointment' ? 'scheduledAt' : 'createdAt';
    const content = `
import { Link } from 'react-router-dom';
import { use${Entity}s } from '../hooks/useApi';
import { ${Entity} } from '../types/${entity}.types';

export default function ${Entity}List() {
  const { data: items, loading } = use${Entity}s();
  const agenda = [...(items || [])].sort((a: ${Entity}, b: ${Entity}) => new Date(a.${timeField} || 0).getTime() - new Date(b.${timeField} || 0).getTime());
  if (loading) return <div className="grid min-h-64 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[rgb(var(--orus-primary))] border-t-transparent"/></div>;
  return <div className="grid gap-5 lg:grid-cols-[180px_1fr]"><aside className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] p-5 text-[rgb(var(--orus-on-primary))]"><p className="text-xs font-bold uppercase tracking-[.2em] opacity-65">${isPt ? 'Agenda clínica' : 'Care schedule'}</p><p className="mt-5 font-display text-4xl font-bold">{agenda.length}</p><p className="mt-1 text-sm opacity-70">${isPt ? 'atendimentos' : 'appointments'}</p><div className="mt-8 h-px bg-white/20"/><p className="mt-5 text-xs leading-5 opacity-75">${isPt ? 'Horários, profissionais e situação do cuidado em uma única linha do tempo.' : 'Times, professionals and care status in one timeline.'}</p></aside><section className="space-y-3">{agenda.map((item: ${Entity}) => <Link key={item.id} to={'/${resourcePath}/' + item.id} className="grid gap-4 rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-4 transition hover:border-[rgb(var(--orus-primary))] sm:grid-cols-[90px_1fr_auto] sm:items-center"><div><p className="font-display text-lg font-bold text-[rgb(var(--orus-primary))]">{new Date(item.${timeField} || Date.now()).toLocaleTimeString('${isPt ? 'pt-BR' : 'en-US'}', { hour: '2-digit', minute: '2-digit' })}</p><p className="text-[11px] text-[rgb(var(--orus-text-muted))]">{new Date(item.${timeField} || Date.now()).toLocaleDateString('${isPt ? 'pt-BR' : 'en-US'}')}</p></div><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-[rgb(var(--orus-text-muted))]">{'professional' in item ? String(item.professional || '${isPt ? 'Profissional a definir' : 'Professional pending'}') : '${isPt ? 'Agenda organizada' : 'Organized schedule'}'}</p></div><span className="rounded-full bg-[rgb(var(--orus-primary-soft))] px-3 py-1 text-xs font-semibold text-[rgb(var(--orus-primary))]">{item.status || '${isPt ? 'agendado' : 'scheduled'}'}</span></Link>)}{agenda.length === 0 && <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] p-12 text-center text-sm text-[rgb(var(--orus-text-muted))]">${isPt ? 'A agenda está livre.' : 'The schedule is clear.'}</div>}</section></div>;
}`.trim();
    return { path: 'frontend/src/components', name: `${Entity}List.tsx`, content, type: 'tsx' };
  }

  private generateProductCatalogComponent(locale: VisualIntent['locale']): GeneratedUIFile {
    const isPt = locale === 'pt-BR';
    const content = `import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useApi';
import { Product } from '../types/product.types';

export default function ProductList() {
  const { data: products, loading } = useProducts();
  const [search, setSearch] = useState('');
  const visible = (products || []).filter((product: Product) => product.name.toLowerCase().includes(search.toLowerCase()));
  const currency = new Intl.NumberFormat('${isPt ? 'pt-BR' : 'en-US'}', { style: 'currency', currency: '${isPt ? 'BRL' : 'USD'}' });
  if (loading) return <div className="grid min-h-64 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[rgb(var(--orus-primary))] border-t-transparent"/></div>;
  return <div className="space-y-7"><header className="flex flex-col gap-4 rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] p-6 text-[rgb(var(--orus-on-primary))] md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.24em] opacity-70">${isPt ? 'Curadoria de catálogo' : 'Catalog curation'}</p><h2 className="mt-2 font-display text-3xl font-bold">${isPt ? 'Produtos que merecem destaque' : 'Products worth discovering'}</h2><p className="mt-2 max-w-xl text-sm opacity-75">${isPt ? 'Estoque, preço e disponibilidade em uma vitrine operacional.' : 'Stock, price and availability in an operational storefront.'}</p></div><input value={search} onChange={event => setSearch(event.target.value)} placeholder="${isPt ? 'Buscar no catálogo...' : 'Search catalog...'}" className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm placeholder:text-white/60 outline-none focus:bg-white/20"/></header><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{visible.map((product: Product, index: number) => <Link key={product.id} to={'/products/' + product.id} className="group overflow-hidden rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]"><div className="relative aspect-[4/3] bg-gradient-to-br from-[rgb(var(--orus-primary-soft))] to-[rgb(var(--orus-panel-muted))]"><span className="absolute left-4 top-4 rounded-full bg-[rgb(var(--orus-panel))] px-3 py-1 text-[11px] font-bold uppercase tracking-wider">{product.status}</span><span className="absolute bottom-4 right-4 font-display text-5xl font-bold text-[rgb(var(--orus-primary))]/20">{String(index + 1).padStart(2, '0')}</span></div><div className="p-5"><p className="text-xs uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">{product.sku}</p><h3 className="mt-2 text-lg font-bold group-hover:text-[rgb(var(--orus-primary))]">{product.name}</h3><div className="mt-5 flex items-end justify-between"><strong className="font-display text-xl">{currency.format(Number(product.price || 0))}</strong><span className="text-xs text-[rgb(var(--orus-text-muted))]">{product.stock || 0} ${isPt ? 'em estoque' : 'in stock'}</span></div></div></Link>)}{visible.length === 0 && <div className="col-span-full rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] p-16 text-center text-sm text-[rgb(var(--orus-text-muted))]">${isPt ? 'Nenhum produto encontrado.' : 'No products found.'}</div>}</div></div>;
}`;
    return { path: 'frontend/src/components', name: 'ProductList.tsx', content, type: 'tsx' };
  }

  private generateTransactionLedgerComponent(locale: VisualIntent['locale']): GeneratedUIFile {
    const isPt = locale === 'pt-BR';
    const content = `import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../hooks/useApi';
import { Transaction } from '../types/transaction.types';

export default function TransactionList() {
  const { data: transactions, loading } = useTransactions();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const visible = (transactions || []).filter((item: Transaction) => filter === 'all' || item.type === filter);
  const balance = visible.reduce((sum: number, item: Transaction) => sum + (item.type === 'expense' ? -Number(item.amount || 0) : Number(item.amount || 0)), 0);
  const money = new Intl.NumberFormat('${isPt ? 'pt-BR' : 'en-US'}', { style: 'currency', currency: '${isPt ? 'BRL' : 'USD'}' });
  if (loading) return <div className="grid min-h-64 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[rgb(var(--orus-primary))] border-t-transparent"/></div>;
  return <div className="grid gap-5 xl:grid-cols-[280px_1fr]"><aside className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-text))] p-6 text-[rgb(var(--orus-page))]"><p className="text-xs font-bold uppercase tracking-[.22em] opacity-55">${isPt ? 'Saldo do período' : 'Period balance'}</p><p className="mt-4 font-display text-4xl font-bold">{money.format(balance)}</p><div className="mt-8 space-y-2">{(['all','income','expense'] as const).map(value => <button key={value} onClick={() => setFilter(value)} className={'w-full rounded-xl px-4 py-3 text-left text-sm transition ' + (filter === value ? 'bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))]' : 'hover:bg-white/10')}>{value === 'all' ? '${isPt ? 'Todos os lançamentos' : 'All transactions'}' : value === 'income' ? '${isPt ? 'Entradas' : 'Income'}' : '${isPt ? 'Saídas' : 'Expenses'}'}</button>)}</div></aside><section className="overflow-hidden rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]"><header className="flex items-center justify-between border-b border-[rgb(var(--orus-border))] px-5 py-4"><div><h3 className="font-bold">${isPt ? 'Livro de movimentações' : 'Transaction ledger'}</h3><p className="text-xs text-[rgb(var(--orus-text-muted))]">{visible.length} ${isPt ? 'lançamentos conciliáveis' : 'reconcilable entries'}</p></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"/></header><div className="divide-y divide-[rgb(var(--orus-border))]">{visible.map((item: Transaction) => <Link key={item.id} to={'/transactions/' + item.id} className="grid gap-3 px-5 py-4 transition hover:bg-[rgb(var(--orus-panel-muted))] sm:grid-cols-[1fr_140px_120px] sm:items-center"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-[rgb(var(--orus-text-muted))]">{item.category || '${isPt ? 'Sem categoria' : 'Uncategorized'}'} · {new Date(item.occurredAt).toLocaleDateString('${isPt ? 'pt-BR' : 'en-US'}')}</p></div><strong className={item.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}>{item.type === 'expense' ? '−' : '+'}{money.format(Number(item.amount || 0))}</strong><span className="rounded-full bg-[rgb(var(--orus-primary-soft))] px-3 py-1 text-center text-xs text-[rgb(var(--orus-primary))]">{item.status}</span></Link>)}</div></section></div>;
}`;
    return { path: 'frontend/src/components', name: 'TransactionList.tsx', content, type: 'tsx' };
  }

  private generateProjectGalleryComponent(locale: VisualIntent['locale']): GeneratedUIFile {
    const isPt = locale === 'pt-BR';
    const content = `import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useApi';
import { Project } from '../types/project.types';

export default function ProjectList() {
  const { data: projects, loading } = useProjects();
  if (loading) return <div className="grid min-h-64 place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-[rgb(var(--orus-primary))] border-t-transparent"/></div>;
  return <div className="space-y-8"><header className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.28em] text-[rgb(var(--orus-accent))]">${isPt ? 'Portfólio em movimento' : 'Work in motion'}</p><h2 className="mt-3 font-display text-4xl font-bold leading-tight">${isPt ? 'Projetos com ritmo, contexto e direção.' : 'Projects with rhythm, context and direction.'}</h2></header><div className="grid gap-6 md:grid-cols-2">{(projects || []).map((project: Project, index: number) => <Link key={project.id} to={'/projects/' + project.id} className={'group relative min-h-[300px] overflow-hidden rounded-[var(--orus-radius)] p-7 text-white ' + (index % 3 === 0 ? 'md:col-span-2 bg-gradient-to-br from-slate-950 via-violet-950 to-fuchsia-700' : index % 3 === 1 ? 'bg-gradient-to-br from-blue-950 to-cyan-600' : 'bg-gradient-to-br from-zinc-900 to-orange-600')}><span className="text-xs font-bold uppercase tracking-[.2em] opacity-60">{project.status}</span><div className="absolute inset-x-7 bottom-7"><h3 className="font-display text-3xl font-bold transition group-hover:translate-x-2">{project.name}</h3><p className="mt-2 max-w-xl text-sm text-white/70">{project.description || '${isPt ? 'Projeto autoral em desenvolvimento.' : 'Creative project in progress.'}'}</p><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white" style={{ width: Math.min(100, Number(project.progress || 0)) + '%' }}/></div><p className="mt-2 text-xs text-white/60">{project.progress || 0}% ${isPt ? 'concluído' : 'complete'}</p></div></Link>)}</div></div>;
}`;
    return { path: 'frontend/src/components', name: 'ProjectList.tsx', content, type: 'tsx' };
  }

  /**
   * Generate Form Component — polished with navigate, error, loading
   * ✅ FIX I (restored)
   */
  private generateFormComponent(entity: string, locale: VisualIntent['locale']): GeneratedUIFile {
    const Entity = this.capitalize(entity);
    const resourcePath = toResourcePath(entity);
    const entityLabel = this.entityLabel(entity, locale);
    const fields = getEntityFields(entity);
    const initialState = fields.map(field => {
      const fallback = field.defaultValue !== undefined ? JSON.stringify(field.defaultValue) : field.tsType === 'number' ? '0' : "''";
      return `${field.name}: ${fallback}`;
    }).join(', ');
    const loadedState = fields.map(field => {
      const fallback = field.defaultValue !== undefined ? JSON.stringify(field.defaultValue) : field.tsType === 'number' ? '0' : "''";
      const value = field.kind === 'datetime'
        ? `item.${field.name} ? String(item.${field.name}).slice(0, 16) : ${fallback}`
        : field.kind === 'date'
          ? `item.${field.name} ? String(item.${field.name}).slice(0, 10) : ${fallback}`
          : `item.${field.name} ?? ${fallback}`;
      return `${field.name}: ${value}`;
    }).join(', ');
    const formFields = fields.map(field => this.generateFormField(field, locale)).join('\n');
    const relationFields = fields.filter(field => field.kind === 'relation' && field.relationTo);
    const relationLoads = relationFields.map(field => `api.get('/api/${toResourcePath(field.relationTo!)}').then(res => ['${field.name}', res.data?.data ?? []] as const)`).join(',\n      ');
    const copy = locale === 'pt-BR'
      ? { error: 'Não foi possível salvar. Tente novamente.', loadError: 'Não foi possível carregar o registro.', name: 'Nome', namePlaceholder: 'Digite o nome...', description: 'Descrição', descriptionPlaceholder: 'Adicione uma descrição...', status: 'Status', active: 'Ativo', pending: 'Pendente', inactive: 'Inativo', loading: 'Carregando...', saving: 'Salvando...', save: `Salvar ${entityLabel}`, cancel: 'Cancelar' }
      : { error: 'Something went wrong. Please try again.', loadError: 'Could not load this record.', name: 'Name', namePlaceholder: 'Enter a name...', description: 'Description', descriptionPlaceholder: 'Add a description...', status: 'Status', active: 'Active', pending: 'Pending', inactive: 'Inactive', loading: 'Loading...', saving: 'Saving...', save: `Save ${entityLabel}`, cancel: 'Cancel' };
    const content = `
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

export default function ${Entity}Form() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({ ${initialState} });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  ${relationFields.length > 0 ? "const [relationOptions, setRelationOptions] = useState<Record<string, Array<{ id: string; name: string }>>>({});" : ''}

  ${relationFields.length > 0 ? `useEffect(() => {
    Promise.all([
      ${relationLoads}
    ]).then(entries => setRelationOptions(Object.fromEntries(entries))).catch(() => undefined);
  }, []);` : ''}

  useEffect(() => {
    if (!id) return;
    api.get('/api/${resourcePath}/' + id)
      .then(res => {
        const item = res.data?.data ?? res.data;
        setFormData({ ${loadedState} });
      })
      .catch(() => setError('${copy.loadError}'))
      .finally(() => setInitialLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === 'number'
      ? Number(e.target.value)
      : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (id) await api.put('/api/${resourcePath}/' + id, formData);
      else await api.post('/api/${resourcePath}', formData);
      navigate('/${resourcePath}');
    } catch (err: any) {
      setError(err.response?.data?.message || '${copy.error}');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="py-8 text-center text-sm text-gray-500">${copy.loading}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
${formFields}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
          {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {loading ? '${copy.saving}' : '${copy.save}'}
        </button>
        <button type="button" onClick={() => navigate(-1)}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
          ${copy.cancel}
        </button>
      </div>
    </form>
  );
}
    `.trim();
    return { path: 'frontend/src/components', name: `${Entity}Form.tsx`, content, type: 'tsx' };
  }

  private generateFormField(field: DomainField, locale: VisualIntent['locale']): string {
    const label = locale === 'pt-BR' ? field.pt : field.en;
    const placeholder = locale === 'pt-BR' ? field.placeholderPt : field.placeholderEn;
    const required = field.required ? ' required' : '';
    const commonClass = 'w-full px-4 py-2.5 border border-[rgb(var(--orus-border))] rounded-xl bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] transition';
    if (field.kind === 'relation' && field.relationTo) {
      const emptyLabel = locale === 'pt-BR' ? `Selecione ${field.pt.toLowerCase()}` : `Select ${field.en.toLowerCase()}`;
      return `      <div><label className="block text-sm font-medium mb-1.5">${label}${field.required ? ' <span className="text-red-500">*</span>' : ''}</label><select name="${field.name}" value={formData.${field.name}} onChange={handleChange}${required} className="${commonClass}"><option value="">${emptyLabel}</option>{(relationOptions.${field.name} || []).map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></div>`;
    }
    if (field.options?.length) {
      const options = field.options.map(item => `          <option value="${item.value}">${locale === 'pt-BR' ? item.pt : item.en}</option>`).join('\n');
      return `      <div><label className="block text-sm font-medium mb-1.5">${label}${field.required ? ' <span className="text-red-500">*</span>' : ''}</label><select name="${field.name}" value={formData.${field.name}} onChange={handleChange}${required} className="${commonClass}">\n${options}\n        </select></div>`;
    }
    if (field.kind === 'textarea') {
      return `      <div><label className="block text-sm font-medium mb-1.5">${label}${field.required ? ' <span className="text-red-500">*</span>' : ''}</label><textarea name="${field.name}" value={formData.${field.name}} onChange={handleChange} rows={4}${required} placeholder="${placeholder || ''}" className="${commonClass} resize-none" /></div>`;
    }
    const inputType: Record<DomainField['kind'], string> = {
      text: 'text', textarea: 'text', email: 'email', phone: 'tel', url: 'url', number: 'number', currency: 'number', date: 'date', datetime: 'datetime-local', relation: 'text', select: 'text',
    };
    const step = field.kind === 'currency' ? ' step="0.01" min="0"' : field.kind === 'number' ? ' step="1" min="0"' : '';
    return `      <div><label className="block text-sm font-medium mb-1.5">${label}${field.required ? ' <span className="text-red-500">*</span>' : ''}</label><input type="${inputType[field.kind]}" name="${field.name}" value={formData.${field.name}} onChange={handleChange}${required}${step} placeholder="${placeholder || ''}" className="${commonClass}" /></div>`;
  }

  /**
   * Generate Card Component — polished with hover, status badge, actions
   * ✅ FIX H (restored)
   */
  private generateCardComponent(entity: string, locale: VisualIntent['locale']): GeneratedUIFile {
    const Entity = this.capitalize(entity);
    const resourcePath = toResourcePath(entity);
    const detailsLabel = locale === 'pt-BR' ? 'Ver detalhes' : 'View details';
    const deleteLabel = locale === 'pt-BR' ? 'Excluir' : 'Delete';
    const fields = getEntityFields(entity);
    const statusOptions = fields.find(field => field.name === 'status')?.options || [];
    const statusLabels = JSON.stringify(Object.fromEntries(statusOptions.map(item => [item.value, locale === 'pt-BR' ? item.pt : item.en])));
    const summary = fields.filter(field => field.summary && !['name', 'status'].includes(field.name)).slice(0, 3).map(field =>
      `        {${entity}.${field.name} !== undefined && ${entity}.${field.name} !== null && <div className="flex items-center justify-between gap-3 text-xs"><span className="text-[rgb(var(--orus-text-muted))]">${locale === 'pt-BR' ? field.pt : field.en}</span><strong className="max-w-[60%] truncate text-right">{String(${entity}.${field.name})}</strong></div>}`
    ).join('\n');
    const content = `
import { Link } from 'react-router-dom';
import { ${Entity} } from '../types/${entity}.types';

interface ${Entity}CardProps { ${entity}: ${Entity}; onDelete?: (id: string) => void; }

export default function ${Entity}Card({ ${entity}, onDelete }: ${Entity}CardProps) {
  const statusColors: Record<string, string> = {
    active:   'bg-emerald-100 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-600',
    pending:  'bg-amber-100 text-amber-700',
    done:     'bg-blue-100 text-blue-700',
    lead:     'bg-amber-100 text-amber-800',
    prospect: 'bg-blue-100 text-blue-700',
    scheduled:'bg-sky-100 text-sky-700',
    confirmed:'bg-emerald-100 text-emerald-700',
    completed:'bg-violet-100 text-violet-700',
    cancelled:'bg-rose-100 text-rose-700',
  };
  const statusLabels: Record<string, string> = ${statusLabels};
  return (
    <div className="bg-[rgb(var(--orus-panel))] rounded-2xl border border-[rgb(var(--orus-border))] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="p-5 pb-4 border-b border-[rgb(var(--orus-border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--orus-primary-soft))] flex items-center justify-center flex-shrink-0 text-[rgb(var(--orus-primary))] font-bold text-sm">
            {(${entity}.name || 'N')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[rgb(var(--orus-text))] truncate">{${entity}.name}</h3>
            {${entity}.status && (
              <span className={\`inline-flex mt-1 text-xs font-medium px-2 py-0.5 rounded-full \${statusColors[${entity}.status] ?? 'bg-gray-100 text-gray-600'}\`}>
                {statusLabels[${entity}.status] ?? ${entity}.status}
              </span>
            )}
          </div>
        </div>
      </div>
      {${entity}.description && (
        <div className="px-5 py-3">
          <p className="text-sm text-gray-500 line-clamp-2">{${entity}.description}</p>
        </div>
      )}
      <div className="space-y-2 px-5 py-3">
${summary}
      </div>
      <div className="px-5 py-3 bg-[rgb(var(--orus-panel-muted))] flex items-center justify-between gap-2">
        <Link to={\`/${resourcePath}/\${${entity}.id}\`} className="text-sm font-medium text-[rgb(var(--orus-primary))] transition-colors">
          ${detailsLabel} →
        </Link>
        {onDelete && (
          <button onClick={() => onDelete(${entity}.id)} className="text-sm text-red-500 hover:text-red-700 transition-colors">
            ${deleteLabel}
          </button>
        )}
      </div>
    </div>
  );
}
    `.trim();
    return { path: 'frontend/src/components', name: `${Entity}Card.tsx`, content, type: 'tsx' };
  }

  /**
   * Generate Navbar — polished sticky topbar with NavLink active states
   * ✅ FIX G (restored)
   */
  private generateNavbar(entities: string[], hasAuth: boolean, visualIntent: VisualIntent, productBlueprint?: ProductBlueprint): GeneratedUIFile {
    const isPt = visualIntent.locale === 'pt-BR';
    const dashboardLabel = isPt ? 'Visão geral' : 'Dashboard';
    const workspaceLabel = isPt ? 'Espaço de trabalho' : 'Workspace';
    const navigationItems = productBlueprint
      ? productBlueprint.screens
        .filter(screen => screen.route !== '/' && !screen.route.includes(':'))
        .map(screen => ({ route: screen.route, label: screen.name }))
      : entities.map(entity => ({ route: `/${toResourcePath(entity)}`, label: this.entityLabel(entity, visualIntent.locale, true) }));
    const links = navigationItems.map(item =>
      `      <NavLink to="${item.route}" className={({ isActive }) => \`rounded-full px-3 py-2 text-sm font-medium transition-colors \${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}\`}>${item.label}</NavLink>`
    ).join('\n');
    const mobileLinks = navigationItems.map(item =>
      `            <NavLink to="${item.route}" className={({ isActive }) => \`block rounded-[var(--orus-radius)] px-4 py-3 text-sm font-medium transition-colors \${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}\`}>${item.label}</NavLink>`
    ).join('\n');
    const logoutLabel = isPt ? 'Sair' : 'Sign out';
    const authImports = hasAuth
      ? "import { useNavigate } from 'react-router-dom';\nimport { useAuth } from '../contexts/AuthContext';"
      : '';
    const authHelper = hasAuth ? `
function LogoutButton({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return <button type="button" onClick={handleLogout} className={className}>${logoutLabel}</button>;
}
` : '';

    const primaryEntity = productBlueprint?.data[0]?.name.toLowerCase() || entities[0] || 'item';
    const primaryResourcePath = toResourcePath(primaryEntity);
    const navigationAction = visualIntent.composition.actionPlacement === 'navigation'
      ? `<Link to="/${primaryResourcePath}/new" className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--orus-primary))] px-4 py-2 text-sm font-bold text-[rgb(var(--orus-on-primary))]">＋ ${isPt ? 'Novo' : 'New'}</Link>`
      : '';
    const compactNavigationAction = visualIntent.composition.actionPlacement === 'navigation'
      ? `<Link to="/${primaryResourcePath}/new" title="${isPt ? 'Novo' : 'New'}" className="grid h-11 w-11 place-items-center rounded-full bg-[rgb(var(--orus-primary))] text-lg font-bold text-[rgb(var(--orus-on-primary))]">＋</Link>`
      : '';
    const shell = visualIntent.composition.shell;

    if (shell === 'compact-rail') {
      const railLinks = navigationItems.map((item, index) =>
        `        <NavLink to="${item.route}" title="${item.label}" className={({ isActive }) => \`group flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition \${isActive ? 'bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}\`}>${String(index + 1).padStart(2, '0')}</NavLink>`
      ).join('\n');
      const railMobileLinks = navigationItems.map(item =>
        `        <NavLink to="${item.route}" className={({ isActive }) => \`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold \${isActive ? 'bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))]' : 'text-[rgb(var(--orus-text-muted))]'}\`}>${item.label}</NavLink>`
      ).join('\n');
      const content = `
import { NavLink, Link } from 'react-router-dom';
${authImports}
${authHelper}

export default function Navbar() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-24 flex-col items-center border-r border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] py-5 lg:flex" data-navigation="compact-rail">
        <Link to="/" title="${visualIntent.brandName}" className="grid h-12 w-12 place-items-center rounded-2xl bg-[rgb(var(--orus-primary))] font-display text-lg font-black text-[rgb(var(--orus-on-primary))]">${visualIntent.brandName.charAt(0).toUpperCase()}</Link>
        <nav className="mt-10 flex flex-1 flex-col items-center gap-2 overflow-y-auto">
          <NavLink to="/" end title="${dashboardLabel}" className={({ isActive }) => \`flex h-12 w-12 items-center justify-center rounded-2xl text-lg transition \${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))]'}\`}>⌂</NavLink>
${railLinks}
        </nav>
        ${compactNavigationAction}
        ${hasAuth ? '<LogoutButton className="grid h-10 w-10 place-items-center rounded-full text-xs font-bold text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]" />' : ''}
      </aside>
      <nav className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 lg:hidden"><Link to="/" className="font-display font-bold">${visualIntent.brandName}</Link>${navigationAction}</nav>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-2 lg:hidden"><NavLink to="/" end className="whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold">${dashboardLabel}</NavLink>${railMobileLinks}</nav>
    </>
  );
}
      `.trim();
      return { path: 'frontend/src/components', name: 'Navbar.tsx', content, type: 'tsx' };
    }

    if (shell === 'split-workspace') {
      const splitLinks = navigationItems.map((item, index) =>
        `        <NavLink to="${item.route}" className={({ isActive }) => \`grid grid-cols-[32px_1fr] items-center gap-3 rounded-[var(--orus-radius)] px-3 py-3 text-sm transition \${isActive ? 'bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}\`}><span className="font-mono text-[10px] opacity-90">${String(index + 1).padStart(2, '0')}</span><span className="font-semibold">${item.label}</span></NavLink>`
      ).join('\n');
      const content = `
import { NavLink, Link } from 'react-router-dom';
${authImports}
${authHelper}

export default function Navbar() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-80 flex-col border-r border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6 lg:flex" data-navigation="split-workspace">
        <Link to="/" className="font-display text-2xl font-black tracking-tight">${visualIntent.brandName}</Link>
        <p className="mt-6 border-l-2 border-[rgb(var(--orus-accent))] pl-4 text-sm leading-6 text-[rgb(var(--orus-text-muted))]">${visualIntent.identity.promise}</p>
        <nav className="mt-10 flex flex-1 flex-col gap-1 overflow-y-auto"><NavLink to="/" end className="rounded-[var(--orus-radius)] px-3 py-3 text-sm font-semibold">${dashboardLabel}</NavLink>${splitLinks}</nav>
        <div className="space-y-4 border-t border-[rgb(var(--orus-border))] pt-5">${navigationAction}${hasAuth ? '<LogoutButton className="block text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]" />' : ''}</div>
      </aside>
      <nav className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 lg:hidden"><Link to="/" className="font-display font-bold">${visualIntent.brandName}</Link><details><summary className="cursor-pointer list-none text-sm font-bold">Menu</summary><div className="absolute inset-x-4 top-16 rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-3 shadow-2xl"><NavLink to="/" className="block p-3">${dashboardLabel}</NavLink>${mobileLinks}</div></details></nav>
    </>
  );
}
      `.trim();
      return { path: 'frontend/src/components', name: 'Navbar.tsx', content, type: 'tsx' };
    }

    if (shell === 'bottom-navigation') {
      const bottomLinks = navigationItems.slice(0, 5).map((item, index) =>
        `        <NavLink to="${item.route}" className={({ isActive }) => \`flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-bold \${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))]'}\`}><span className="text-base">${index + 1}</span>${item.label}</NavLink>`
      ).join('\n');
      const content = `
import { NavLink, Link } from 'react-router-dom';
${authImports}
${authHelper}

export default function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-page))]/90 px-5 backdrop-blur-xl"><Link to="/" className="font-display text-lg font-black">${visualIntent.brandName}</Link><div className="flex items-center gap-3">${navigationAction}${hasAuth ? '<LogoutButton className="text-xs font-semibold text-[rgb(var(--orus-text-muted))]" />' : ''}</div></header>
      <nav className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl items-center justify-around gap-1 overflow-x-auto rounded-[calc(var(--orus-radius)*1.35)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]/95 p-2 shadow-2xl backdrop-blur-xl" data-navigation="bottom-tabs"><NavLink to="/" end className="flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-bold"><span className="text-base">⌂</span>${dashboardLabel}</NavLink>${bottomLinks}</nav>
    </>
  );
}
      `.trim();
      return { path: 'frontend/src/components', name: 'Navbar.tsx', content, type: 'tsx' };
    }

    if (shell === 'canvas') {
      const canvasLinks = navigationItems.slice(0, 4).map(item =>
        `          <NavLink to="${item.route}" className={({ isActive }) => \`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold \${isActive ? 'bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]'}\`}>${item.label}</NavLink>`
      ).join('\n');
      const content = `
import { NavLink, Link } from 'react-router-dom';
${authImports}
${authHelper}

export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-4 z-40 px-4" data-navigation="floating-canvas"><div className="mx-auto flex max-w-5xl items-center gap-3 rounded-full border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]/90 p-2 pl-5 shadow-2xl backdrop-blur-xl"><Link to="/" className="mr-auto font-display font-black">${visualIntent.brandName}</Link><div className="hidden items-center gap-1 md:flex"><NavLink to="/" end className="rounded-full px-4 py-2 text-xs font-semibold">${dashboardLabel}</NavLink>${canvasLinks}</div>${navigationAction}${hasAuth ? '<LogoutButton className="hidden px-3 text-xs font-semibold text-[rgb(var(--orus-text-muted))] sm:block" />' : ''}</div></nav>
  );
}
      `.trim();
      return { path: 'frontend/src/components', name: 'Navbar.tsx', content, type: 'tsx' };
    }

    if (shell === 'sidebar-workspace') {
      const sidebarLinks = navigationItems.map(item =>
        `        <NavLink to="${item.route}" className={({ isActive }) => \`flex items-center gap-3 rounded-[var(--orus-radius)] px-3 py-2.5 text-sm font-medium transition-colors \${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}\`}>
          <span className="h-2 w-2 rounded-full bg-[rgb(var(--orus-accent))]" />
          ${item.label}
        </NavLink>`
      ).join('\n');

      const sidebarContent = `
import { NavLink, Link } from 'react-router-dom';
${authImports}
${authHelper}

export default function Navbar() {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 py-5 lg:flex" data-navigation="sidebar-workspace">
        <Link to="/" className="flex items-center gap-3 px-2 font-display text-lg font-bold text-[rgb(var(--orus-text))]">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))] shadow-lg">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          ${visualIntent.brandName}
        </Link>
        <div className="mt-9 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--orus-text-muted))]">${workspaceLabel}</div>
        <nav className="mt-3 flex flex-col gap-1">
          <NavLink to="/" end className={({ isActive }) => \`flex items-center gap-3 rounded-[var(--orus-radius)] px-3 py-2.5 text-sm font-medium transition-colors \${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}\`}>
            <span className="h-2 w-2 rounded-full bg-[rgb(var(--orus-accent))]" />
            ${dashboardLabel}
          </NavLink>
${sidebarLinks}
        </nav>
        <div className="mt-5 px-2">${navigationAction}</div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[rgb(var(--orus-border))] px-2 pt-4 text-xs text-[rgb(var(--orus-text-muted))]">
          <span>Generated by ORUS</span>
          ${hasAuth ? '<LogoutButton className="font-semibold hover:text-[rgb(var(--orus-text))]" />' : ''}
        </div>
      </aside>
      <nav className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 lg:hidden">
        <Link to="/" className="truncate font-display font-bold text-[rgb(var(--orus-text))]">${visualIntent.brandName}</Link>
        ${navigationAction}
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] p-2.5 text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]" aria-label="Open navigation">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </summary>
          <div className="absolute right-0 top-12 max-h-[70vh] w-64 overflow-y-auto rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-2 shadow-2xl">
            <NavLink to="/" end className={({ isActive }) => \`block rounded-[var(--orus-radius)] px-4 py-3 text-sm font-medium transition-colors \${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]'}\`}>${dashboardLabel}</NavLink>
${mobileLinks}
${hasAuth ? "            <LogoutButton className=\"w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100\" />" : ''}
          </div>
        </details>
      </nav>
    </>
  );
}
      `.trim();
      return { path: 'frontend/src/components', name: 'Navbar.tsx', content: sidebarContent, type: 'tsx' };
    }

    const content = `
import { NavLink, Link } from 'react-router-dom';
${authImports}
${authHelper}

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]/95 backdrop-blur-xl" data-navigation="top-navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-[rgb(var(--orus-text))]">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))]">
              <svg className="h-5 w-5 text-[rgb(var(--orus-on-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            ${visualIntent.brandName}
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={({ isActive }) => \`rounded-full px-3 py-2 text-sm font-medium transition-colors \${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}\`}>
              ${dashboardLabel}
            </NavLink>
${links}
${navigationAction ? `            ${navigationAction}` : ''}
${hasAuth ? "            <LogoutButton className=\"rounded-full px-3 py-2 text-sm font-medium text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]\" />" : ''}
          </div>
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] p-2.5 text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]" aria-label="Open navigation">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </summary>
            <div className="absolute right-0 top-12 max-h-[70vh] w-64 overflow-y-auto rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-2 shadow-2xl">
              <NavLink to="/" end className={({ isActive }) => \`block rounded-[var(--orus-radius)] px-4 py-3 text-sm font-medium transition-colors \${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]'}\`}>${dashboardLabel}</NavLink>
${mobileLinks}
${navigationAction ? `              ${navigationAction}` : ''}
${hasAuth ? "              <LogoutButton className=\"w-full rounded-[var(--orus-radius)] px-4 py-3 text-left text-sm font-medium text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]\" />" : ''}
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}
    `.trim();
    return { path: 'frontend/src/components', name: 'Navbar.tsx', content, type: 'tsx' };
  }

  /**
   * Generate Layout Component — clean shell wrapping Navbar + main
   * ✅ FIX F (restored)
   */
  private generateLayout(visualIntent: VisualIntent, productBlueprint?: ProductBlueprint): GeneratedUIFile {
    const shellClasses: Record<VisualIntent['composition']['shell'], string> = {
      'sidebar-workspace': 'min-h-screen bg-[rgb(var(--orus-page))] lg:pl-64',
      'compact-rail': 'min-h-screen bg-[rgb(var(--orus-page))] pb-20 lg:pb-0 lg:pl-24',
      'split-workspace': 'min-h-screen bg-[rgb(var(--orus-page))] lg:pl-80',
      'top-navigation': 'min-h-screen bg-[rgb(var(--orus-page))]',
      canvas: 'min-h-screen bg-[rgb(var(--orus-page))] pt-20',
      'bottom-navigation': 'min-h-screen bg-[rgb(var(--orus-page))] pb-28',
    };
    const frameClasses: Record<VisualIntent['composition']['contentFrame'], string> = {
      contained: 'mx-auto max-w-7xl',
      fluid: 'w-full',
      narrow: 'mx-auto max-w-5xl',
      asymmetric: 'ml-0 mr-auto max-w-[92rem]',
    };
    const routeLayouts = (productBlueprint?.screens || []).map(screen => ({
      route: screen.route,
      layout: screen.layout,
    }));
    const content = `
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps { children: React.ReactNode; }
interface ScreenLayoutEntry { route: string; layout: string; }

const SCREEN_LAYOUTS: readonly ScreenLayoutEntry[] = ${JSON.stringify(routeLayouts, null, 2)};
const WIDE_LAYOUTS = new Set(['kanban', 'calendar', 'analytics', 'conversation', 'asset-library', 'gallery', 'immersive-canvas', 'command-center', 'revenue-overview', 'wealth-overview', 'care-hub', 'commerce-pulse', 'automation-studio', 'permission-matrix']);
const FOCUSED_LAYOUTS = new Set(['checkout', 'stepper', 'split-focus', 'billing', 'payment-operations', 'editorial-overview']);

function resolveScreenLayout(pathname: string) {
  const exact = SCREEN_LAYOUTS.find(screen => screen.route === pathname);
  if (exact) return exact.layout;
  const nested = SCREEN_LAYOUTS
    .filter(screen => screen.route !== '/' && !screen.route.includes(':'))
    .sort((left, right) => right.route.length - left.route.length)
    .find(screen => pathname.startsWith(screen.route + '/'));
  return nested?.layout || 'default';
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const screenLayout = resolveScreenLayout(pathname);
  const frameClassName = WIDE_LAYOUTS.has(screenLayout)
    ? 'w-full max-w-none'
    : FOCUSED_LAYOUTS.has(screenLayout)
      ? 'mx-auto max-w-5xl'
      : '${frameClasses[visualIntent.composition.contentFrame]}';

  return (
    <div className="${shellClasses[visualIntent.composition.shell]}" data-shell="${visualIntent.composition.shell}" data-action-placement="${visualIntent.composition.actionPlacement}">
      <Navbar />
      <main className={
        frameClassName +
        ' px-4 py-7 sm:px-6 lg:px-10 lg:py-10'
      } data-screen-layout={screenLayout}>
        {children}
      </main>
    </div>
  );
}
    `.trim();
    return { path: 'frontend/src/components', name: 'Layout.tsx', content, type: 'tsx' };
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const uiGenerator = new UIGenerator();
export default uiGenerator;
