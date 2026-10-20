/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS GENERATION EXECUTION SERVICE
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-06T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.generation.execution.20261006.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import { createHash, randomUUID } from 'crypto';
import type { ProductBlueprint } from '../blueprint/product-blueprint';
import { normalizeProductBlueprint, validateProductBlueprintContract } from '../blueprint/product-blueprint-contract';
import { CIGBridge } from '../core/cig/cig-bridge';
import { EngineOutputRegistry } from '../core/cig/engine-output-registry';
import {
  orchestrationEngine,
  WorkflowType,
  type WorkflowExecutionResult,
  type WorkflowProgressUpdate,
  type WorkflowResumeCandidate,
} from '../engines/orchestrator-engine';
import type { EngineResult } from '../engines/cig-engine-compat';
import { normalizeGenerationDiagnostics, type GenerationDiagnostic, type WorkspaceOverlay } from './generation-contracts';

export interface GenerationExecutionInput {
  generationId?: string;
  projectId: string;
  prompt: string;
  userId: string;
  framework: string;
  language: string;
  includeTests: boolean;
  style: string;
  complexity?: string;
  locale?: 'en' | 'pt-BR' | 'es';
  enhanceVisuals?: boolean;
  productBlueprint?: ProductBlueprint;
  workspaceOverlay?: WorkspaceOverlay;
  resumeCandidate?: WorkflowResumeCandidate;
  onProgress?: (update: WorkflowProgressUpdate) => void;
  signal?: AbortSignal;
}

export interface GenerationExecutionOutcome {
  certified: boolean;
  workflowResult: EngineResult<WorkflowExecutionResult>;
  execution?: WorkflowExecutionResult;
  diagnostics: GenerationDiagnostic[];
  repairAttempts: unknown[];
  error?: string;
}

export class GenerationExecutionService {
  private readonly cancellationControllers = new Map<string, AbortController>();
  private activeExecutions = 0;
  private readonly executionQueue: Array<{
    signal: AbortSignal;
    resolve: () => void;
    reject: (error: Error) => void;
    abort: () => void;
    enqueuedAt: number;
    timer: NodeJS.Timeout;
  }> = [];
  private readonly operational = {
    submitted: 0,
    successful: 0,
    failed: 0,
    cancelled: 0,
    rejected: 0,
    queueTimedOut: 0,
    queueWaitMs: [] as number[],
    executionMs: [] as number[],
  };

  constructor(
    private readonly maxConcurrentExecutions = Math.max(1, Number(process.env['ORUS_MAX_CONCURRENT_GENERATIONS']) || 2),
    private readonly maxQueuedExecutions = Math.max(1, Number(process.env['ORUS_MAX_QUEUED_GENERATIONS']) || 20),
    private readonly maxQueueWaitMs = Math.max(1000, Number(process.env['ORUS_MAX_QUEUE_WAIT_MS']) || 300000)
  ) {}

  cancel(generationId: string): boolean {
    const controller = this.cancellationControllers.get(generationId);
    if (!controller) return false;
    controller.abort();
    return true;
  }

  getCapacity(): {
    active: number;
    queued: number;
    maxConcurrent: number;
    maxQueued: number;
    accepting: boolean;
  } {
    return {
      active: this.activeExecutions,
      queued: this.executionQueue.length,
      maxConcurrent: this.maxConcurrentExecutions,
      maxQueued: this.maxQueuedExecutions,
      accepting: this.executionQueue.length < this.maxQueuedExecutions,
    };
  }

  getOperationalMetrics(): {
    submitted: number;
    successful: number;
    failed: number;
    cancelled: number;
    rejected: number;
    queueTimedOut: number;
    successRate: number | null;
    queueWaitP50Ms: number | null;
    queueWaitP95Ms: number | null;
    executionP50Ms: number | null;
    executionP95Ms: number | null;
    sampleSize: number;
    targets: { queueWaitP95Ms: number; successRate: number };
  } {
    const terminal = this.operational.successful + this.operational.failed;
    return {
      submitted: this.operational.submitted,
      successful: this.operational.successful,
      failed: this.operational.failed,
      cancelled: this.operational.cancelled,
      rejected: this.operational.rejected,
      queueTimedOut: this.operational.queueTimedOut,
      successRate: terminal > 0 ? this.operational.successful / terminal : null,
      queueWaitP50Ms: this.percentile(this.operational.queueWaitMs, 0.5),
      queueWaitP95Ms: this.percentile(this.operational.queueWaitMs, 0.95),
      executionP50Ms: this.percentile(this.operational.executionMs, 0.5),
      executionP95Ms: this.percentile(this.operational.executionMs, 0.95),
      sampleSize: this.operational.executionMs.length,
      targets: {
        queueWaitP95Ms: Math.max(1000, Number(process.env['ORUS_SLO_QUEUE_WAIT_P95_MS']) || 60000),
        successRate: Math.max(0, Math.min(1, Number(process.env['ORUS_SLO_GENERATION_SUCCESS_RATE']) || 0.95)),
      },
    };
  }

