import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const stores = [
  ['generation-jobs.json', 'ORUS_JOB_STORE_PATH'],
  ['projects.json', 'ORUS_PROJECT_STORE_FILE'],
  ['blueprints.json', 'ORUS_BLUEPRINT_STORE_FILE'],
  ['users.json', 'ORUS_USER_STORE_FILE'],
  ['collaboration.json', 'ORUS_COLLABORATION_STORE_FILE'],
  ['learning.json', 'ORUS_LEARNING_STORE_FILE'],
];

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function sourcePath(name, environmentName) {
  return resolve(process.env[environmentName] || join('.orus-data', name));
}

export function backupProductionData(destination) {
  const target = resolve(destination);
  mkdirSync(target, { recursive: true });
  const files = [];
  for (const [name, environmentName] of stores) {
    const source = sourcePath(name, environmentName);
    if (!existsSync(source)) continue;
    const output = join(target, name);
    copyFileSync(source, output);
    files.push({ name, bytes: statSync(output).size, sha256: sha256(output) });
  }
  const manifest = { version: 1, createdAt: new Date().toISOString(), files };
  writeFileSync(join(target, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}

export function restoreProductionData(sourceDirectory) {
  const source = resolve(sourceDirectory);
  const manifestPath = join(source, 'manifest.json');
  if (!existsSync(manifestPath)) throw new Error('Backup manifest not found');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.files)) throw new Error('Unsupported backup manifest');
  const allowed = new Set(stores.map(([name]) => name));
  const restored = [];
  for (const entry of manifest.files) {
    if (!allowed.has(entry.name) || basename(entry.name) !== entry.name) throw new Error('Invalid backup entry');
    const input = join(source, entry.name);
    if (!existsSync(input) || sha256(input) !== entry.sha256) throw new Error(`Backup integrity failed: ${entry.name}`);
    const environmentName = stores.find(([name]) => name === entry.name)[1];
    const output = sourcePath(entry.name, environmentName);
    mkdirSync(dirname(output), { recursive: true });
    if (existsSync(output)) renameSync(output, `${output}.before-restore-${Date.now()}`);
    copyFileSync(input, output);
    restored.push(entry.name);
  }
  return restored;
}

function readArgument(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const mode = process.argv[2];
  const directory = readArgument('--directory');
  if (!directory || !['backup', 'restore'].includes(mode)) {
    process.stderr.write('Usage: node scripts/production-data.mjs <backup|restore> --directory <path>\n');
    process.exitCode = 1;
  } else {
    const result = mode === 'backup' ? backupProductionData(directory) : restoreProductionData(directory);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }
}
