import { spawn, spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCli = process.env.npm_execpath;
const npmCommand = npmCli ? process.execPath : 'npm';
const commands = [
  ['backend', ['run', 'dev:backend']],
  ['frontend', ['run', 'dev:frontend']],
];
const children = new Map();
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children.values()) {
    if (child.killed || !child.pid) continue;
    if (isWindows) {
      spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' });
    } else {
      child.kill('SIGTERM');
    }
  }
  setTimeout(() => process.exit(exitCode), 500).unref();
}

for (const [name, args] of commands) {
  const commandArgs = npmCli ? [npmCli, ...args] : args;
  const child = spawn(npmCommand, commandArgs, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });
  children.set(name, child);
  child.on('error', error => {
    console.error(`[${name}] ${error.message}`);
    stop(1);
  });
  child.on('exit', code => {
    if (!stopping) {
      console.error(`[${name}] encerrado com código ${code ?? 1}`);
      stop(code ?? 1);
    }
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
