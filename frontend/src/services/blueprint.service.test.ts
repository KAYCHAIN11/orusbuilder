import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './api.service';
import blueprintService from './blueprint.service';

vi.mock('./api.service', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('BlueprintService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('uploads the original document as multipart data', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        data: { blueprintId: 'bp-1', status: 'uploaded', progress: 10, name: 'produto.docx' },
      },
    });
    const file = new File(['binary'], 'produto.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const result = await blueprintService.uploadBlueprint(file, 'produto-1');

    expect(result.blueprintId).toBe('bp-1');
    const [, body, config] = vi.mocked(apiClient.post).mock.calls[0];
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
    expect((body as FormData).get('projectId')).toBe('produto-1');
    expect(config).toMatchObject({ headers: { 'Content-Type': 'multipart/form-data' } });
  });

  it('uses the canonical generation endpoint and preserves job access', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        jobId: 'job-blueprint',
        accessToken: 'opaque-token',
        data: {
          generationId: 'job-blueprint',
          accessToken: 'opaque-token',
          status: 'queued',
          progress: 0,
          currentStep: 'queued',
        },
      },
    });

    await blueprintService.generateFromBlueprint({ blueprintId: 'pb-1', projectId: 'produto-1' });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/generation/blueprint',
      { blueprintId: 'pb-1', projectId: 'produto-1' },
      { timeout: 120000 },
    );
    expect(sessionStorage.getItem('orus:job-token:job-blueprint')).toBe('opaque-token');
  });

  it('reads Blueprint details from the authenticated resource endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: { blueprintId: 'bp-2', name: 'produto.md', format: 'md', status: 'ready', fileSize: 20 },
      },
    });

    const result = await blueprintService.getBlueprint('bp-2');

    expect(apiClient.get).toHaveBeenCalledWith('/blueprints/bp-2');
    expect(result).toMatchObject({ blueprintId: 'bp-2', status: 'ready' });
  });
});
