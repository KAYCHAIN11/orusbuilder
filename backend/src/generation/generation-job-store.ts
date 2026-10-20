/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS GENERATION JOB STORE
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-06T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.generation.job-store.20261006.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

export type GenerationJobStatus = 'queued' | 'recovering' | 'generating' | 'validating' | 'repairing' | 'ready' | 'failed' | 'cancelled';

export interface GenerationCandidateArtifact {
  stage: string;
  artifactHash: string;
  createdAt: string;
  files: Array<{ path: string; content: string; [key: string]: unknown }>;
  productBlueprint: unknown;
  generation: unknown;
  tests?: unknown;
}

export interface GenerationCheckpoint {
  stage: string;
  status: GenerationJobStatus;
  progress: number;
  attempt: number;
  createdAt: string;
  diagnostics?: unknown[];
  artifactHash?: string;
  fileCount?: number;
  resumable?: boolean;
}

export interface GenerationJobRecord {
  generationId: string;
  status: GenerationJobStatus;
  progress: number;
  currentStep: string;
  success: boolean;
  createdAt?: string;
  updatedAt?: string;
  error?: string;
  request?: any;
  diagnostics?: unknown[];
  repairAttempts?: number | unknown[];
  checkpoints?: GenerationCheckpoint[];
  candidateArtifact?: GenerationCandidateArtifact;
  recoveryCount?: number;
  files: any[];
  projectName?: string;
  structure?: any;
  metrics?: any;
  pipeline?: any;
  metadata?: any;
  [key: string]: any;
}

export interface GenerationJobRepository {
  get(generationId: string): GenerationJobRecord | undefined;
  set(generationId: string, record: GenerationJobRecord): void;
  delete(generationId: string): boolean;
  count(): number;
  clear(): void;
  values(): GenerationJobRecord[];
}

export class MemoryGenerationJobRepository implements GenerationJobRepository {
  private readonly records = new Map<string, GenerationJobRecord>();

  get(generationId: string): GenerationJobRecord | undefined {
    return this.records.get(generationId);
  }

  set(generationId: string, record: GenerationJobRecord): void {
    this.records.set(generationId, record);
  }

  delete(generationId: string): boolean {
    return this.records.delete(generationId);
  }

  count(): number {
    return this.records.size;
  }

  clear(): void {
    this.records.clear();
  }

  values(): GenerationJobRecord[] {
    return Array.from(this.records.values());
  }
}

export class FileGenerationJobRepository implements GenerationJobRepository {
  private readonly records = new Map<string, GenerationJobRecord>();

  constructor(private readonly filePath: string) {
    this.load();
  }

  get(generationId: string): GenerationJobRecord | undefined {
    return this.records.get(generationId);
  }

  set(generationId: string, record: GenerationJobRecord): void {
    this.records.set(generationId, record);
    this.persist();
  }

  delete(generationId: string): boolean {
    const deleted = this.records.delete(generationId);
    if (deleted) this.persist();
    return deleted;
  }

  count(): number {
    return this.records.size;
  }

  clear(): void {
    this.records.clear();
    this.persist();
  }

  values(): GenerationJobRecord[] {
    return Array.from(this.records.values());
  }

  private load(): void {
    if (!existsSync(this.filePath)) return;
    let parsed: GenerationJobRecord[];
    try {
      parsed = JSON.parse(readFileSync(this.filePath, 'utf8')) as GenerationJobRecord[];
      if (!Array.isArray(parsed)) throw new Error('Invalid generation job store shape');
    } catch {
      copyFileSync(this.filePath, `${this.filePath}.corrupt-${Date.now()}`);
      return;
    }
    const now = new Date().toISOString();
    let recovered = false;
    for (const value of parsed) {
      if (!value?.generationId) continue;
      const active = ['queued', 'recovering', 'generating', 'validating', 'repairing'].includes(value.status);
      const record = active ? {
        ...value,
        status: 'recovering' as const,
        success: false,
        currentStep: 'recovering-after-restart',
        error: undefined,
        recoveryCount: Number(value.recoveryCount || 0) + 1,
        updatedAt: now,
      } : value;
      if (active) recovered = true;
      this.records.set(record.generationId, record);
    }
    if (recovered) this.persist();
  }

  private persist(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(Array.from(this.records.values()), null, 2), 'utf8');
    renameSync(temporaryPath, this.filePath);
  }
}

