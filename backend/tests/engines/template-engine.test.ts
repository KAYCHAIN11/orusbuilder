import { TemplateEngine, TemplateType, type TemplateRenderRequest } from '../../src/engines/template-engine';

describe('TemplateEngine', () => {
  function request(overrides: Partial<TemplateRenderRequest> = {}): TemplateRenderRequest {
    const now = new Date();
    return {
      id: 'render-1',
      requestId: 'render-1',
      templateId: 'ts-service',
      type: TemplateType.SERVICE,
      language: 'typescript',
      variables: { serviceName: 'PatientService' },
      validateOutput: true,
      version: 1,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      ...overrides,
    };
  }

  it('renders a complete service with defaults and no provider dependency', async () => {
    const engine = new TemplateEngine();
    await engine.initialize({
      enabled: true,
      enableAIGeneration: false,
      enableCaching: true,
      enableValidation: true,
      enableMarketplace: false,
      maxTemplateSize: 1_000_000,
    });

    const result = await engine.render(request());

    expect(result.success).toBe(true);
    expect(result.data?.valid).toBe(true);
    expect(result.data?.content).toContain('class PatientService');
    expect(result.data?.content).toContain('return this.records.delete(id)');
    expect(result.data?.content).not.toMatch(/TODO|Not implemented|Coming soon/);
  });

  it('fails closed when a required template variable is missing', async () => {
    const engine = new TemplateEngine();
    await engine.initialize({ enabled: true, enableAIGeneration: false });

    const result = await engine.render(request({ variables: {} }));

    expect(result.success).toBe(false);
    expect(result.error?.details).toBeInstanceOf(Error);
    expect((result.error?.details as Error).message).toContain('serviceName');
  });

  it('rejects templates with incomplete implementation markers', async () => {
    const engine = new TemplateEngine();
    await engine.initialize({ enabled: true, enableAIGeneration: false });
    await engine.createTemplate({
      templateId: 'incomplete-service',
      name: 'Incomplete service',
      description: 'Regression fixture',
      type: TemplateType.SERVICE,
      content: `export class BrokenService { run(): void { throw new Error('Not implemented'); } }`,
      variables: [],
      conditionals: [],
      language: 'typescript',
      category: 'service',
      tags: ['regression'],
      usageCount: 0,
      rating: 0,
      authorId: 'test',
      isPublic: false,
      isFeatured: false,
    });

    const result = await engine.render(request({ templateId: 'incomplete-service', variables: {} }));

    expect(result.success).toBe(false);
    expect((result.error?.details as Error).message).toContain('incomplete implementation marker');
  });
});
