import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { backupProductionData, restoreProductionData } from './production-data.mjs';

const root = mkdtempSync(join(tmpdir(), 'orus-data-test-'));
const data = join(root, 'data');
const backup = join(root, 'backup');
process.env.ORUS_JOB_STORE_PATH = join(data, 'generation-jobs.json');
mkdirSync(data, { recursive: true });
writeFileSync(process.env.ORUS_JOB_STORE_PATH, '[{"generationId":"job-1"}]', { encoding: 'utf8', flag: 'w' });
const manifest = backupProductionData(backup);
assert.equal(manifest.files.length, 1);
writeFileSync(process.env.ORUS_JOB_STORE_PATH, '[]', 'utf8');
assert.deepEqual(restoreProductionData(backup), ['generation-jobs.json']);
assert.equal(readFileSync(process.env.ORUS_JOB_STORE_PATH, 'utf8'), '[{"generationId":"job-1"}]');
process.stdout.write('Production data backup and restore verified.\n');