export class GenerationJobStore {
  private purgedRecords = 0;
  private lastPurgedAt?: string;

  constructor(private readonly repository: GenerationJobRepository = new MemoryGenerationJobRepository()) {}

  get(generationId: string): GenerationJobRecord | undefined {
    return this.repository.get(generationId);
  }

  set(record: GenerationJobRecord): GenerationJobRecord {
    const normalized = {
      ...record,
      generationId: record.generationId,
      updatedAt: new Date().toISOString(),
    };
    this.repository.set(record.generationId, normalized);
    return normalized;
  }

  update(generationId: string, update: Partial<GenerationJobRecord>): GenerationJobRecord {
    const current = this.repository.get(generationId);
    if (current?.status === 'cancelled' && update.status !== 'cancelled') return current;
    const record: GenerationJobRecord = {
      success: false,
      status: 'queued',
      progress: 0,
      currentStep: 'queued',
      files: [],
      ...current,
      ...update,
      generationId,
      updatedAt: new Date().toISOString(),
    };
    this.repository.set(generationId, record);
    return record;
  }

  checkpoint(
    generationId: string,
    checkpoint: Omit<GenerationCheckpoint, 'createdAt'> & {
      createdAt?: string;
      candidateArtifact?: GenerationCandidateArtifact;
    }
  ): GenerationJobRecord {
    const current = this.repository.get(generationId);
    const { candidateArtifact, ...checkpointRecord } = checkpoint;
    const checkpoints = [...(current?.checkpoints || []), {
      ...checkpointRecord,
      ...(candidateArtifact ? {
        artifactHash: candidateArtifact.artifactHash,
        fileCount: candidateArtifact.files.length,
        resumable: true,
      } : {}),
      createdAt: checkpoint.createdAt || new Date().toISOString(),
    }].slice(-50);
    return this.update(generationId, {
      status: checkpoint.status,
      progress: checkpoint.progress,
      currentStep: checkpoint.stage,
      checkpoints,
      ...(checkpoint.diagnostics ? { diagnostics: checkpoint.diagnostics } : {}),
      ...(candidateArtifact ? { candidateArtifact } : {}),
    });
  }

  cancel(generationId: string): GenerationJobRecord | undefined {
    const current = this.repository.get(generationId);
    if (!current || current.status === 'ready' || current.status === 'failed' || current.status === 'cancelled') return undefined;
    return this.update(generationId, {
      status: 'cancelled',
      success: false,
      progress: 100,
      currentStep: 'cancelled',
      error: 'Generation cancelled by user',
    });
  }

  delete(generationId: string): boolean {
    return this.repository.delete(generationId);
  }

  count(): number {
    return this.repository.count();
  }

  purgeExpired(now = new Date()): number {
    const terminal = new Set<GenerationJobStatus>(['ready', 'failed', 'cancelled']);
    let removed = 0;
    for (const record of this.repository.values()) {
      const expiresAt = typeof record['expiresAt'] === 'string' ? Date.parse(record['expiresAt']) : Number.NaN;
      if (!terminal.has(record.status) || !Number.isFinite(expiresAt) || expiresAt > now.getTime()) continue;
      if (this.repository.delete(record.generationId)) removed++;
    }
    this.purgedRecords += removed;
    this.lastPurgedAt = now.toISOString();
    return removed;
  }

  getRetentionMetrics(): { records: number; purged: number; lastPurgedAt?: string } {
    return {
      records: this.repository.count(),
      purged: this.purgedRecords,
      ...(this.lastPurgedAt ? { lastPurgedAt: this.lastPurgedAt } : {}),
    };
  }

  clear(): void {
    this.repository.clear();
  }

  list(): GenerationJobRecord[] {
    return this.repository.values().sort((left, right) => String(right.createdAt || right.updatedAt).localeCompare(String(left.createdAt || left.updatedAt)));
  }
}

function createDefaultRepository(): GenerationJobRepository {
  if (process.env['NODE_ENV'] === 'test') return new MemoryGenerationJobRepository();
  const configuredPath = process.env['ORUS_JOB_STORE_PATH'];
  return new FileGenerationJobRepository(resolve(configuredPath || '.orus-data/generation-jobs.json'));
}

export const generationJobStore = new GenerationJobStore(createDefaultRepository());
