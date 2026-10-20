import express from 'express';
import request from 'supertest';
import { authRoutes } from '../../src/routes/auth.routes';
import { errorHandlerMiddleware } from '../../src/middleware/error-handler.middleware';
import { userStore } from '../../src/system/user-store';

describe('Authentication routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes);
  app.use(errorHandlerMiddleware.handle);

  beforeEach(() => userStore.clear());

  it('supports account, identity, profile and password journeys', async () => {
    const registered = await request(app).post('/api/v1/auth/register').send({
      name: 'ORUS User',
      email: 'route@orus.dev',
      password: 'Orus#2026Seguro',
      acceptTerms: true,
    });
    expect(registered.status).toBe(201);
    const token = registered.body.data.token;

    const identity = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(identity.status).toBe(200);
    expect(identity.body.data.user.email).toBe('route@orus.dev');

    const profile = await request(app).patch('/api/v1/auth/profile').set('Authorization', `Bearer ${token}`).send({
      name: 'ORUS User Updated',
      bio: 'Workspace owner',
    });
    expect(profile.status).toBe(200);
    expect(profile.body.data.user.bio).toBe('Workspace owner');

    const changed = await request(app).post('/api/v1/auth/change-password').set('Authorization', `Bearer ${token}`).send({
      currentPassword: 'Orus#2026Seguro',
      newPassword: 'Novo#Orus2026',
    });
    expect(changed.status).toBe(200);

    const loggedIn = await request(app).post('/api/v1/auth/login').send({
      email: 'route@orus.dev',
      password: 'Novo#Orus2026',
    });
    expect(loggedIn.status).toBe(200);
  });
});
