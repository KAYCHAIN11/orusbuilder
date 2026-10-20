/**
 * Deterministic visual planning for generated interfaces.
 *
 * This module deliberately sits in the active generation path. It converts
 * natural-language cues into a small, testable contract that templates and AI
 * providers can both consume. An AI provider may enrich this object later, but
 * the generator never depends on an external model to produce a coherent UI.
 */

export type VisualStyle =
  | 'premium'
  | 'minimal'
  | 'corporate'
  | 'playful'
  | 'editorial'
  | 'luxury'
  | 'glass';

export type VisualDensity = 'compact' | 'comfortable' | 'spacious';
export type ProductArchetype =
  | 'saas'
  | 'dashboard'
  | 'crm'
  | 'commerce'
  | 'healthcare'
  | 'finance'
  | 'creative'
  | 'generic';

export type BrandPersonality =
  | 'precise'
  | 'trustworthy'
  | 'warm'
  | 'bold'
  | 'refined'
  | 'inventive'
  | 'energetic';

export type ExperiencePattern =
  | 'command-center'
  | 'revenue-pipeline'
  | 'wealth-overview'
  | 'care-hub'
  | 'commerce-pulse'
  | 'creative-studio'
  | 'talent-hub'
  | 'learning-campus'
  | 'logistics-control'
  | 'event-stage'
  | 'hospitality-service'
  | 'product-workspace'
  | 'editorial-overview';

export type DataViewPattern =
  | 'table'
  | 'kanban'
  | 'calendar'
  | 'timeline'
  | 'catalog'
  | 'ledger'
  | 'gallery';

export type LayoutSignature =
  | 'split-focus'
  | 'modular-grid'
  | 'dense-rail'
  | 'editorial-stack'
  | 'immersive-canvas';

export type ShellPattern =
  | 'sidebar-workspace'
  | 'top-navigation'
  | 'compact-rail'
  | 'split-workspace'
  | 'canvas'
  | 'bottom-navigation';

export type ActionPlacement = 'header' | 'command-bar' | 'floating' | 'inline' | 'navigation';

export interface VisualPalette {
  name: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  primarySoft: string;
  accent: string;
  page: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  heroGradient: string;
  cssPrimary: string;
  cssPrimaryHover: string;
  cssPrimarySoft: string;
  cssAccent: string;
  cssPage: string;
  cssSurface: string;
  cssSurfaceMuted: string;
  cssText: string;
  cssTextMuted: string;
  cssBorder: string;
}

export interface VisualIntent {
  version: 2;
  style: VisualStyle;
  archetype: ProductArchetype;
  density: VisualDensity;
  locale: 'pt-BR' | 'en';
  colorMode: 'light' | 'dark';
  radius: 'soft' | 'rounded' | 'sharp';
  navigation: 'top' | 'sidebar';
  motion: 'subtle' | 'expressive' | 'none';
  brandName: string;
  typography: {
    display: string;
    body: string;
  };
  palette: VisualPalette;
  identity: {
    personality: BrandPersonality[];
    voice: string;
    promise: string;
    visualMetaphor: string;
    signature: string;
    imagery: string;
  };
  experience: {
    pattern: ExperiencePattern;
    primaryDataView: DataViewPattern;
    hierarchy: 'metric-first' | 'workflow-first' | 'content-first' | 'people-first';
    heroTreatment: 'solid' | 'gradient' | 'editorial' | 'ambient';
    componentShape: 'quiet' | 'outlined' | 'elevated' | 'layered';
    layout: LayoutSignature;
    screenPriorities: string[];
  };
  composition: {
    shell: ShellPattern;
    contentFrame: 'contained' | 'fluid' | 'narrow' | 'asymmetric';
    header: 'page' | 'command' | 'editorial' | 'minimal' | 'immersive';
    actionPlacement: ActionPlacement;
    mobileNavigation: 'drawer' | 'bottom-tabs' | 'scrolling-tabs';
    rationale: string[];
  };
  evidence: string[];
}