  async execute(input: GenerationExecutionInput): Promise<GenerationExecutionOutcome> {
    this.operational.submitted++;
    const controller = new AbortController();
    const abort = () => controller.abort(input.signal?.reason);
    if (input.signal?.aborted) abort();
    else input.signal?.addEventListener('abort', abort, { once: true });
    if (input.generationId) {
      this.cancellationControllers.get(input.generationId)?.abort();
      this.cancellationControllers.set(input.generationId, controller);
    }
    let acquired = false;
    let executionStartedAt = 0;
    try {
      controller.signal.throwIfAborted();
      const waitMs = await this.acquireExecutionSlot(controller.signal);
      this.recordSample(this.operational.queueWaitMs, waitMs);
      acquired = true;
      executionStartedAt = Date.now();
      controller.signal.throwIfAborted();
      const outcome = await this.executeWorkflow({ ...input, signal: controller.signal });
      if (outcome.certified) this.operational.successful++;
      else this.operational.failed++;
      return outcome;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') this.operational.cancelled++;
      else if (!['Generation queue capacity exceeded', 'Generation queue wait timeout'].includes(error instanceof Error ? error.message : '')) this.operational.failed++;
      throw error;
    } finally {
      if (acquired) {
        this.recordSample(this.operational.executionMs, Date.now() - executionStartedAt);
        this.releaseExecutionSlot();
      }
      input.signal?.removeEventListener('abort', abort);
      if (input.generationId && this.cancellationControllers.get(input.generationId) === controller) {
        this.cancellationControllers.delete(input.generationId);
      }
    }
  }

  private async acquireExecutionSlot(signal: AbortSignal): Promise<number> {
    const enqueuedAt = Date.now();
    signal.throwIfAborted();
    if (this.activeExecutions < this.maxConcurrentExecutions) {
      this.activeExecutions += 1;
      return 0;
    }
    if (this.executionQueue.length >= this.maxQueuedExecutions) {
      this.operational.rejected++;
      throw new Error('Generation queue capacity exceeded');
    }
    await new Promise<void>((resolve, reject) => {
      const waiter = {
        signal,
        resolve,
        reject,
        enqueuedAt,
        timer: setTimeout(() => {
          const index = this.executionQueue.indexOf(waiter);
          if (index >= 0) this.executionQueue.splice(index, 1);
          signal.removeEventListener('abort', waiter.abort);
          this.operational.queueTimedOut++;
          reject(new Error('Generation queue wait timeout'));
        }, this.maxQueueWaitMs),
        abort: () => {
          const index = this.executionQueue.indexOf(waiter);
          if (index >= 0) this.executionQueue.splice(index, 1);
          clearTimeout(waiter.timer);
          reject(signal.reason instanceof Error ? signal.reason : new DOMException('Generation cancelled', 'AbortError'));
        },
      };
      signal.addEventListener('abort', waiter.abort, { once: true });
      this.executionQueue.push(waiter);
    });
    return Date.now() - enqueuedAt;
  }

  private releaseExecutionSlot(): void {
    this.activeExecutions = Math.max(0, this.activeExecutions - 1);
    while (this.executionQueue.length > 0) {
      const waiter = this.executionQueue.shift()!;
      waiter.signal.removeEventListener('abort', waiter.abort);
      clearTimeout(waiter.timer);
      if (waiter.signal.aborted) continue;
      this.activeExecutions += 1;
      waiter.resolve();
      return;
    }
  }

  private recordSample(target: number[], value: number): void {
    target.push(Math.max(0, value));
    if (target.length > 200) target.splice(0, target.length - 200);
  }

