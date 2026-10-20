import { CommandExecutionError, createExecutionEnvironment, testAutomation } from '../../src/testing/test-automation';

const processTree = "const {spawn}=require('child_process');const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'inherit',windowsHide:true});console.log(child.pid);setInterval(()=>{},1000)";

describe('Command execution lifecycle', () => {
  it('rejects an already cancelled command before spawning', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(testAutomation.runCommand({
      command: 'orus-nonexistent-command', args: [], cwd: process.cwd(), signal: controller.signal,
    })).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('terminates the child process tree when the command times out', async () => {
    const started = Date.now();
    const error = await testAutomation.runCommand({
      command: process.execPath, args: ['-e', processTree], cwd: process.cwd(), timeout: 2000,
    }).catch(reason => reason);
    expect(error).toBeInstanceOf(CommandExecutionError);
    expect(error.result.stderr).toContain('Command timed out');
    expect(error.result.stdout.trim()).toMatch(/^\d+$/);
    expect(Date.now() - started).toBeLessThan(15000);
  }, 20000);

  it('propagates cancellation after stopping an active command tree', async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    try {
      await expect(testAutomation.runCommand({
        command: process.execPath, args: ['-e', processTree], cwd: process.cwd(), timeout: 30000, signal: controller.signal,
      })).rejects.toMatchObject({ name: 'AbortError' });
    } finally {
      clearTimeout(timer);
    }
  }, 20000);

  it('does not expose unrelated host variables and limits captured output', async () => {
    const key = 'ORUS_TEST_HOST_SECRET';
    process.env[key] = 'must-not-leak';
    try {
      expect(createExecutionEnvironment()).not.toHaveProperty(key);
      expect(createExecutionEnvironment({ GENERATED_RUNTIME_VALUE: 'allowed' })).toHaveProperty('GENERATED_RUNTIME_VALUE', 'allowed');
      const error = await testAutomation.runCommand({
        command: process.execPath,
        args: ['-e', "process.stdout.write('x'.repeat(100000))"],
        cwd: process.cwd(),
        timeout: 10000,
        maxOutputBytes: 1024,
      }).catch(reason => reason);
      expect(error).toBeInstanceOf(CommandExecutionError);
      expect(error.result.stderr).toContain('Command output exceeded 1024 bytes');
    } finally {
      delete process.env[key];
    }
  }, 20000);
});
