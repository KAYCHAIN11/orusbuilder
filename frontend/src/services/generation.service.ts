/**
 * ============================================================================
 * ORUS BUILDER - GENERATION SERVICE ⭐ (COMPLETE VERSION)
 * ============================================================================
 * 
 * LAST_MODIFIED: 2025-10-12T10:23:00-03:00
 * 
 * ADDITIONS:
 * - Added startGeneration() method
 * - Added subscribeToGenerationUpdates() method
 * - Added cancelGeneration() method
 * - Added checkTrinityHealth() method
 * - Fixed downloadProject() signature
 * - All TypeScript errors resolved
 * ============================================================================
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';
import { API_ORIGIN, WS_ORIGIN } from '../config/runtime';
import { tokenStorage } from './api.service';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GenerationServiceConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  enableWebSocket?: boolean;
}

export interface GenerateCodeRequest {
  prompt: string;
  mode?: string;
  target?: string;
  language?: string;
  framework?: string;
}

export interface GeneratedFile {
  path: string;
  fileName: string;
  content: string;
  language: string;
  type: string;
  lines: number;
  size?: number;
  hash?: string;
}

export interface GenerateCodeResponse {
  success: boolean;
  engine: string;
  generationId: string;
  files: GeneratedFile[];
  totalFiles: number;
  totalLines: number;
  tokensUsed: number;
  generationTime: number;
  confidence?: number;
  qualityScore?: number;
  cigScore?: number;
  validated?: boolean;
  timestamp: string;
  jobId?: string;
  accessToken?: string;
}

export interface GenerationStartResponse {
  jobId: string;
  estimatedTime: number;
  message: string;
  projectId?: string;
  accessToken?: string;
}

export interface GenerationProgressUpdate {
  jobId: string;
  stage: string;
  progress: number;
  message: string;
  timestamp: Date;
}

export interface GenerationStatusData {
  generationId: string;
  status: 'queued' | 'generating' | 'validating' | 'repairing' | 'ready' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  repairAttempts: number;
  diagnostics: unknown[];
  error?: string;
}

export interface GenerationCompleteData {
  jobId: string;
  projectId: string;
  files: GeneratedFile[];
  validation: any;
  metadata: any;
}

// ============================================================================
// GENERATION SERVICE
// ============================================================================

export class GenerationService {
  private api: AxiosInstance;
  private socket: Socket | null = null;
  private config: GenerationServiceConfig;
  private readonly jobTokens = new Map<string, string>();

  private rememberAccess(jobId?: string, token?: string): void {
    if (!jobId || !token) return;
    this.jobTokens.set(jobId, token);
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(`orus:job-token:${jobId}`, token);
  }

  private accessHeaders(jobId: string): Record<string, string> {
    const token = this.jobTokens.get(jobId) ||
      (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(`orus:job-token:${jobId}`) : '') ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem(`orus:job-token:${jobId}`) : '');
    return token ? { 'x-orus-job-token': token } : {};
  }

  constructor(config: GenerationServiceConfig) {
    this.config = config;

    // Configure Axios instance
    this.api = axios.create({
      baseURL: config.baseURL || API_ORIGIN,
      timeout: config.timeout || 300000, // 5 minutes
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = tokenStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );

    // Initialize WebSocket if enabled
    if (config.enableWebSocket) {
      this.initializeWebSocket();
    }
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private initializeWebSocket(): void {
    const wsUrl = WS_ORIGIN;
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        token: tokenStorage.getToken(),
      },
    });

    this.socket.on('connect', () => {
      console.log('[GenerationService] WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[GenerationService] WebSocket disconnected');
    });

    this.socket.on('error', (error: Error) => {
      console.error('[GenerationService] WebSocket error:', error);
    });
  }

  // ============================================================================
  // ✅ COMPLETE API METHODS
  // ============================================================================

  /**
   * Start generation process (FULL API)
   */
  public async startGeneration(request: any): Promise<GenerationStartResponse> {
    try {
      const response = await this.api.post<GenerationStartResponse>(
        '/api/v1/generation',
        request
      );

      this.rememberAccess(response.data.jobId, response.data.accessToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Generate code using direct Groq endpoint
   */
  public async generateCodeDirect(request: GenerateCodeRequest): Promise<GenerateCodeResponse> {
    try {
      const response = await this.api.post<GenerateCodeResponse>(
        '/api/v1/generation/generate',
        request
      );

      this.rememberAccess(response.data.jobId || response.data.generationId, response.data.accessToken);
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get generation status
   */
  public async getGenerationStatus(jobId: string): Promise<GenerationStatusData> {
    try {
      const response = await this.api.get(`/api/v1/generation/${jobId}/status`, { headers: this.accessHeaders(jobId) });
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get generation result
   */
  public async getGenerationResult(jobId: string): Promise<GenerationCompleteData> {
    try {
      const response = await this.api.get<any>(
        `/api/v1/generation/${jobId}/result`,
        { headers: this.accessHeaders(jobId) }
      );
      const result = response.data.data;
      return {
        jobId,
        projectId: result.generationId,
        files: result.files,
        validation: result.certification,
        metadata: result.metrics
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Cancel generation
   */
  public async cancelGeneration(jobId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.post<{ success: boolean; message: string }>(
        `/api/v1/generation/${jobId}/cancel`,
        undefined,
        { headers: this.accessHeaders(jobId) }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Subscribe to generation updates via WebSocket
   */
  public subscribeToGenerationUpdates(
    jobId: string,
    onUpdate: (update: GenerationProgressUpdate) => void,
    onComplete: (data: GenerationCompleteData) => void,
    onError: (error: Error) => void
  ): () => void {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async (): Promise<void> => {
      if (cancelled) return;
      try {
        const status = await this.getGenerationStatus(jobId);
        onUpdate({
          jobId,
          stage: status.currentStep,
          progress: status.progress,
          message: status.currentStep,
          timestamp: new Date()
        });
        if (status.status === 'failed') {
          onError(new Error(status.error || 'Generation failed certification'));
          return;
        }
        if (status.status === 'ready') {
          onComplete(await this.getGenerationResult(jobId));
          return;
        }
        timer = setTimeout(poll, 2000);
      } catch (error) {
        onError(error as Error);
      }
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }

  /**
   * Validate prompt before generation
   */
  public async validatePrompt(prompt: string): Promise<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
    suggestions?: string[];
    quality: number;
  }> {
    try {
      const response = await this.api.post('/api/v1/generation/validate-prompt', {
        prompt,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Trinity AI health check
   */
  public async checkTrinityHealth(): Promise<{
    status: 'online' | 'offline';
    latency: number;
  }> {
    try {
      const response = await this.api.get('/api/engines/status');
      const engines = Array.isArray(response.data?.engines) ? response.data.engines : [];
      const trinity = engines.find((engine: { name?: string }) => engine.name === 'trinity');
      return {
        status: trinity?.healthy ? 'online' : 'offline',
        latency: Number(trinity?.responseTime || 0),
      };
    } catch {
      return { status: 'offline', latency: 0 };
    }
  }

  /**
   * Download generated project as ZIP (CLIENT-SIDE)
   */
  public async downloadProject(files: GeneratedFile[], projectName: string = 'project'): Promise<void> {
    try {
      const { saveAs } = await import('file-saver');
      const JSZip = (await import('jszip')).default;
      
      const zip = new JSZip();

      // Add all files to ZIP
      files.forEach((file) => {
        const sourcePath = file.path || file.fileName || 'generated-file.ts';
        const safePath = sourcePath.replace(/^[/\\]+/, '').replace(/\\/g, '/');
        zip.file(safePath, file.content);
      });

      // Generate ZIP and download
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${projectName}.zip`);
    } catch (error) {
      console.error('Download failed:', error);
      throw new Error('Failed to download project', { cause: error });
    }
  }

  /**
   * Check backend health
   */
  public async checkHealth(): Promise<any> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Error handler
   */
  private handleError(error: AxiosError): Error {
    if (error.response) {
      const message = (error.response.data as any)?.error || 'Server error occurred';
      return new Error(message);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Disconnect WebSocket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const generationService = new GenerationService({
  baseURL: API_ORIGIN,
  enableWebSocket: true,
});

export default generationService;

/**
 * EXPORT MANIFEST
 * ============================================================================
 * PRIMARY_EXPORT: generationService (Singleton instance)
 * NAMED_EXPORTS: GenerationService, GenerationServiceConfig,
 *                GenerateCodeRequest, GenerateCodeResponse, GeneratedFile
 * DEFAULT_AVAILABLE: true
 * COMPATIBILITY: Full - all methods implemented
 * ============================================================================
 */
