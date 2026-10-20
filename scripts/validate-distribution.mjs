import { readFile, access, readdir, stat } from 'node:fs/promises';
import { join, relative, extname, basename } from 'node:path';

const requiredFiles = [
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'CODE_OF_CONDUCT.md',
  'CHANGELOG.md',
  '.env.example',
  '.env.production.example',
  'compose.yml',
  '.github/workflows/ci.yml',
];

const errors = [];

for (const file of requiredFiles) {
  try {
    await access(file);
  } catch {
    errors.push(`Arquivo obrigatório ausente: ${file}`);
  }
}

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
if (packageJson.license !== 'MIT') errors.push('package.json deve declarar licença MIT');
if (!packageJson.repository?.url) errors.push('package.json deve declarar o repositório');
if (!packageJson.bugs?.url) errors.push('package.json deve declarar o rastreador de issues');

const gitignore = await readFile('.gitignore', 'utf8');
for (const entry of ['node_modules/', '.env', '.orus-data/', 'work/', 'logs/']) {
  if (!gitignore.includes(entry)) errors.push(`.gitignore não cobre ${entry}`);
}

const readme = await readFile('README.md', 'utf8');
for (const match of readme.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
  const rawTarget = match[1].trim().replace(/^<|>$/g, '');
  if (!rawTarget || rawTarget.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(rawTarget)) continue;
  const target = decodeURIComponent(rawTarget.split('#')[0]);
  try {
    await access(target);
  } catch {
    errors.push(`Link local ausente no README: ${target}`);
  }
}

for (const file of ['.env.example', '.env.production.example']) {
  const content = await readFile(file, 'utf8');
  if (/sk-[a-z0-9]{20,}/i.test(content)) errors.push(`${file} contém uma chave com formato real`);
  if (/C:\\Users\\|\/Users\/|\/home\//i.test(content)) errors.push(`${file} contém caminho local absoluto`);
}

const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', 'work', 'logs', 'test-results', 'playwright-report']);
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md', '.txt', '.yml', '.yaml', '.env', '.example', '.toml']);
const secretPatterns = [
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  /\bsk-ant-[A-Za-z0-9_-]{20,}\b/,
  /\bgsk_[A-Za-z0-9]{20,}\b/,
  /\bghp_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bAIza[0-9A-Za-z_-]{30,}\b/,
];

async function scanDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      await scanDirectory(absolutePath);
      continue;
    }
    if (!entry.isFile() || basename(entry.name) === 'package-lock.json' || !textExtensions.has(extname(entry.name))) continue;
    if ((await stat(absolutePath)).size > 1_000_000) continue;
    const content = await readFile(absolutePath, 'utf8');
    if (secretPatterns.some(pattern => pattern.test(content))) {
      errors.push(`Possível segredo detectado: ${relative(process.cwd(), absolutePath)}`);
    }
  }
}

await scanDirectory(process.cwd());

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log('OPEN_SOURCE_DISTRIBUTION_OK');
