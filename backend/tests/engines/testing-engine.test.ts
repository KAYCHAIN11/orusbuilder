import { learningEngine } from '../../src/engines/learning-engine';
import { TestingEngine, TestFramework, TestType } from '../../src/engines/testing-engine';
import { ProductBlueprintPlanner } from '../../src/blueprint/product-blueprint';

describe('TestingEngine generated project tests', () => {
  const createEngine = async () => {
    const engine = new TestingEngine();
    await engine.initialize({
      enabled: true,
      enableAutoGeneration: true,
      enableMutationTesting: false,
      enableFlakyDetection: true,
      enableAIEdgeCases: true,
      minCoverageThreshold: 70,
      targetCoverage: 80,
      maxParallelTests: 1,
      testTimeout: 30000,
      supportedFrameworks: [TestFramework.JEST, TestFramework.VITEST],
      defaultFramework: TestFramework.JEST
    } as any);
    return engine;
  };

  beforeEach(() => {
    jest.spyOn(learningEngine, 'recordEvent').mockResolvedValue({ success: true } as any);
  });

  it.each([
    [TestFramework.JEST, 'backend/src/__tests__/orus-generated.contract.test.ts'],
    [TestFramework.VITEST, 'frontend/src/__tests__/orus-generated.contract.test.ts']
  ])('materializes an executable %s contract test', async (framework, expectedPath) => {
    const engine = await createEngine();
    const result = await engine.generateTests({
      id: 'test-request',
      requestId: 'test-request',
      userId: 'user-1',
      projectId: 'project-1',
      sourceFiles: [
        { path: `${framework === TestFramework.JEST ? 'backend' : 'frontend'}/src/index.ts`, content: 'export const value = 1;', language: 'typescript', type: 'util' }
      ],
      testTypes: [TestType.UNIT, TestType.INTEGRATION],
      framework,
      targetCoverage: 80,
      generateEdgeCases: true,
      generateMocks: false,
      includePerformanceTests: false,
      includeSecurityTests: false,
      version: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    expect(result.success).toBe(true);
    expect(result.data?.tests).toHaveLength(1);
    expect(result.data?.tests[0]).toEqual(expect.objectContaining({ path: expectedPath, framework }));
    expect(result.data?.tests[0]?.code).toContain('fs.existsSync');
    expect(result.data?.tests[0]?.code).not.toContain('expect(true)');
  });

  it('records only an actual project-runner result', async () => {
    const engine = await createEngine();
    const generated = await engine.generateTests({
      id: 'execution-request',
      requestId: 'execution-request',
      userId: 'user-1',
      projectId: 'project-1',
      sourceFiles: [{ path: 'backend/src/index.ts', content: 'export {};', language: 'typescript', type: 'util' }],
      testTypes: [TestType.INTEGRATION],
      framework: TestFramework.JEST,
      targetCoverage: 80,
      generateEdgeCases: false,
      generateMocks: false,
      includePerformanceTests: false,
      includeSecurityTests: false,
      version: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const suiteId = generated.data!.suiteId;

    expect((await engine.executeTests(suiteId)).success).toBe(false);
    const executed = await engine.executeTests(suiteId, { success: true, duration: 18, output: '1 passed' });
    expect(executed.success).toBe(true);
    expect(executed.data).toEqual(expect.objectContaining({ status: 'success', passed: 1, failed: 0, duration: 18 }));
  });

  it('generates a traceability contract from required Blueprint criteria', async () => {
    const engine = await createEngine();
    const productBlueprint = await new ProductBlueprintPlanner().create({ prompt: 'Sistema de agendamentos e clientes' });
    const result = await engine.generateTests({
      id: 'acceptance-request', requestId: 'acceptance-request', userId: 'user-1', projectId: 'project-1',
      sourceFiles: [{ path: 'backend/src/index.ts', content: 'export {};', language: 'typescript', type: 'util' }],
      productBlueprint,
      testTypes: [TestType.INTEGRATION], framework: TestFramework.JEST, targetCoverage: 80,
      generateEdgeCases: false, generateMocks: false, includePerformanceTests: false, includeSecurityTests: false,
      version: 1, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    const acceptance = result.data?.tests.find(test => test.path?.endsWith('orus-acceptance.contract.test.ts'));

    expect(result.data?.tests).toHaveLength(2);
    expect(acceptance?.code).toContain("acceptancePlan.criteria.filter((criterion: any) => criterion.required)");
    expect(acceptance?.code).toContain("expect(criterion.screens.length).toBeGreaterThan(0)");
  });

  it('generates executable API behavior from Blueprint capabilities', async () => {
    const engine = await createEngine();
    const productBlueprint = await new ProductBlueprintPlanner().create({
      prompt: 'CRM fullstack com pipeline de negócios, relatórios, login e persistência',
    });
    const result = await engine.generateTests({
      id: 'behavior-request', requestId: 'behavior-request', userId: 'user-1', projectId: 'project-1',
      sourceFiles: [{ path: 'backend/src/app.ts', content: 'export default app;', language: 'typescript', type: 'util' }],
      productBlueprint,
      testTypes: [TestType.INTEGRATION], framework: TestFramework.JEST, targetCoverage: 80,
      generateEdgeCases: false, generateMocks: false, includePerformanceTests: false, includeSecurityTests: false,
      version: 1, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    const behavior = result.data?.tests.find(test => test.path?.endsWith('orus-capabilities.behavior.test.ts'));

    expect(result.data?.tests).toHaveLength(3);
    expect(behavior?.code).toContain("request(app).post(resource.path)");
    expect(behavior?.code).toContain("request(app).patch(resource.path + '/' + created.id + '/status')");
    expect(behavior?.code).toContain("request(app).get(resource.path + '/insights/summary')");
    expect(behavior?.code).toContain("rejects anonymous access to protected product resources");
    expect(behavior?.code).toContain("strategies.includes('integration')");
    expect(behavior?.code).toContain("strategies.includes('content')");
    expect(behavior?.code).toContain("strategies.includes('custom')");
    expect(behavior?.code).toContain("request(app).post(resource.path)).send({})");
    expect(behavior?.code).toContain(productBlueprint.acceptanceCriteria.find(criterion => criterion.required)!.id);
    expect(behavior?.code).not.toMatch(/(?:password|api[_-]?key|secret|token)\s*=\s*["'][^"']+["']/i);
  });
});