const PALETTES: Record<VisualStyle, VisualPalette> = {
  premium: {
    name: 'midnight-violet',
    primary: 'bg-violet-600',
    primaryHover: 'hover:bg-violet-500',
    primaryText: 'text-white',
    primarySoft: 'bg-violet-50 text-violet-700',
    accent: 'text-cyan-400',
    page: 'bg-slate-950',
    surface: 'bg-white/10',
    surfaceMuted: 'bg-slate-900',
    text: 'text-white',
    textMuted: 'text-slate-300',
    border: 'border-white/10',
    heroGradient: 'bg-gradient-to-br from-slate-950 via-violet-950 to-blue-950',
    cssPrimary: '124 58 237',
    cssPrimaryHover: '109 40 217',
    cssPrimarySoft: '46 16 101',
    cssAccent: '34 211 238',
    cssPage: '2 6 23',
    cssSurface: '15 23 42',
    cssSurfaceMuted: '30 41 59',
    cssText: '248 250 252',
    cssTextMuted: '148 163 184',
    cssBorder: '51 65 85',
  },
  minimal: {
    name: 'ink-paper',
    primary: 'bg-gray-950',
    primaryHover: 'hover:bg-gray-800',
    primaryText: 'text-white',
    primarySoft: 'bg-gray-100 text-gray-900',
    accent: 'text-gray-950',
    page: 'bg-white',
    surface: 'bg-white',
    surfaceMuted: 'bg-gray-50',
    text: 'text-gray-950',
    textMuted: 'text-gray-500',
    border: 'border-gray-200',
    heroGradient: 'bg-gradient-to-b from-gray-50 to-white',
    cssPrimary: '17 24 39',
    cssPrimaryHover: '31 41 55',
    cssPrimarySoft: '243 244 246',
    cssAccent: '17 24 39',
    cssPage: '255 255 255',
    cssSurface: '255 255 255',
    cssSurfaceMuted: '249 250 251',
    cssText: '17 24 39',
    cssTextMuted: '107 114 128',
    cssBorder: '229 231 235',
  },
  corporate: {
    name: 'trust-blue',
    primary: 'bg-blue-700',
    primaryHover: 'hover:bg-blue-600',
    primaryText: 'text-white',
    primarySoft: 'bg-blue-50 text-blue-800',
    accent: 'text-sky-700',
    page: 'bg-slate-50',
    surface: 'bg-white',
    surfaceMuted: 'bg-slate-100',
    text: 'text-slate-950',
    textMuted: 'text-slate-600',
    border: 'border-slate-200',
    heroGradient: 'bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900',
    cssPrimary: '29 78 216',
    cssPrimaryHover: '37 99 235',
    cssPrimarySoft: '239 246 255',
    cssAccent: '3 105 161',
    cssPage: '248 250 252',
    cssSurface: '255 255 255',
    cssSurfaceMuted: '241 245 249',
    cssText: '15 23 42',
    cssTextMuted: '71 85 105',
    cssBorder: '203 213 225',
  },
  playful: {
    name: 'electric-candy',
    primary: 'bg-fuchsia-600',
    primaryHover: 'hover:bg-fuchsia-500',
    primaryText: 'text-white',
    primarySoft: 'bg-fuchsia-50 text-fuchsia-700',
    accent: 'text-amber-700',
    page: 'bg-orange-50',
    surface: 'bg-white',
    surfaceMuted: 'bg-yellow-50',
    text: 'text-purple-950',
    textMuted: 'text-purple-700/70',
    border: 'border-fuchsia-200',
    heroGradient: 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-orange-400',
    cssPrimary: '192 38 211',
    cssPrimaryHover: '217 70 239',
    cssPrimarySoft: '253 244 255',
    cssAccent: '161 98 7',
    cssPage: '255 247 237',
    cssSurface: '255 255 255',
    cssSurfaceMuted: '254 252 232',
    cssText: '59 7 100',
    cssTextMuted: '107 33 168',
    cssBorder: '245 208 254',
  },
  editorial: {
    name: 'editorial-rose',
    primary: 'bg-rose-700',
    primaryHover: 'hover:bg-rose-600',
    primaryText: 'text-white',
    primarySoft: 'bg-rose-50 text-rose-800',
    accent: 'text-rose-700',
    page: 'bg-stone-50',
    surface: 'bg-white',
    surfaceMuted: 'bg-stone-100',
    text: 'text-stone-950',
    textMuted: 'text-stone-600',
    border: 'border-stone-300',
    heroGradient: 'bg-gradient-to-br from-stone-100 via-white to-rose-50',
    cssPrimary: '190 18 60',
    cssPrimaryHover: '225 29 72',
    cssPrimarySoft: '255 241 242',
    cssAccent: '190 18 60',
    cssPage: '250 250 249',
    cssSurface: '255 255 255',
    cssSurfaceMuted: '245 245 244',
    cssText: '28 25 23',
    cssTextMuted: '87 83 78',
    cssBorder: '214 211 209',
  },
  luxury: {
    name: 'obsidian-gold',
    primary: 'bg-amber-500',
    primaryHover: 'hover:bg-amber-400',
    primaryText: 'text-neutral-950',
    primarySoft: 'bg-amber-400/10 text-amber-300',
    accent: 'text-amber-400',
    page: 'bg-neutral-950',
    surface: 'bg-neutral-900',
    surfaceMuted: 'bg-neutral-900/70',
    text: 'text-amber-50',
    textMuted: 'text-neutral-400',
    border: 'border-amber-400/20',
    heroGradient: 'bg-gradient-to-br from-black via-neutral-950 to-amber-950',
    cssPrimary: '245 158 11',
    cssPrimaryHover: '251 191 36',
    cssPrimarySoft: '69 26 3',
    cssAccent: '251 191 36',
    cssPage: '10 10 10',
    cssSurface: '10 10 10',
    cssSurfaceMuted: '23 23 23',
    cssText: '255 251 235',
    cssTextMuted: '163 163 163',
    cssBorder: '69 58 25',
  },
  glass: {
    name: 'aurora-glass',
    primary: 'bg-cyan-500',
    primaryHover: 'hover:bg-cyan-400',
    primaryText: 'text-slate-950',
    primarySoft: 'bg-cyan-400/10 text-cyan-300',
    accent: 'text-fuchsia-400',
    page: 'bg-slate-950',
    surface: 'bg-white/10 backdrop-blur-xl',
    surfaceMuted: 'bg-slate-900/60',
    text: 'text-white',
    textMuted: 'text-slate-300',
    border: 'border-white/15',
    heroGradient: 'bg-gradient-to-br from-slate-950 via-cyan-950 to-fuchsia-950',
    cssPrimary: '6 182 212',
    cssPrimaryHover: '34 211 238',
    cssPrimarySoft: '8 51 68',
    cssAccent: '232 121 249',
    cssPage: '2 6 23',
    cssSurface: '15 23 42',
    cssSurfaceMuted: '15 23 42',
    cssText: '255 255 255',
    cssTextMuted: '203 213 225',
    cssBorder: '51 65 85',
  },
};

