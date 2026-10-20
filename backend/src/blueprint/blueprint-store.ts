/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS BLUEPRINT STORE
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-08T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.blueprint.store.20261008.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import type { BlueprintProcessingResult } from '../engines/blueprint-engine';
import type { ProductBlueprint } from './product-blueprint';

export type StoredBlueprintFormat = 'docx' | 'md' | 'pdf' | 'txt';
export type StoredBlueprintStatus = 'uploaded' | 'parsing' | 'recognized' | 'validated' | 'ready' | 'failed';

export interface StoredBlueprint {
  blueprintId: string;
  name: string;
  format: StoredBlueprintFormat;
  status: StoredBlueprintStatus;
  uploadedAt: Date;
  processedAt?: Date;
  userId: string;
  projectId?: string;
  fileSize: number;
  parsedText?: string;
  patterns?: unknown[];
  metadata?: unknown;
  tree?: unknown;
  validation?: unknown;
  processingResult?: BlueprintProcessingResult;
  productBlueprint?: ProductBlueprint;
  error?: string;
}

export interface BlueprintRepository {
  get(blueprintId: string): StoredBlueprint | undefined;
  set(blueprint: StoredBlueprint): void;
  values(): StoredBlueprint[];
}

export class MemoryBlueprintRepository implements BlueprintRepository {
  private readonly records = new Map<string, StoredBlueprint>();

  get(blueprintId: string): StoredBlueprint | undefined {
    return this.records.get(blueprintId);
  }

  set(blueprint: StoredBlueprint): void {
    this.records.set(blueprint.blueprintId, blueprint);
  }

  values(): StoredBlueprint[] {
    return Array.from(this.records.values());
  }
}

export class FileBlueprintRepository implements BlueprintRepository {
  private readonly records = new Map<string, StoredBlueprint>();

  constructor(private readonly filePath: string) {
    this.load();
  }

  get(blueprintId: string): StoredBlueprint | undefined {
    return this.records.get(blueprintId);
  }

  set(blueprint: StoredBlueprint): void {
    this.records.set(blueprint.blueprintId, blueprint);
    this.persist();
  }

  values(): StoredBlueprint[] {
    return Array.from(this.records.values());
  }

  private load(): void {
    if (!existsSync(this.filePath)) return;
    try {
      const values = JSON.parse(readFileSync(this.filePath, 'utf8')) as Array<Omit<StoredBlueprint, 'uploadedAt' | 'processedAt'> & {
        uploadedAt: string;
        processedAt?: string;
      }>;
      if (!Array.isArray(values)) throw new Error('Invalid Blueprint store shape');
      let recovered = false;
      for (const value of values) {
        if (!value?.blueprintId || !value.userId) continue;
        const { uploadedAt, processedAt, ...stored } = value;
        const interrupted = ['uploaded', 'parsing', 'recognized', 'validated'].includes(value.status);
        const blueprint: StoredBlueprint = {
          ...stored,
          status: interrupted ? 'failed' : value.status,
          uploadedAt: new Date(uploadedAt),
          ...(processedAt ? { processedAt: new Date(processedAt) } : {}),
          ...(interrupted ? { error: 'Blueprint processing interrupted by process restart' } : {}),
        };
        recovered = recovered || interrupted;
        this.records.set(blueprint.blueprintId, blueprint);
      }
      if (recovered) this.persist();
    } catch {
      renameSync(this.filePath, `${this.filePath}.corrupt-${Date.now()}`);
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(this.values(), null, 2), 'utf8');
    renameSync(temporaryPath, this.filePath);
  }
}

export class BlueprintStore {
  constructor(private readonly repository: BlueprintRepository) {}

  get(blueprintId: string): StoredBlueprint | undefined {
    return this.repository.get(blueprintId);
  }

  save(blueprint: StoredBlueprint): StoredBlueprint {
    this.repository.set(blueprint);
    return blueprint;
  }

  values(): StoredBlueprint[] {
    return this.repository.values();
  }
}

export function createBlueprintStore(environment: NodeJS.ProcessEnv = process.env): BlueprintStore {
  if (environment['NODE_ENV'] === 'test' && !environment['ORUS_BLUEPRINT_STORE_FILE']) {
    return new BlueprintStore(new MemoryBlueprintRepository());
  }
  const filePath = environment['ORUS_BLUEPRINT_STORE_FILE'] || resolve(process.cwd(), '.orus-data', 'blueprints.json');
  return new BlueprintStore(new FileBlueprintRepository(resolve(filePath)));
}
