import type { Request, Response } from 'express';
import { vi } from 'vitest';
import { projectController } from '../../src/controllers/project.controller';
import { generationExecutionService } from '../../src/generation/generation-execution-service';
import { generationJobStore } from '../../src/generation/generation-job-store';

vi.mock('uuid', () => ({ v4: () => require('crypto').randomUUID() }));
vi.mock('../../src/generation/generation-execution-service', () => ({
  generationExecutionService: { execute: vi.fn() },
}));

describe('ProjectController certification', () => {
  beforeEach(() => generationJobStore.clear());

  it.each([true, false, undefined])('requires explicit deployment certification: %s', async ready => {
    const execution = { output: { deployment: { ready }, files: [{ path: 'src/App.tsx', content: 'export default 1;' }] }, totalDuration: 20 };
    (generationExecutionService.execute as jest.Mock).mockResolvedValue({
      certified: ready === true,
      workflowResult: { success: true, data: execution },
      execution,
      diagnostics: [],
      repairAttempts: [],
      ...(ready === true ? {} : { error: 'O projeto não passou pela certificação de geração' }),
    });
    const res = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (res.status as jest.Mock).mockReturnValue(res);
    const next = jest.fn();
    await projectController.createProject({ body: { name: 'Certification test', prompt: 'Aplicação de tarefas' } } as Request, res, next);
    await new Promise(resolve => setImmediate(resolve));
    expect(next).not.toHaveBeenCalled();
    const project = (res.json as jest.Mock).mock.calls[0][0].data.project;
    const job = generationJobStore.get(project.generationId)!;
    expect(project.status).toBe(ready === true ? 'ready' : 'error');
    expect(job.status).toBe(ready === true ? 'ready' : 'failed');
    expect(job.success).toBe(ready === true);
    if (ready !== true) expect(job.files).toEqual([]);
  });

  it('isolates projects by owner and persists file workspace operations', async () => {
    const execution = {
      output: {
        deployment: { ready: true },
        files: [{ name: 'App.tsx', path: 'src/App.tsx', content: 'export default 1;' }],
      },
      totalDuration: 20,
    };
    (generationExecutionService.execute as jest.Mock).mockResolvedValue({
      certified: true,
      workflowResult: { success: true, data: execution },
      execution,
      diagnostics: [],
      repairAttempts: [],
    });
    const owner = { userId: 'owner-a', email: 'a@orus.dev', username: 'owner-a', role: 'owner' };
    const createResponse = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (createResponse.status as jest.Mock).mockReturnValue(createResponse);
    await projectController.createProject({
      body: { name: 'Workspace test', prompt: 'Crie um workspace funcional completo' },
      user: owner,
    } as Request, createResponse, jest.fn());
    await new Promise(resolve => setImmediate(resolve));

    const project = (createResponse.json as jest.Mock).mock.calls[0][0].data.project;
    const file = project.files[0];
    expect(file.content).toBe('export default 1;');

    const foreignList = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (foreignList.status as jest.Mock).mockReturnValue(foreignList);
    await projectController.listProjects({
      user: { ...owner, userId: 'owner-b' },
    } as Request, foreignList, jest.fn());
    expect((foreignList.json as jest.Mock).mock.calls[0][0].data.projects).toEqual([]);

    const updateResponse = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (updateResponse.status as jest.Mock).mockReturnValue(updateResponse);
    await projectController.updateFileContent({
      params: { projectId: project.id, fileId: file.id },
      body: { content: 'export default 2;' },
      user: owner,
    } as unknown as Request, updateResponse, jest.fn());
    expect((updateResponse.json as jest.Mock).mock.calls[0][0].data.file.content).toBe('export default 2;');

    const duplicateResponse = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (duplicateResponse.status as jest.Mock).mockReturnValue(duplicateResponse);
    await projectController.duplicateFile({
      params: { projectId: project.id, fileId: file.id },
      user: owner,
    } as unknown as Request, duplicateResponse, jest.fn());
    expect((duplicateResponse.json as jest.Mock).mock.calls[0][0].data.file.name).toBe('App.copy.tsx');

    const historyResponse = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (historyResponse.status as jest.Mock).mockReturnValue(historyResponse);
    await projectController.getProjectHistory({
      params: { projectId: project.id },
      user: owner,
    } as unknown as Request, historyResponse, jest.fn());
    const revisions = (historyResponse.json as jest.Mock).mock.calls[0][0].data.revisions;
    expect(revisions).toHaveLength(2);
    expect(revisions[0]).toMatchObject({ type: 'duplicate', previousPath: 'src/App.tsx' });
    expect(revisions[1]).toMatchObject({ type: 'content', contentBefore: 'export default 1;', contentAfter: 'export default 2;' });
  });

  it('imports a certified generation into the authenticated workspace once', async () => {
    generationJobStore.update('job-import', {
      userId: 'owner-import',
      status: 'ready',
      success: true,
      files: [
        { name: 'App.tsx', path: 'frontend/src/App.tsx', content: 'export default 1;' },
        { name: 'README.md', path: 'README.md', content: '# Imported app' },
      ],
      projectName: 'Imported app',
      request: { prompt: 'Aplicação importada', framework: 'react', language: 'typescript' },
    });
    const owner = { userId: 'owner-import', email: 'owner@orus.dev', username: 'owner', role: 'owner' };
    const response = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (response.status as jest.Mock).mockReturnValue(response);
    const request = {
      body: { generationId: 'job-import', name: 'Workspace importado' },
      user: owner,
    } as Request;

    await projectController.createProjectFromGeneration(request, response, jest.fn());
    expect(response.status).toHaveBeenCalledWith(201);
    const project = (response.json as jest.Mock).mock.calls[0][0].data.project;
    expect(project.files[0].path).toBe('frontend/src/App.tsx');
    expect(project.userId).toBe('owner-import');

    (response.status as jest.Mock).mockClear();
    (response.json as jest.Mock).mockClear();
    await projectController.createProjectFromGeneration(request, response, jest.fn());
    expect(response.status).toHaveBeenCalledWith(200);
    expect((response.json as jest.Mock).mock.calls[0][0].data.project.id).toBe(project.id);

    const fileId = project.files[0].id;
    const updateResponse = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (updateResponse.status as jest.Mock).mockReturnValue(updateResponse);
    await projectController.updateFileContent({
      params: { projectId: project.id, fileId },
      body: { content: 'export default "user-edit";' },
      user: owner,
    } as unknown as Request, updateResponse, jest.fn());

    (generationExecutionService.execute as jest.Mock).mockResolvedValue({
      certified: true,
      workflowResult: { success: true },
      execution: {
        output: {
          files: [
            { name: 'App.tsx', path: 'frontend/src/App.tsx', content: 'export default "user-edit";' },
            { name: 'Feature.tsx', path: 'frontend/src/Feature.tsx', content: 'export default "feature";' },
            { name: 'README.md', path: 'README.md', content: '# Imported app' },
          ],
        },
        totalDuration: 10,
      },
      diagnostics: [],
      repairAttempts: [],
    });
    const regenerateResponse = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (regenerateResponse.status as jest.Mock).mockReturnValue(regenerateResponse);
    await projectController.regenerateProject({
      params: { projectId: project.id },
      body: { prompt: 'Adicione uma funcionalidade especializada ao projeto', protectedPaths: ['README.md'] },
      user: owner,
    } as unknown as Request, regenerateResponse, jest.fn());
    expect(regenerateResponse.status).toHaveBeenCalledWith(202);
    await new Promise(resolve => setImmediate(resolve));
    expect(generationExecutionService.execute).toHaveBeenLastCalledWith(expect.objectContaining({
      workspaceOverlay: expect.objectContaining({
        protectedPaths: expect.arrayContaining(['frontend/src/App.tsx', 'README.md']),
        files: expect.arrayContaining([expect.objectContaining({ path: 'README.md', content: '# Imported app' })]),
      }),
    }));
    await new Promise(resolve => setImmediate(resolve));

    const projectResponse = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (projectResponse.status as jest.Mock).mockReturnValue(projectResponse);
    await projectController.getProject({ params: { projectId: project.id }, user: owner } as unknown as Request, projectResponse, jest.fn());
    const regenerated = (projectResponse.json as jest.Mock).mock.calls[0][0].data.project;
    expect(regenerated.files.find((file: any) => file.path === 'frontend/src/App.tsx').content).toBe('export default "user-edit";');
    expect(regenerated.files.find((file: any) => file.path === 'frontend/src/Feature.tsx').content).toBe('export default "feature";');
    expect(regenerated.revisions.at(-1)).toMatchObject({ type: 'regenerate' });
  });

  it.each(['cancelled', 'concurrent-edit', 'deleted-file-restored'])('does not replace the workspace after %s', async scenario => {
    const seedId = `seed-${scenario}`;
    const user = { userId: seedId, email: 'owner@orus.dev', username: 'owner', role: 'owner' };
    generationJobStore.update(seedId, {
      userId: user.userId, status: 'ready', success: true,
      request: { prompt: 'Agenda de clientes', framework: 'react', language: 'typescript' },
      files: [{ path: 'src/manual.ts', name: 'manual.ts', content: 'export const value = 1;' }],
    });
    const response = (): Response => {
      const res = { status: jest.fn(), json: jest.fn() } as unknown as Response;
      (res.status as jest.Mock).mockReturnValue(res);
      return res;
    };
    const imported = response();
    await projectController.createProjectFromGeneration({ user, body: { generationId: seedId } } as Request, imported, jest.fn());
    const project = (imported.json as jest.Mock).mock.calls[0][0].data.project;
    const fileId = project.files[0].id;
    if (scenario === 'deleted-file-restored') {
      await projectController.deleteFile({ user, params: { projectId: project.id, fileId } } as unknown as Request, response(), jest.fn());
    }
    let release: (value: unknown) => void = () => undefined;
    let entered: () => void = () => undefined;
    const executing = new Promise<void>(resolve => { entered = resolve; });
    (generationExecutionService.execute as jest.Mock).mockImplementation(() => {
      entered();
      return new Promise(resolve => { release = resolve; });
    });
    const started = response();
    const req = { user, params: { projectId: project.id }, body: { prompt: 'Adicione relatórios ao sistema' } } as unknown as Request;
    await projectController.regenerateProject(req, started, jest.fn());
    await executing;
    const generationId = (started.json as jest.Mock).mock.calls[0][0].data.generationId;
    const duplicate = response();
    await projectController.regenerateProject(req, duplicate, jest.fn());
    expect(duplicate.status).toHaveBeenCalledWith(409);
    if (scenario === 'cancelled') generationJobStore.cancel(generationId);
    if (scenario === 'concurrent-edit') {
      await projectController.updateFileContent({ user, params: { projectId: project.id, fileId }, body: { content: 'export const value = 2;' } } as unknown as Request, response(), jest.fn());
    }
    const before = JSON.stringify(project);
    release({
      certified: true, diagnostics: [], repairAttempts: [], workflowResult: { success: true },
      execution: { output: { files: [{ path: 'src/manual.ts', content: 'export const value = 1;' }] } },
    });
    await new Promise(resolve => setImmediate(resolve));
    expect(JSON.stringify(project)).toBe(before);
    expect(project.generationId).toBe(seedId);
    expect(generationJobStore.get(generationId)?.status).toBe(scenario === 'cancelled' ? 'cancelled' : 'failed');
  });
});
