/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🗂️ ORUS BUILDER - PROJECT CONTROLLER WITH ORCHESTRATOR
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../system/logging-system';
import { randomUUID } from 'crypto';
import JSZip from 'jszip';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';

// ✅ Import Orchestrator
import { productBlueprintPlanner, type ProductBlueprint } from '../blueprint/product-blueprint';
import { generationJobStore } from '../generation/generation-job-store';
import { generationExecutionService } from '../generation/generation-execution-service';
import { createCertifiedArtifactManifest } from '../generation/artifact-manifest';

interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  files: any[];
  framework: string;
  language: string;
  owner: string;
  prompt: string;
  generatedCode?: string;
  specification?: any;
  productBlueprint?: ProductBlueprint;
  generationId: string;
  status: 'creating' | 'ready' | 'modified' | 'error';
  createdAt: string;
  updatedAt: string;
  revisions?: ProjectRevision[];
  protectedPaths?: string[];
}

interface ProjectRevision {
  id: string;
  type: 'content' | 'rename' | 'delete' | 'duplicate' | 'regenerate' | 'restore';
  summary: string;
  fileId: string;
  path: string;
  previousPath?: string;
  contentBefore?: string;
  contentAfter?: string;
  fileSnapshot?: Record<string, unknown>;
  sourceRevisionId?: string;
  createdAt: string;
  userId: string;
}

const projectStorePath = process.env['ORUS_PROJECT_STORE_FILE'] || resolve(process.cwd(), '.orus-data', 'projects.json');

function loadProjects(): Project[] {
  if (process.env['NODE_ENV'] === 'test' || !existsSync(projectStorePath)) return [];
  try {
    const stored = JSON.parse(readFileSync(projectStorePath, 'utf8'));
    return Array.isArray(stored) ? stored : [];
  } catch {
    renameSync(projectStorePath, `${projectStorePath}.corrupt-${Date.now()}`);
    return [];
  }
}

const projects: Project[] = loadProjects();

export function canAccessProject(userId: string, projectId: string): boolean {
  return projects.some(project => project.id === projectId && project.userId === userId);
}

export function ownsProject(userId: string, projectId: string): boolean {
  return projects.some(project => project.id === projectId && project.owner === userId);
}

