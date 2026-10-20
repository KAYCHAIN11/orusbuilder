import express from 'express';
import request from 'supertest';
import { authenticationMiddleware } from '../../src/middleware/authentication.middleware';
import { errorHandlerMiddleware } from '../../src/middleware/error-handler.middleware';
import { generationJobStore } from '../../src/generation/generation-job-store';
import { collaborationRoutes } from '../../src/routes/collaboration.routes';
import { projectRoutes } from '../../src/routes/project.routes';

describe('Collaboration workspace routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/projects', projectRoutes);
  app.use('/api/v1/collaboration', collaborationRoutes);
  app.use(errorHandlerMiddleware.handle);

  it('persists project chat and isolates the session from another user', async () => {
    const suffix = Date.now();
    const userId = `collaboration-owner-${suffix}`;
    const owner = authenticationMiddleware.generateToken({ userId, email: `owner-${suffix}@orus.dev`, username: 'Owner', role: 'user' });
    const foreign = authenticationMiddleware.generateToken({ userId: `${userId}-foreign`, email: `foreign-${suffix}@orus.dev`, username: 'Foreign', role: 'user' });
    const authorization = { Authorization: `Bearer ${owner}` };
    generationJobStore.update(`collaboration-generation-${suffix}`, {
      userId,
      status: 'ready',
      success: true,
      files: [{ name: 'App.tsx', path: 'frontend/src/App.tsx', content: 'export default 1;' }],
      request: { prompt: 'Collaboration test', framework: 'react', language: 'typescript' },
    });
    const imported = await request(app)
      .post('/api/v1/projects/from-generation')
      .set(authorization)
      .send({ generationId: `collaboration-generation-${suffix}`, name: 'Collaboration workspace' })
      .expect(201);
    const projectId = imported.body.data.project.id;
    const created = await request(app)
      .post('/api/v1/collaboration/sessions')
      .set(authorization)
      .send({ projectId })
      .expect(201);
    const sessionId = created.body.data.session.sessionId;

    const sent = await request(app)
      .post(`/api/v1/collaboration/sessions/${sessionId}/chat`)
      .set(authorization)
      .send({ message: 'Decisão arquitetural registrada' })
      .expect(201);
    expect(sent.body.data.message).toMatchObject({ userId, message: 'Decisão arquitetural registrada' });

    const history = await request(app)
      .get(`/api/v1/collaboration/sessions/${sessionId}/chat`)
      .set(authorization)
      .expect(200);
    expect(history.body.data.messages).toEqual([
      expect.objectContaining({ message: 'Decisão arquitetural registrada' }),
    ]);
    const sessions = await request(app)
      .get(`/api/v1/collaboration/sessions?projectId=${projectId}`)
      .set(authorization)
      .expect(200);
    expect(sessions.body.data.sessions).toEqual([expect.objectContaining({ sessionId, projectId })]);

    const comment = await request(app)
      .post(`/api/v1/collaboration/sessions/${sessionId}/comments`)
      .set(authorization)
      .send({ fileId: 'frontend/src/App.tsx', line: 12, content: 'Preservar esta decisão no código' })
      .expect(201);
    const commentId = comment.body.data.comment.commentId;
    await request(app)
      .patch(`/api/v1/collaboration/sessions/${sessionId}/comments/${commentId}`)
      .set(authorization)
      .send({ resolved: true })
      .expect(200);
    const comments = await request(app)
      .get(`/api/v1/collaboration/sessions/${sessionId}/comments?fileId=${encodeURIComponent('frontend/src/App.tsx')}`)
      .set(authorization)
      .expect(200);
    expect(comments.body.data.comments).toEqual([
      expect.objectContaining({ commentId, line: 12, content: 'Preservar esta decisão no código', resolvedBy: userId }),
    ]);
    await request(app)
      .delete(`/api/v1/collaboration/sessions/${sessionId}/comments/${commentId}`)
      .set(authorization)
      .expect(200);

    await request(app)
      .get(`/api/v1/collaboration/sessions/${sessionId}/chat`)
      .set('Authorization', `Bearer ${foreign}`)
      .expect(403);
  });
});
