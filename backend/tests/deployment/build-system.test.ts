import { buildSystem } from '../../src/deployment/build-system';
import { containerBuilder } from '../../src/deployment/container-builder';
import { CommandExecutionError, testAutomation } from '../../src/testing/test-automation';

function manifest(buildScript: string): string {
  return JSON.stringify({
    name: 'orus-validation-fixture',
    version: '1.0.0',
    private: true,
    scripts: {
      test: 'node -e "process.exit(0)"',
      build: buildScript,
    },
  });
}

describe('BuildSystem generated project validation', () => {
  afterAll(async () => {
    await buildSystem.stop();
  }, 30000);

  it('blocks delivery when the prepared preview references a missing asset', async () => {
    const previewSpy = jest.spyOn(buildSystem, 'createPreviewBundle').mockResolvedValueOnce({
      entry: 'index.html',
      files: [{ path: 'index.html', content: Buffer.from('<div id="root"></div><script src="assets/missing.js"></script>') }],
    });

    const result = await buildSystem.validateGeneratedPreview('preview-gate', 'PreviewGate', []);

    expect(result).toMatchObject({ success: false, projectId: 'preview-gate', assetCount: 1 });
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ stage: 'runtime', category: 'runtime', affectedFiles: ['assets/missing.js'] }),
    ]);
    previewSpy.mockRestore();
  });

  it('propagates cancellation to build commands without certifying the result', async () => {
    const controller = new AbortController();
    const runCommand = testAutomation.runCommand.bind(testAutomation);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const command = jest.spyOn(testAutomation, 'runCommand').mockImplementation(request => {
      expect(request.signal).toBe(controller.signal);
      timer = setTimeout(() => controller.abort(), 500);
      return runCommand(request);
    });
    try {
      await expect(buildSystem.validateGeneratedProject(
        'build-cancelled', 'BuildCancelled',
        [{ path: 'package.json', content: manifest('node -e "setInterval(()=>{},1000)"') }],
        { installDependencies: false, runTests: false, validateDatabase: false, commandTimeout: 30000, signal: controller.signal }
      )).rejects.toMatchObject({ name: 'AbortError' });
      expect(command).toHaveBeenCalledTimes(1);
    } finally {
      if (timer) clearTimeout(timer);
      command.mockRestore();
    }
  }, 30000);

  it('installs, tests and builds a materialized project', async () => {
    const result = await buildSystem.validateGeneratedProject(
      'build-success',
      'BuildSuccess',
      [{
        path: 'package.json',
        content: manifest('node -e "require(\'fs\').mkdirSync(\'dist\',{recursive:true});require(\'fs\').writeFileSync(\'dist/index.js\',\'ok\')"'),
      }],
      { commandTimeout: 60000 }
    );

    expect(result.success).toBe(true);
    expect(result.build?.bundleSize).toBeGreaterThan(0);
    expect(result.commands.map(command => command.args.join(' '))).toEqual(expect.arrayContaining([
      expect.stringContaining('install'),
      expect.stringContaining('audit --omit=dev --audit-level=moderate --json'),
      expect.stringContaining('run test'),
      expect.stringContaining('run build'),
    ]));
    expect(result.commands.find(command => command.args.includes('install'))?.args).toContain('--ignore-scripts');
    expect(result.reproducibility).toEqual(expect.objectContaining({
      lockfilePath: 'package-lock.json',
      lockfileSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
      auditLevel: 'moderate'
    }));
    expect(result.internalFiles?.[0]).toEqual(expect.objectContaining({ path: 'package-lock.json' }));
  }, 120000);

  it('fails closed when required container isolation is unavailable', async () => {
    const availability = jest.spyOn(containerBuilder, 'isDockerAvailable').mockResolvedValue(false);
    const command = jest.spyOn(testAutomation, 'runCommand');
    try {
      const result = await buildSystem.validateGeneratedProject(
        'container-unavailable',
        'Container unavailable',
        [{ path: 'package.json', content: manifest('node build.js') }],
        { executionIsolation: 'container-required', installDependencies: false, runTests: false, validateDatabase: false }
      );
      expect(result.success).toBe(false);
      expect(result.diagnostics[0]).toMatchObject({
        stage: 'security',
        category: 'environment',
        message: expect.stringContaining('Docker runtime is unavailable')
      });
      expect(command).not.toHaveBeenCalled();
    } finally {
      availability.mockRestore();
      command.mockRestore();
    }
  });

  it('routes certification commands through the required container adapter', async () => {
    const availability = jest.spyOn(containerBuilder, 'isDockerAvailable').mockResolvedValue(true);
    const isolated = jest.spyOn(containerBuilder, 'runIsolatedCommand').mockImplementation(request => {
      const npmCli = process.env['npm_execpath'];
      return testAutomation.runCommand({
        command: npmCli ? process.execPath : process.platform === 'win32' ? process.env['ComSpec'] || 'cmd.exe' : 'npm',
        args: npmCli ? [npmCli, ...request.npmArgs] : process.platform === 'win32' ? ['/d', '/s', '/c', `npm ${request.npmArgs.join(' ')}`] : request.npmArgs,
        cwd: request.projectRoot,
        env: request.env,
        timeout: request.timeout,
        maxOutputBytes: request.maxOutputBytes,
        signal: request.signal
      });
    });
    try {
      const result = await buildSystem.validateGeneratedProject(
        'container-routed',
        'Container routed',
        [{
          path: 'package.json',
          content: manifest('node -e "require(\'fs\').mkdirSync(\'dist\',{recursive:true});require(\'fs\').writeFileSync(\'dist/index.js\',\'ok\')"'),
        }],
        {
          executionIsolation: 'container-required',
          installDependencies: false,
          runTests: true,
          validateDatabase: false,
          commandTimeout: 60000
        }
      );
      expect(result).toMatchObject({ success: true, diagnostics: [] });
      expect(isolated).toHaveBeenCalledTimes(2);
      expect(isolated).toHaveBeenNthCalledWith(1, expect.objectContaining({ npmArgs: ['run', 'test'], network: 'none' }));
      expect(isolated).toHaveBeenNthCalledWith(2, expect.objectContaining({ npmArgs: ['run', 'build'], network: 'none' }));
    } finally {
      availability.mockRestore();
      isolated.mockRestore();
    }
  }, 30000);

  it('routes production readiness through the required container adapter', async () => {
    const availability = jest.spyOn(containerBuilder, 'isDockerAvailable').mockResolvedValue(true);
    const isolated = jest.spyOn(containerBuilder, 'runIsolatedCommand').mockImplementation(request => {
      const npmCli = process.env['npm_execpath'];
      return testAutomation.runCommand({
        command: npmCli ? process.execPath : process.platform === 'win32' ? process.env['ComSpec'] || 'cmd.exe' : 'npm',
        args: npmCli ? [npmCli, ...request.npmArgs] : process.platform === 'win32' ? ['/d', '/s', '/c', `npm ${request.npmArgs.join(' ')}`] : request.npmArgs,
        cwd: request.projectRoot,
        env: request.env,
        timeout: request.timeout,
        maxOutputBytes: request.maxOutputBytes,
        signal: request.signal
      });
    });
    const runtime = jest.spyOn(containerBuilder, 'validateIsolatedRuntime').mockResolvedValue([]);
    try {
      const result = await buildSystem.validateGeneratedProject('container-runtime', 'Container runtime', [
        { path: 'package.json', content: JSON.stringify({ name: 'container-runtime', private: true, workspaces: ['backend'], scripts: { build: 'npm run build --workspace=backend' } }) },
        { path: 'backend/package.json', content: JSON.stringify({ name: 'container-runtime-backend', private: true, scripts: { build: 'node build.cjs', start: 'node dist/server.js' } }) },
        { path: 'backend/build.cjs', content: "const fs=require('fs');fs.mkdirSync('dist',{recursive:true});fs.writeFileSync('dist/server.js','ok');" },
        { path: 'backend/src/server.js', content: 'source' },
      ], {
        executionIsolation: 'container-required',
        installDependencies: false,
        runTests: false,
        validateDatabase: false,
        commandTimeout: 60000
      });
      expect(result).toMatchObject({ success: true, runtime: { passed: true, mode: 'production', healthPath: '/health' } });
      expect(isolated).toHaveBeenCalledTimes(1);
      expect(runtime).toHaveBeenCalledWith(expect.objectContaining({
        workDir: 'backend',
        npmArgs: ['run', 'start'],
        port: 4174,
        env: expect.objectContaining({ NODE_ENV: 'production', PORT: '4174' })
      }));
    } finally {
      availability.mockRestore();
      isolated.mockRestore();
      runtime.mockRestore();
    }
  }, 30000);

  it('blocks certification when the dependency advisory gate fails', async () => {
    const runCommand = testAutomation.runCommand.bind(testAutomation);
    const command = jest.spyOn(testAutomation, 'runCommand').mockImplementation(request => {
      if (request.args.includes('audit')) {
        return Promise.reject(new CommandExecutionError({
          command: request.command,
          args: request.args,
          cwd: request.cwd,
          exitCode: 1,
          stdout: JSON.stringify({ metadata: { vulnerabilities: { moderate: 1 } } }),
          stderr: '',
          duration: 1
        }));
      }
      return runCommand(request);
    });
    try {
      const result = await buildSystem.validateGeneratedProject(
        'audit-failure',
        'Audit failure',
        [{ path: 'package.json', content: manifest('node build.js') }],
        { runTests: false, validateDatabase: false, commandTimeout: 60000 }
      );

      expect(result.success).toBe(false);
      expect(result.diagnostics[0]).toEqual(expect.objectContaining({
        stage: 'security',
        category: 'dependency'
      }));
    } finally {
      command.mockRestore();
    }
  }, 120000);

  it.each([
    ['file count', [
      { path: 'package.json', content: manifest('node build.js') },
      { path: 'build.js', content: '' },
    ], { maxGeneratedFiles: 1 }, 'file count'],
    ['source size', [
      { path: 'package.json', content: manifest('node build.js') },
      { path: 'build.js', content: 'x'.repeat(128) },
    ], { maxSourceBytes: 64 }, 'source'],
    ['file size', [
      { path: 'package.json', content: manifest('node build.js') },
      { path: 'build.js', content: 'x'.repeat(128) },
    ], { maxFileBytes: 64 }, 'file'],
  ])('rejects generated input beyond the configured %s limit', async (_name, files, limits, expected) => {
    const command = jest.spyOn(testAutomation, 'runCommand');
    try {
      const result = await buildSystem.validateGeneratedProject(
        `resource-${_name}`,
        'Resource fixture',
        files,
        { ...limits, installDependencies: false, runTests: false, validateDatabase: false }
      );
      expect(result.success).toBe(false);
      expect(result.diagnostics[0]).toEqual(expect.objectContaining({
        stage: 'filesystem',
        category: 'resource',
        message: expect.stringContaining(expected)
      }));
      expect(command).not.toHaveBeenCalled();
    } finally {
      command.mockRestore();
    }
  });

  it('rejects a workspace that grows beyond the configured execution limit', async () => {
    const result = await buildSystem.validateGeneratedProject(
      'resource-workspace',
      'Resource workspace',
      [{
        path: 'package.json',
        content: manifest('node -e "require(\'fs\').mkdirSync(\'dist\',{recursive:true});require(\'fs\').writeFileSync(\'dist/index.js\',\'x\'.repeat(512))"'),
      }],
      {
        installDependencies: false,
        runTests: false,
        validateDatabase: false,
        maxWorkspaceBytes: 256
      }
    );

    expect(result.success).toBe(false);
    expect(result.diagnostics[0]).toEqual(expect.objectContaining({
      stage: 'filesystem',
      category: 'resource',
      message: expect.stringContaining('workspace size')
    }));
  });

  it('returns structured build diagnostics', async () => {
    const result = await buildSystem.validateGeneratedProject(
      'build-failure',
      'BuildFailure',
      [{ path: 'package.json', content: manifest('node -e "process.exit(2)"') }],
      { commandTimeout: 60000 }
    );

    expect(result.success).toBe(false);
    expect(result.diagnostics).toEqual([
      expect.objectContaining({ stage: 'build', category: 'build' }),
    ]);
  }, 120000);

  it('blocks destructive schema evolution before Prisma changes data', async () => {
    const previous = `datasource db { provider = "sqlite" url = env("DATABASE_URL") }
model Patient {
  id String @id @default(uuid())
  name String
}`;
    const current = `datasource db { provider = "sqlite" url = env("DATABASE_URL") }
model Patient {
  id String @id @default(uuid())
}`;
    const command = jest.spyOn(testAutomation, 'runCommand');
    try {
      const result = await buildSystem.validateGeneratedProject('schema-removal', 'Schema removal', [
        { path: 'package.json', content: manifest('node -e "process.exit(0)"') },
        { path: '.orus/schema-baseline.prisma', content: previous },
        { path: 'backend/prisma/schema.prisma', content: current },
        { path: 'backend/prisma/migrations/001_init/migration.sql', content: 'CREATE TABLE Patient (id TEXT PRIMARY KEY, name TEXT NOT NULL);' },
      ], { installDependencies: false, runTests: false, validateDatabase: true });
      expect(result.success).toBe(false);
      expect(result.diagnostics[0]).toMatchObject({ stage: 'database', category: 'schema' });
      expect(result.diagnostics[0]?.message).toContain('Patient.name');
      expect(command).not.toHaveBeenCalled();
    } finally {
      command.mockRestore();
    }
  });

  it.each(['healthy', 'crash', 'unhealthy'])('validates production startup after build: %s', async state => {
    const serverCode = state === 'crash'
      ? 'throw new Error("intentional startup failure");'
      : `const http = require('http'); http.createServer((req, res) => {
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({status: process.env.NODE_ENV === 'production' && '${state}' === 'healthy' ? 'healthy' : 'failed'}));
        }).listen(Number(process.env.PORT), '127.0.0.1');`;
    const nativeFetch = global.fetch;
    const probe = jest.spyOn(global, 'fetch').mockImplementation(nativeFetch);
    try {
      const result = await buildSystem.validateGeneratedProject(`runtime-${state}`, 'Runtime validation', [
        { path: 'package.json', content: JSON.stringify({ name: `runtime-${state}`, private: true, workspaces: ['backend'], scripts: { build: 'npm run build --workspace=backend' } }) },
        { path: 'backend/package.json', content: JSON.stringify({ name: `runtime-${state}-backend`, scripts: { build: 'node build.cjs', start: 'node dist/server.js' } }) },
        { path: 'backend/build.cjs', content: "const fs=require('fs');fs.mkdirSync('dist',{recursive:true});fs.copyFileSync('src/server.js','dist/server.js');" },
        { path: 'backend/src/server.js', content: serverCode },
      ], { installDependencies: false, runTests: false, validateDatabase: false, runtimeTimeout: state === 'healthy' ? 10000 : 2000 });
      expect(result.success).toBe(state === 'healthy');
      expect(result.commands.some(command => command.args.includes('build') && command.exitCode === 0)).toBe(true);
      if (state === 'healthy') {
        expect(result.runtime).toEqual({ passed: true, mode: 'production', healthPath: '/health' });
      } else {
        expect(result.diagnostics[0]).toMatchObject({ stage: 'runtime', category: 'runtime' });
      }
      const address = probe.mock.calls[0]?.[0];
      expect(address).toBeDefined();
      await expect(nativeFetch(address!, { signal: AbortSignal.timeout(1500) })).rejects.toThrow();
    } finally {
      probe.mockRestore();
    }
  }, 30000);

  it('cancels a pending backend readiness probe and stops its server', async () => {
    const controller = new AbortController();
    const nativeFetch = global.fetch;
    const probe = jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
      controller.abort();
      return nativeFetch(input, init);
    });
    try {
      await expect(buildSystem.validateGeneratedProject('runtime-cancel', 'Runtime cancellation', [
        { path: 'package.json', content: JSON.stringify({ name: 'runtime-cancel', scripts: { build: 'node build.cjs', start: 'node dist/server.js' } }) },
        { path: 'build.cjs', content: "const fs=require('fs');fs.mkdirSync('dist',{recursive:true});fs.copyFileSync('src/server.js','dist/server.js');" },
        { path: 'src/server.js', content: "require('http').createServer(()=>{}).listen(Number(process.env.PORT),'127.0.0.1');" },
      ], { installDependencies: false, runTests: false, validateDatabase: false, signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
      const address = probe.mock.calls[0]?.[0];
      expect(address).toBeDefined();
      await expect(nativeFetch(address!, { signal: AbortSignal.timeout(1500) })).rejects.toThrow();
    } finally {
      probe.mockRestore();
    }
  }, 30000);

  it('rejects invalid workspace package metadata before npm execution', async () => {
    const command = jest.spyOn(testAutomation, 'runCommand');
    try {
      const result = await buildSystem.validateGeneratedProject(
        'invalid-manifest',
        'InvalidManifest',
        [
          {
            path: 'package.json',
            content: JSON.stringify({ name: 'valid-root', workspaces: ['frontend'], scripts: { build: 'npm run build --workspace=frontend' } }),
          },
          {
            path: 'frontend/package.json',
            content: JSON.stringify({ name: 'project - frontend', dependencies: { '@prisma / client': '^6.0.0' }, scripts: { build: 'vite build' } }),
          },
        ],
        { installDependencies: false, runTests: false, validateDatabase: false }
      );

      expect(result.success).toBe(false);
      expect(result.diagnostics[0]).toEqual(expect.objectContaining({ message: expect.stringContaining('Invalid npm package name') }));
      expect(command).not.toHaveBeenCalled();
    } finally {
      command.mockRestore();
    }
  });

  it.each([
    ['lifecycle script', [{ path: 'package.json', content: JSON.stringify({ name: 'unsafe-script', scripts: { postinstall: 'node exploit.js', build: 'node build.js' } }) }], 'lifecycle script'],
    ['remote dependency', [{ path: 'package.json', content: JSON.stringify({ name: 'unsafe-dependency', dependencies: { unsafe: 'git+https://example.test/repo.git' }, scripts: { build: 'node build.js' } }) }], 'Unsafe npm dependency'],
    ['workspace traversal', [{ path: 'package.json', content: JSON.stringify({ name: 'unsafe-workspace', workspaces: ['../outside'], scripts: { build: 'node build.js' } }) }], 'Invalid npm workspace path'],
    ['package manager configuration', [
      { path: 'package.json', content: JSON.stringify({ name: 'unsafe-config', scripts: { build: 'node build.js' } }) },
      { path: '.npmrc', content: 'registry=https://example.test' },
    ], 'package manager configuration'],
  ])('rejects unsafe generated package configuration: %s', async (_name, files, expected) => {
    const command = jest.spyOn(testAutomation, 'runCommand');
    try {
      const result = await buildSystem.validateGeneratedProject(
        `unsafe-${_name}`,
        'Unsafe fixture',
        files,
        { installDependencies: false, runTests: false, validateDatabase: false }
      );
      expect(result.success).toBe(false);
      expect(result.diagnostics[0]?.message).toContain(expected);
      expect(command).not.toHaveBeenCalled();
    } finally {
      command.mockRestore();
    }
  });

  it('starts a generated fullstack preview backend on Windows-compatible npm invocation', async () => {
    const bundle = await buildSystem.createPreviewBundle('preview-runtime', 'PreviewRuntime', [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'preview-runtime',
          private: true,
          workspaces: ['frontend', 'backend'],
          scripts: { build: 'npm run build --workspace=frontend' },
        }),
      },
      {
        path: 'frontend/package.json',
        content: JSON.stringify({
          name: 'preview-runtime-frontend',
          private: true,
          scripts: { build: "node -e \"require('fs').mkdirSync('dist',{recursive:true});require('fs').writeFileSync('dist/index.html','<main>ready</main>')\"" },
        }),
      },
      {
        path: 'backend/package.json',
        content: JSON.stringify({ name: 'preview-runtime-backend', private: true, scripts: { dev: 'node src/server.js' } }),
      },
      {
        path: 'backend/src/server.js',
        content: "const http=require('http');const port=Number(process.env.PORT);http.createServer((req,res)=>{const ok=req.url==='/health'||req.url==='/database';res.writeHead(ok?200:404,{'content-type':'application/json'});res.end(JSON.stringify(req.url==='/database'?{databaseUrl:process.env.DATABASE_URL}:{status:'healthy'}));}).listen(port,'127.0.0.1');",
      },
      {
        path: 'backend/prisma/validation.db',
        content: 'validated',
      },
    ], { installDependencies: false, commandTimeout: 60000 });

    expect(bundle.backendUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
    expect((await fetch(`${bundle.backendUrl}/health`)).status).toBe(200);
    expect(await (await fetch(`${bundle.backendUrl}/database`)).json()).toEqual({
      databaseUrl: expect.stringMatching(/^file:.*backend\/prisma\/validation\.db$/),
    });
    expect(bundle.files.find(file => file.path === 'index.html')?.content.toString()).toContain('ready');
  }, 120000);

  it('opens generated previews in demo mode while preserving delivered auth defaults', async () => {
    const buildScript = "node -e \"const fs=require('fs');fs.mkdirSync('dist',{recursive:true});const source=fs.readFileSync('frontend/src/App.tsx','utf8');const api=fs.readFileSync('frontend/src/utils/api.ts','utf8');fs.writeFileSync('dist/index.html',process.env.VITE_ORUS_PREVIEW_MODE+'|'+process.env.ORUS_PREVIEW_MODE+'|'+source+'|'+api)\"";
    const source = 'import { BrowserRouter, Navigate } from \'react-router-dom\';\nfunction ProtectedRoute({ children }: any) { const isAuthenticated = false; return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />; }';
    const bundle = await buildSystem.createPreviewBundle('preview-demo', 'PreviewDemo', [
      { path: 'package.json', content: manifest(buildScript) },
      { path: 'frontend/src/App.tsx', content: source },
      { path: 'frontend/src/utils/api.ts', content: "const token = localStorage.getItem('token');\nconst api = { baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001', };" },
    ], {
      installDependencies: false,
      runTests: false,
      validateDatabase: false,
      commandTimeout: 60000,
    });

    const output = bundle.files.find(file => file.path === 'index.html')?.content.toString();
    expect(output).toContain('true|true|');
    expect(output).toContain('HashRouter');
    expect(output).toContain("VITE_ORUS_PREVIEW_MODE === 'true' || isAuthenticated");
    expect(output).toContain("VITE_ORUS_PREVIEW_MODE === 'true' ? 'orus-preview-token'");
    expect(output).toContain("baseURL: import.meta.env.VITE_API_URL || ''");
    expect(source).toContain('BrowserRouter');
    expect(source).not.toContain('VITE_ORUS_PREVIEW_MODE');
  }, 120000);
});
