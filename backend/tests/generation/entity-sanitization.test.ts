import { GenerationPipeline } from '../../src/engines/cognitive-generation-engine';

describe('domain entity sanitization', () => {
  it('does not turn a generic product reference into a Product domain model', () => {
    const pipeline = new GenerationPipeline() as any;
    const entities = pipeline.sanitizeDomainEntities(
      ['Product', 'Schedule', 'Patient', 'Clinic'],
      'O produto deve ter dashboard com agenda, pacientes e dados da clínica'
    );

    expect(entities).toEqual(['Schedule', 'Patient', 'Clinic']);
  });

  it('keeps Product when the requested domain actually manages products', () => {
    const pipeline = new GenerationPipeline() as any;
    const entities = pipeline.sanitizeDomainEntities(
      ['Product', 'Order'],
      'Loja com catálogo de produtos, estoque, carrinho e pedidos'
    );

    expect(entities).toEqual(['Product', 'Order']);
  });

  it('normalizes a Portuguese CRM prompt and rejects instruction words', () => {
    const pipeline = new GenerationPipeline() as any;
    const entities = pipeline.sanitizeDomainEntities(
      ['Deve', 'Dashboard', 'Contatos', 'Empresas', 'Negocios', 'Tarefas'],
      'CRM com login, contatos, empresas, negócios, tarefas e CRUD completo'
    );

    expect(entities).toEqual(['Contact', 'Company', 'Deal', 'Task']);
  });

  it('does not turn a sales stage or the requesting team into domain models', () => {
    const pipeline = new GenerationPipeline() as any;
    const entities = pipeline.extractDomainEntitiesFromPrompt(
      'CRM para uma equipe comercial com etapas Lead, Qualificação e Proposta'
    );

    expect(entities).toEqual([]);
  });

  it('keeps authentication users out of the business domain unless explicitly requested', () => {
    const pipeline = new GenerationPipeline() as any;

    expect(pipeline.sanitizeDomainEntities(
      ['User', 'Contact', 'Company'],
      'CRM com autenticação, contatos e empresas'
    )).toEqual(['Contact', 'Company']);
    expect(pipeline.sanitizeDomainEntities(
      ['User', 'Contact'],
      'Painel administrativo para gerenciar usuários e contatos'
    )).toEqual(['User', 'Contact']);
  });

  it('uses SQLite for explicitly local persistence', () => {
    const pipeline = new GenerationPipeline() as any;

    expect(pipeline.detectDatabaseTypeFromPrompt('App com persistência local funcional')).toBe('sqlite');
  });
});
