import express from 'express';
import request from 'supertest';
import { GenerationController } from '../../src/controllers/generation.controller';
import { authenticationMiddleware } from '../../src/middleware/authentication.middleware';
import { generationRoutes } from '../../src/routes/generation.routes';
import { hashGenerationAccessToken } from '../../src/middleware/generation-access.middleware';
import { errorHandlerMiddleware } from '../../src/middleware/error-handler.middleware';

describe('Generation route access', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/generation', generationRoutes);
  app.use(errorHandlerMiddleware.handle);

  beforeEach(() => {
    (GenerationController as any).generationStore.clear();
  });

  it('validates prompts through the canonical generation router', async () => {
    const empty = await request(app).post('/api/generation/validate-prompt').send({ prompt: '   ' });
    expect(empty.status).toBe(200);
    expect(empty.body).toMatchObject({ valid: false, quality: 0 });

    const detailed = await request(app).post('/api/generation/validate-prompt').send({
      prompt: 'Crie uma agenda para pacientes com autenticação, relatórios e visual editorial premium.',
    });
    expect(detailed.status).toBe(200);
    expect(detailed.body.valid).toBe(true);
    expect(detailed.body.quality).toBeGreaterThanOrEqual(70);
  });

  it('rejects unsupported generation targets before creating a job', async () => {
    const response = await request(app).post('/api/generation').send({
      prompt: 'Crie um sistema completo de operações.',
      framework: 'django',
      language: 'python',
    });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('UNSUPPORTED_GENERATION_LANGUAGE');
    expect((GenerationController as any).generationStore.count()).toBe(0);
  });

  it('requires authentication for history without requiring a project id', async () => {
    expect((await request(app).get('/api/generation/history')).status).toBe(401);
    const token = authenticationMiddleware.generateToken({
      userId: 'owner-1', email: 'owner@orus.local', username: 'owner', role: 'member',
    });
    (GenerationController as any).generationStore.update('owned-job', {
      userId: 'owner-1', status: 'ready', progress: 100, success: true, files: [],
    });
    const response = await request(app)
      .get('/api/generation/history')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.history).toEqual([
      expect.objectContaining({ generationId: 'owned-job', status: 'ready' }),
    ]);
  });

  it('does not expose legacy or foreign jobs in an authenticated history', async () => {
    const token = authenticationMiddleware.generateToken({
      userId: 'owner-1', email: 'owner@orus.local', username: 'owner', role: 'member',
    });
    (GenerationController as any).generationStore.update('foreign-job', {
      userId: 'owner-2', status: 'ready', progress: 100, files: [],
    });
    (GenerationController as any).generationStore.update('legacy-job', {
      status: 'ready', progress: 100, files: [],
    });
    const response = await request(app)
      .get('/api/generation/history')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.history).toEqual([]);
  });

  it('protects anonymous jobs with an opaque access token', async () => {
    (GenerationController as any).generationStore.update('anonymous-job', {
      userId: 'anonymous', accessTokenHash: hashGenerationAccessToken('secret-token'),
      status: 'generating', progress: 42, files: [],
    });
    expect((await request(app).get('/api/generation/anonymous-job/status')).status).toBe(403);
    expect((await request(app).get('/api/generation/anonymous-job/status').set('x-orus-job-token', 'wrong')).status).toBe(403);
    const response = await request(app).get('/api/generation/anonymous-job/status').set('x-orus-job-token', 'secret-token');
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ generationId: 'anonymous-job', progress: 42 });
    const browserResponse = await request(app).get('/api/generation/anonymous-job/status?access_token=secret-token');
    expect(browserResponse.status).toBe(200);
    expect(browserResponse.headers['set-cookie']?.[0]).toContain('orus_job_anonymous-job=secret-token');
    expect(browserResponse.headers['set-cookie']?.[0]).toContain('HttpOnly');
    const previewResponse = await request(app).get('/api/generation/anonymous-job/preview?access_token=secret-token');
    expect(previewResponse.status).toBe(303);
    expect(previewResponse.headers['location']).toBe('/api/generation/anonymous-job/preview');
  });

  it('allows the authenticated owner without exposing the job to another user', async () => {
    (GenerationController as any).generationStore.update('owned-job', {
      userId: 'owner-1', status: 'generating', progress: 18, files: [],
    });
    const owner = authenticationMiddleware.generateToken({
      userId: 'owner-1', email: 'owner@orus.local', username: 'owner', role: 'member',
    });
    const foreign = authenticationMiddleware.generateToken({
      userId: 'owner-2', email: 'foreign@orus.local', username: 'foreign', role: 'member',
    });
    expect((await request(app).get('/api/generation/owned-job/status').set('Authorization', `Bearer ${foreign}`)).status).toBe(403);
    expect((await request(app).get('/api/generation/owned-job/status').set('Authorization', `Bearer ${owner}`)).status).toBe(200);
  });

  it('expires public access and allows an opaque token to be revoked', async () => {
    (GenerationController as any).generationStore.update('expired-job', {
      userId: 'anonymous',
      accessTokenHash: hashGenerationAccessToken('expired-token'),
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      status: 'ready',
      progress: 100,
      files: [],
    });
    expect((await request(app)
      .get('/api/generation/expired-job/status')
      .set('x-orus-job-token', 'expired-token')).status).toBe(410);

    (GenerationController as any).generationStore.update('revocable-job', {
      userId: 'anonymous',
      accessTokenHash: hashGenerationAccessToken('revocable-token'),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      status: 'ready',
      progress: 100,
      files: [],
    });
    const revoked = await request(app)
      .post('/api/generation/revocable-job/revoke-access')
      .set('x-orus-job-token', 'revocable-token');
    expect(revoked.status).toBe(200);
    expect((await request(app)
      .get('/api/generation/revocable-job/status')
      .set('x-orus-job-token', 'revocable-token')).status).toBe(403);
  });
});
