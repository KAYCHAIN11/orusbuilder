import express from 'express';
import request from 'supertest';
import { apiRouter } from '../../src/routes/api.routes';

describe('Public API capabilities', () => {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  it('advertises only connected public endpoints', async () => {
    const response = await request(app).get('/api/info');

    expect(response.status).toBe(200);
    expect(response.body.endpoints.deployment).toBeUndefined();
    expect(response.body.endpoints.marketplace).toBeUndefined();
    expect(response.body.capabilities).toMatchObject({
      deployment: { available: false },
      marketplace: { available: false },
      passwordRecovery: { available: false },
      sso: { available: false },
      twoFactorAuthentication: { available: false },
    });
  });

  it('does not expose simulated deployment or commerce operations', async () => {
    expect((await request(app).post('/api/v1/deployment/deploy').send({})).status).toBe(404);
    expect((await request(app).get('/api/v1/marketplace/search')).status).toBe(404);
  });
});
