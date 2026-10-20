import { beforeEach, describe, expect, it } from 'vitest';
import { clearResumableGeneration, readResumableGeneration } from './generation-resume';

describe('generation resume state', () => {
  beforeEach(() => localStorage.clear());

  it('restores the last generation and access token', () => {
    localStorage.setItem('orus:last-generation-id', 'job-123');
    localStorage.setItem('orus:job-token:job-123', 'token-123');
    expect(readResumableGeneration(localStorage)).toEqual({ generationId: 'job-123', accessToken: 'token-123' });
  });

  it('returns null without a persisted generation', () => {
    expect(readResumableGeneration(localStorage)).toBeNull();
  });

  it('clears the generation and its token', () => {
    localStorage.setItem('orus:last-generation-id', 'job-123');
    localStorage.setItem('orus:job-token:job-123', 'token-123');
    clearResumableGeneration(localStorage);
    expect(readResumableGeneration(localStorage)).toBeNull();
    expect(localStorage.getItem('orus:job-token:job-123')).toBeNull();
  });
});
