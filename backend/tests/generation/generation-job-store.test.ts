import {
  FileGenerationJobRepository,
  GenerationJobStore,
  MemoryGenerationJobRepository,
} from '../../src/generation/generation-job-store';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Generation job store', () => {
  it('creates and advances the canonical job lifecycle', () => {
    const store = new GenerationJobStore(new MemoryGenerationJobRepository());
    const queued = store.update('job-1', { request: { prompt: 'Crie um app' }, accessTokenHash: 'secure-hash', userId: 'anonymous' });
    const validating = store.update('job-1', { status: 'validating', progress: 72, currentStep: 'runtime' });
    const ready = store.update('job-1', { status: 'ready', progress: 100, currentStep: 'certified', success: true });

    expect(queued).toMatchObject({ generationId: 'job-1', status: 'queued', progress: 0, success: false });
    expect(validating).toMatchObject({ status: 'validating', progress: 72, request: { prompt: 'Crie um app' } });
    expect(ready).toMatchObject({ status: 'ready', progress: 100, success: true, accessTokenHash: 'secure-hash', userId: 'anonymous' });
    expect(store.count()).toBe(1);
  });

  it('supports repository replacement and deletion', () => {
    const repository = new MemoryGenerationJobRepository();
    const store = new GenerationJobStore(repository);
    store.set({ generationId: 'job-2', status: 'failed', progress: 100, currentStep: 'failed', success: false, files: [] });

    expect(store.get('job-2')?.status).toBe('failed');
    expect(store.delete('job-2')).toBe(true);
    expect(store.get('job-2')).toBeUndefined();
  });

  it('lists jobs from newest to oldest', () => {
    const store = new GenerationJobStore(new MemoryGenerationJobRepository());
    store.set({ generationId: 'older', status: 'failed', progress: 100, currentStep: 'failed', success: false, files: [], createdAt: '2026-10-01T00:00:00.000Z' });
    store.set({ generationId: 'newer', status: 'ready', progress: 100, currentStep: 'certified', success: true, files: [], createdAt: '2026-10-02T00:00:00.000Z' });

    expect(store.list().map(job => job.generationId)).toEqual(['newer', 'older']);
  });

  it('keeps cancellation terminal when late workflow updates arrive', () => {
    const store = new GenerationJobStore(new MemoryGenerationJobRepository());
    store.update('job-3', { status: 'generating', progress: 20 });

    expect(store.cancel('job-3')).toMatchObject({ status: 'cancelled', progress: 100, success: false });
    expect(store.update('job-3', { status: 'ready', success: true })).toMatchObject({ status: 'cancelled', success: false });
    expect(store.cancel('job-3')).toBeUndefined();
  });

  it('purges only terminal jobs after their retention deadline', () => {
    const store = new GenerationJobStore(new MemoryGenerationJobRepository());
    store.update('expired-ready', { status: 'ready', success: true, expiresAt: '2026-10-01T00:00:00.000Z' });
    store.update('future-failed', { status: 'failed', expiresAt: '2026-10-03T00:00:00.000Z' });
    store.update('expired-active', { status: 'generating', expiresAt: '2026-10-01T00:00:00.000Z' });

    expect(store.purgeExpired(new Date('2026-10-02T00:00:00.000Z'))).toBe(1);
    expect(store.get('expired-ready')).toBeUndefined();
    expect(store.get('future-failed')).toBeDefined();
    expect(store.get('expired-active')).toBeDefined();
    expect(store.getRetentionMetrics()).toEqual({
      records: 2,
      purged: 1,
      lastPurgedAt: '2026-10-02T00:00:00.000Z',
    });
  });

  it('persists jobs and marks interrupted work for durable recovery', () => {
    const directory = mkdtempSync(join(tmpdir(), 'orus-job-store-'));
    const file = join(directory, 'jobs.json');
    try {
      const first = new GenerationJobStore(new FileGenerationJobRepository(file));
      first.update('job-durable', { status: 'validating', progress: 70, request: { prompt: 'Durable app' } });
      expect(JSON.parse(readFileSync(file, 'utf8'))).toEqual([
        expect.objectContaining({ generationId: 'job-durable', status: 'validating' }),
      ]);

      const recovered = new GenerationJobStore(new FileGenerationJobRepository(file));
      expect(recovered.get('job-durable')).toMatchObject({
        status: 'recovering', currentStep: 'recovering-after-restart', success: false, request: { prompt: 'Durable app' }, recoveryCount: 1,
      });
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('retains bounded stage checkpoints with diagnostics', () => {
    const store = new GenerationJobStore(new MemoryGenerationJobRepository());
    store.update('job-checkpoint', { request: { prompt: 'Checkpoint app' } });
    store.checkpoint('job-checkpoint', {
      stage: 'preview-smoke', status: 'validating', progress: 92, attempt: 1,
      diagnostics: [{ stage: 'preview', message: 'asset missing' }],
    });

    expect(store.get('job-checkpoint')).toMatchObject({
      status: 'validating', progress: 92, currentStep: 'preview-smoke',
      checkpoints: [expect.objectContaining({ stage: 'preview-smoke', attempt: 1 })],
    });
  });

  it('persists only the latest resumable candidate while checkpoints retain its identity', () => {
    const store = new GenerationJobStore(new MemoryGenerationJobRepository());
    store.update('job-candidate', { request: { prompt: 'Durable candidate' } });
    const candidate = {
      stage: 'install-test-build',
      artifactHash: 'artifact-hash',
      createdAt: new Date().toISOString(),
      files: [{ path: 'src/App.tsx', content: 'export default function App() { return null; }' }],
      productBlueprint: { blueprintId: 'bp-1' },
      generation: { success: true },
    };

    store.checkpoint('job-candidate', {
      stage: 'install-test-build',
      status: 'validating',
      progress: 50,
      attempt: 0,
      candidateArtifact: candidate,
    });

    expect(store.get('job-candidate')).toMatchObject({
      candidateArtifact: candidate,
      checkpoints: [expect.objectContaining({
        artifactHash: 'artifact-hash',
        fileCount: 1,
        resumable: true,
      })],
    });
    expect(store.get('job-candidate')?.checkpoints?.[0]).not.toHaveProperty('candidateArtifact');
  });

  it('preserves a corrupt store before accepting new jobs', () => {
    const directory = mkdtempSync(join(tmpdir(), 'orus-job-store-corrupt-'));
    const file = join(directory, 'jobs.json');
    try {
      writeFileSync(file, '{invalid', 'utf8');
      const store = new GenerationJobStore(new FileGenerationJobRepository(file));
      expect(store.count()).toBe(0);
      expect(readdirSync(directory).some(name => name.startsWith('jobs.json.corrupt-'))).toBe(true);

      store.update('job-after-recovery', { status: 'queued' });
      expect(JSON.parse(readFileSync(file, 'utf8'))).toEqual([
        expect.objectContaining({ generationId: 'job-after-recovery', status: 'queued' }),
      ]);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
