/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS GENERATION CONTRACTS
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-06T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.generation.contracts.20261006.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import type { GeneratedFile } from './code-generator';
import type { GenerationJobStatus } from './generation-job-store';

export type GenerationDiagnosticSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface WorkspaceOverlay {
  protectedPaths: string[];
  files: Array<{ path: string; content: string }>;
}

export interface GenerationDiagnostic {
  stage: string;
  category: string;
  severity: GenerationDiagnosticSeverity;
  message: string;
  output?: string;
  affectedFiles: string[];
  details?: Record<string, unknown>;
}

export interface GenerationCertification {
  status: 'ready' | 'failed';
  buildPassed: boolean;
  previewPassed: boolean;
  productCoveragePassed: boolean;
  productCoverageScore: number;
  repairAttempts: number;
  validationDuration: number;
}

export interface GenerationStatusResponse {
  generationId: string;
  status: GenerationJobStatus;
  progress: number;
  currentStep?: string;
  estimatedTimeRemaining?: number;
  repairAttempts?: number;
  diagnostics: GenerationDiagnostic[];
  error?: string;
}

export interface GenerationResultResponse {
  generationId: string;
  success: boolean;
  files: GeneratedFile[];
  metrics: {
    totalFiles: number;
    totalLines: number;
    generationTime: number;
    qualityScore?: number;
  };
  certification: GenerationCertification;
}

export function normalizeGenerationDiagnostic(value: unknown, index = 0): GenerationDiagnostic {
  if (value instanceof Error) {
    return {
      stage: 'generation',
      category: 'runtime',
      severity: 'error',
      message: value.message,
      output: value.stack,
      affectedFiles: [],
    };
  }
  if (typeof value === 'string') {
    return {
      stage: 'generation',
      category: 'validation',
      severity: 'error',
      message: value,
      affectedFiles: [],
    };
  }
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const severityValue = String(source['severity'] || 'error').toLowerCase();
  const severity: GenerationDiagnosticSeverity = ['info', 'warning', 'error', 'critical'].includes(severityValue)
    ? severityValue as GenerationDiagnosticSeverity
    : 'error';
  const affectedFiles = Array.isArray(source['affectedFiles'])
    ? source['affectedFiles'].filter((file): file is string => typeof file === 'string')
    : [];
  const output = typeof source['output'] === 'string' ? source['output'] : undefined;
  return {
    stage: typeof source['stage'] === 'string' ? source['stage'] : 'generation',
    category: typeof source['category'] === 'string' ? source['category'] : 'validation',
    severity,
    message: typeof source['message'] === 'string'
      ? source['message']
      : output || `Generation diagnostic ${index + 1}`,
    ...(output ? { output } : {}),
    affectedFiles,
    details: source,
  };
}

export function normalizeGenerationDiagnostics(values: unknown): GenerationDiagnostic[] {
  if (!Array.isArray(values)) return [];
  return values.map(normalizeGenerationDiagnostic);
}
