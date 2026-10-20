const keys = [
  'NODE_ENV', 'JWT_SECRET', 'SESSION_SECRET', 'ENCRYPTION_KEY',
  'MONGODB_URI', 'FRONTEND_URL', 'CORS_ORIGIN', 'CLAUDE_API_KEY',
  'TRINITY_ENABLED', 'TRINITY_API_KEY', 'ORUS_EXECUTION_ISOLATION',
] as const;

describe('production configuration', () => {
  const original = Object.fromEntries(keys.map(key => [key, process.env[key]]));

  afterEach(() => {
    for (const key of keys) {
      const value = original[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    jest.resetModules();
  });

  it('accepts secure production configuration without requiring one specific AI provider', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'jwt-secret-with-at-least-32-characters';
    process.env['SESSION_SECRET'] = 'session-secret-with-at-least-32-characters';
    process.env['ENCRYPTION_KEY'] = 'encryption-key-with-at-least-32-chars';
    process.env['MONGODB_URI'] = 'mongodb://database/orus';
    process.env['FRONTEND_URL'] = 'https://builder.example.test';
    process.env['ORUS_EXECUTION_ISOLATION'] = 'container-required';
    delete process.env['CLAUDE_API_KEY'];

    jest.resetModules();
    await expect(import('../../src/system/config-manager')).resolves.toBeDefined();
  });

  it('fails closed when production secrets and infrastructure are missing', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'short';
    process.env['SESSION_SECRET'] = 'short';
    process.env['ENCRYPTION_KEY'] = 'short';
    process.env['MONGODB_URI'] = '';
    process.env['FRONTEND_URL'] = '';
    process.env['CORS_ORIGIN'] = '';
    process.env['ORUS_EXECUTION_ISOLATION'] = 'process';

    jest.resetModules();
    await expect(import('../../src/system/config-manager')).rejects.toThrow(/JWT_SECRET[\s\S]*MONGODB_URI[\s\S]*ORUS_EXECUTION_ISOLATION/);
  });

  it('rejects non-HTTPS public origins in production', async () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'jwt-secret-with-at-least-32-characters';
    process.env['SESSION_SECRET'] = 'session-secret-with-at-least-32-characters';
    process.env['ENCRYPTION_KEY'] = 'encryption-key-with-at-least-32-chars';
    process.env['MONGODB_URI'] = 'mongodb://database/orus';
    process.env['FRONTEND_URL'] = 'http://builder.example.test';
    process.env['ORUS_EXECUTION_ISOLATION'] = 'container-required';

    jest.resetModules();
    await expect(import('../../src/system/config-manager')).rejects.toThrow('must use HTTPS');
  });
});
