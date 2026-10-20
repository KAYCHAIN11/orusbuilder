import { analyzeVisualIntent, visualFingerprint } from '../../src/generation/visual-intent';
import { planUIComponents, UI_COMPONENT_CATALOG } from '../../src/generation/ui-component-catalog';
import { trinityEngine } from '../../src/engines/trinity-engine';

describe('visual intent planning', () => {
  it('honors an explicit luxury direction and extracts the brand', () => {
    const intent = analyzeVisualIntent(
      'Crie uma landing page premium de luxo para uma joalheria chamada Aurea, escura e dourada',
      'LANDING_PAGE'
    );

    expect(intent.style).toBe('luxury');
    expect(intent.colorMode).toBe('dark');
    expect(intent.brandName).toBe('Aurea');
    expect(intent.palette.name).toBe('obsidian-gold');
    expect(intent.identity.personality).toContain('refined');
    expect(intent.experience.pattern).toBe('commerce-pulse');
  });

  it('uses domain-aware defaults without overriding an explicit style', () => {
    const finance = analyzeVisualIntent('Dashboard para uma fintech com investimentos');
    const playfulFinance = analyzeVisualIntent('Dashboard divertido e vibrante para uma fintech');

    expect(finance.archetype).toBe('finance');
    expect(finance.style).toBe('corporate');
    expect(playfulFinance.style).toBe('playful');
  });

  it('does not confuse ordinary words ending in fin with the finance domain', () => {
    const intent = analyzeVisualIntent('Loja divertida com API completa, produtos, pedidos e banco SQLite');

    expect(intent.archetype).toBe('commerce');
    expect(intent.style).toBe('playful');
  });

  it('does not treat the generic product concept as an e-commerce request', () => {
    const intent = analyzeVisualIntent(
      'Evolua o produto existente de agendamentos e clientes preservando a arquitetura atual'
    );

    expect(intent.archetype).not.toBe('commerce');
  });

  it('does not confuse Fluxo with a luxury style request', () => {
    const intent = analyzeVisualIntent('Aplicação Fluxo Norte com visual industrial em azul petróleo e âmbar');

    expect(intent.style).not.toBe('luxury');
    expect(intent.evidence).toContain('palette:explicit-blue');
  });

  it('plans complete states for generated application interfaces', () => {
    const intent = analyzeVisualIntent('Painel administrativo premium com sidebar');
    const plan = planUIComponents(intent);

    expect(plan).toEqual(expect.arrayContaining([
      'app-shell', 'data-table', 'empty-state', 'skeleton', 'dialog', 'toast',
    ]));
    expect(UI_COMPONENT_CATALOG.find(component => component.id === 'button')?.states)
      .toEqual(expect.arrayContaining(['hover', 'focus', 'disabled', 'loading']));
  });

  it('is carried by Trinity even without an external AI provider', () => {
    const intent = trinityEngine.planVisualIntent(
      'Painel corporativo para uma fintech chamada Ledger, compacto e com menu lateral'
    );

    expect(intent).toMatchObject({
      archetype: 'finance',
      style: 'corporate',
      brandName: 'Ledger',
      navigation: 'sidebar',
      density: 'compact',
    });
  });

  it('understands a Portuguese request for side navigation', () => {
    const intent = analyzeVisualIntent(
      'Crie uma fintech minimalista chamada Atlas com navegação lateral'
    );

    expect(intent.navigation).toBe('sidebar');
  });

  it('creates a domain-specific identity and experience before component planning', () => {
    const healthcare = analyzeVisualIntent('Sistema Clinia para clínicas com agenda, pacientes e prontuários');
    const commerce = analyzeVisualIntent('Loja chamada Vitta com catálogo, produtos, pedidos e checkout');

    expect(healthcare).toMatchObject({
      version: 2,
      archetype: 'healthcare',
      palette: { name: 'clinical-mint' },
      experience: { pattern: 'care-hub', primaryDataView: 'calendar', hierarchy: 'people-first' },
    });
    expect(healthcare.identity.promise).toContain('cuidado');
    expect(commerce).toMatchObject({
      brandName: 'Vitta',
      palette: { name: 'commerce-coral' },
      experience: { pattern: 'commerce-pulse', primaryDataView: 'catalog' },
    });
    expect(planUIComponents(healthcare)).toContain('calendar');
    expect(planUIComponents(commerce)).toEqual(expect.arrayContaining(['catalog', 'chart']));
  });

  it('keeps the brand name separate from the product description', () => {
    const intent = analyzeVisualIntent('Crie o aplicativo Atlas Flow para gestão operacional com tarefas e projetos');

    expect(intent.brandName).toBe('Atlas Flow');
  });

  it('extracts a title-case brand after a Portuguese para a expression', () => {
    const intent = analyzeVisualIntent('Landing page editorial para a Casa Aurora, um estúdio de arquitetura');

    expect(intent.brandName).toBe('Casa Aurora');
  });

  it.each([
    ['Landing page editorial de luxo para Nocturne Atelier, com composição assimétrica', 'Nocturne Atelier'],
    ['Central operacional fullstack Northstar Control para logística de cadeia fria', 'Northstar Control'],
    ['Plataforma fullstack Lumen Academy para formação criativa', 'Lumen Academy'],
    ['Aplicação clínica fullstack Amparo Care para cuidado materno', 'Amparo Care'],
    ['Workspace criativo fullstack FrameFlow Studio para produtoras', 'FrameFlow Studio'],
    ['Sistema financeiro fullstack Atlas Treasury para tesouraria', 'Atlas Treasury'],
  ])('extracts showcase brand names from natural product descriptions', (prompt, brandName) => {
    expect(analyzeVisualIntent(prompt).brandName).toBe(brandName);
  });

  it('prioritizes explicit brand colors and light mode over style defaults', () => {
    const intent = analyzeVisualIntent(
      'Aplicação Clinia sofisticada com tons claros de verde e teal para uma clínica'
    );

    expect(intent.style).toBe('premium');
    expect(intent.colorMode).toBe('light');
    expect(intent.palette.name).toBe('clinical-mint');
    expect(intent.evidence).toContain('palette:explicit-green-teal');
  });

  it('separates a sales CRM from a clinical product before component planning', () => {
    const crm = analyzeVisualIntent('CRM Vértice com pipeline de vendas, contatos, empresas e oportunidades em verde esmeralda');
    const clinic = analyzeVisualIntent('Sistema Clinia para clínicas com pacientes, agenda e atendimentos em verde');

    expect(crm).toMatchObject({
      archetype: 'crm',
      palette: { name: 'revenue-emerald' },
      experience: { pattern: 'revenue-pipeline', primaryDataView: 'kanban' },
    });
    expect(clinic).toMatchObject({
      archetype: 'healthcare',
      palette: { name: 'clinical-mint' },
      experience: { pattern: 'care-hub', primaryDataView: 'calendar' },
    });
    expect(crm.identity.promise).not.toBe(clinic.identity.promise);
  });

  it('creates distinct brand systems for different products in the same domain', () => {
    const atlas = analyzeVisualIntent('CRM Atlas com contatos, empresas e pipeline de vendas');
    const pulse = analyzeVisualIntent('CRM Pulse com contatos, empresas e pipeline de vendas');

    expect(atlas.archetype).toBe('crm');
    expect(pulse.archetype).toBe('crm');
    expect(visualFingerprint(atlas)).not.toBe(visualFingerprint(pulse));
  });

  it.each([
    ['recruiting', 'Sistema Talento Vivo com vagas, candidatos, processo seletivo e entrevistas', 'talent-hub', 'kanban', 'people-first'],
    ['education', 'Plataforma Aprende+ com catálogo de cursos, matrículas e progresso de aprendizagem', 'learning-campus', 'catalog', 'content-first'],
    ['logistics', 'Aplicação Rota Clara para remessas e entregas, gestão de frota e planejamento de rotas', 'logistics-control', 'timeline', 'workflow-first'],
    ['events', 'Aplicativo Festival Vivo com programação de eventos, ingressos e inscrições e credenciamento', 'event-stage', 'calendar', 'content-first'],
    ['hospitality', 'Sistema Mesa Autoral com reservas de mesas, cardápio e painel da cozinha', 'hospitality-service', 'kanban', 'workflow-first'],
  ])('creates a distinct %s experience before composing the interface', (_domain, prompt, pattern, primaryDataView, hierarchy) => {
    const intent = analyzeVisualIntent(prompt);

    expect(intent.archetype).toBe('generic');
    expect(intent.experience).toMatchObject({ pattern, primaryDataView, hierarchy });
    expect(intent.identity.promise).not.toContain('experiência coerente');
    expect(intent.evidence.some(item => item.startsWith('domain-family:'))).toBe(true);
  });

  it('keeps distinct visual fingerprints across the expanded domain matrix', () => {
    const prompts = [
      'Sistema Talento Vivo com vagas, candidatos, processo seletivo e entrevistas',
      'Plataforma Aprende+ com catálogo de cursos, matrículas e progresso de aprendizagem',
      'Aplicação Rota Clara para remessas e entregas, gestão de frota e planejamento de rotas',
      'Aplicativo Festival Vivo com programação de eventos, ingressos e inscrições e credenciamento',
      'Sistema Mesa Autoral com reservas de mesas, cardápio e painel da cozinha',
    ];
    const fingerprints = prompts.map(prompt => visualFingerprint(analyzeVisualIntent(prompt)));

    expect(new Set(fingerprints).size).toBe(prompts.length);
  });

  it('honors explicit composition and color directions from the prompt', () => {
    const intent = analyzeVisualIntent('Plataforma financeira chamada Lume, azul marinho, layout bento modular e tema claro');

    expect(intent.palette.name).toBe('trust-blue');
    expect(intent.experience.layout).toBe('modular-grid');
    expect(intent.colorMode).toBe('light');
  });

  it.each([
    ['Sistema clínico com split view, ação junto ao conteúdo e agenda', 'split-workspace', 'inline'],
    ['Loja mobile-first com tabs inferiores e botão flutuante', 'bottom-navigation', 'floating'],
    ['Estúdio criativo imersivo em canvas com ação no menu', 'canvas', 'navigation'],
    ['Dashboard financeiro com menu lateral compacto e barra de comandos', 'compact-rail', 'command-bar'],
    ['SaaS com navegação superior e ação junto ao conteúdo', 'top-navigation', 'inline'],
    ['CRM com sidebar e botão flutuante para novo negócio', 'sidebar-workspace', 'floating'],
  ])('turns explicit product composition into a stable shell: %s', (prompt, shell, actionPlacement) => {
    const intent = analyzeVisualIntent(prompt);

    expect(intent.composition.shell).toBe(shell);
    expect(intent.composition.actionPlacement).toBe(actionPlacement);
    expect(intent.evidence).toContain(`composition:explicit-${shell}`);
    expect(intent.composition.rationale).toContain(`action:${actionPlacement}`);
  });
});
