/**
 * ============================================================================
 * ORUS BUILDER - PROJECT SERVICE
 * ============================================================================
 * 
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-09T21:27:00-03:00
 * LAST_MODIFIED: 2025-10-09T21:27:00-03:00
 * COMPONENT_HASH: orus.frontend.service.project.20251009.PRJ0F1G2
 * 
 * PURPOSE:
 * - API service for project CRUD operations
 * - GET, POST, PUT, DELETE /api/v1/projects endpoints
 * - Project listing with filters and pagination
 * - File management within projects
 * 
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: CRUDServiceAgent
 * - COGNITIVE_LEVEL: Advanced
 * - AUTONOMY_DEGREE: 80
 * - TRINITY_INTEGRATED: None (API only)
 * ============================================================================
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/api.types';
import { API_ORIGIN } from '../config/runtime';
import { tokenStorage } from './api.service';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ProjectServiceConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ProjectServiceError extends Error {
  constructor(message: string, public readonly code?: string, public readonly status?: number) {
    super(message);
    this.name = 'ProjectServiceError';
  }
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'archived' | 'draft';
  framework?: 'react' | 'vue' | 'angular' | 'nextjs';
  sortBy?: 'name' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  name: string;
  content: string;
  language: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRevision {
  id: string;
  type: 'content' | 'rename' | 'delete' | 'duplicate' | 'regenerate' | 'restore';
  summary: string;
  fileId: string;
  path: string;
  previousPath?: string;
  contentBefore?: string;
  contentAfter?: string;
  createdAt: string;
  userId: string;
  sourceRevisionId?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

// ============================================================================
// PROJECT SERVICE
// ============================================================================

class ProjectService {
  private api: AxiosInstance;
  private config: ProjectServiceConfig;

  constructor(config: ProjectServiceConfig) {
    this.config = config;

    // Configure Axios instance
    this.api = axios.create({
      baseURL: config.baseURL || process.env['REACT_APP_API_URL'] || 'http://localhost:3001',
      timeout: config.timeout || 30000,
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
  }

  /**
   * Get all projects with optional filters
   */
  public async getProjects(params?: ProjectListParams): Promise<ProjectListResponse> {
    try {
      const response = await this.api.get<ApiEnvelope<{ projects: Project[]; total: number }>>('/api/v1/projects', {
        params,
      });
      const { projects, total } = response.data.data;
      const page = params?.page || 1;
      const limit = params?.limit || Math.max(total, 1);
      return { projects, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get single project by ID
   */
  public async getProject(projectId: string): Promise<Project> {
    try {
      const response = await this.api.get<ApiEnvelope<{ project: Project }>>(`/api/v1/projects/${projectId}`);
      return response.data.data.project;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Create new project
   */
  public async createProject(data: CreateProjectRequest): Promise<Project> {
    try {
      const response = await this.api.post<ApiEnvelope<{ project: Project }>>('/api/v1/projects', data);
      return response.data.data.project;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Update existing project
   */
  public async updateProject(
    projectId: string,
    data: UpdateProjectRequest
  ): Promise<Project> {
    try {
      const response = await this.api.patch<ApiEnvelope<{ project: Project }>>(
        `/api/v1/projects/${projectId}`,
        data
      );
      return response.data.data.project;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Delete project
   */
  public async deleteProject(projectId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.api.delete<{ success: boolean; message: string }>(
        `/api/v1/projects/${projectId}`
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get project files
   */
  public async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    try {
      const response = await this.api.get<ApiEnvelope<{ files: ProjectFile[] }>>(
        `/api/v1/projects/${projectId}/files`
      );
      return response.data.data.files;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Get single file content
   */
  public async getFile(projectId: string, fileId: string): Promise<ProjectFile> {
    try {
      const response = await this.api.get<ApiEnvelope<{ file: ProjectFile }>>(
        `/api/v1/projects/${projectId}/files/${fileId}`
      );
      return response.data.data.file;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Update file content
   */
  public async updateFile(
    projectId: string,
    fileId: string,
    content: string
  ): Promise<ProjectFile> {
    try {
      const response = await this.api.put<ApiEnvelope<{ file: ProjectFile }>>(
        `/api/v1/projects/${projectId}/files/${fileId}`,
        { content }
      );
      return response.data.data.file;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async createProjectFromGeneration(
    generationId: string,
    name: string,
    description?: string
  ): Promise<Project> {
    try {
      const response = await this.api.post<ApiEnvelope<{ project: Project }>>(
        '/api/v1/projects/from-generation',
        { generationId, name, description }
      );
      return response.data.data.project;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async renameFile(projectId: string, fileId: string, name: string): Promise<ProjectFile> {
    try {
      const response = await this.api.patch<ApiEnvelope<{ file: ProjectFile }>>(
        `/api/v1/projects/${projectId}/files/${fileId}`,
        { name }
      );
      return response.data.data.file;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async deleteFile(projectId: string, fileId: string): Promise<void> {
    try {
      await this.api.delete(`/api/v1/projects/${projectId}/files/${fileId}`);
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async duplicateFile(projectId: string, fileId: string): Promise<ProjectFile> {
    try {
      const response = await this.api.post<ApiEnvelope<{ file: ProjectFile }>>(
        `/api/v1/projects/${projectId}/files/${fileId}/duplicate`
      );
      return response.data.data.file;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async getProjectHistory(projectId: string): Promise<ProjectRevision[]> {
    try {
      const response = await this.api.get<ApiEnvelope<{ revisions: ProjectRevision[]; total: number }>>(
        `/api/v1/projects/${projectId}/history`
      );
      return response.data.data.revisions;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async getProjectRevision(projectId: string, revisionId: string): Promise<ProjectRevision> {
    try {
      const response = await this.api.get<ApiEnvelope<{ revision: ProjectRevision }>>(
        `/api/v1/projects/${projectId}/history/${revisionId}`
      );
      return response.data.data.revision;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async restoreProjectRevision(projectId: string, revisionId: string): Promise<{
    project: Project;
    file: ProjectFile | null;
    removedFileId?: string;
    revision: ProjectRevision;
  }> {
    try {
      const response = await this.api.post<ApiEnvelope<{
        project: Project;
        file: ProjectFile | null;
        removedFileId?: string;
        revision: ProjectRevision;
      }>>(`/api/v1/projects/${projectId}/history/${revisionId}/restore`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  public async regenerateProject(projectId: string, prompt: string, protectedPaths: string[] = []): Promise<{
    generationId: string;
    status: string;
    protectedFiles: number;
  }> {
    try {
      const response = await this.api.post<ApiEnvelope<{
        generationId: string;
        status: string;
        protectedFiles: number;
      }>>(`/api/v1/projects/${projectId}/regenerate`, { prompt, protectedPaths });
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Export project
   */
  public async exportProject(projectId: string, format: 'zip' | 'tar'): Promise<Blob> {
    try {
      const response = await this.api.get(`/api/v1/projects/${projectId}/export`, {
        params: { format },
        responseType: 'blob',
      });

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
      const payload = error.response.data as { message?: string; error?: { code?: string; message?: string } } | undefined;
      return new ProjectServiceError(
        payload?.error?.message || payload?.message || 'Server error occurred',
        payload?.error?.code,
        error.response.status
      );
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const projectService = new ProjectService({
  baseURL: API_ORIGIN,
});

export default projectService;

/**
 * EXPORT MANIFEST
 * ============================================================================
 * PRIMARY_EXPORT: projectService (Singleton instance)
 * NAMED_EXPORTS: ProjectService, ProjectServiceConfig
 * DEFAULT_AVAILABLE: true
 * COMPATIBILITY: internal
 * ============================================================================
 */
