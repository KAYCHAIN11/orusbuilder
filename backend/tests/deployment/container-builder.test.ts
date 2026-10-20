import { containerBuilder } from '../../src/deployment/container-builder';
import { testAutomation } from '../../src/testing/test-automation';

describe('ContainerBuilder execution isolation', () => {
  afterEach(() => jest.restoreAllMocks());

  it('defines a bounded, unprivileged runtime policy', () => {
    expect(containerBuilder.getExecutionPolicy()).toEqual({
      image: expect.stringMatching(/^node:20-/),
      memoryMb: 1024,
      cpus: 1,
      pidsLimit: 256,
      network: 'none',
      readOnlyRoot: true,
      noNewPrivileges: true,
      capabilities: 'none'
    });
  });

  it('executes npm inside a constrained container without a shell', async () => {
    const runCommand = jest.spyOn(testAutomation, 'runCommand').mockResolvedValue({
      command: 'docker',
      args: [],
      cwd: process.cwd(),
      exitCode: 0,
      stdout: '',
      stderr: '',
      duration: 1
    });

    await containerBuilder.runIsolatedCommand({
      projectRoot: process.cwd(),
      npmArgs: ['run', 'build'],
      env: { NODE_ENV: 'test' },
      timeout: 30000,
      maxOutputBytes: 1024,
      network: 'none'
    });

    expect(runCommand).toHaveBeenCalledWith(expect.objectContaining({
      command: 'docker',
      args: expect.arrayContaining([
        'run', '--rm',
        '--network', 'none',
        '--cap-drop', 'ALL',
        '--read-only',
        '--env', 'NPM_CONFIG_CACHE=/tmp/npm-cache',
        '--workdir', '/workspace',
        'npm', 'run', 'build'
      ]),
      timeout: 30000,
      maxOutputBytes: 1024
    }));
  });

  it('reports an unavailable Docker daemon without false success', async () => {
    jest.spyOn(testAutomation, 'runCommand').mockRejectedValue(new Error('daemon unavailable'));
    await expect(containerBuilder.isDockerAvailable()).resolves.toBe(false);
  });

  it('validates backend readiness inside a network-isolated container and removes it', async () => {
    const runCommand = jest.spyOn(testAutomation, 'runCommand').mockImplementation(async request => ({
      command: request.command,
      args: request.args,
      cwd: request.cwd,
      exitCode: 0,
      stdout: request.args[0] === 'run' ? 'container-id' : '',
      stderr: '',
      duration: 1
    }));

    const results = await containerBuilder.validateIsolatedRuntime({
      projectRoot: process.cwd(),
      workDir: 'backend',
      npmArgs: ['run', 'start'],
      env: { PORT: '4174', NODE_ENV: 'production' },
      port: 4174,
      timeout: 10000,
      maxOutputBytes: 4096
    });

    expect(results).toHaveLength(2);
    expect(runCommand).toHaveBeenNthCalledWith(1, expect.objectContaining({
      command: 'docker',
      args: expect.arrayContaining([
        'run', '--detach',
        '--network', 'none',
        '--cap-drop', 'ALL',
        '--read-only',
        '--env', 'NPM_CONFIG_CACHE=/tmp/npm-cache',
        '--workdir', '/workspace/backend',
        'npm', 'run', 'start'
      ])
    }));
    expect(runCommand.mock.calls[0]?.[0].args).not.toContain('--rm');
    expect(runCommand).toHaveBeenNthCalledWith(2, expect.objectContaining({
      args: expect.arrayContaining(['exec', 'node', '-e'])
    }));
    expect(runCommand).toHaveBeenNthCalledWith(3, expect.objectContaining({
      args: expect.arrayContaining(['rm', '--force'])
    }));
  });
});