const DOMAIN_PALETTES: Partial<Record<ProductArchetype, VisualPalette>> = {
  crm: {
    name: 'revenue-emerald',
    primary: 'bg-emerald-700', primaryHover: 'hover:bg-emerald-600', primaryText: 'text-white',
    primarySoft: 'bg-emerald-50 text-emerald-900', accent: 'text-amber-700', page: 'bg-stone-50',
    surface: 'bg-white', surfaceMuted: 'bg-stone-100', text: 'text-slate-950', textMuted: 'text-slate-600',
    border: 'border-stone-200', heroGradient: 'bg-gradient-to-br from-slate-950 via-emerald-950 to-emerald-700',
    cssPrimary: '4 120 87', cssPrimaryHover: '5 150 105', cssPrimarySoft: '236 253 245',
    cssAccent: '161 98 7', cssPage: '250 250 249', cssSurface: '255 255 255',
    cssSurfaceMuted: '245 245 244', cssText: '15 23 42', cssTextMuted: '71 85 105', cssBorder: '231 229 228',
  },
  healthcare: {
    name: 'clinical-mint',
    primary: 'bg-teal-700', primaryHover: 'hover:bg-teal-800', primaryText: 'text-white',
    primarySoft: 'bg-teal-50 text-teal-800', accent: 'text-emerald-700', page: 'bg-slate-50',
    surface: 'bg-white', surfaceMuted: 'bg-teal-50', text: 'text-slate-950', textMuted: 'text-slate-600',
    border: 'border-teal-100', heroGradient: 'bg-gradient-to-br from-teal-950 via-teal-800 to-emerald-600',
    cssPrimary: '15 118 110', cssPrimaryHover: '17 94 89', cssPrimarySoft: '240 253 250',
    cssAccent: '4 120 87', cssPage: '248 250 252', cssSurface: '255 255 255',
    cssSurfaceMuted: '240 253 250', cssText: '15 23 42', cssTextMuted: '71 85 105', cssBorder: '204 251 241',
  },
  commerce: {
    name: 'commerce-coral',
    primary: 'bg-orange-700', primaryHover: 'hover:bg-orange-800', primaryText: 'text-white',
    primarySoft: 'bg-orange-50 text-orange-800', accent: 'text-rose-700', page: 'bg-stone-50',
    surface: 'bg-white', surfaceMuted: 'bg-orange-50', text: 'text-stone-950', textMuted: 'text-stone-600',
    border: 'border-orange-100', heroGradient: 'bg-gradient-to-br from-stone-950 via-orange-950 to-rose-900',
    cssPrimary: '194 65 12', cssPrimaryHover: '154 52 18', cssPrimarySoft: '255 247 237',
    cssAccent: '190 18 60', cssPage: '250 250 249', cssSurface: '255 255 255',
    cssSurfaceMuted: '255 247 237', cssText: '28 25 23', cssTextMuted: '87 83 78', cssBorder: '255 237 213',
  },
  creative: {
    name: 'studio-cobalt',
    primary: 'bg-blue-600', primaryHover: 'hover:bg-blue-500', primaryText: 'text-white',
    primarySoft: 'bg-blue-50 text-blue-800', accent: 'text-fuchsia-700', page: 'bg-zinc-50',
    surface: 'bg-white', surfaceMuted: 'bg-violet-50', text: 'text-zinc-950', textMuted: 'text-zinc-600',
    border: 'border-violet-100', heroGradient: 'bg-gradient-to-br from-blue-700 via-violet-700 to-fuchsia-600',
    cssPrimary: '37 99 235', cssPrimaryHover: '59 130 246', cssPrimarySoft: '239 246 255',
    cssAccent: '162 28 175', cssPage: '250 250 250', cssSurface: '255 255 255',
    cssSurfaceMuted: '245 243 255', cssText: '24 24 27', cssTextMuted: '82 82 91', cssBorder: '237 233 254',
  },
};

const EARTH_ARCHITECTURE_PALETTE: VisualPalette = {
  name: 'earth-atelier',
  primary: 'bg-orange-800', primaryHover: 'hover:bg-orange-700', primaryText: 'text-white',
  primarySoft: 'bg-orange-100 text-orange-950', accent: 'text-lime-900', page: 'bg-stone-100',
  surface: 'bg-amber-50', surfaceMuted: 'bg-stone-200', text: 'text-stone-900', textMuted: 'text-stone-600',
  border: 'border-stone-300', heroGradient: 'bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100',
  cssPrimary: '154 52 18', cssPrimaryHover: '194 65 12', cssPrimarySoft: '255 237 213',
  cssAccent: '54 83 20', cssPage: '245 245 244', cssSurface: '255 251 235',
  cssSurfaceMuted: '231 229 228', cssText: '28 25 23', cssTextMuted: '87 83 78', cssBorder: '214 211 209',
};

const includesAny = (text: string, words: string[]) => words.some(word => text.includes(word));

type VisualDomainFamily = 'recruiting' | 'education' | 'logistics' | 'events' | 'hospitality';

function detectVisualDomainFamily(text: string): VisualDomainFamily | undefined {
  if (includesAny(text, ['processo seletivo', 'recrutamento', 'candidatos', 'entrevistas', 'job opening', 'hiring pipeline', 'recruitment'])) return 'recruiting';
  if (includesAny(text, ['catálogo de cursos', 'catalogo de cursos', 'matrículas', 'matriculas', 'progresso de aprendizagem', 'avaliações acadêmicas', 'avaliacoes academicas', 'learning platform', 'course catalog', 'enrollments'])) return 'education';
  if (includesAny(text, ['remessas e entregas', 'gestão de frota', 'gestao de frota', 'planejamento de rotas', 'rastreamento logístico', 'rastreamento logistico', 'shipment tracking', 'fleet management', 'route planning'])) return 'logistics';
  if (includesAny(text, ['programação de eventos', 'programacao de eventos', 'ingressos e inscrições', 'ingressos e inscricoes', 'credenciamento', 'event schedule', 'event registration', 'attendee check-in'])) return 'events';
  if (includesAny(text, ['reservas de mesas', 'cardápio', 'cardapio', 'pedidos do restaurante', 'painel da cozinha', 'restaurant reservations', 'restaurant menu', 'kitchen display'])) return 'hospitality';
  return undefined;
}

function stableIndex(value: string, length: number): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % length;
}

