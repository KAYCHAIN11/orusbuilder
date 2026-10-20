export type PromptScopeType =
  | 'single-component' | 'feature' | 'page' | 'backend'
  | 'fullstack' | 'database' | 'landing_page';

export interface PromptScopeResult {
  type: PromptScopeType;
  complexity: 'simple' | 'moderate' | 'complex' | 'very_high';
  confidence: number;
  expectedFileCount: { min: number; max: number };
  shouldIncludeFrontend: boolean;
  shouldIncludeBackend: boolean;
  shouldIncludeDatabase: boolean;
  detectedKeywords: string[];
}

const includesAny = (prompt: string, terms: string[]) => terms.some(term => prompt.includes(term));

export function detectScopeFromPrompt(originalPrompt: string): PromptScopeResult {
  const prompt = originalPrompt.toLowerCase();
  const requestsLandingPage = includesAny(prompt, [
    'landing page', 'landing-page', 'página de destino', 'pagina de destino',
    'hero section', 'call to action', 'testimonials', 'marketing page',
  ]);
  const landingOnly = requestsLandingPage && (
    includesAny(prompt, [
      'apenas a landing page', 'somente a landing page', 'só a landing page',
      'so a landing page', 'landing page only', 'only the landing page',
    ]) || /(?:gere|crie|faça|faca)\s+(?:somente|apenas|só|so)\s+(?:uma|a)?\s*landing[ -]page/.test(prompt)
  );
  const frontendOnly = includesAny(prompt, [
    'somente o frontend', 'somente frontend', 'apenas o frontend', 'apenas frontend',
    'só o frontend', 'so o frontend', 'frontend only', 'only the frontend',
  ]);
  const backendOnly = includesAny(prompt, [
    'somente o backend', 'somente backend', 'apenas o backend', 'apenas backend',
    'só o backend', 'so o backend', 'backend only', 'only the backend',
  ]);
  const excludesBackend = frontendOnly || includesAny(prompt, [
    'sem backend', 'não crie backend', 'nao crie backend', 'não inclua backend',
    'nao inclua backend', 'without backend',
  ]) || /\bsem\b[^.!?\n]{0,80}\bbackend\b/.test(prompt);
  const excludesFrontend = backendOnly || includesAny(prompt, [
    'sem frontend', 'não crie frontend', 'nao crie frontend', 'não inclua frontend',
    'nao inclua frontend', 'without frontend',
  ]);
  const excludesDatabase = frontendOnly || includesAny(prompt, [
    'sem banco', 'sem database', 'sem banco de dados', 'não crie banco',
    'nao crie banco', 'não use banco', 'nao use banco', 'nem banco',
    'no database', 'without database',
  ]);

  if (landingOnly) {
    return {
      type: 'landing_page', complexity: 'moderate', confidence: 0.98,
      expectedFileCount: { min: 8, max: 20 }, shouldIncludeFrontend: true,
      shouldIncludeBackend: false, shouldIncludeDatabase: false,
      detectedKeywords: ['landing_page', 'frontend_only'],
    };
  }

  const hasFrontend = !excludesFrontend && includesAny(prompt, [
    'frontend', 'react', 'interface', 'interface web', 'tela', 'página', 'pagina',
  ]);
  const hasBackend = !excludesBackend && includesAny(prompt, [
    'backend', 'express', 'api', 'servidor', 'endpoint', 'controller', 'middleware',
  ]);
  const hasDatabase = !excludesDatabase && includesAny(prompt, [
    'database', 'prisma', 'mongodb', 'banco de dados', 'banco', 'postgres', 'mysql', 'sqlite', ' sql',
  ]);
  const explicitFullstack = !excludesFrontend && !excludesBackend && includesAny(prompt, [
    'fullstack', 'full-stack', 'full stack', 'aplicação completa', 'aplicacao completa',
    'frontend e backend', 'frontend + backend', 'react e express', 'react + express',
    'complete application', 'sistema completo', 'blog system', 'complete system', 'full system',
  ]);

  const requestsSingleComponent = includesAny(prompt, [
    'crie um componente', 'componente de botão', 'componente customizável',
    'single component', 'apenas o componente', 'só o componente', 'simples componente',
    'somente um componente', 'apenas um componente', 'só um componente',
    'componente react', 'reusable component',
  ]) || /(?:crie|gere|faça|faca)\s+(?:somente|apenas|só|so)?\s*(?:um|o)?\s*componente\b/.test(prompt);
  const singleComponent = requestsSingleComponent && !includesAny(prompt, [
    'aplicação', 'aplicacao', 'sistema', 'api', 'dashboard', 'página', 'pagina', 'page',
  ]);
  if (singleComponent) {
    return {
      type: 'single-component', complexity: 'simple', confidence: 0.9,
      expectedFileCount: { min: 10, max: 15 }, shouldIncludeFrontend: true,
      shouldIncludeBackend: false, shouldIncludeDatabase: false,
      detectedKeywords: ['single_component'],
    };
  }

  if (explicitFullstack || (hasFrontend && hasBackend)) {
    return {
      type: 'fullstack', complexity: 'very_high', confidence: 0.95,
      expectedFileCount: { min: 30, max: 90 }, shouldIncludeFrontend: true,
      shouldIncludeBackend: true, shouldIncludeDatabase: hasDatabase,
      detectedKeywords: ['fullstack'],
    };
  }

  if (hasBackend && !hasFrontend) {
    return {
      type: 'backend', complexity: 'complex', confidence: 0.9,
      expectedFileCount: { min: 10, max: 45 }, shouldIncludeFrontend: false,
      shouldIncludeBackend: true, shouldIncludeDatabase: hasDatabase,
      detectedKeywords: ['backend'],
    };
  }

  if (requestsLandingPage) {
    return {
      type: 'landing_page', complexity: 'moderate', confidence: 0.85,
      expectedFileCount: { min: 8, max: 20 }, shouldIncludeFrontend: true,
      shouldIncludeBackend: false, shouldIncludeDatabase: false,
      detectedKeywords: ['landing_page'],
    };
  }

  const featureRich = includesAny(prompt, [
    'dashboard', 'admin panel', 'painel', 'gráficos', 'graficos', 'charts',
    'analytics', 'metrics', 'métricas', 'metricas', 'relatórios', 'relatorios',
    'multiple components', 'vários componentes', 'varios componentes',
  ]);
  return {
    type: 'feature', complexity: featureRich ? 'complex' : 'moderate',
    confidence: featureRich ? 0.85 : 0.65,
    expectedFileCount: featureRich ? { min: 12, max: 35 } : { min: 6, max: 20 },
    shouldIncludeFrontend: true, shouldIncludeBackend: false, shouldIncludeDatabase: false,
    detectedKeywords: featureRich ? ['feature_rich'] : ['default', 'fallback'],
  };
}
