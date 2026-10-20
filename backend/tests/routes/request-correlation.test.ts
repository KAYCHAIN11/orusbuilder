import express from 'express';
import request from 'supertest';
import { errorHandlerMiddleware } from '../../src/middleware/error-handler.middleware';
import { loggingMiddleware } from '../../src/middleware/logging.middleware';

describe('HTTP request correlation', () => {
  const app = express();
  app.use(loggingMiddleware.logRequests);
  app.get('/failure', (_req, _res, next) => next(new Error('failure')));
  app.use(errorHandlerMiddleware.handle);

  it('returns the same safe request id in headers and errors', async () => {
    const response = await request(app).get('/failure').set('x-request-id', 'client-request-123');
    expect(response.status).toBe(500);
    expect(response.headers['x-request-id']).toBe('client-request-123');
    expect(response.body.requestId).toBe('client-request-123');
  });

  it('replaces unsafe correlation values', async () => {
    const response = await request(app).get('/failure').set('x-request-id', 'unsafe value');
    expect(response.headers['x-request-id']).toMatch(/^req-[0-9a-f-]{36}$/);
    expect(response.body.requestId).toBe(response.headers['x-request-id']);
  });
});