function detectStyle(text: string, evidence: string[]): VisualStyle {
  const candidates: Array<[VisualStyle, string[]]> = [
    ['luxury', ['luxo', 'luxury', 'exclusiv', 'dourad', 'gold']],
    ['premium', ['premium', 'elegant', 'elegante', 'refinad', 'sofisticad', 'high-end']],
    ['glass', ['glass', 'vidro', 'aurora', 'neon', 'futurist']],
    ['minimal', ['minimal', 'clean', 'limp', 'simples', 'monocrom']],
    ['playful', ['divertid', 'playful', 'colorid', 'vibrant', 'jovem']],
    ['editorial', ['editorial', 'revista', 'magazine', 'fashion', 'moda']],
    ['corporate', ['corporativ', 'enterprise', 'institucional', 'sóbrio', 'sobrio']],
  ];

  for (const [style, words] of candidates) {
    const matched = words.some(word => ['luxo', 'gold'].includes(word)
      ? new RegExp(`\\b${word}\\b`, 'i').test(text)
      : text.includes(word));
    if (matched) {
      evidence.push(`style:${style}`);
      return style;
    }
  }

  evidence.push('style:premium-default');
  return 'premium';
}

function detectArchetype(text: string, evidence: string[]): ProductArchetype {
  const domainFamily = detectVisualDomainFamily(text);
  if (domainFamily) {
    evidence.push(`domain-family:${domainFamily}`, 'archetype:generic');
    return 'generic';
  }
  const candidates: Array<[ProductArchetype, string[]]> = [
    ['healthcare', ['saúde', 'saude', 'clinic', 'clínic', 'médic', 'medic', 'pacient', 'hospital']],
    ['finance', ['finance', 'finança', 'financas', 'finanças', 'bancário', 'bancario', 'banking', 'invest', 'pagamento', 'payment', 'fintech']],
    ['crm', ['crm', 'pipeline comercial', 'pipeline de vendas', 'funil de vendas', 'oportunidades', 'leads', 'equipe comercial', 'sales pipeline']],
    ['commerce', ['loja', 'store', 'ecommerce', 'e-commerce', 'marketplace', 'produtos', 'carrinho', 'checkout', 'joalher', 'fashion', 'moda', 'cosmét', 'cosmet']],
    ['creative', ['portfolio', 'portfólio', 'studio', 'estúdio', 'agência', 'agency', 'artist']],
    ['dashboard', ['dashboard', 'painel', 'admin', 'analytics', 'métricas', 'metricas']],
    ['saas', ['saas', 'software', 'plataforma', 'platform', 'startup']],
  ];

  const ranked = candidates
    .map(([archetype, words], index) => ({
      archetype,
      index,
      score: words.reduce((score, word) => score + Number(text.includes(word)), 0),
    }))
    .filter(candidate => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = ranked[0];
  if (!selected) return 'generic';
  evidence.push(`archetype:${selected.archetype}`, `archetype-score:${selected.score}`);
  return selected.archetype;
}

function detectBrandName(prompt: string): string {
  const patterns = [
    /(?:chamad[oa]|chama-se|called|named)\s+["“']?([\p{L}\d][\p{L}\d&._-]*(?:\s+(?!para\b|com\b|que\b|uma?\b|the\b|with\b|for\b)[\p{L}\d&._-]+){0,3})/iu,
    /(?:marca|brand)\s+["“']?([\p{L}\d][\p{L}\d&._-]*(?:\s+(?!para\b|com\b|que\b|uma?\b|the\b|with\b|for\b)[\p{L}\d&._-]+){0,3})/iu,
    /(?:para\s+(?:a|o))\s+["“']?([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\p{L}\d&._-]*(?:\s+(?!com\b|que\b|uma?\b|the\b|with\b|for\b)[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\p{L}\d&._-]*){0,2})/u,
    /(?:para\s+(?:a|o)|for)\s+["“']?([A-Z][A-Z\d_-]{1,30})(?=\s*[,.;:\n]|\s+(?:uma|um|a|an|the)\b)/u,
    /(?:app|aplicativo|plataforma|sistema|produto)\s+["“']?([A-Z][\p{L}\d&._-]*(?:\s+[A-Z][\p{L}\d&._-]*){0,2})/u,
    /\b(?:fullstack|premium|editorial)\s+["“']?([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\p{L}\d&._-]*(?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\p{L}\d&._-]*){0,2})(?=\s+para\b|[,.;:])/u,
    /\bpara\s+["“']?([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\p{L}\d&._-]*(?:\s+[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][\p{L}\d&._-]*){0,2})(?=\s+(?:para|com|uma?|the|with|for)\b|[,.;:\n])/u,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    const candidate = match?.[1]?.split(/[,.;\n]/)[0]?.trim();
    if (candidate) return candidate.slice(0, 32);
  }

  return 'Orus Studio';
}

function buildIdentity(text: string, style: VisualStyle, archetype: ProductArchetype): VisualIntent['identity'] {
  const domainFamily = detectVisualDomainFamily(text);
  const byDomain: Record<VisualDomainFamily, VisualIntent['identity']> = {
    recruiting: { personality: ['warm', 'precise', 'trustworthy'], voice: 'humana, objetiva e orientada a potencial', promise: 'talentos e oportunidades avançam com contexto', visualMetaphor: 'jornada de talentos em movimento', signature: 'perfis, etapas e sinais de aderência', imagery: 'pessoas, competências e encontros profissionais' },
    education: { personality: ['inventive', 'warm', 'trustworthy'], voice: 'encorajadora, clara e progressiva', promise: 'aprendizagem visível do primeiro passo à conquista', visualMetaphor: 'campus vivo de conhecimento', signature: 'trilhas, marcos e progresso acumulado', imagery: 'conteúdo, descoberta e evolução pessoal' },
    logistics: { personality: ['precise', 'bold', 'trustworthy'], voice: 'operacional, antecipatória e direta', promise: 'cada movimento acompanhado até o destino', visualMetaphor: 'rede logística em fluxo', signature: 'rotas, eventos e exceções em tempo real', imagery: 'mapas, deslocamentos e sinais operacionais' },
    events: { personality: ['energetic', 'inventive', 'bold'], voice: 'vibrante, convidativa e coordenada', promise: 'da programação à entrada, cada momento conectado', visualMetaphor: 'palco em preparação', signature: 'agenda, lotes e pulsos de presença', imagery: 'palcos, encontros e experiências coletivas' },
    hospitality: { personality: ['warm', 'refined', 'energetic'], voice: 'acolhedora, ágil e atenta aos detalhes', promise: 'serviço sincronizado da reserva ao último prato', visualMetaphor: 'ritmo de salão e cozinha', signature: 'mesas, comandas e tempos de preparo', imagery: 'ingredientes, hospitalidade e experiência à mesa' },
  };
  const byArchetype: Record<ProductArchetype, VisualIntent['identity']> = {
    finance: { personality: ['precise', 'trustworthy', 'refined'], voice: 'segura, objetiva e orientada a decisões', promise: 'clareza para decidir com confiança', visualMetaphor: 'sinais financeiros em movimento', signature: 'linhas de tendência e destaques numéricos', imagery: 'dados, profundidade e luz controlada' },
    healthcare: { personality: ['trustworthy', 'warm', 'precise'], voice: 'acolhedora, clara e responsável', promise: 'cuidado coordenado sem atrito', visualMetaphor: 'ritmo de cuidado contínuo', signature: 'blocos calmos, sinais de status e espaço respirável', imagery: 'pessoas, cuidado e ambientes luminosos' },
    crm: { personality: ['precise', 'bold', 'trustworthy'], voice: 'consultiva, direta e orientada a avanço', promise: 'relações comerciais transformadas em receita previsível', visualMetaphor: 'pipeline em movimento', signature: 'etapas visíveis, valor em destaque e próximas ações', imagery: 'negociação, progresso e contexto de relacionamento' },
    commerce: { personality: ['energetic', 'bold', 'warm'], voice: 'direta, desejável e orientada à ação', promise: 'descoberta rápida até a conversão', visualMetaphor: 'vitrine em movimento', signature: 'cards de produto, contrastes quentes e chamadas decisivas', imagery: 'produto em primeiro plano e recortes editoriais' },
    creative: { personality: ['inventive', 'bold', 'refined'], voice: 'autoral, expressiva e confiante', promise: 'trabalho memorável apresentado com intenção', visualMetaphor: 'canvas vivo', signature: 'composição assimétrica e tipografia protagonista', imagery: 'portfólio imersivo e recortes de processo' },
    dashboard: { personality: ['precise', 'trustworthy', 'bold'], voice: 'operacional, direta e acionável', promise: 'controle do que exige atenção agora', visualMetaphor: 'central de comando', signature: 'hierarquia por urgência e densidade controlada', imagery: 'dados operacionais e sinais de progresso' },
    saas: { personality: ['inventive', 'precise', 'trustworthy'], voice: 'clara, inteligente e produtiva', promise: 'menos atrito entre intenção e resultado', visualMetaphor: 'workspace conectado', signature: 'camadas modulares e atalhos contextuais', imagery: 'fluxos, colaboração e automação' },
    generic: { personality: ['refined', 'trustworthy'], voice: 'clara, contemporânea e confiante', promise: 'uma experiência coerente do início ao resultado', visualMetaphor: 'sistema modular', signature: 'ritmo consistente, contraste e foco em tarefas', imagery: 'contexto real de uso e detalhes do produto' },
  };
  const selected = domainFamily ? byDomain[domainFamily] : byArchetype[archetype];
  const identity = { ...selected, personality: [...selected.personality] };
  if (style === 'luxury') identity.personality = ['refined', 'precise'];
  if (style === 'playful') identity.personality = ['energetic', 'warm', 'inventive'];
  if (style === 'minimal') identity.signature = `composição silenciosa, ${identity.signature}`;
  return identity;
}

function buildExperience(text: string, archetype: ProductArchetype): VisualIntent['experience'] {
  const explicitView: DataViewPattern | undefined = includesAny(text, ['kanban', 'quadro']) ? 'kanban'
    : includesAny(text, ['calendário', 'calendario', 'agenda', 'calendar']) ? 'calendar'
    : includesAny(text, ['timeline', 'linha do tempo']) ? 'timeline'
    : includesAny(text, ['catálogo', 'catalogo', 'catalog', 'vitrine']) ? 'catalog'
    : includesAny(text, ['ledger', 'extrato', 'transações', 'transacoes']) ? 'ledger'
    : includesAny(text, ['galeria', 'gallery', 'portfolio', 'portfólio']) ? 'gallery'
    : undefined;
  const domainFamily = detectVisualDomainFamily(text);
  const domainDefaults: Record<VisualDomainFamily, VisualIntent['experience']> = {
    recruiting: { pattern: 'talent-hub', primaryDataView: 'kanban', hierarchy: 'people-first', heroTreatment: 'ambient', componentShape: 'layered', layout: 'split-focus', screenPriorities: ['vagas prioritárias', 'candidatos em movimento', 'entrevistas próximas'] },
    education: { pattern: 'learning-campus', primaryDataView: 'catalog', hierarchy: 'content-first', heroTreatment: 'editorial', componentShape: 'elevated', layout: 'editorial-stack', screenPriorities: ['trilhas em destaque', 'progresso dos estudantes', 'avaliações pendentes'] },
    logistics: { pattern: 'logistics-control', primaryDataView: 'timeline', hierarchy: 'workflow-first', heroTreatment: 'solid', componentShape: 'outlined', layout: 'dense-rail', screenPriorities: ['entregas em risco', 'rotas em execução', 'capacidade da frota'] },
    events: { pattern: 'event-stage', primaryDataView: 'calendar', hierarchy: 'content-first', heroTreatment: 'gradient', componentShape: 'layered', layout: 'immersive-canvas', screenPriorities: ['programação ao vivo', 'venda de ingressos', 'fluxo de entrada'] },
    hospitality: { pattern: 'hospitality-service', primaryDataView: 'kanban', hierarchy: 'workflow-first', heroTreatment: 'editorial', componentShape: 'elevated', layout: 'modular-grid', screenPriorities: ['reservas chegando', 'pedidos em preparo', 'ritmo do serviço'] },
  };
  if (domainFamily) {
    return { ...domainDefaults[domainFamily], ...(explicitView ? { primaryDataView: explicitView } : {}) };
  }
  const defaults: Record<ProductArchetype, Omit<VisualIntent['experience'], 'primaryDataView'>> = {
    finance: { pattern: 'wealth-overview', hierarchy: 'metric-first', heroTreatment: 'ambient', componentShape: 'layered', layout: 'dense-rail', screenPriorities: ['saldo e tendência', 'movimentações', 'risco e metas'] },
    healthcare: { pattern: 'care-hub', hierarchy: 'people-first', heroTreatment: 'solid', componentShape: 'quiet', layout: 'split-focus', screenPriorities: ['agenda do dia', 'pacientes prioritários', 'continuidade do cuidado'] },
    crm: { pattern: 'revenue-pipeline', hierarchy: 'workflow-first', heroTreatment: 'ambient', componentShape: 'layered', layout: 'dense-rail', screenPriorities: ['pipeline e receita', 'oportunidades em risco', 'próximas ações'] },
    commerce: { pattern: 'commerce-pulse', hierarchy: 'metric-first', heroTreatment: 'gradient', componentShape: 'elevated', layout: 'modular-grid', screenPriorities: ['receita e conversão', 'pedidos', 'catálogo e estoque'] },
    creative: { pattern: 'creative-studio', hierarchy: 'content-first', heroTreatment: 'editorial', componentShape: 'layered', layout: 'immersive-canvas', screenPriorities: ['trabalho em destaque', 'projetos ativos', 'próximas entregas'] },
    dashboard: { pattern: 'command-center', hierarchy: 'workflow-first', heroTreatment: 'solid', componentShape: 'outlined', layout: 'modular-grid', screenPriorities: ['itens críticos', 'fluxo em andamento', 'atividade recente'] },
    saas: { pattern: 'product-workspace', hierarchy: 'workflow-first', heroTreatment: 'ambient', componentShape: 'layered', layout: 'split-focus', screenPriorities: ['trabalho em foco', 'progresso da equipe', 'automações'] },
    generic: { pattern: 'editorial-overview', hierarchy: 'content-first', heroTreatment: 'editorial', componentShape: 'outlined', layout: 'editorial-stack', screenPriorities: ['visão geral', 'ações frequentes', 'atividade recente'] },
  };
  const defaultViews: Record<ProductArchetype, DataViewPattern> = {
    finance: 'ledger', healthcare: 'calendar', commerce: 'catalog', creative: 'gallery',
    crm: 'kanban', dashboard: 'kanban', saas: 'timeline', generic: 'table',
  };
  const explicitLayout: LayoutSignature | undefined = includesAny(text, ['split', 'dividid', 'duas colunas']) ? 'split-focus'
    : includesAny(text, ['mosaico', 'bento', 'modular']) ? 'modular-grid'
    : includesAny(text, ['denso', 'dense', 'rail']) ? 'dense-rail'
    : includesAny(text, ['editorial', 'revista', 'storytelling']) ? 'editorial-stack'
    : includesAny(text, ['imersiv', 'immersive', 'canvas']) ? 'immersive-canvas'
    : undefined;
  return { ...defaults[archetype], ...(explicitLayout ? { layout: explicitLayout } : {}), primaryDataView: explicitView || defaultViews[archetype] };
}

function buildComposition(
  text: string,
  archetype: ProductArchetype,
  experience: VisualIntent['experience'],
  requestedNavigation: VisualIntent['navigation'],
  evidence: string[]
): VisualIntent['composition'] {
  const explicitShell: ShellPattern | undefined = includesAny(text, ['menu lateral', 'navegação lateral', 'navegacao lateral', 'sidebar'])
    ? (includesAny(text, ['compact', 'compacto', 'rail']) ? 'compact-rail' : 'sidebar-workspace')
    : includesAny(text, ['navegação superior', 'navegacao superior', 'top navigation', 'topbar', 'navbar horizontal'])
      ? 'top-navigation'
      : includesAny(text, ['split view', 'split-view', 'multipainel', 'multi painel', 'painel dividido'])
        ? 'split-workspace'
        : includesAny(text, ['bottom navigation', 'bottom tabs', 'tabs inferiores', 'mobile first', 'mobile-first'])
          ? 'bottom-navigation'
          : includesAny(text, ['canvas', 'tela cheia', 'fullscreen', 'imersivo', 'imersiva'])
            ? 'canvas'
            : undefined;
  const candidates: Record<ProductArchetype, ShellPattern[]> = {
    finance: ['compact-rail', 'sidebar-workspace', 'top-navigation'],
    healthcare: ['split-workspace', 'top-navigation', 'sidebar-workspace'],
    crm: ['sidebar-workspace', 'compact-rail', 'split-workspace'],
    commerce: ['top-navigation', 'bottom-navigation', 'canvas'],
    creative: ['canvas', 'top-navigation', 'split-workspace'],
    dashboard: ['compact-rail', 'sidebar-workspace', 'split-workspace'],
    saas: ['top-navigation', 'sidebar-workspace', 'split-workspace'],
    generic: ['top-navigation', 'canvas', 'bottom-navigation'],
  };
  const domainShells: Partial<Record<ExperiencePattern, ShellPattern[]>> = {
    'talent-hub': ['split-workspace', 'sidebar-workspace'],
    'learning-campus': ['top-navigation', 'canvas'],
    'logistics-control': ['compact-rail', 'split-workspace'],
    'event-stage': ['canvas', 'top-navigation'],
    'hospitality-service': ['sidebar-workspace', 'top-navigation'],
  };
  const shellCandidates = domainShells[experience.pattern] || candidates[archetype];
  const shell = explicitShell || shellCandidates[stableIndex(`${text}:shell`, shellCandidates.length)]!;
  evidence.push(`composition:${explicitShell ? 'explicit' : 'planned'}-${shell}`);
  const actionCandidates: Record<ShellPattern, ActionPlacement[]> = {
    'sidebar-workspace': ['header', 'command-bar', 'floating'],
    'top-navigation': ['navigation', 'inline', 'header'],
    'compact-rail': ['command-bar', 'floating', 'header'],
    'split-workspace': ['inline', 'command-bar', 'header'],
    canvas: ['floating', 'inline', 'navigation'],
    'bottom-navigation': ['floating', 'inline', 'command-bar'],
  };
  const explicitAction: ActionPlacement | undefined = includesAny(text, ['botão flutuante', 'botao flutuante', 'floating action', 'fab']) ? 'floating'
    : includesAny(text, ['barra de comandos', 'command bar', 'toolbar']) ? 'command-bar'
    : includesAny(text, ['ação no menu', 'acao no menu', 'action in navigation']) ? 'navigation'
    : includesAny(text, ['ação junto', 'acao junto', 'inline action']) ? 'inline'
    : undefined;
  const actionPlacement = explicitAction || actionCandidates[shell][stableIndex(`${text}:action`, actionCandidates[shell].length)]!;
  const contentFrame = shell === 'canvas' ? 'fluid'
    : shell === 'split-workspace' ? 'asymmetric'
    : experience.layout === 'editorial-stack' ? 'narrow'
    : experience.layout === 'dense-rail' ? 'fluid'
    : 'contained';
  const header = shell === 'canvas' ? 'immersive'
    : experience.hierarchy === 'content-first' ? 'editorial'
    : experience.hierarchy === 'workflow-first' ? 'command'
    : requestedNavigation === 'top' ? 'minimal'
    : 'page';
  const mobileNavigation = shell === 'bottom-navigation' ? 'bottom-tabs'
    : shell === 'top-navigation' || shell === 'canvas' ? 'scrolling-tabs'
    : 'drawer';
  return {
    shell,
    contentFrame,
    header,
    actionPlacement,
    mobileNavigation,
    rationale: [
      `archetype:${archetype}`,
      `layout:${experience.layout}`,
      `hierarchy:${experience.hierarchy}`,
      `action:${actionPlacement}`,
    ],
  };
}

function resolvePalette(
  text: string,
  style: VisualStyle,
  archetype: ProductArchetype,
  explicitStyle: boolean,
  evidence: string[]
): VisualPalette {
  const domainFamily = detectVisualDomainFamily(text);
  if (includesAny(text, ['terracota', 'terracotta', 'verde oliva', 'olive', 'tons terrosos', 'earth tone', 'areia'])) {
    evidence.push('palette:explicit-earth-atelier');
    return EARTH_ARCHITECTURE_PALETTE;
  }
  if (includesAny(text, ['verde', 'green', 'esmeralda', 'emerald', 'teal'])) {
    evidence.push('palette:explicit-green-teal');
    if (archetype === 'crm') return DOMAIN_PALETTES.crm!;
    if (archetype === 'healthcare') return DOMAIN_PALETTES.healthcare!;
    return PALETTES.minimal;
  }
  if (includesAny(text, ['laranja', 'orange', 'coral']) && style !== 'luxury') {
    evidence.push('palette:explicit-orange-coral');
    return DOMAIN_PALETTES.commerce!;
  }
  if (includesAny(text, ['cobalto', 'cobalt', 'magenta']) && style !== 'luxury') {
    evidence.push('palette:explicit-cobalt');
    return DOMAIN_PALETTES.creative!;
  }
  if (includesAny(text, ['azul', 'blue', 'navy', 'marinho']) && style !== 'luxury') {
    evidence.push('palette:explicit-blue');
    if (archetype === 'finance' || archetype === 'crm') return PALETTES.corporate;
    return DOMAIN_PALETTES.creative!;
  }
  if (includesAny(text, ['roxo', 'purple', 'violeta', 'violet', 'lilás', 'lilas'])) {
    evidence.push('palette:explicit-violet');
    return PALETTES.premium;
  }
  if (includesAny(text, ['rosa', 'pink', 'vermelho', 'red'])) {
    evidence.push('palette:explicit-warm');
    return PALETTES.playful;
  }
  if (!explicitStyle && DOMAIN_PALETTES[archetype]) {
    const choices: Record<string, VisualPalette[]> = {
      crm: [DOMAIN_PALETTES.crm!, PALETTES.corporate, PALETTES.minimal],
      healthcare: [DOMAIN_PALETTES.healthcare!, PALETTES.minimal, DOMAIN_PALETTES.creative!],
      commerce: [DOMAIN_PALETTES.commerce!, PALETTES.playful, PALETTES.luxury],
      creative: [DOMAIN_PALETTES.creative!, PALETTES.editorial, PALETTES.glass],
    };
    const variants = choices[archetype] || [DOMAIN_PALETTES[archetype]!];
    const palette = variants[stableIndex(text, variants.length)]!;
    evidence.push(`palette:${palette.name}`);
    return palette;
  }
  if (!explicitStyle && domainFamily) {
    const choices: Record<VisualDomainFamily, VisualPalette[]> = {
      recruiting: [PALETTES.corporate, PALETTES.minimal, DOMAIN_PALETTES.crm!],
      education: [DOMAIN_PALETTES.creative!, PALETTES.editorial, PALETTES.playful],
      logistics: [PALETTES.corporate, PALETTES.minimal, PALETTES.glass],
      events: [DOMAIN_PALETTES.creative!, PALETTES.playful, PALETTES.glass],
      hospitality: [EARTH_ARCHITECTURE_PALETTE, DOMAIN_PALETTES.commerce!, PALETTES.luxury],
    };
    const palette = choices[domainFamily][stableIndex(text, choices[domainFamily].length)]!;
    evidence.push(`palette:${palette.name}`);
    return palette;
  }
  return PALETTES[style];
}

export function analyzeVisualIntent(prompt = '', generationType?: string): VisualIntent {
  const text = prompt.toLocaleLowerCase('pt-BR');
  const evidence: string[] = [];
  let style = detectStyle(text, evidence);
  const archetype = detectArchetype(text, evidence);

  // Domain defaults apply only when the user did not explicitly request a style.
  if (evidence.includes('style:premium-default')) {
    if (archetype === 'finance') style = 'corporate';
    if (archetype === 'creative') style = 'editorial';
    const domainFamily = detectVisualDomainFamily(text);
    if (domainFamily === 'recruiting' || domainFamily === 'logistics') style = 'corporate';
    if (domainFamily === 'education' || domainFamily === 'hospitality') style = 'editorial';
    if (domainFamily === 'events') style = 'playful';
  }

  const locale = /\b(the|with|for|create|build|website|dashboard)\b/i.test(prompt)
    && !/[áàâãéêíóôõúç]/i.test(prompt)
    ? 'en'
    : 'pt-BR';
  const compact = includesAny(text, ['compact', 'compacto', 'denso', 'dense']);
  const spacious = includesAny(text, ['espaçoso', 'espacoso', 'spacious', 'editorial']);
  const noMotion = includesAny(text, ['sem animação', 'sem animacao', 'no animation', 'static']);
  const expressiveMotion = includesAny(text, ['animad', 'motion', 'interativ', 'cinematic']);
  const explicitLight = includesAny(text, ['tema claro', 'modo claro', 'tons claros', 'light theme', 'light mode']);
  const dark = !explicitLight && (includesAny(text, ['dark', 'escuro', 'noturno', 'night']) || ['premium', 'luxury', 'glass'].includes(style));
  const isDashboard = generationType !== 'LANDING_PAGE' && archetype === 'dashboard';

  const explicitStyle = !evidence.includes('style:premium-default');
  const palette = resolvePalette(text, style, archetype, explicitStyle, evidence);

  const experience = buildExperience(text, archetype);
  const domainPatterns: ExperiencePattern[] = ['talent-hub', 'learning-campus', 'logistics-control', 'event-stage', 'hospitality-service'];
  if (!domainPatterns.includes(experience.pattern) && !includesAny(text, ['split', 'dividid', 'duas colunas', 'mosaico', 'bento', 'modular', 'denso', 'dense', 'rail', 'editorial', 'revista', 'storytelling', 'imersiv', 'immersive', 'canvas'])) {
    const compatibleLayouts: Record<ProductArchetype, LayoutSignature[]> = {
      finance: ['dense-rail', 'modular-grid', 'split-focus'],
      healthcare: ['split-focus', 'modular-grid', 'editorial-stack'],
      crm: ['dense-rail', 'modular-grid', 'split-focus'],
      commerce: ['modular-grid', 'editorial-stack', 'immersive-canvas'],
      creative: ['immersive-canvas', 'editorial-stack', 'split-focus'],
      dashboard: ['modular-grid', 'dense-rail', 'split-focus'],
      saas: ['split-focus', 'modular-grid', 'dense-rail'],
      generic: ['editorial-stack', 'modular-grid', 'split-focus'],
    };
    experience.layout = compatibleLayouts[archetype][stableIndex(`${prompt}:${archetype}`, compatibleLayouts[archetype].length)]!;
  }

  const requestedNavigation: VisualIntent['navigation'] = isDashboard || includesAny(text, [
    'sidebar',
    'menu lateral',
    'navegação lateral',
    'navegacao lateral',
    'side navigation',
  ]) ? 'sidebar' : 'top';
  const composition = buildComposition(text, archetype, experience, requestedNavigation, evidence);
  const navigation: VisualIntent['navigation'] = ['sidebar-workspace', 'compact-rail', 'split-workspace'].includes(composition.shell)
    ? 'sidebar'
    : 'top';

  return {
    version: 2,
    style,
    archetype,
    density: compact ? 'compact' : spacious ? 'spacious' : 'comfortable',
    locale,
    colorMode: dark ? 'dark' : 'light',
    radius: includesAny(text, ['brutalist', 'brutalista', 'sharp', 'quadrado']) ? 'sharp' : 'rounded',
    navigation,
    motion: noMotion ? 'none' : expressiveMotion ? 'expressive' : 'subtle',
    brandName: detectBrandName(prompt),
    typography: {
      display: ['editorial', 'luxury'].includes(style) || archetype === 'creative' ? 'Playfair Display' : 'Manrope',
      body: 'Inter',
    },
    palette,
    identity: buildIdentity(text, style, archetype),
    experience,
    composition,
    evidence,
  };
}

export function visualFingerprint(intent: VisualIntent): string {
  return [
    intent.archetype,
    intent.style,
    intent.palette.name,
    intent.experience.pattern,
    intent.experience.layout,
    intent.experience.primaryDataView,
    intent.navigation,
    intent.composition.shell,
    intent.composition.actionPlacement,
    intent.radius,
  ].join(':');
}
