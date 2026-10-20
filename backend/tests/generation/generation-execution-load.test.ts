/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COGNITIVE AGENT CODE DNA - GENERATION EXECUTION LOAD
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENT_HASH: orus.builder.test.generation.load.20261007.v1
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { CIGBridge } from '../../src/core/cig/cig-bridge';
import { orchestrationEngine } from '../../src/engines/orchestrator-engine';
import { GenerationExecutionService } from '../../src/generation/generation-execution-service';

describe('GenerationExecutionService controlled load', () => {
  afterEach(() => jest.restoreAllMocks());

  it('keeps concurrency bounded and reports queue SLO evidence under burst load', async () => {
    jest.spyOn(CIGBridge, 'getInstance').mockReturnValue({
      registerAvailableContext: jest.fn().mockResolvedValue(undefined),
    } as any);
    let active = 0;
    let peak = 0;
    jest.spyOn(orchestrationEngine, 'executeWorkflow').mockImplementation(async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise(resolve => setTimeout(resolve, 20));
      active -= 1;
      return { success: true, data: { output: { deployment: { ready: true } } } } as any;
    });

    const service = new GenerationExecutionService(4, 64, 5000);
    const results = await Promise.all(Array.from({ length: 48 }, (_, index) => service.execute({
      generationId: `load-job-${index}`,
      projectId: `load-project-${index}`,
      prompt: `Controlled load ${index}`,
      userId: 'load-user',
      framework: 'react',
      language: 'typescript',
      includeTests: true,
      style: 'adaptive',
    })));
    const metrics = service.getOperationalMetrics();

    expect(results.every(result => result.certified)).toBe(true);
    expect(peak).toBe(4);
    expect(service.getCapacity()).toMatchObject({ active: 0, queued: 0, accepting: true });
    expect(metrics).toMatchObject({
      submitted: 48,
      successful: 48,
      failed: 0,
      cancelled: 0,
      rejected: 0,
      queueTimedOut: 0,
      successRate: 1,
      sampleSize: 48,
    });
    expect(metrics.queueWaitP50Ms).toBeGreaterThan(0);
    expect(metrics.queueWaitP95Ms).toBeLessThan(metrics.targets.queueWaitP95Ms);
    expect(metrics.executionP95Ms).toBeGreaterThanOrEqual(15);
  });
});
