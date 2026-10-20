/**
 * ============================================================================
 * ORUS BUILDER - BLUEPRINT SERVICE
 * ============================================================================
 *
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-10T09:00:00-03:00
 * LAST_MODIFIED: 2026-10-07T00:00:00-03:00
 * COMPONENT_HASH: orus.frontend.service.blueprint.20261007.BLS9O0P2
 *
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: BlueprintAPIAgent
 * - COGNITIVE_LEVEL: Advanced
 * - AUTONOMY_DEGREE: 82
 * - TRINITY_INTEGRATED: Full (Blueprint Intelligence)
 * ============================================================================
 */

import type { AxiosError } from 'axios';
import apiClient from './api.service';

export type BlueprintStatus = 'uploaded' | 'parsing' | 'recognized' | 'validated' | 'ready' | 'failed';
export type BlueprintDepth = 'essential' | 'product' | 'complete';

export interface ProductBlueprint {
  schemaVersion: string;
  blueprintId: string;
  projectId: string;
  version: number;
  status: string;
  depth: BlueprintDepth;
  source: { type: 'prompt' | 'document' | 'hybrid'; prompt: string; documentIds: string[] };
  product: {
    name: string;
    summary: string;
    problem: string;
    valueProposition: string;
    audience: string[];
    goals: string[];
    outOfScope: string[];
  };
  visualIntent: {
    archetype: string;
    style: string;
    tone: string[];
    palette: Record<string, string>;
    [key: string]: unknown;
  };
  personas: Array<{ id: string; name: string; goals: string[]; permissions: string[] }>;
  capabilities: Array<{
    id: string;
    name: string;
    purpose: string;
    strategy: string;
    priority: string;
    rules: string[];
    acceptanceCriteria: string[];
  }>;
  journeys: Array<{ id: string; name: string; steps: string[]; outcome: string }>;
  screens: Array<{ id: string; name: string; route: string; purpose: string; layout: string; states: string[] }>;
  components: Array<{ id: string; name: string; category: string; purpose: string }>;
  data: Array<{ id: string; name: string; purpose: string }>;
  architecture: {
    frontend: string[];
    backend: string[];
    database?: string;
    authentication: boolean;
    api: string;
  };
  acceptanceCriteria: Array<{
    id: string;
    statement: string;
    testType: string;
    required: boolean;
    kind: string;
  }>;
  assumptions: string[];
  openQuestions: string[];
  confidence: number;
}

export interface BlueprintValidation {
  isValid: boolean;
  score: number;
  checks: Array<{ name: string; passed: boolean; severity: string; message: string }>;
  errors: string[];
  warnings: string[];
}

export interface BlueprintResource {
  blueprintId: string;
  name: string;
  format: 'docx' | 'md' | 'txt';
  status: BlueprintStatus;
  uploadedAt: string;
  processedAt?: string;
  projectId?: string;
  fileSize: number;
  parsedText?: string;
  metadata?: Record<string, unknown>;
  tree?: Record<string, unknown>;
  validation?: BlueprintValidation;
  productBlueprint?: ProductBlueprint;
  error?: string;
}

export interface BlueprintStatusResponse {
  blueprintId: string;
  status: BlueprintStatus;
  progress: number;
  name: string;
  error?: string;
  productBlueprintId?: string;
}

export interface BlueprintListResponse {
  blueprints: BlueprintResource[];
  total: number;
  page: number;
  limit: number;
}

export interface BlueprintGenerationResponse {
  jobId: string;
  accessToken: string;
  data: { generationId: string; accessToken: string; status: string; progress: number; currentStep: string };
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

const wait = (duration: number) => new Promise(resolve => window.setTimeout(resolve, duration));

class BlueprintService {
  public async uploadBlueprint(file: File, projectId?: string): Promise<BlueprintStatusResponse> {
    const form = new FormData();
    form.append('file', file);
    if (projectId?.trim()) form.append('projectId', projectId.trim());
    const response = await apiClient.post<ApiEnvelope<BlueprintStatusResponse>>('/blueprints/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
    return response.data.data;
  }

  public async getStatus(blueprintId: string): Promise<BlueprintStatusResponse> {
    const response = await apiClient.get<ApiEnvelope<BlueprintStatusResponse>>(`/blueprints/${blueprintId}/status`);
    return response.data.data;
  }

  public async waitUntilReady(
    blueprintId: string,
    onProgress?: (status: BlueprintStatusResponse) => void,
    timeoutMs = 120000,
  ): Promise<BlueprintResource> {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const status = await this.getStatus(blueprintId);
      onProgress?.(status);
      if (status.status === 'ready') return this.getBlueprint(blueprintId);
      if (status.status === 'failed') throw new Error(status.error || 'O documento não pôde ser processado.');
      await wait(500);
    }
    throw new Error('O processamento do Blueprint excedeu o tempo limite.');
  }

  public async getBlueprint(blueprintId: string): Promise<BlueprintResource> {
    const response = await apiClient.get<ApiEnvelope<BlueprintResource>>(`/blueprints/${blueprintId}`);
    return response.data.data;
  }

  public async validateBlueprint(blueprintId: string): Promise<BlueprintValidation> {
    const response = await apiClient.get<ApiEnvelope<BlueprintValidation>>(`/blueprints/${blueprintId}/validate`);
    return response.data.data;
  }

  public async listBlueprints(params: { page?: number; limit?: number; status?: BlueprintStatus } = {}): Promise<BlueprintListResponse> {
    const response = await apiClient.get<ApiEnvelope<BlueprintListResponse>>('/blueprints', { params });
    return response.data.data;
  }

  public async generateFromBlueprint(input: {
    blueprintId: string;
    projectId: string;
    customization?: Record<string, unknown>;
  }): Promise<BlueprintGenerationResponse> {
    const response = await apiClient.post<BlueprintGenerationResponse>('/generation/blueprint', input, { timeout: 120000 });
    if (response.data.jobId && response.data.accessToken && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(`orus:job-token:${response.data.jobId}`, response.data.accessToken);
    }
    return response.data;
  }

  public errorMessage(error: unknown): string {
    const axiosError = error as AxiosError<{ error?: { message?: string }; message?: string }>;
    return axiosError.response?.data?.error?.message || axiosError.response?.data?.message || (error as Error)?.message || 'Falha inesperada.';
  }
}

const blueprintService = new BlueprintService();

export default blueprintService;
