import { analyzeVisualIntent } from '../../src/generation/visual-intent';
import { ComponentStatus } from '../../src/engines/cig-engine-compat';
import { EngineRegistry } from '../../src/engines/engine-registry';
import { OrchestrationEngine, WorkflowType, type WorkflowProgressUpdate } from '../../src/engines/orchestrator-engine';

describe('OrchestrationEngine integration', () => {
  it.each([
    { cigPassed: true, severity: 'low', includeTests: true, buildFailures: 0, previewFailures: 0, qualityScore: 96 },
    { cigPassed: false, severity: 'low', includeTests: true, buildFailures: 0, previewFailures: 0, qualityScore: 96 },
    { cigPassed: true, severity: 'high', includeTests: false, buildFailures: 0, previewFailures: 0, qualityScore: 96 },
    { cigPassed: false, severity: 'critical', includeTests: false, buildFailures: 0, previewFailures: 0, qualityScore: 96 },
    { cigPassed: true, severity: 'low', includeTests: true, buildFailures: 1, previewFailures: 0, qualityScore: 96 },
    { cigPassed: true, severity: 'low', includeTests: true, buildFailures: 0, previewFailures: 1, qualityScore: 96 },
    { cigPassed: true, severity: 'low', includeTests: true, buildFailures: 0, previewFailures: 0, qualityScore: 69 },
  ])('preserves quality gates: %j', async ({ cigPassed, severity, includeTests, buildFailures, previewFailures, qualityScore }) => {
    const passed = cigPassed && severity === 'low' && qualityScore >= 70;
    const calls: string[] = [];
    const progressUpdates: WorkflowProgressUpdate[] = [];
    let buildAttempts = 0;
    let previewAttempts = 0;
    const protectedContent = 'export const App = () => <main>Minha edição ORUS</main>';
    const lifecycle = {
      initialize: async () => undefined,
      start: async () => undefined,
      stop: async () => undefined,
      getStatus: () => ComponentStatus.RUNNING,
    };
    const registry = new EngineRegistry();
    const register = (name: string, engine: object) => registry.register({
      name,
      engine: { ...lifecycle, ...engine },
      config: { enabled: true },
      required: true,
      capabilities: [],
    });

    register('trinity', { planVisualIntent: (prompt: string) => analyzeVisualIntent(prompt) });
    register('prompt', {
      analyze: async () => ({
        success: true,
        data: {
          intent: { type: 'CREATE_APP' },
          entities: [],
          context: { domain: 'saas', complexity: 'standard', stylePreferences: 'premium' },
          specification: { technologies: { frontend: ['react'] } },
        },
      }),
    });
    register('cognitive-generation', {
      generate: async (request: { options: { includeTests: boolean } }) => {
        expect(request.options.includeTests).toBe(includeTests);
        calls.push('generation');
        const file = { path: 'src/App.tsx', content: 'export const App = () => <main>ORUS</main>' };
        return {
          success: true,
          components: [{
            name: 'App',
            type: 'component',
            code: file.content,
            path: file.path,
            language: 'typescript',
            framework: 'react',
            dependencies: [],
            files: [file],
            metadata: { linesOfCode: 1, complexity: 1, generated: true },
          }],
          qualityScore,
          dependencies: [],
          packageJson: '{}',
          readme: '',
          data: { components: [], files: [file, { path: 'src/deleted.ts', content: 'export const obsolete = true;' }], structure: {} },
        };
      },
      repair: async (request: { files: Array<{ path: string; content: string }> }) => {
        calls.push('repair');
        return {
          success: true,
          files: request.files.map(file => ({ ...file, content: `${file.content}\nexport const repaired = true;` })),
          changedFiles: ['src/App.tsx'],
        };
      },
    });
    register('ui-enhancement', { enhance: async (files: unknown[]) => ({ enhancedFiles: files, configFiles: [], statistics: {} }) });
    register('blueprint', {
      createProductBlueprint: async ({ prompt, projectId }: { prompt: string; projectId: string }) => ({
        blueprintId: 'blueprint-1',
        projectId,
        version: 1,
        status: 'ready',
        depth: 'essential',
        source: { type: 'prompt', prompt, documentIds: [] },
        product: { name: 'ORUS', summary: prompt, problem: '', valueProposition: '', audience: [], goals: [], outOfScope: [] },
        visualIntent: analyzeVisualIntent(prompt),
        personas: [],
        capabilities: [],
        journeys: [],
        screens: [{ id: 'screen-home', name: 'Início', route: '/', purpose: '', layout: 'dashboard', capabilityIds: [], componentIds: [], states: [] }],
        components: [],
        data: [],
        architecture: { frontend: ['React'], backend: [], authentication: false, api: 'rest' },
        acceptanceCriteria: [],
        assumptions: [],
        openQuestions: [],
        confidence: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      validateProductBlueprint: () => ({ valid: true, score: 100, errors: [], warnings: [] }),
      parse: async () => {
        calls.push('blueprint');
        return { structure: { entities: [], services: [], components: [{ name: 'App' }] } };
      },
    });
    register('testing', {
      generateTests: async () => {
        calls.push('testing');
        return { success: true, data: { tests: [], totalTests: 0 } };
      },
    });
    register('build-system', {
      validateGeneratedProject: async (_projectId: string, _name: string, files: Array<{ path: string; content: string }>) => {
        expect(files).toEqual([{ path: 'src/App.tsx', content: protectedContent }]);
        calls.push('build-system');
        buildAttempts++;
        if (buildAttempts <= buildFailures) {
          return {
            success: false,
            projectId: 'project-1',
            commands: [],
            diagnostics: [{ stage: 'build', category: 'typescript', message: 'TS2304', output: 'TS2304', affectedFiles: ['src/App.tsx'] }],
            duration: 1,
          };
        }
        return { success: true, projectId: 'project-1', commands: [], diagnostics: [], duration: 1 };
      },
      validateGeneratedPreview: async () => {
        calls.push('preview');
        previewAttempts++;
        if (previewAttempts <= previewFailures) {
          return {
            success: false, projectId: 'project-1', assetCount: 0, backendReady: false, duration: 1,
            diagnostics: [{ stage: 'runtime', category: 'runtime', message: 'Preview failed', output: 'blank page', affectedFiles: ['src/App.tsx'] }],
          };
        }
        return { success: true, projectId: 'project-1', assetCount: 2, backendReady: true, duration: 1, diagnostics: [] };
      },
    });
    register('security', {
      scan: async () => {
        calls.push('security');
        return { success: true, data: { securityScore: 100, vulnerabilities: [{ severity }] } };
      },
    });
    register('cig', {
      validate: async () => {
        calls.push('cig');
        return { success: true, data: { isValid: cigPassed, passed: cigPassed } };
      },
    });
    register('learning', {
      recordEvent: async () => {
        calls.push('learning');
        return { success: true };
      },
    });
    register('monitoring', {
      recordMetric: async () => {
        calls.push('monitoring');
        return {};
      },
    });

    const orchestrator = new OrchestrationEngine(registry);
    const result = await orchestrator.executeWorkflow({
      id: 'request-1',
      requestId: 'request-1',
      userId: 'user-1',
      workflowType: WorkflowType.PROMPT_TO_DEPLOY,
      input: {
        projectId: 'project-1',
        prompt: 'Crie um SaaS premium para gestão de projetos',
        options: {
          includeTests, locale: 'pt-BR',
          workspaceOverlay: {
            protectedPaths: ['src/App.tsx', 'src/deleted.ts'],
            files: [{ path: 'src/App.tsx', content: protectedContent }],
          },
          onProgress: (update: WorkflowProgressUpdate) => progressUpdates.push(update),
        },
      },
      version: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result.success).toBe(passed);
    expect(result.data?.overallSuccess).toBe(passed);
    expect(result.data?.stepsFailed).toBe(Number(!cigPassed) + Number(severity !== 'low') + Number(qualityScore < 70));
    expect(result.error?.code).toBe(passed ? undefined : 'VALIDATION_ERROR');
    const outputFiles = result.data?.output['files'] as Array<{ path: string; content: string }>;
    expect(outputFiles).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: 'src/App.tsx', content: protectedContent }),
    ]));
    const certification = outputFiles.find(file => file.path === '.orus/certification.json');
    if (passed) {
      expect(JSON.parse(certification?.content || '{}')).toMatchObject({
        version: 1,
        projectId: 'project-1',
        gates: {
          runtime: true,
          preview: true,
          productCoverage: { passed: true },
          quality: { passed: true },
          security: true,
          cig: true,
        },
      });
    } else {
      expect(certification).toBeUndefined();
    }
    expect(result.data?.output['repairAttempts']).toHaveLength(buildFailures + previewFailures);
    expect(progressUpdates.filter(update => update.candidateArtifact).length).toBeGreaterThanOrEqual(3);
    expect(progressUpdates.find(update => update.candidateArtifact)?.candidateArtifact).toMatchObject({
      artifactHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      files: expect.arrayContaining([expect.objectContaining({ path: 'src/App.tsx', content: protectedContent })]),
    });
    expect(calls).toEqual([
      'generation',
      ...(includeTests ? ['testing'] : []),
      'build-system',
      ...(buildFailures ? ['repair', 'build-system'] : []),
      'preview',
      ...(previewFailures ? ['repair', 'build-system', 'preview'] : []),
      'blueprint',
      'security',
      'cig',
      'learning',
      'monitoring',
    ]);
  });

  it('rejects workflow types without implementation', async () => {
    const orchestrator = new OrchestrationEngine(new EngineRegistry());
    const result = await orchestrator.executeWorkflow({
      id: 'request-2',
      requestId: 'request-2',
      userId: 'user-1',
      workflowType: WorkflowType.CUSTOM,
      input: { prompt: 'custom' },
      version: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result.success).toBe(false);
  });
});
