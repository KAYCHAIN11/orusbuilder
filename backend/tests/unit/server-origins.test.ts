import { resolveAllowedOrigins, shouldEnableInternalTestRoutes } from '../../src/server';

describe('server origin allowlist', () => {
  it('normalizes configured production origins without development fallbacks', () => {
    expect(resolveAllowedOrigins({
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://builder.example.com/',
      CORS_ORIGIN: 'https://app.example.com, https://admin.example.com/',
    })).toEqual([
      'https://builder.example.com',
      'https://app.example.com',
      'https://admin.example.com',
    ]);
  });

  it('keeps local Builder origins available outside production', () => {
    const origins = resolveAllowedOrigins({ NODE_ENV: 'development' });
    expect(origins).toContain('http://localhost:3000');
    expect(origins).toContain('http://127.0.0.1:5173');
  });
});

describe('server internal test routes', () => {
  it('requires an explicit opt-in outside production', () => {
    expect(shouldEnableInternalTestRoutes({ NODE_ENV: 'development' })).toBe(false);
    expect(shouldEnableInternalTestRoutes({ NODE_ENV: 'development', ORUS_ENABLE_TEST_ROUTES: 'true' })).toBe(true);
  });

  it('cannot be enabled in production', () => {
    expect(shouldEnableInternalTestRoutes({ NODE_ENV: 'production', ORUS_ENABLE_TEST_ROUTES: 'true' })).toBe(false);
  });
});
