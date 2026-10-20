import { CIGBridge } from '../../src/core/cig/cig-bridge';
import { ProductBlueprintPlanner } from '../../src/blueprint/product-blueprint';
import { orchestrationEngine, WorkflowType } from '../../src/engines/orchestrator-engine';
import { GenerationExecutionService } from '../../src/generation/generation-execution-service';
import { createHash } from 'crypto';

describe('GenerationExecutionService', () => {
  const registerAvailableContext = jest.fn();

  beforeEach(() => {
    jest.restoreAllMocks();
    registerAvailableContext.mockReset().mockResolvedValue(undefined);
    jest.spyOn(CIGBridge, 'getInstance').mockReturnValue({ registerAvailableContext } as any);
  });

  it('builds the canonical workflow request and returns a certified execution', async () => {
    const execution = {
      output: { deployment: { ready: true, validationPassed: true, securityPassed: true }, repairAttempts: [] },
    };
    const executeWorkflow = jest.spyOn(orchestrationEngine, 'executeWorkflow').mockResolvedValue({
      success: true,
      data: execution,
    } as any);

    const result = await new GenerationExecutionService().execute({
      projectId: 'project-1',
      prompt: 'Sistema de agenda',
      userId: 'user-1',
      framework: 'react',
      language: 'typescript',
      includeTests: true,
      style: 'modern',
      signal: new AbortController().signal,
      workspaceOverlay: { protectedPaths: ['src/manual.ts'], files: [{ path: 'src/manual.ts', content: 'export const manual = true;' }] },
    });

    expect(registerAvailableContext).toHaveBeenCalledWith(expect.objectContaining({ projectId: 'project-1' }));
    expect(executeWorkflow).toHaveBeenCalledWith(expect.objectContaining({
      workflowType: WorkflowType.PROMPT_TO_DEPLOY,
      input: expect.objectContaining({
        projectId: 'project-1',
        options: expect.objectContaining({
          framework: 'react', language: 'typescript', includeTests: true, signal: expect.any(AbortSignal),
          workspaceOverlay: { protectedPaths: ['src/manual.ts'], files: [{ path: 'src/manual.ts', content: 'export const manual = true;' }] },
        }),
      }),
    }));
    expect(result).toMatchObject({ certified: true, execution, diagnostics: [], repairAttempts: [] });
  });

  it('normalizes all failed gates and selects the Blueprint workflow', async () => {
    jest.spyOn(orchestrationEngine, 'executeWorkflow').mockResolvedValue({
      success: false,
      error: { message: { pt_BR: 'Certificação recusada' } },
      data: {
        output: {
          deployment: { ready: false, validationPassed: false, securityPassed: false, qualityPassed: false },
          runtimeValidation: { diagnostics: [{ stage: 'build', message: 'Build failed' }] },
          productImplementation: { diagnostics: [{ stage: 'product-coverage', message: 'Screen missing' }] },
          cig: { errors: ['CIG-1'] },
          security: { vulnerabilities: ['SEC-1'] },
          quality: { score: 60, minimumScore: 70 },
          repairAttempts: [{ attempt: 1 }],
        },
      },
    } as any);
    const productBlueprint = await new ProductBlueprintPlanner().create({ prompt: 'Sistema com Blueprint' });

    const result = await new GenerationExecutionService().execute({
      projectId: 'project-2',
      prompt: 'Sistema com Blueprint',
      productBlueprint,
      userId: 'user-2',
      framework: 'react',
      language: 'typescript',
      includeTests: true,
      style: 'premium',
    });

    expect(orchestrationEngine.executeWorkflow).toHaveBeenCalledWith(expect.objectContaining({
      workflowType: WorkflowType.BLUEPRINT_TO_DEPLOY,
      input: expect.objectContaining({ productBlueprint }),
    }));
    expect(result.certified).toBe(false);
    expect(result.repairAttempts).toHaveLength(1);
    expect(result.diagnostics.map(item => item.stage)).toEqual([
      'build', 'product-coverage', 'cig', 'security', 'quality',
    ]);
    expect(result.error).toContain('Certificação recusada [build] Build failed');
  });

  it('resumes from a verified candidate artifact without discarding its files', async () => {
    const productBlueprint = await new ProductBlueprintPlanner().create({ prompt: 'Sistema recuperável' });
    const files = [{ path: 'src/App.tsx', content: 'export default function App() { return null; }' }];
    const artifactHash = createHash('sha256')
      .update(files.map(file => `${file.path}\0${file.content}`).sort().join('\0'))
      .digest('hex');
    const resumeCandidate = {
      stage: 'install-test-build',
      artifactHash,
      createdAt: new Date().toISOString(),
      files,
      productBlueprint,
      generation: { success: true, components: [{ name: 'App', files }], data: { files }, qualityScore: 90 },
    } as any;
    const executeWorkflow = jest.spyOn(orchestrationEngine, 'executeWorkflow').mockResolvedValue({
      success: true,
      data: { output: { deployment: { ready: true } } },
    } as any);

    await new GenerationExecutionService().execute({
      generationId: 'job-resume',
      projectId: 'project-resume',
      prompt: 'Sistema recuperável',
      userId: 'user-resume',
      framework: 'react',
      language: 'typescript',
      includeTests: true,
      style: 'modern',
      resumeCandidate,
    });

    expect(executeWorkflow).toHaveBeenCalledWith(expect.objectContaining({
      workflowType: WorkflowType.BLUEPRINT_TO_DEPLOY,
      input: expect.objectContaining({
        productBlueprint,
        options: expect.objectContaining({ resumeCandidate }),
      }),
    }));
  });

  it('owns and aborts cancellable executions by generation id', async () => {
    let release: ((value: any) => void) | undefined;
    let workflowSignal: AbortSignal | undefined;
    jest.spyOn(orchestrationEngine, 'executeWorkflow').mockImplementation(request => {
      workflowSignal = (request.input['options'] as { signal?: AbortSignal } | undefined)?.signal;
      return new Promise(resolve => { release = resolve; });
    });
    const service = new GenerationExecutionService();
    const execution = service.execute({
      generationId: 'job-cancellable',
      projectId: 'project-3',
      prompt: 'Sistema cancelável',
      userId: 'user-3',
      framework: 'react',
      language: 'typescript',
      includeTests: true,
      style: 'modern',
    });
    await new Promise(resolve => setImmediate(resolve));

    expect(service.cancel('job-cancellable')).toBe(true);
    expect(workflowSignal?.aborted).toBe(true);
    release?.({ success: true, data: { output: { deployment: { ready: true } } } });
    await expect(execution).rejects.toMatchObject({ name: 'AbortError' });
    expect(service.cancel('job-cancellable')).toBe(false);
  });

  it('cancels during context registration before starting the workflow', async () => {
    let release: (() => void) | undefined;
    registerAvailableContext.mockImplementation(() => new Promise<void>(resolve => { release = resolve; }));
    const executeWorkflow = jest.spyOn(orchestrationEngine, 'executeWorkflow');
    const service = new GenerationExecutionService();
    const execution = service.execute({
      generationId: 'job-registering', projectId: 'project-4', prompt: 'Agenda', userId: 'user-4',
      framework: 'react', language: 'typescript', includeTests: true, style: 'modern',
    });
    await new Promise(resolve => setImmediate(resolve));
    expect(service.cancel('job-registering')).toBe(true);
    release?.();
    await expect(execution).rejects.toMatchObject({ name: 'AbortError' });
    expect(executeWorkflow).not.toHaveBeenCalled();
    expect(service.cancel('job-registering')).toBe(false);
  });

  it('cleans cancellation ownership when registration fails', async () => {
    registerAvailableContext.mockRejectedValue(new Error('Context unavailable'));
    const service = new GenerationExecutionService();
    await expect(service.execute({
      generationId: 'job-failed', projectId: 'project-5', prompt: 'Agenda', userId: 'user-5',
      framework: 'react', language: 'typescript', includeTests: true, style: 'modern',
    })).rejects.toThrow('Context unavailable');
    expect(service.cancel('job-failed')).toBe(false);
  });

  it('preserves replacement ownership and propagates an external abort signal', async () => {
    const releases: Array<(value: any) => void> = [];
    const signals: AbortSignal[] = [];
    jest.spyOn(orchestrationEngine, 'executeWorkflow').mockImplementation(request => {
      signals.push((request.input['options'] as { signal: AbortSignal }).signal);
      return new Promise(resolve => { releases.push(resolve); });
    });
    const service = new GenerationExecutionService();
    const external = new AbortController();
    const input = {
      generationId: 'job-replaced', projectId: 'project-6', prompt: 'Agenda', userId: 'user-6',
      framework: 'react', language: 'typescript', includeTests: true, style: 'modern',
    };
    const first = service.execute(input);
    await new Promise(resolve => setImmediate(resolve));
    const second = service.execute({ ...input, signal: external.signal });
    await new Promise(resolve => setImmediate(resolve));
    expect(signals[0]?.aborted).toBe(true);
    releases[0]?.({ success: true, data: { output: { deployment: { ready: true } } } });
    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    expect(signals[1]?.aborted).toBe(false);
    external.abort();
    expect(signals[1]?.aborted).toBe(true);
    expect(service.cancel(input.generationId)).toBe(true);
    releases[1]?.({ success: true, data: { output: { deployment: { ready: true } } } });
    await expect(second).rejects.toMatchObject({ name: 'AbortError' });
    expect(service.cancel(input.generationId)).toBe(false);
  });

  it('bounds concurrent workflows and releases queued work in order', async () => {
    const releases: Array<(value: any) => void> = [];
    const started: string[] = [];
    jest.spyOn(orchestrationEngine, 'executeWorkflow').mockImplementation(request => {
      started.push(request.id);
      return new Promise(resolve => { releases.push(resolve); });
    });
    const service = new GenerationExecutionService(1, 2);
    expect(service.getCapacity()).toEqual({ active: 0, queued: 0, maxConcurrent: 1, maxQueued: 2, accepting: true });
    const input = (id: string) => ({
      generationId: id, projectId: id, prompt: 'Agenda', userId: 'user',
      framework: 'react', language: 'typescript', includeTests: true, style: 'modern',
    });
    const first = service.execute(input('job-first'));
    const second = service.execute(input('job-second'));
    await new Promise(resolve => setImmediate(resolve));
    expect(started).toEqual(['job-first']);
    expect(service.getCapacity()).toMatchObject({ active: 1, queued: 1, accepting: true });
    releases[0]?.({ success: true, data: { output: { deployment: { ready: true } } } });
    await first;
    await new Promise(resolve => setImmediate(resolve));
    expect(started).toEqual(['job-first', 'job-second']);
    releases[1]?.({ success: true, data: { output: { deployment: { ready: true } } } });
    await second;
    expect(service.getCapacity()).toMatchObject({ active: 0, queued: 0 });
    expect(service.getOperationalMetrics()).toMatchObject({
      submitted: 2,
      successful: 2,
      failed: 0,
      rejected: 0,
      queueTimedOut: 0,
      successRate: 1,
      sampleSize: 2,
    });
    expect(service.getOperationalMetrics().queueWaitP95Ms).not.toBeNull();
  });

  it('cancels queued work without starting its workflow', async () => {
    let release: ((value: any) => void) | undefined;
    const started: string[] = [];
    jest.spyOn(orchestrationEngine, 'executeWorkflow').mockImplementation(request => {
      started.push(request.id);
      return new Promise(resolve => { release = resolve; });
    });
    const service = new GenerationExecutionService(1, 1);
    const base = { userId: 'user', framework: 'react', language: 'typescript', includeTests: true, style: 'modern' };
    const first = service.execute({ ...base, generationId: 'job-active', projectId: 'active', prompt: 'Agenda' });
    const queued = service.execute({ ...base, generationId: 'job-queued', projectId: 'queued', prompt: 'Agenda' });
    await new Promise(resolve => setImmediate(resolve));
    expect(service.cancel('job-queued')).toBe(true);
    await expect(queued).rejects.toMatchObject({ name: 'AbortError' });
    expect(started).toEqual(['job-active']);
    release?.({ success: true, data: { output: { deployment: { ready: true } } } });
    await first;
  });

  it('rejects work above the configured queue capacity', async () => {
    const releases: Array<(value: any) => void> = [];
    jest.spyOn(orchestrationEngine, 'executeWorkflow').mockImplementation(() => new Promise(resolve => { releases.push(resolve); }));
    const service = new GenerationExecutionService(1, 1);
    const base = { userId: 'user', framework: 'react', language: 'typescript', includeTests: true, style: 'modern' };
    const first = service.execute({ ...base, generationId: 'job-capacity-active', projectId: 'active', prompt: 'Agenda' });
    const queued = service.execute({ ...base, generationId: 'job-capacity-queued', projectId: 'queued', prompt: 'Agenda' });
    await new Promise(resolve => setImmediate(resolve));

    await expect(service.execute({ ...base, generationId: 'job-capacity-rejected', projectId: 'rejected', prompt: 'Agenda' }))
      .rejects.toThrow('Generation queue capacity exceeded');
    expect(service.getCapacity()).toMatchObject({ active: 1, queued: 1, accepting: false });
    expect(service.getOperationalMetrics()).toMatchObject({ submitted: 3, rejected: 1 });

    releases[0]?.({ success: true, data: { output: { deployment: { ready: true } } } });
    await first;
    await new Promise(resolve => setImmediate(resolve));
    releases[1]?.({ success: true, data: { output: { deployment: { ready: true } } } });
    await queued;
  });

  it('expires queued work at the configured wait limit', async () => {
    let release: ((value: any) => void) | undefined;
    jest.spyOn(orchestrationEngine, 'executeWorkflow').mockImplementation(() => new Promise(resolve => { release = resolve; }));
    const service = new GenerationExecutionService(1, 1, 1000);
    const base = { userId: 'user', framework: 'react', language: 'typescript', includeTests: true, style: 'modern' };
    const first = service.execute({ ...base, generationId: 'job-timeout-active', projectId: 'active', prompt: 'Agenda' });
    const queued = service.execute({ ...base, generationId: 'job-timeout-queued', projectId: 'queued', prompt: 'Agenda' });
    await expect(queued).rejects.toThrow('Generation queue wait timeout');
    expect(service.getOperationalMetrics()).toMatchObject({ submitted: 2, queueTimedOut: 1 });
    release?.({ success: true, data: { output: { deployment: { ready: true } } } });
    await first;
  });
});