function persistProjects(): void {
  if (process.env['NODE_ENV'] === 'test') return;
  mkdirSync(dirname(projectStorePath), { recursive: true });
  const temporaryPath = `${projectStorePath}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(projects, null, 2), 'utf8');
  renameSync(temporaryPath, projectStorePath);
}

class ProjectController {
  private readonly regeneratingProjects = new Set<string>();
  private markProjectModified(project: Project, updatedAt = new Date().toISOString()): void {
    project.status = 'modified';
    project.updatedAt = updatedAt;
  }
  private findOwnedProject(projectId: string, userId: string): Project | undefined {
    return projects.find(project => project.id === projectId && project.userId === userId);
  }

  private getUserId(req: Request): string {
    return req.user?.userId || 'anonymous';
  }

  private recordRevision(project: Project, revision: Omit<ProjectRevision, 'id' | 'createdAt' | 'userId'>): ProjectRevision {
    const recorded: ProjectRevision = {
      ...revision,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      userId: project.userId,
    };
    if (revision.type !== 'regenerate') {
      project.protectedPaths = Array.from(new Set([
        ...(project.protectedPaths || []),
        ...(project.revisions || []).filter(item => item.type !== 'regenerate')
          .flatMap(item => [item.path, ...(item.previousPath ? [item.previousPath] : [])]),
        revision.path,
        ...(revision.previousPath ? [revision.previousPath] : []),
      ]));
    }
    project.revisions = [...(project.revisions || []), recorded].slice(-200);
    return recorded;
  }

  private projectFile(project: Project, file: any, existing?: any): any {
    const now = new Date().toISOString();
    const path = String(file.path || file.filename || file.name || 'file');
    return {
      ...existing,
      id: existing?.id || randomUUID(),
      name: file.name || file.filename || path.split('/').pop() || 'file',
      path,
      content: String(file.content || ''),
      language: file.type || existing?.language || 'text',
      framework: project.framework,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
  }

  private incrementalPrompt(project: Project, change: string): string {
    const blueprint = project.productBlueprint;
    const productContext = blueprint ? {
      product: blueprint.product,
      capabilities: blueprint.capabilities,
      screens: blueprint.screens,
      data: blueprint.data,
      architecture: blueprint.architecture,
      visualIntent: blueprint.visualIntent,
    } : undefined;
    return [
      'Evolua o produto existente preservando tudo o que não foi explicitamente alterado.',
      `Fonte original: ${project.prompt}`,
      productContext ? `Product Blueprint atual: ${JSON.stringify(productContext)}` : '',
      `Alteração solicitada: ${change}`,
      'Atualize o Product Blueprint antes de gerar o código e mantenha compatibilidade com os fluxos existentes.',
    ].filter(Boolean).join('\n\n');
  }

  async listProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const userProjects = projects.filter(project => project.userId === userId);

      logger.info(`📋 Listing projects for user: ${userId}`, {
        component: 'ProjectController'
      } as any);

      res.status(200).json({
        success: true,
        data: {
          projects: userProjects,
          total: userProjects.length,
        },
      });
    } catch (error) {
      logger.error('❌ Error listing projects', { error, component: 'ProjectController' } as any);
      next(error);
    }
  }

  async getProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = String(req.params['projectId'] || '');
      const project = this.findOwnedProject(projectId, this.getUserId(req));

      if (!project) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { project },
      });
    } catch (error) {
      logger.error('❌ Error getting project', { error, component: 'ProjectController' } as any);
      next(error);
    }
  }

  async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const { name, description, framework, prompt, language } = req.body;

      if (!name || !prompt) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Name and prompt are required' },
        });
        return;
      }

      logger.info('Creating project', {
        component: 'ProjectController',
        projectNameLength: String(name).length,
        promptLength: String(prompt).length,
        framework,
        language
      } as any);

      const projectId = randomUUID();
      const generationId = `job-${randomUUID()}`;
      const newProject: Project = {
        id: projectId,
        userId,
        name,
        description: description || '',
        files: [],
        framework: framework || 'react',
        language: language || 'typescript',
        owner: userId,
        prompt,
        generationId,
        status: 'creating',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      projects.push(newProject);
      persistProjects();
      generationJobStore.update(generationId, {
        request: { projectId, prompt, framework: framework || 'react', language: language || 'typescript' },
        createdAt: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        data: {
          project: newProject,
          message: 'Project created, generating code...',
        },
      });

      // ✅ Generate code asynchronously
      this.generateCodeAsync(projectId, generationId, {
        prompt,
        framework: framework || 'react',
        language: language === 'javascript' ? 'javascript' : 'typescript',
        userId,
      }).catch(error => {
        logger.error('❌ Async code generation failed', {
          error,
          projectId,
          component: 'ProjectController'
        } as any);
        
        const project = projects.find(p => p.id === projectId);
        if (project) {
          project.status = 'error';
          project.updatedAt = new Date().toISOString();
          persistProjects();
        }
        generationJobStore.update(generationId, {
          status: 'failed',
          progress: 100,
          currentStep: 'failed',
          error: error instanceof Error ? error.message : String(error),
        });
      });

    } catch (error) {
      logger.error('❌ Error creating project', { error, component: 'ProjectController' } as any);
      next(error);
    }
  }

  private async generateCodeAsync(
    projectId: string,
    generationId: string,
    params: { prompt: string; framework: string; language: string; userId: string; }
  ): Promise<void> {
    try {
      logger.info(`🔄 Starting code generation for: ${projectId}`, {
        component: 'ProjectController'
      } as any);
      generationJobStore.update(generationId, {
        status: 'generating',
        progress: 5,
        currentStep: 'initializing',
      });

      const executionOutcome = await generationExecutionService.execute({
        generationId,
        userId: params.userId,
        prompt: params.prompt,
        projectId,
        framework: params.framework,
        language: params.language,
        complexity: 'standard',
        includeTests: true,
        style: 'modern',
        locale: 'pt-BR',
        onProgress: update => generationJobStore.update(generationId, {
          status: update.status,
          progress: update.progress,
          currentStep: update.currentStep,
          repairAttempts: update.repairAttempt || 0,
          ...(update.diagnostics ? { diagnostics: update.diagnostics } : {}),
        }),
      });
      const workflowResult = executionOutcome.workflowResult;

      logger.info(`✅ Code generated for: ${projectId}`, {
        component: 'ProjectController',
        success: workflowResult.success
      } as any);

      // ✅ Processar resultado (workflowResult.data contém WorkflowExecutionResult)
      const project = projects.find(p => p.id === projectId);
      if (project && executionOutcome.certified && executionOutcome.execution) {
        // ✅ Extrair código gerado do output
        const executionResult = executionOutcome.execution;
        const generatedFiles = (executionResult.output?.['files'] as any[]) || [];
        project.productBlueprint = executionResult.output?.['productBlueprint'] as ProductBlueprint | undefined;
        project.status = 'ready';
        project.updatedAt = new Date().toISOString();
        const runtimeValidation = executionResult.output?.['runtimeValidation'] as any;
        const repairAttempts = executionResult.output?.['repairAttempts'] as unknown[] | undefined;
        const productImplementation = executionResult.output?.['productImplementation'] as any;
        generationJobStore.update(generationId, {
          success: true,
          status: 'ready',
          progress: 100,
          currentStep: 'certified',
          files: generatedFiles,
          projectName: project.name,
          diagnostics: [],
          repairAttempts: repairAttempts?.length || 0,
          metrics: {
            totalFiles: generatedFiles.length,
            totalLines: generatedFiles.reduce((total, file) => total + String(file.content || '').split('\n').length, 0),
            generationTime: executionResult.totalDuration,
          },
          metadata: {
            artifactManifest: createCertifiedArtifactManifest(generatedFiles),
            productBlueprint: project.productBlueprint,
            qualityGate: {
              certified: true,
              runtimeValidation,
              repairAttempts,
              productImplementation,
              cig: executionResult.output?.['cig'],
              security: executionResult.output?.['security'],
            },
          },
        });

        // ✅ Adicionar arquivos gerados
        if (generatedFiles.length > 0) {
          generatedFiles.forEach((file: any) => {
            project.files.push({
              id: randomUUID(),
              name: file.name || `${project.name.replace(/\s/g, '')}.tsx`,
              path: file.path || `src/components/${project.name.replace(/\s/g, '')}.tsx`,
              content: file.content,
              language: 'typescript',
              framework: project.framework,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });
          
          // ✅ Salvar código do primeiro arquivo como generatedCode
          project.generatedCode = generatedFiles[0].content;
        }

        logger.info(`✅ Project ready: ${projectId}`, {
          component: 'ProjectController',
          filesCount: project.files.length,
          stepsCompleted: executionResult.stepsCompleted
        } as any);
        persistProjects();
        
      } else {
        if (project) {
          project.status = 'error';
          project.updatedAt = new Date().toISOString();
          persistProjects();
        }
        generationJobStore.update(generationId, {
          status: 'failed',
          progress: 100,
          currentStep: 'failed-quality-gate',
          diagnostics: executionOutcome.diagnostics,
          repairAttempts: executionOutcome.repairAttempts.length,
          error: executionOutcome.error,
        });
        
        logger.error(`❌ Workflow failed for: ${projectId}`, {
          component: 'ProjectController',
          error: workflowResult.error
        } as any);
      }

    } catch (error) {
      logger.error(`❌ Code generation failed for: ${projectId}`, {
        error,
        component: 'ProjectController'
      } as any);
      
      const project = projects.find(p => p.id === projectId);
      if (project) {
        project.status = 'error';
        project.updatedAt = new Date().toISOString();
        persistProjects();
      }
      generationJobStore.update(generationId, {
        status: 'failed',
        progress: 100,
        currentStep: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
      
      throw error;
    }
  }

  async regenerateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = String(req.params['projectId'] || '');
      const userId = this.getUserId(req);
      const project = this.findOwnedProject(projectId, userId);
      if (!project) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
        return;
      }
      const prompt = String(req.body.prompt || '').trim();
      if (this.regeneratingProjects.has(projectId)) {
        res.status(409).json({ success: false, error: { code: 'REGENERATION_IN_PROGRESS', message: 'Este projeto já possui uma regeneração em andamento' } });
        return;
      }
      const generationId = `job-${randomUUID()}`;
      const protectedPaths = new Set<string>(project.protectedPaths || []);
      for (const revision of project.revisions || []) {
        if (revision.type !== 'regenerate') protectedPaths.add(revision.path);
        if (revision.previousPath) protectedPaths.add(revision.previousPath);
      }
      const requestedProtectedPaths = Array.isArray(req.body.protectedPaths)
        ? req.body.protectedPaths.map((path: unknown) => String(path))
        : [];
      const workspacePaths = new Set(project.files.map(file => String(file.path)));
      const invalidProtectedPath = requestedProtectedPaths.find((path: string) => !workspacePaths.has(path));
      if (invalidProtectedPath) {
        res.status(400).json({ success: false, error: { code: 'INVALID_PROTECTED_PATH', message: `File is not part of the workspace: ${invalidProtectedPath}` } });
        return;
      }
      requestedProtectedPaths.forEach((path: string) => protectedPaths.add(path));
      const previousSchema = project.files.find(file => /^(?:backend\/)?prisma\/schema\.prisma$/.test(String(file.path).replace(/\\/g, '/')));
      const previousMigrations = project.files.filter(file => /^(?:backend\/)?prisma\/migrations\/.+/.test(String(file.path).replace(/\\/g, '/')));
      previousMigrations.forEach(file => protectedPaths.add(String(file.path).replace(/\\/g, '/')));
      generationJobStore.update(generationId, {
        userId,
        status: 'queued',
        request: { projectId, prompt, framework: project.framework, language: project.language },
        createdAt: new Date().toISOString(),
      });
      this.regeneratingProjects.add(projectId);
      res.status(202).json({
        success: true,
        data: { generationId, status: 'queued', protectedFiles: protectedPaths.size },
      });
      void this.regenerateProjectAsync(project, generationId, prompt, protectedPaths, previousSchema?.content ? String(previousSchema.content) : undefined);
    } catch (error) {
      next(error);
    }
  }

  private async regenerateProjectAsync(
    project: Project,
    generationId: string,
    prompt: string,
    protectedPaths: Set<string>,
    previousSchema?: string
  ): Promise<void> {
    if (previousSchema) protectedPaths.add('.orus/schema-baseline.prisma');
    const originalState = JSON.stringify(project);
    const workspaceOverlay = {
      protectedPaths: Array.from(protectedPaths),
      files: [
        ...project.files
        .map(file => ({ path: String(file.path).replace(/\\/g, '/'), content: String(file.content) }))
        .filter(file => protectedPaths.has(file.path)),
        ...(previousSchema ? [{ path: '.orus/schema-baseline.prisma', content: previousSchema }] : []),
      ],
    };
    try {
      generationJobStore.update(generationId, { status: 'generating', progress: 5, currentStep: 'initializing' });
      const productBlueprint = project.productBlueprint
        ? await productBlueprintPlanner.evolve(project.productBlueprint, prompt, project.prompt)
        : await productBlueprintPlanner.create({
          prompt: [project.prompt, prompt].filter(Boolean).join('\n\n'),
          projectId: project.id,
          sourceType: 'prompt',
        });
      if (generationJobStore.get(generationId)?.status === 'cancelled') return;
      const outcome = await generationExecutionService.execute({
        generationId,
        projectId: project.id,
        userId: project.userId,
        prompt: this.incrementalPrompt(project, prompt),
        framework: project.framework,
        language: project.language,
        complexity: 'standard',
        includeTests: true,
        style: 'modern',
        locale: 'pt-BR',
        productBlueprint,
        workspaceOverlay,
        onProgress: update => generationJobStore.update(generationId, {
          status: update.status,
          progress: update.progress,
          currentStep: update.currentStep,
          repairAttempts: update.repairAttempt || 0,
          ...(update.diagnostics ? { diagnostics: update.diagnostics } : {}),
        }),
      });
      if (generationJobStore.get(generationId)?.status === 'cancelled') return;
      if (!outcome.certified || !outcome.execution) {
        generationJobStore.update(generationId, {
          status: 'failed',
          progress: 100,
          currentStep: 'failed-quality-gate',
          diagnostics: outcome.diagnostics,
          repairAttempts: outcome.repairAttempts.length,
          error: outcome.error,
        });
        return;
      }
      const generatedFiles = (outcome.execution.output?.['files'] as any[]) || [];
      if (JSON.stringify(project) !== originalState || !projects.includes(project)) {
        throw new Error('O workspace foi alterado durante a geração. Suas alterações foram preservadas; execute novamente sobre a versão atual.');
      }
      const currentByPath = new Map(project.files.map(file => [String(file.path), file]));
      const merged = generatedFiles.map(file => {
        const path = String(file.path || file.filename || file.name || 'file');
        const current = currentByPath.get(path);
        return this.projectFile(project, file, current);
      });
      for (const path of protectedPaths) {
        const current = currentByPath.get(path);
        const certified = merged.find(file => file.path === path);
        const overlay = workspaceOverlay.files.find(file => file.path === path);
        const expectedContent = overlay?.content ?? current?.content;
        if (expectedContent === undefined ? !!certified : certified?.content !== expectedContent) {
          throw new Error(`A geração não preservou o arquivo protegido: ${path}`);
        }
      }
      const previousCount = project.files.length;
      project.files = merged;
      project.prompt = `${project.prompt}\n\nAlteração incremental: ${prompt}`;
      project.productBlueprint = outcome.execution.output?.['productBlueprint'] as ProductBlueprint | undefined;
      project.generationId = generationId;
      project.status = 'ready';
      project.updatedAt = new Date().toISOString();
      this.recordRevision(project, {
        type: 'regenerate',
        summary: `Regenerated ${merged.length} files and preserved ${protectedPaths.size} edited paths`,
        fileId: project.id,
        path: '/',
        contentBefore: String(previousCount),
        contentAfter: String(merged.length),
      });
      persistProjects();
      generationJobStore.update(generationId, {
        success: true,
        status: 'ready',
        progress: 100,
        currentStep: 'certified',
        files: merged,
        projectName: project.name,
        diagnostics: [],
        repairAttempts: outcome.repairAttempts.length,
        metadata: {
          artifactManifest: createCertifiedArtifactManifest(merged),
          productBlueprint: project.productBlueprint,
          protectedPaths: Array.from(protectedPaths),
          qualityGate: {
            certified: true,
            runtimeValidation: outcome.execution.output?.['runtimeValidation'],
            productImplementation: outcome.execution.output?.['productImplementation'],
            cig: outcome.execution.output?.['cig'],
            security: outcome.execution.output?.['security'],
          },
        },
      });
    } catch (error) {
      generationJobStore.update(generationId, {
        status: 'failed',
        progress: 100,
        currentStep: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.regeneratingProjects.delete(project.id);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.params;
      const updates = req.body;
      const userId = this.getUserId(req);
      const projectIndex = projects.findIndex(p => p.id === projectId && p.userId === userId);

      if (projectIndex === -1) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
        });
        return;
      }

      const { id: _id, userId: _userId, files: _files, generationId: _generationId, ...allowedUpdates } = updates;
      projects[projectIndex] = {
        ...projects[projectIndex],
        ...allowedUpdates,
        id: projectId,
        updatedAt: new Date().toISOString(),
      };
      persistProjects();

      logger.info(`✏️ Project updated: ${projectId}`, {
        component: 'ProjectController'
      } as any);

      res.status(200).json({
        success: true,
        data: { project: projects[projectIndex] },
      });
    } catch (error) {
      logger.error('❌ Error updating project', { error, component: 'ProjectController' } as any);
      next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { projectId } = req.params;
      const userId = this.getUserId(req);
      const projectIndex = projects.findIndex(p => p.id === projectId && p.userId === userId);

      if (projectIndex === -1) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project not found' },
        });
        return;
      }

      projects.splice(projectIndex, 1);
      persistProjects();

      logger.info(`🗑️ Project deleted: ${projectId}`, {
        component: 'ProjectController'
      } as any);

      res.status(204).send();
    } catch (error) {
      logger.error('❌ Error deleting project', { error, component: 'ProjectController' } as any);
      next(error);
    }
  }

  async createProjectFromGeneration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = this.getUserId(req);
      const generationId = String(req.body.generationId || '');
      const generation = generationJobStore.get(generationId);
      if (!generation || generation.status !== 'ready' || generation.success !== true) {
        res.status(409).json({ success: false, error: { code: 'GENERATION_NOT_READY', message: 'Generation is not ready' } });
        return;
      }
      if (generation['userId'] !== userId) {
        res.status(403).json({ success: false, error: { code: 'GENERATION_ACCESS_DENIED', message: 'Access denied to this generation' } });
        return;
      }
      const existing = projects.find(project => project.generationId === generationId && project.userId === userId);
      if (existing) {
        res.status(200).json({ success: true, data: { project: existing } });
        return;
      }
      const now = new Date().toISOString();
      const files = generation.files.map(file => ({
        id: randomUUID(),
        name: file.name || file.filename || String(file.path || '').split('/').pop() || 'file',
        path: file.path || file.filename || file.name,
        content: String(file.content || ''),
        language: file.type || 'text',
        createdAt: now,
        updatedAt: now,
      }));
      const project: Project = {
        id: randomUUID(),
        userId,
        owner: userId,
        name: String(req.body.name || generation.projectName || 'Projeto ORUS'),
        description: String(req.body.description || generation.request?.prompt || ''),
        files,
        framework: String(generation.request?.framework || 'react'),
        language: String(generation.request?.language || 'typescript'),
        prompt: String(generation.request?.prompt || ''),
        productBlueprint: generation.metadata?.productBlueprint,
        generationId,
        status: 'ready',
        createdAt: now,
        updatedAt: now,
      };
      projects.push(project);
      persistProjects();
      res.status(201).json({ success: true, data: { project } });
    } catch (error) {
      next(error);
    }
  }

  async getProjectFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      if (!project) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
        return;
      }
      res.status(200).json({ success: true, data: { files: project.files } });
    } catch (error) {
      next(error);
    }
  }

  async getFileContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      const file = project?.files.find(item => item.id === req.params['fileId']);
      if (!project || !file) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
        return;
      }
      res.status(200).json({ success: true, data: { file } });
    } catch (error) {
      next(error);
    }
  }

  async updateFileContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      const file = project?.files.find(item => item.id === req.params['fileId']);
      if (!project || !file) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
        return;
      }
      const contentBefore = String(file.content || '');
      const contentAfter = String(req.body.content);
      if (contentBefore !== contentAfter) {
        this.recordRevision(project, {
          type: 'content',
          summary: `Updated ${file.path}`,
          fileId: file.id,
          path: file.path,
          contentBefore,
          contentAfter,
        });
      }
      file.content = contentAfter;
      file.updatedAt = new Date().toISOString();
      this.markProjectModified(project, file.updatedAt);
      persistProjects();
      res.status(200).json({ success: true, data: { file } });
    } catch (error) {
      next(error);
    }
  }

  async renameFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      const file = project?.files.find(item => item.id === req.params['fileId']);
      if (!project || !file) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
        return;
      }
      const oldName = String(file.name);
      const newName = String(req.body.name);
      const previousPath = String(file.path);
      file.name = newName;
      file.path = String(file.path).replace(new RegExp(`${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), newName);
      this.recordRevision(project, {
        type: 'rename',
        summary: `Renamed ${previousPath} to ${file.path}`,
        fileId: file.id,
        path: file.path,
        previousPath,
      });
      file.updatedAt = new Date().toISOString();
      this.markProjectModified(project, file.updatedAt);
      persistProjects();
      res.status(200).json({ success: true, data: { file } });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      const fileIndex = project?.files.findIndex(item => item.id === req.params['fileId']) ?? -1;
      if (!project || fileIndex < 0) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
        return;
      }
      const deletedFile = project.files[fileIndex];
      this.recordRevision(project, {
        type: 'delete',
        summary: `Deleted ${deletedFile.path}`,
        fileId: deletedFile.id,
        path: deletedFile.path,
        contentBefore: String(deletedFile.content || ''),
        fileSnapshot: { ...deletedFile },
      });
      project.files.splice(fileIndex, 1);
      this.markProjectModified(project);
      persistProjects();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async duplicateFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      const source = project?.files.find(item => item.id === req.params['fileId']);
      if (!project || !source) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
        return;
      }
      const extensionIndex = String(source.name).lastIndexOf('.');
      const stem = extensionIndex > 0 ? String(source.name).slice(0, extensionIndex) : String(source.name);
      const extension = extensionIndex > 0 ? String(source.name).slice(extensionIndex) : '';
      const name = `${stem}.copy${extension}`;
      const now = new Date().toISOString();
      const file = {
        ...source,
        id: randomUUID(),
        name,
        path: String(source.path).replace(new RegExp(`${String(source.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), name),
        createdAt: now,
        updatedAt: now,
      };
      project.files.push(file);
      this.recordRevision(project, {
        type: 'duplicate',
        summary: `Duplicated ${source.path} as ${file.path}`,
        fileId: file.id,
        path: file.path,
        previousPath: source.path,
        contentAfter: String(file.content || ''),
      });
      this.markProjectModified(project, now);
      persistProjects();
      res.status(201).json({ success: true, data: { file } });
    } catch (error) {
      next(error);
    }
  }

  async exportProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      if (!project) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
        return;
      }
      const zip = new JSZip();
      project.files.forEach(file => zip.file(String(file.path || file.name).replace(/^[/\\]+/, ''), String(file.content || '')));
      const artifactManifest = createCertifiedArtifactManifest(project.files);
      const archive = await zip.generateAsync({ type: 'nodebuffer' });
      const fileName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || project.id;
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', `attachment; filename="${fileName}.zip"`);
      res.set('X-Orus-Artifact-Digest', artifactManifest.digest);
      res.set('X-Orus-Certification', project.status === 'ready' ? 'certified' : 'modified');
      res.send(archive);
    } catch (error) {
      next(error);
    }
  }

  async getProjectHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      if (!project) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
        return;
      }
      const revisions = [...(project.revisions || [])].reverse();
      res.status(200).json({ success: true, data: { revisions, total: revisions.length } });
    } catch (error) {
      next(error);
    }
  }

  async getProjectRevision(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      const revision = project?.revisions?.find(item => item.id === req.params['revisionId']);
      if (!project || !revision) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Revision not found' } });
        return;
      }
      res.status(200).json({ success: true, data: { revision } });
    } catch (error) {
      next(error);
    }
  }

  async restoreProjectRevision(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const project = this.findOwnedProject(String(req.params['projectId'] || ''), this.getUserId(req));
      const revision = project?.revisions?.find(item => item.id === req.params['revisionId']);
      if (!project || !revision) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Revision not found' } });
        return;
      }
      if (this.regeneratingProjects.has(project.id)) {
        res.status(409).json({ success: false, error: { code: 'PROJECT_BUSY', message: 'Project regeneration is in progress' } });
        return;
      }
      if (revision.type === 'regenerate' || revision.type === 'restore') {
        res.status(409).json({ success: false, error: { code: 'REVISION_NOT_RESTORABLE', message: 'Revision cannot be restored' } });
        return;
      }

      const now = new Date().toISOString();
      let file: any | undefined;
      let removedFileId: string | undefined;
      let restore: Omit<ProjectRevision, 'id' | 'createdAt' | 'userId'>;

      if (revision.type === 'content') {
        file = project.files.find(item => item.id === revision.fileId) || project.files.find(item => item.path === revision.path);
        if (!file) {
          res.status(409).json({ success: false, error: { code: 'RESTORE_CONFLICT', message: 'The file no longer exists' } });
          return;
        }
        const currentContent = String(file.content || '');
        file.content = revision.contentBefore ?? '';
        file.updatedAt = now;
        restore = {
          type: 'restore',
          summary: `Restored content from ${revision.id}`,
          fileId: file.id,
          path: file.path,
          contentBefore: currentContent,
          contentAfter: file.content,
          sourceRevisionId: revision.id,
        };
      } else if (revision.type === 'rename') {
        file = project.files.find(item => item.id === revision.fileId) || project.files.find(item => item.path === revision.path);
        const targetPath = revision.previousPath;
        if (!file || !targetPath || project.files.some(item => item.id !== file.id && item.path === targetPath)) {
          res.status(409).json({ success: false, error: { code: 'RESTORE_CONFLICT', message: 'The original path is unavailable' } });
          return;
        }
        const currentPath = String(file.path);
        file.path = targetPath;
        file.name = targetPath.split('/').pop() || targetPath.split('\\').pop() || file.name;
        file.updatedAt = now;
        restore = {
          type: 'restore',
          summary: `Restored path from ${revision.id}`,
          fileId: file.id,
          path: targetPath,
          previousPath: currentPath,
          sourceRevisionId: revision.id,
        };
      } else if (revision.type === 'delete') {
        if (project.files.some(item => item.id === revision.fileId || item.path === revision.path)) {
          res.status(409).json({ success: false, error: { code: 'RESTORE_CONFLICT', message: 'The deleted file path is already in use' } });
          return;
        }
        const snapshot = revision.fileSnapshot || {};
        file = this.projectFile(project, {
          ...snapshot,
          id: revision.fileId,
          path: revision.path,
          name: revision.path.split('/').pop() || revision.path.split('\\').pop(),
          content: revision.contentBefore ?? '',
        }, {
          ...snapshot,
          id: revision.fileId,
          createdAt: snapshot['createdAt'] || now,
        });
        project.files.push(file);
        restore = {
          type: 'restore',
          summary: `Restored deleted file from ${revision.id}`,
          fileId: file.id,
          path: file.path,
          contentAfter: String(file.content || ''),
          sourceRevisionId: revision.id,
        };
      } else {
        const duplicateIndex = project.files.findIndex(item => item.id === revision.fileId || item.path === revision.path);
        if (duplicateIndex < 0) {
          res.status(409).json({ success: false, error: { code: 'RESTORE_CONFLICT', message: 'The duplicated file no longer exists' } });
          return;
        }
        const [removed] = project.files.splice(duplicateIndex, 1);
        removedFileId = removed.id;
        restore = {
          type: 'restore',
          summary: `Removed duplicate from ${revision.id}`,
          fileId: removed.id,
          path: removed.path,
          contentBefore: String(removed.content || ''),
          sourceRevisionId: revision.id,
        };
      }

      const recorded = this.recordRevision(project, restore);
      this.markProjectModified(project, now);
      persistProjects();
      res.status(200).json({ success: true, data: { project, file: file || null, removedFileId, revision: recorded } });
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