  private percentile(values: number[], ratio: number): number | null {
    if (values.length === 0) return null;
    const sorted = [...values].sort((left, right) => left - right);
    return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)]!;
  }

  private validateResumeCandidate(candidate?: WorkflowResumeCandidate): WorkflowResumeCandidate | undefined {
    if (!candidate || !Array.isArray(candidate.files) || candidate.files.length === 0) return undefined;
    if (!candidate.productBlueprint || !candidate.generation || !candidate.artifactHash) return undefined;
    if (candidate.files.some(file => !file.path || typeof file.content !== 'string')) return undefined;
    const artifactHash = createHash('sha256')
      .update(candidate.files
        .map(file => `${file.path.replace(/\\/g, '/').replace(/^\.\//, '')}\0${file.content}`)
        .sort()
        .join('\0'))
      .digest('hex');
    return artifactHash === candidate.artifactHash ? candidate : undefined;
  }

  private async executeWorkflow(input: GenerationExecutionInput): Promise<GenerationExecutionOutcome> {
    const requestId = input.generationId || `req-${randomUUID()}`;
    const resumeCandidate = this.validateResumeCandidate(input.resumeCandidate);
    const sourceBlueprint = input.productBlueprint || resumeCandidate?.productBlueprint;
    const productBlueprint = sourceBlueprint ? normalizeProductBlueprint(sourceBlueprint) : undefined;
    if (productBlueprint) {
      const validation = validateProductBlueprintContract(productBlueprint);
      if (!validation.valid) throw new Error(`Product Blueprint contract is invalid: ${validation.errors.join(', ')}`);
    }
    const registry = EngineOutputRegistry.getInstance();
    await CIGBridge.getInstance(registry).registerAvailableContext({
      projectId: input.projectId,
      existingFiles: [],
      existingImports: [],
      dependencies: [],
    });

    input.signal?.throwIfAborted();
    const workflowResult = await orchestrationEngine.executeWorkflow({
      id: requestId,
      requestId,
      userId: input.userId,
      workflowType: productBlueprint ? WorkflowType.BLUEPRINT_TO_DEPLOY : WorkflowType.PROMPT_TO_DEPLOY,
      input: {
        projectId: input.projectId,
        prompt: input.prompt,
        productBlueprint,
        options: {
          framework: input.framework,
          language: input.language,
          locale: input.locale || 'pt-BR',
          complexity: input.complexity || 'standard',
          includeTests: input.includeTests,
          style: input.style,
          enhanceVisuals: input.enhanceVisuals ?? false,
          onProgress: input.onProgress,
          signal: input.signal,
          workspaceOverlay: input.workspaceOverlay,
          resumeCandidate,
        },
      },
      parallel: false,
      rollbackOnError: false,
      continueOnError: true,
      version: 1,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    input.signal?.throwIfAborted();

    const execution = workflowResult.data;
    const output = execution?.output || {};
    const deployment = output['deployment'] as {
      ready?: boolean;
      validationPassed?: boolean;
      securityPassed?: boolean;
      qualityPassed?: boolean;
      previewPassed?: boolean;
    } | undefined;
    const runtimeValidation = output['runtimeValidation'] as { diagnostics?: unknown[] } | undefined;
    const previewValidation = output['previewValidation'] as { diagnostics?: unknown[] } | undefined;
    const productImplementation = output['productImplementation'] as { diagnostics?: unknown[] } | undefined;
    const cig = output['cig'] as { errors?: unknown[]; issues?: unknown[] } | undefined;
    const security = output['security'] as {
      vulnerabilities?: unknown[];
      complianceIssues?: unknown[];
      error?: unknown;
    } | undefined;
    const repairAttempts = Array.isArray(output['repairAttempts']) ? output['repairAttempts'] : [];
    const diagnostics: unknown[] = [
      ...(runtimeValidation?.diagnostics || []),
      ...(previewValidation?.diagnostics || []),
      ...(productImplementation?.diagnostics || []),
    ];
    if (deployment?.validationPassed === false) {
      diagnostics.push({ stage: 'cig', category: 'validation', message: 'CIG Protocol validation failed', issues: cig?.errors || cig?.issues || [] });
    }
    if (deployment?.securityPassed === false) {
      diagnostics.push({
        stage: 'security',
        category: 'security',
        severity: 'critical',
        message: 'Security gate failed',
        issues: [...(security?.vulnerabilities || []), ...(security?.complianceIssues || [])],
        details: security?.error,
      });
    }
    if (deployment?.qualityPassed === false) {
      const quality = output['quality'] as { score?: number; minimumScore?: number } | undefined;
      diagnostics.push({
        stage: 'quality',
        category: 'quality',
        message: `Quality score ${quality?.score ?? 0} is below the required minimum ${quality?.minimumScore ?? 70}`,
      });
    }
    if (deployment?.previewPassed === false && !(previewValidation?.diagnostics || []).length) {
      diagnostics.push({ stage: 'preview', category: 'runtime', message: 'Preview certification failed' });
    }
    const certified = workflowResult.success && Boolean(execution) && deployment?.ready === true;
    const normalizedDiagnostics = normalizeGenerationDiagnostics(diagnostics);
    const first = normalizedDiagnostics[0];
    const baseError = workflowResult.error?.message.pt_BR || 'O projeto não passou pela certificação de geração';
    const error = certified ? undefined : first
      ? `${baseError} [${first.stage}] ${first.message}`
      : baseError;

    return {
      certified,
      workflowResult,
      execution,
      diagnostics: normalizedDiagnostics,
      repairAttempts,
      ...(error ? { error } : {}),
    };
  }
}

export const generationExecutionService = new GenerationExecutionService();
