import { detectScopeFromPrompt } from '../../src/generation/prompt-scope-detector';

describe('prompt scope detection', () => {
  it('honors explicit frontend-only exclusions', () => {
    const result = detectScopeFromPrompt(
      'Crie somente o frontend de um dashboard React. Não crie backend nem banco de dados.'
    );

    expect(result.type).toBe('feature');
    expect(result.shouldIncludeFrontend).toBe(true);
    expect(result.shouldIncludeBackend).toBe(false);
    expect(result.shouldIncludeDatabase).toBe(false);
  });

  it('honors backend-only intent while retaining its database', () => {
    const result = detectScopeFromPrompt(
      'Crie somente o backend de uma API REST de produtos com PostgreSQL, sem frontend.'
    );

    expect(result.type).toBe('backend');
    expect(result.shouldIncludeFrontend).toBe(false);
    expect(result.shouldIncludeBackend).toBe(true);
    expect(result.shouldIncludeDatabase).toBe(true);
  });

  it('detects explicit fullstack applications', () => {
    const result = detectScopeFromPrompt(
      'Crie um sistema fullstack com React, API Express e banco SQLite.'
    );

    expect(result.type).toBe('fullstack');
    expect(result.shouldIncludeFrontend).toBe(true);
    expect(result.shouldIncludeBackend).toBe(true);
    expect(result.shouldIncludeDatabase).toBe(true);
  });

  it('does not confuse Portuguese "no backend" with the English negation', () => {
    const result = detectScopeFromPrompt(
      'Crie uma aplicação fullstack premium com React no frontend, Node.js, Express e Prisma no backend e banco SQLite.'
    );

    expect(result.type).toBe('fullstack');
    expect(result.shouldIncludeFrontend).toBe(true);
    expect(result.shouldIncludeBackend).toBe(true);
    expect(result.shouldIncludeDatabase).toBe(true);
  });

  it('does not interpret a generic "sistema de" frontend as fullstack', () => {
    const result = detectScopeFromPrompt('Crie um sistema de catálogo somente frontend em React.');

    expect(result.shouldIncludeBackend).toBe(false);
    expect(result.shouldIncludeDatabase).toBe(false);
  });

  it('recognizes a natural-language request for only one React component', () => {
    const result = detectScopeFromPrompt(
      'Crie somente um componente React reutilizável ProductCard com imagem e botão. Não crie backend.'
    );

    expect(result.type).toBe('single-component');
    expect(result.shouldIncludeFrontend).toBe(true);
    expect(result.shouldIncludeBackend).toBe(false);
  });

  it('keeps an explicit landing-only request out of the fullstack pipeline', () => {
    const result = detectScopeFromPrompt(
      'Use React e TypeScript. Gere apenas a landing page, sem dashboard funcional, autenticação, backend ou páginas adicionais.'
    );

    expect(result.type).toBe('landing_page');
    expect(result.shouldIncludeFrontend).toBe(true);
    expect(result.shouldIncludeBackend).toBe(false);
    expect(result.shouldIncludeDatabase).toBe(false);
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});
