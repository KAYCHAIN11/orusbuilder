import express from 'express';
import request from 'supertest';
import { projectRoutes } from '../../src/routes/project.routes';
import { generationJobStore } from '../../src/generation/generation-job-store';
import { authenticationMiddleware } from '../../src/middleware/authentication.middleware';
import { errorHandlerMiddleware } from '../../src/middleware/error-handler.middleware';

describe('Project workspace routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/projects', projectRoutes);
  app.use(errorHandlerMiddleware.handle);

  beforeEach(() => generationJobStore.clear());

  it('enforces ownership and exposes real file history', async () => {
    const userId = `workspace-owner-${Date.now()}`;
    const owner = authenticationMiddleware.generateToken({
      userId, email: 'owner@orus.dev', username: 'owner', role: 'user',
    });
    const foreign = authenticationMiddleware.generateToken({
      userId: `${userId}-foreign`, email: 'foreign@orus.dev', username: 'foreign', role: 'user',
    });
    generationJobStore.update('workspace-generation', {
      userId,
      status: 'ready',
      success: true,
      files: [{ name: 'App.tsx', path: 'frontend/src/App.tsx', content: 'export default 1;' }],
      request: { prompt: 'Workspace test', framework: 'react', language: 'typescript' },
    });

    const imported = await request(app)
      .post('/api/v1/projects/from-generation')
      .set('Authorization', `Bearer ${owner}`)
      .send({ generationId: 'workspace-generation', name: 'Workspace routes' });
    expect(imported.status).toBe(201);
    const project = imported.body.data.project;
    const file = project.files[0];

    expect((await request(app).get(`/api/v1/projects/${project.id}`).set('Authorization', `Bearer ${foreign}`)).status).toBe(403);
    expect((await request(app).get(`/api/v1/projects/${project.id}`).set('Authorization', `Bearer ${owner}`)).status).toBe(200);

    const updated = await request(app)
      .put(`/api/v1/projects/${project.id}/files/${file.id}`)
      .set('Authorization', `Bearer ${owner}`)
      .send({ content: 'export default 2;' });
    expect(updated.status).toBe(200);
    const modifiedProject = await request(app)
      .get(`/api/v1/projects/${project.id}`)
      .set('Authorization', `Bearer ${owner}`);
    expect(modifiedProject.body.data.project.status).toBe('modified');
    const exported = await request(app)
      .get(`/api/v1/projects/${project.id}/export`)
      .set('Authorization', `Bearer ${owner}`);
    expect(exported.status).toBe(200);
    expect(exported.headers['x-orus-certification']).toBe('modified');
    expect(exported.headers['x-orus-artifact-digest']).toMatch(/^[a-f0-9]{64}$/);

    const history = await request(app)
      .get(`/api/v1/projects/${project.id}/history`)
      .set('Authorization', `Bearer ${owner}`);
    expect(history.status).toBe(200);
    expect(history.body.data.revisions).toEqual([
      expect.objectContaining({ type: 'content', contentBefore: 'export default 1;', contentAfter: 'export default 2;' }),
    ]);
  });

  it('restores content, path, deletion and duplication without crossing workspace ownership', async () => {
    const userId = `workspace-restore-${Date.now()}`;
    const owner = authenticationMiddleware.generateToken({
      userId, email: 'restore@orus.dev', username: 'restore', role: 'user',
    });
    const foreign = authenticationMiddleware.generateToken({
      userId: `${userId}-foreign`, email: 'foreign@orus.dev', username: 'foreign', role: 'user',
    });
    const authorization = { Authorization: `Bearer ${owner}` };
    generationJobStore.update(`restore-generation-${userId}`, {
      userId,
      status: 'ready',
      success: true,
      files: [{ name: 'App.tsx', path: 'frontend/src/App.tsx', content: 'export default 1;', type: 'typescript' }],
      request: { prompt: 'Workspace restore test', framework: 'react', language: 'typescript' },
    });

    const imported = await request(app)
      .post('/api/v1/projects/from-generation')
      .set(authorization)
      .send({ generationId: `restore-generation-${userId}`, name: 'Workspace restore' });
    const project = imported.body.data.project;
    const file = project.files[0];

    await request(app)
      .put(`/api/v1/projects/${project.id}/files/${file.id}`)
      .set(authorization)
      .send({ content: 'export default 2;' })
      .expect(200);
    let history = await request(app).get(`/api/v1/projects/${project.id}/history`).set(authorization).expect(200);
    const contentRevision = history.body.data.revisions[0];
    await request(app)
      .post(`/api/v1/projects/${project.id}/history/${contentRevision.id}/restore`)
      .set('Authorization', `Bearer ${foreign}`)
      .expect(403);
    let restored = await request(app)
      .post(`/api/v1/projects/${project.id}/history/${contentRevision.id}/restore`)
      .set(authorization)
      .expect(200);
    expect(restored.body.data.file).toMatchObject({ id: file.id, content: 'export default 1;' });

    const renamed = await request(app)
      .patch(`/api/v1/projects/${project.id}/files/${file.id}`)
      .set(authorization)
      .send({ name: 'Workspace.tsx' })
      .expect(200);
    expect(renamed.body.data.file.path).toBe('frontend/src/Workspace.tsx');
    history = await request(app).get(`/api/v1/projects/${project.id}/history`).set(authorization).expect(200);
    const renameRevision = history.body.data.revisions.find((revision: any) => revision.type === 'rename');
    restored = await request(app)
      .post(`/api/v1/projects/${project.id}/history/${renameRevision.id}/restore`)
      .set(authorization)
      .expect(200);
    expect(restored.body.data.file).toMatchObject({ name: 'App.tsx', path: 'frontend/src/App.tsx' });

    await request(app)
      .delete(`/api/v1/projects/${project.id}/files/${file.id}`)
      .set(authorization)
      .expect(204);
    history = await request(app).get(`/api/v1/projects/${project.id}/history`).set(authorization).expect(200);
    const deleteRevision = history.body.data.revisions.find((revision: any) => revision.type === 'delete');
    restored = await request(app)
      .post(`/api/v1/projects/${project.id}/history/${deleteRevision.id}/restore`)
      .set(authorization)
      .expect(200);
    expect(restored.body.data.file).toMatchObject({ id: file.id, path: 'frontend/src/App.tsx', content: 'export default 1;' });
    await request(app)
      .post(`/api/v1/projects/${project.id}/history/${deleteRevision.id}/restore`)
      .set(authorization)
      .expect(409);

    const duplicated = await request(app)
      .post(`/api/v1/projects/${project.id}/files/${file.id}/duplicate`)
      .set(authorization)
      .expect(201);
    history = await request(app).get(`/api/v1/projects/${project.id}/history`).set(authorization).expect(200);
    const duplicateRevision = history.body.data.revisions.find((revision: any) => revision.type === 'duplicate');
    restored = await request(app)
      .post(`/api/v1/projects/${project.id}/history/${duplicateRevision.id}/restore`)
      .set(authorization)
      .expect(200);
    expect(restored.body.data.removedFileId).toBe(duplicated.body.data.file.id);
    expect(restored.body.data.project.files).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: duplicated.body.data.file.id }),
    ]));

    const restoreRevision = restored.body.data.revision;
    expect(restoreRevision).toMatchObject({ type: 'restore', sourceRevisionId: duplicateRevision.id });
    await request(app)
      .post(`/api/v1/projects/${project.id}/history/${restoreRevision.id}/restore`)
      .set(authorization)
      .expect(409);
  });
});
