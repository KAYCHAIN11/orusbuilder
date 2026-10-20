/**
 * ============================================================================
 * ORUS BUILDER - HOME PAGE (EPIC LANDING)
 * ============================================================================
 * 
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-12T11:10:00-03:00
 * LAST_MODIFIED: 2025-10-12T11:10:00-03:00
 * COMPONENT_HASH: orus.frontend.page.home.epic.20251012.HOM9X1Y3
 * 
 * PURPOSE:
 * - Epic landing page com hero section + quick generation
 * - Feature showcase com Trinity AI presentation
 * - Inline prompt input para geração rápida (estilo Lovable)
 * - Multi-language support (pt-BR, en-US, es-ES)
 * - CTA sections e social proof
 * 
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: LandingMarketingAgent
 * - COGNITIVE_LEVEL: Advanced
 * - AUTONOMY_DEGREE: 75
 * - TRINITY_INTEGRATED: Voz (Marketing Communication)
 * ============================================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Zap,
  Code,
  Layers,
  Users,
  Shield,
  ArrowRight,
  Send,
  Loader2,
  Github,
  Monitor,
  TestTube2,
  WandSparkles,
} from 'lucide-react';

// ============================================================================
// I18N - MULTILINGUAL SUPPORT
// ============================================================================

type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface Translations {
  hero: {
    badge: string;
    title: {
      before: string;
      highlight: string;
      after: string;
    };
    subtitle: string;
    cta: {
      primary: string;
      secondary: string;
    };
    prompt: {
      placeholder: string;
      button: string;
      examples: string[];
    };
    stats: {
      projects: string;
      users: string;
      satisfaction: string;
    };
  };
  features: {
    title: string;
    subtitle: string;
    list: Array<{
      title: string;
      description: string;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    copyright: string;
    links: {
      docs: string;
      github: string;
      support: string;
    };
  };
}

const translations: Record<Language, Translations> = {
  'pt-BR': {
    hero: {
      badge: 'Powered by Trinity AI',
      title: {
        before: 'Construa Apps',
        highlight: 'Prontos para Produção',
        after: 'com IA',
      },
      subtitle: 'Transforme suas ideias em aplicações funcionais usando linguagem natural. Trinity AI gera código limpo e mantível com melhores práticas integradas.',
      cta: {
        primary: 'Começar Gratuitamente',
        secondary: 'Ver Exemplos',
      },
      prompt: {
        placeholder: 'Descreva o app que você quer criar... Ex: "Crie um dashboard de vendas com gráficos e tabelas"',
        button: 'Gerar Agora',
        examples: [
          'Criar um blog com comentários',
          'Dashboard de analytics em tempo real',
          'E-commerce com carrinho de compras',
        ],
      },
      stats: {
        projects: 'Projetos Gerados',
        users: 'Desenvolvedores Ativos',
        satisfaction: 'Satisfação',
      },
    },
    features: {
      title: 'Por que escolher o ORUS Builder?',
      subtitle: 'Planejamento, geração e certificação no mesmo workspace',
      list: [
        {
          title: 'Trinity AI Engine',
          description: 'Camadas especializadas interpretam o produto, planejam a experiência e coordenam a geração.',
        },
        {
          title: 'Código Pronto para Produção',
          description: 'Projetos TypeScript passam por instalação, testes, build, segurança e verificação de runtime antes da entrega.',
        },
        {
          title: 'Reconhecimento de Blueprint',
          description: 'Prompts e documentos alimentam um Product Blueprint com domínio, telas, componentes e critérios de aceite.',
        },
        {
          title: 'Geração Instantânea',
          description: 'Acompanhe planejamento, geração, reparo e certificação pelo mesmo job.',
        },
        {
          title: 'Workspace Rastreável',
          description: 'Mantenha histórico, revisões, restauração, atividade, presença e decisões do projeto em um só lugar.',
        },
        {
          title: 'Certificado CIG-2.0',
          description: 'O CIG bloqueia a entrega quando compilação, testes, segurança ou critérios do produto não são aprovados.',
        },
      ],
    },
    cta: {
      title: 'Pronto para Construir Algo Incrível?',
      subtitle: 'Transforme um escopo em código executável, verificável e pronto para evoluir',
      button: 'Iniciar Seu Projeto Gratuito',
    },
    footer: {
      copyright: '© 2025 ORUS Builder. Powered by Trinity AI. Todos os direitos reservados.',
      links: {
        docs: 'Documentação',
        github: 'GitHub',
        support: 'Suporte',
      },
    },
  },
  'en-US': {
    hero: {
      badge: 'Powered by Trinity AI',
      title: {
        before: 'Build',
        highlight: 'Production-Ready',
        after: 'Apps with AI',
      },
      subtitle: 'Transform your ideas into fully functional applications using natural language. Trinity AI generates clean, maintainable code with built-in best practices.',
      cta: {
        primary: 'Start Building Free',
        secondary: 'View Examples',
      },
      prompt: {
        placeholder: 'Describe the app you want to create... Ex: "Create a sales dashboard with charts and tables"',
        button: 'Generate Now',
        examples: [
          'Create a blog with comments',
          'Real-time analytics dashboard',
          'E-commerce with shopping cart',
        ],
      },
      stats: {
        projects: 'Projects Generated',
        users: 'Active Developers',
        satisfaction: 'Satisfaction',
      },
    },
    features: {
      title: 'Why Choose ORUS Builder?',
      subtitle: 'Planning, generation, and certification in one workspace',
      list: [
        {
          title: 'Trinity AI Engine',
          description: 'Specialized layers interpret the product, plan the experience, and coordinate generation.',
        },
        {
          title: 'Production-Ready Code',
          description: 'TypeScript projects pass installation, tests, build, security, and runtime checks before delivery.',
        },
        {
          title: 'Blueprint Recognition',
          description: 'Prompts and documents feed a Product Blueprint with domain, screens, components, and acceptance criteria.',
        },
        {
          title: 'Visible Pipeline',
          description: 'Track planning, generation, repair, and certification through the same job.',
        },
        {
          title: 'Traceable Workspace',
          description: 'Keep history, revisions, restoration, activity, presence, and project decisions in one place.',
        },
        {
          title: 'CIG-2.0 Certified',
          description: 'CIG blocks delivery when compilation, tests, security, or product criteria are not approved.',
        },
      ],
    },
    cta: {
      title: 'Ready to Build Something Amazing?',
      subtitle: 'Turn a scope into runnable, verifiable code that is ready to evolve',
      button: 'Start Your Free Project',
    },
    footer: {
      copyright: '© 2025 ORUS Builder. Powered by Trinity AI. All rights reserved.',
      links: {
        docs: 'Docs',
        github: 'GitHub',
        support: 'Support',
      },
    },
  },
  'es-ES': {
    hero: {
      badge: 'Powered by Trinity AI',
      title: {
        before: 'Construye Apps',
        highlight: 'Listas para Producción',
        after: 'con IA',
      },
      subtitle: 'Transforma tus ideas en aplicaciones funcionales usando lenguaje natural. Trinity AI genera código limpio y mantenible con mejores prácticas integradas.',
      cta: {
        primary: 'Empezar Gratis',
        secondary: 'Ver Ejemplos',
      },
      prompt: {
        placeholder: 'Describe la app que quieres crear... Ej: "Crear un dashboard de ventas con gráficos y tablas"',
        button: 'Generar Ahora',
        examples: [
          'Crear un blog con comentarios',
          'Dashboard de analytics en tiempo real',
          'E-commerce con carrito de compras',
        ],
      },
      stats: {
        projects: 'Proyectos Generados',
        users: 'Desarrolladores Activos',
        satisfaction: 'Satisfacción',
      },
    },
    features: {
      title: '¿Por qué elegir ORUS Builder?',
      subtitle: 'Planificación, generación y certificación en un mismo workspace',
      list: [
        {
          title: 'Trinity AI Engine',
          description: 'Capas especializadas interpretan el producto, planean la experiencia y coordinan la generación.',
        },
        {
          title: 'Código Listo para Producción',
          description: 'Los proyectos TypeScript pasan por instalación, tests, build, seguridad y runtime antes de la entrega.',
        },
        {
          title: 'Reconocimiento de Blueprint',
          description: 'Prompts y documentos alimentan un Product Blueprint con dominio, pantallas, componentes y criterios de aceptación.',
        },
        {
          title: 'Generación Instantánea',
          description: 'Sigue planificación, generación, reparación y certificación en el mismo job.',
        },
        {
          title: 'Workspace Trazable',
          description: 'Mantén historial, revisiones, restauración, actividad, presencia y decisiones del proyecto en un solo lugar.',
        },
        {
          title: 'Certificado CIG-2.0',
          description: 'CIG bloquea la entrega cuando compilación, tests, seguridad o criterios del producto no son aprobados.',
        },
      ],
    },
    cta: {
      title: '¿Listo para Construir Algo Increíble?',
      subtitle: 'Convierte un alcance en código ejecutable, verificable y listo para evolucionar',
      button: 'Iniciar Tu Proyecto Gratis',
    },
    footer: {
      copyright: '© 2025 ORUS Builder. Powered by Trinity AI. Todos los derechos reservados.',
      links: {
        docs: 'Docs',
        github: 'GitHub',
        support: 'Soporte',
      },
    },
  },
};

// ============================================================================
// HOME PAGE COMPONENT
// ============================================================================

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Language state - Auto-detect from browser or manual selection
  const [language, setLanguage] = useState<Language>(() => {
    const browserLang = navigator.language;
    if (browserLang.startsWith('pt')) return 'pt-BR';
    if (browserLang.startsWith('es')) return 'es-ES';
    return 'en-US';
  });
  
  const t = translations[language];
  const productCopy = {
    'pt-BR': {
      eyebrow: 'IDE generativa com validação integrada',
      promptLabel: 'O que você quer construir?',
      examplesLabel: 'Experimente',
      workspace: 'Workspace de geração',
      live: 'Pipeline ativo',
      brief: 'Entendendo o produto',
      generating: 'Criando interface e lógica',
      testing: 'Compilando, testando e corrigindo',
      certified: 'Entrega certificada',
      preview: 'Preview responsivo',
      pipelineTitle: 'Da ideia ao projeto executável',
      pipelineSubtitle: 'Um fluxo único para planejar, gerar, validar e entregar.',
      assurance: ['Projeto completo', 'Validação real', 'Download pronto'],
    },
    'en-US': {
      eyebrow: 'Generative IDE with built-in validation',
      promptLabel: 'What do you want to build?',
      examplesLabel: 'Try',
      workspace: 'Generation workspace',
      live: 'Pipeline active',
      brief: 'Understanding the product',
      generating: 'Building interface and logic',
      testing: 'Compiling, testing and repairing',
      certified: 'Certified delivery',
      preview: 'Responsive preview',
      pipelineTitle: 'From idea to runnable project',
      pipelineSubtitle: 'One workflow to plan, generate, validate and deliver.',
      assurance: ['Complete project', 'Real validation', 'Ready to download'],
    },
    'es-ES': {
      eyebrow: 'IDE generativo con validación integrada',
      promptLabel: '¿Qué quieres construir?',
      examplesLabel: 'Prueba',
      workspace: 'Workspace de generación',
      live: 'Pipeline activo',
      brief: 'Entendiendo el producto',
      generating: 'Creando interfaz y lógica',
      testing: 'Compilando, probando y corrigiendo',
      certified: 'Entrega certificada',
      preview: 'Preview responsivo',
      pipelineTitle: 'De la idea al proyecto ejecutable',
      pipelineSubtitle: 'Un flujo único para planear, generar, validar y entregar.',
      assurance: ['Proyecto completo', 'Validación real', 'Descarga lista'],
    },
  }[language];
  
  // Quick generation state
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuickGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    navigate('/generate', { state: { prompt, autoStart: true } });
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#07080d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-violet-700/20 blur-[120px]" />
        <div className="absolute right-[-12rem] top-[20rem] h-[30rem] w-[30rem] rounded-full bg-fuchsia-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      </div>

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#07080d]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 shadow-glow" />
            <div>
              <span className="block text-[17px] font-heading font-bold tracking-tight text-white">ORUS Builder</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Trinity AI</span>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              aria-label="Idioma"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs text-slate-300 outline-none transition-colors hover:border-white/20 sm:px-3"
            >
              <option className="bg-slate-900" value="pt-BR">PT</option>
              <option className="bg-slate-900" value="en-US">EN</option>
              <option className="bg-slate-900" value="es-ES">ES</option>
            </select>
            <button
              onClick={() => navigate('/dashboard')}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white sm:block"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/generate')}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02] sm:px-4"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">{t.hero.cta.primary}</span>
              <span className="sm:hidden">Criar</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="px-4 pb-24 pt-32 sm:px-6 lg:px-8 lg:pb-32 lg:pt-40">
          <div className="mx-auto grid max-w-[1440px] items-center gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-3 py-1.5 text-xs font-medium text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                {productCopy.eyebrow}
              </div>

              <h1 className="text-5xl font-heading font-bold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl xl:text-7xl">
                {t.hero.title.before}{' '}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">
                  {t.hero.title.highlight}
                </span>{' '}
                {t.hero.title.after}
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">{t.hero.subtitle}</p>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleQuickGenerate();
                }}
                className="mt-9 rounded-2xl border border-white/10 bg-white/[0.055] p-3 shadow-2xl shadow-violet-950/30 backdrop-blur-xl"
              >
                <label htmlFor="home-prompt" className="mb-2 block px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {productCopy.promptLabel}
                </label>
                <textarea
                  id="home-prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void handleQuickGenerate();
                    }
                  }}
                  placeholder={t.hero.prompt.placeholder}
                  rows={3}
                  disabled={isGenerating}
                  className="w-full resize-none bg-transparent px-2 py-2 text-base leading-6 text-white outline-none placeholder:text-slate-600"
                />
                <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] pt-3">
                  <span className="hidden text-xs text-slate-600 sm:block">Enter para gerar · Shift + Enter para nova linha</span>
                  <button
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    className="ml-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {t.hero.prompt.button}
                  </button>
                </div>
              </form>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs text-slate-600">{productCopy.examplesLabel}:</span>
                {t.hero.prompt.examples.map((example) => (
                  <button
                    key={example}
                    onClick={() => handleExampleClick(example)}
                    className="max-w-full truncate rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-violet-400/30 hover:text-violet-200"
                  >
                    {example}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {productCopy.assurance.map((item) => (
                  <span key={item} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.12 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-r from-violet-600/15 to-fuchsia-500/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d14] shadow-2xl shadow-black/50">
                <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{productCopy.workspace}</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    {productCopy.live}
                  </div>
                </div>

                <div className="grid min-h-[520px] grid-cols-[48px_1fr] sm:grid-cols-[58px_1fr]">
                  <div className="flex flex-col items-center gap-5 border-r border-white/[0.06] bg-black/15 py-5 text-slate-600">
                    <WandSparkles className="h-4 w-4 text-violet-400" />
                    <Code className="h-4 w-4" />
                    <Monitor className="h-4 w-4" />
                    <TestTube2 className="h-4 w-4" />
                  </div>

                  <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-[0.78fr_1.22fr]">
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                      <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        Trinity orchestration
                      </div>
                      <div className="space-y-1">
                        {[
                          [productCopy.brief, 'done'],
                          [productCopy.generating, 'done'],
                          [productCopy.testing, 'active'],
                          [productCopy.certified, 'idle'],
                        ].map(([label, status], index) => (
                          <div key={label} className="flex items-center gap-3 rounded-lg px-2 py-3">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${status === 'done' ? 'bg-emerald-400/15 text-emerald-400' : status === 'active' ? 'bg-violet-400/15 text-violet-300 ring-1 ring-violet-400/30' : 'bg-white/5 text-slate-600'}`}>
                              {status === 'done' ? '✓' : index + 1}
                            </div>
                            <span className={`text-[11px] leading-4 ${status === 'idle' ? 'text-slate-600' : 'text-slate-300'}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 rounded-lg border border-violet-400/10 bg-violet-400/[0.045] p-3 font-mono text-[9px] leading-5 text-slate-500">
                        <span className="text-violet-300">CIG</span> compile --repair<br />
                        build · tests · security<br />
                        delivery after certification
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#f5f3ff]">
                      <div className="flex h-9 items-center justify-between border-b border-slate-200 bg-white px-3">
                        <span className="text-[10px] font-semibold text-slate-500">{productCopy.preview}</span>
                        <div className="flex items-center gap-1 text-slate-300">
                          <Monitor className="h-3 w-3 text-violet-500" />
                          <span className="h-3 w-3 rounded-sm border border-slate-300" />
                          <span className="h-3 w-2 rounded-sm border border-slate-300" />
                        </div>
                      </div>
                      <div className="p-4 sm:p-5">
                        <div className="rounded-xl bg-[#17131f] p-4 text-white shadow-xl">
                          <div className="mb-8 flex items-center justify-between">
                            <div className="h-5 w-16 rounded bg-gradient-to-r from-violet-400 to-fuchsia-400" />
                            <div className="flex gap-2">
                              <span className="h-1.5 w-8 rounded-full bg-white/20" />
                              <span className="h-1.5 w-8 rounded-full bg-white/20" />
                            </div>
                          </div>
                          <span className="inline-flex rounded-full bg-violet-400/15 px-2 py-1 text-[8px] text-violet-200">New collection</span>
                          <div className="mt-3 h-5 w-3/4 rounded bg-white/90" />
                          <div className="mt-2 h-5 w-1/2 rounded bg-white/90" />
                          <div className="mt-4 h-2 w-4/5 rounded-full bg-white/15" />
                          <div className="mt-2 h-2 w-3/5 rounded-full bg-white/10" />
                          <div className="mt-6 flex gap-2">
                            <span className="h-8 w-20 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                            <span className="h-8 w-16 rounded-lg border border-white/15" />
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {[0, 1, 2].map((item) => (
                            <div key={item} className="rounded-lg bg-white p-2 shadow-sm">
                              <div className={`mb-2 h-10 rounded-md ${item === 1 ? 'bg-orange-100' : item === 2 ? 'bg-fuchsia-100' : 'bg-violet-100'}`} />
                              <div className="h-1.5 w-4/5 rounded bg-slate-300" />
                              <div className="mt-1.5 h-1.5 w-1/2 rounded bg-slate-200" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-white/[0.06] bg-white/[0.018] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-14 max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">ORUS pipeline</span>
              <h2 className="mt-4 text-3xl font-heading font-bold tracking-tight text-white sm:text-4xl">{productCopy.pipelineTitle}</h2>
              <p className="mt-4 text-base leading-7 text-slate-500">{productCopy.pipelineSubtitle}</p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] md:grid-cols-2 lg:grid-cols-3">
              {t.features.list.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={[Sparkles, Code, Layers, Zap, Users, Shield][index]}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-violet-300/15 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-transparent px-6 py-16 text-center sm:px-12"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.12),transparent_45%)]" />
            <div className="relative">
              <h2 className="text-3xl font-heading font-bold tracking-tight text-white sm:text-5xl">{t.cta.title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400 sm:text-lg">{t.cta.subtitle}</p>
              <button
                onClick={() => navigate('/generate')}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
              >
                {t.cta.button}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.07] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600" />
            <span className="font-heading text-sm font-bold text-white">ORUS Builder</span>
          </div>
          <p className="text-center text-xs text-slate-600">© 2026 ORUS Builder · Powered by Trinity AI</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-xs text-slate-500 transition-colors hover:text-white">Dashboard</button>
            <a href="https://github.com/OrusMind/Orus-Builder-FullStack" aria-label={t.footer.links.github} className="text-slate-500 transition-colors hover:text-white">
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="group bg-[#0b0d14] p-7 transition-colors hover:bg-[#0e111a]"
  >
    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.07] text-violet-300 transition-colors group-hover:border-violet-400/30">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mb-2 text-lg font-heading font-semibold text-slate-100">{title}</h3>
    <p className="text-sm leading-6 text-slate-500">{description}</p>
  </motion.div>
);

/**
 * EXPORT MANIFEST
 * ============================================================================
 * PRIMARY_EXPORT: HomePage (Epic landing page with multilingual support)
 * NAMED_EXPORTS: None
 * DEFAULT_AVAILABLE: false
 * COMPATIBILITY: internal
 * ============================================================================
 */
