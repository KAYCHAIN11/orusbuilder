import { describe, expect, it, vi } from 'vitest';
import { GenerationService } from './generation.service';

describe('GenerationService engine health', () => {
  it('derives Trinity status from the canonical engine endpoint', async () => {
    const service = new GenerationService({ baseURL: 'http://localhost:5000', enableWebSocket: false });
    const get = vi.fn().mockResolvedValue({
      data: {
        engines: [
          { name: 'trinity', healthy: true, responseTime: 14 },
          { name: 'testing', healthy: true, responseTime: 5 },
        ],
      },
    });
    (service as unknown as { api: { get: typeof get } }).api.get = get;

    await expect(service.checkTrinityHealth()).resolves.toEqual({ status: 'online', latency: 14 });
    expect(get).toHaveBeenCalledWith('/api/engines/status');
  });

  it('reports an unavailable engine without inventing component status', async () => {
    const service = new GenerationService({ baseURL: 'http://localhost:5000', enableWebSocket: false });
    (service as unknown as { api: { get: ReturnType<typeof vi.fn> } }).api.get = vi.fn().mockRejectedValue(new Error('offline'));

    await expect(service.checkTrinityHealth()).resolves.toEqual({ status: 'offline', latency: 0 });
  });
});
