import { mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { containerBuilder } from '../../src/deployment/container-builder';

const dockerSuite = process.env['ORUS_TEST_DOCKER'] === 'true' ? describe : describe.skip;

dockerSuite('Docker execution isolation', () => {
  let projectRoot = '';

  beforeAll(async () => {
    expect(await containerBuilder.isDockerAvailable()).toBe(true);
    projectRoot = await mkdtemp(join(tmpdir(), 'orus-container-e2e-'));
    await writeFile(join(projectRoot, 'package.json'), JSON.stringify({
      name: 'orus-container-probe',
      private: true,
      scripts: { start: 'node server.js' },
    }));
    await writeFile(join(projectRoot, 'server.js'), [
      "const http = require('http');",
      "const port = Number(process.env.PORT || 4174);",
      "http.createServer((req, res) => {",
      "  res.setHeader('content-type', 'application/json');",
      "  res.end(JSON.stringify({ status: req.url === '/health' ? 'healthy' : 'ok' }));",
      "}).listen(port, '127.0.0.1');",
    ].join('\n'));
  });

  afterAll(async () => {
    if (projectRoot) await rm(projectRoot, { recursive: true, force: true });
  });

  it('runs commands and health checks in a bounded network-isolated container', async () => {
    const version = await containerBuilder.runIsolatedCommand({
      projectRoot,
      npmArgs: ['--version'],
      timeout: 60_000,
      maxOutputBytes: 16 * 1024,
      network: 'none',
    });
    expect(version.exitCode).toBe(0);
    expect(version.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);

    const runtime = await containerBuilder.validateIsolatedRuntime({
      projectRoot,
      npmArgs: ['run', 'start'],
      env: { NODE_ENV: 'production', PORT: '4174' },
      port: 4174,
      timeout: 60_000,
      maxOutputBytes: 64 * 1024,
    });
    expect(runtime).toHaveLength(2);
    expect(runtime.every(result => result.exitCode === 0)).toBe(true);
  });
});
