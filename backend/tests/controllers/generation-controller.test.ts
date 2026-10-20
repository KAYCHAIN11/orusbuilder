import type { NextFunction, Request, Response } from 'express';
import { GenerationController, generationController } from '../../src/controllers/generation.controller';
import { generationExecutionService } from '../../src/generation/generation-execution-service';
import { createCertifiedArtifactManifest } from '../../src/generation/artifact-manifest';

const response = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    set: jest.fn(),
    send: jest.fn(),
    removeHeader: jest.fn()
  } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res);
  return res;
};

describe('GenerationController async lifecycle', () => {
  beforeEach(() => {
    (GenerationController as any).generationStore.clear();
    (GenerationController as any).previewCache.clear();
    (GenerationController as any).previewBuilds.clear();
  });

  it('returns persisted progress for an active job', async () => {
    (GenerationController as any).generationStore.update('job-1', {
      status: 'repairing',
      progress: 64,
      currentStep: 'repairing-generated-code',
      repairAttempts: 1,
      diagnostics: [{ message: 'TS2304' }]
    });
    const req = { params: { generationId: 'job-1' } } as unknown as Request;
    const res = response();
    const next = jest.fn() as NextFunction;

    await generationController.getGenerationStatus(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'repairing', progress: 64, repairAttempts: 1 })
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('blocks result retrieval until the project is certified', async () => {
    (GenerationController as any).generationStore.update('job-2', {
      status: 'validating',
      progress: 72,
      currentStep: 'install-test-build'
    });
    const req = { params: { generationId: 'job-2' } } as unknown as Request;
    const res = response();

    await generationController.getGenerationResult(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('blocks download for failed or unfinished jobs', async () => {
    (GenerationController as any).generationStore.update('job-3', {
      status: 'failed',
      progress: 100,
      error: 'Build failed',
      diagnostics: [{ message: 'TS2322' }]
    });
    const req = { params: { generationId: 'job-3' } } as unknown as Request;
    const res = response();

    await generationController.downloadGeneratedCode(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Build failed' }));
  });

  it('fails closed when certification returns no deliverable files', async () => {
    const execute = jest.spyOn(generationExecutionService, 'execute').mockResolvedValue({
      certified: true,
      execution: {
        output: {
          files: [],
          generation: { success: true, components: [{ name: 'App' }], data: { files: [] } },
        },
      },
      diagnostics: [],
      repairAttempts: [],
    } as any);
    (GenerationController as any).generationStore.update('empty-certified-job', {
      status: 'queued',
      progress: 0,
    });

    await (generationController as any).executeGenerationJob({
      body: { projectId: 'empty-project', prompt: 'Crie uma aplicação funcional completa' },
    } as Request, 'empty-certified-job');

    expect((GenerationController as any).generationStore.get('empty-certified-job')).toMatchObject({
      status: 'failed',
      success: false,
      error: 'Certified workflow returned no deliverable files',
    });
    execute.mockRestore();
  });

  it('allows the certified preview to be embedded by the local builder', async () => {
    const files = [{ path: 'index.html', content: '<html><body>Ready</body></html>' }];
    (GenerationController as any).generationStore.update('job-preview', {
      status: 'ready',
      files,
      metadata: { qualityGate: { certified: true }, artifactManifest: createCertifiedArtifactManifest(files) }
    });
    (GenerationController as any).previewCache.set('job-preview', {
      entry: 'index.html',
      files: [{ path: 'index.html', content: Buffer.from('<html><body>Ready</body></html>') }]
    });
    const req = { params: { generationId: 'job-preview' } } as unknown as Request;
    const res = response();

    await generationController.serveGeneratedPreview(req, res, jest.fn());

    expect(res.removeHeader).toHaveBeenCalledWith('X-Frame-Options');
    expect(res.set).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining('http://127.0.0.1:4173')
    );
    expect(res.set).toHaveBeenCalledWith('Cross-Origin-Resource-Policy', 'cross-origin');
    expect(res.send).toHaveBeenCalledWith('<html><body>Ready</body></html>');
  });

  it('blocks preview when certified files were modified after certification', async () => {
    const certified = [{ path: 'index.html', content: '<html>Certified</html>' }];
    (GenerationController as any).generationStore.update('job-tampered', {
      status: 'ready',
      files: [{ path: 'index.html', content: '<html>Tampered</html>' }],
      metadata: {
        qualityGate: { certified: true },
        artifactManifest: createCertifiedArtifactManifest(certified),
      },
    });
    const next = jest.fn();

    await generationController.serveGeneratedPreview(
      { params: { generationId: 'job-tampered' } } as unknown as Request,
      response(),
      next
    );

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Generated artifact no longer matches its certified manifest',
    }));
  });

  it('cancels an active generation and rejects terminal jobs', async () => {
    (GenerationController as any).generationStore.update('job-active', { status: 'generating', progress: 25 });
    const cancel = jest.spyOn(generationExecutionService, 'cancel').mockReturnValue(true);
    const activeResponse = response();

    await generationController.cancelGeneration(
      { params: { generationId: 'job-active' } } as unknown as Request,
      activeResponse,
      jest.fn()
    );

    expect(cancel).toHaveBeenCalledWith('job-active');
    expect((GenerationController as any).generationStore.get('job-active')).toMatchObject({ status: 'cancelled', success: false });
    expect(activeResponse.status).toHaveBeenCalledWith(200);

    const terminalResponse = response();
    await generationController.cancelGeneration(
      { params: { generationId: 'job-active' } } as unknown as Request,
      terminalResponse,
      jest.fn()
    );
    expect(terminalResponse.status).toHaveBeenCalledWith(409);
  });

  it('returns persisted generation history for the current user', async () => {
    (GenerationController as any).generationStore.update('job-user', {
      userId: 'user-1', status: 'ready', progress: 100, success: true, projectName: 'Atlas', createdAt: '2026-10-02T00:00:00.000Z',
    });
    (GenerationController as any).generationStore.update('job-other', {
      userId: 'user-2', status: 'failed', progress: 100, createdAt: '2026-10-01T00:00:00.000Z',
    });
    (GenerationController as any).generationStore.update('job-legacy', { status: 'ready', progress: 100 });
    const res = response();

    await generationController.getGenerationHistory(
      { user: { userId: 'user-1' }, query: {} } as unknown as Request,
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        history: [expect.objectContaining({ generationId: 'job-user', projectName: 'Atlas', status: 'ready' })],
        total: 1,
      },
    });
  });
});
