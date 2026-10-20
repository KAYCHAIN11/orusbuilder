import express from 'express';
import request from 'supertest';
import { generationRoutes } from '../../src/routes/generation.routes';
import { generationJobStore } from '../../src/generation/generation-job-store';
import { authenticationMiddleware } from '../../src/middleware/authentication.middleware';
import { errorHandlerMiddleware } from '../../src/middleware/error-handler.middleware';

describe('Generation workspace compatibility route', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/generation', generationRoutes);
  app.use(errorHandlerMiddleware.handle);

  beforeEach(() => generationJobStore.clear());

  it('persists a certified generation through the canonical project workspace flow', async () => {
    const userId = `generation-save-${Date.now()}`;
    const token = authenticationMiddleware.generateToken({
      userId,
      email: 'save@orus.dev',
      username: 'save',
      role: 'user',
    });
    generationJobStore.update('generation-save-ready', {
      userId,
      status: 'ready',
      success: true,
      files: [{ name: 'App.tsx', path: 'frontend/src/App.tsx', content: 'export default 1;' }],
      request: { prompt: 'Workspace compatibility route', framework: 'react', language: 'typescript' },
    });

    const response = await request(app)
      .post('/api/v1/generation/save')
      .set('Authorization', `Bearer ${token}`)
      .send({ generationId: 'generation-save-ready', name: 'Saved workspace' });

    expect(response.status).toBe(201);
    expect(response.body.data.project).toMatchObject({
      userId,
      generationId: 'generation-save-ready',
      name: 'Saved workspace',
      status: 'ready',
    });
    expect(response.body.data.project.files).toEqual([
      expect.objectContaining({ path: 'frontend/src/App.tsx', content: 'export default 1;' }),
    ]);
  });
});
