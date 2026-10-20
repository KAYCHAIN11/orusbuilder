const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
process.env.DATABASE_URL ||= 'file:./dev.db';
const schema = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl.startsWith('file:')) {
  const configured = databaseUrl.slice(5);
  const databaseFile = path.isAbsolute(configured)
    ? configured
    : path.resolve(path.dirname(schema), configured);
  fs.mkdirSync(path.dirname(databaseFile), { recursive: true });
  fs.closeSync(fs.openSync(databaseFile, 'a'));
}

const prismaCli = require.resolve('prisma/build/index.js');
for (const command of ['generate', 'db push']) {
  const args = command.split(' ').concat(['--schema', schema]);
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status || 1);
}