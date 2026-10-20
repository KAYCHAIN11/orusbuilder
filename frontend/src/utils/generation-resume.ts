export interface ResumableGeneration {
  generationId: string;
  accessToken?: string;
}

export function readResumableGeneration(storage: Storage): ResumableGeneration | null {
  const generationId = storage.getItem('orus:last-generation-id')?.trim();
  if (!generationId) return null;
  const accessToken = storage.getItem(`orus:job-token:${generationId}`)?.trim();
  return { generationId, ...(accessToken ? { accessToken } : {}) };
}

export function clearResumableGeneration(storage: Storage, generationId?: string): void {
  const targetId = generationId || storage.getItem('orus:last-generation-id') || '';
  storage.removeItem('orus:last-generation-id');
  if (targetId) storage.removeItem(`orus:job-token:${targetId}`);
}
