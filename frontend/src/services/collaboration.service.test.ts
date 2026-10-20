import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from './api.service';
import collaborationService from './collaboration.service';

vi.mock('./api.service', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('CollaborationService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a project session and persists a chat message through the API', async () => {
    vi.mocked(apiClient.post)
      .mockResolvedValueOnce({ data: { success: true, data: { session: { sessionId: 'session-1', projectId: 'project-1', participants: [], status: 'active' } } } })
      .mockResolvedValueOnce({ data: { success: true, data: { message: { messageId: 'message-1', sessionId: 'session-1', userId: 'user-1', username: 'User', message: 'Decision', timestamp: '2026-10-08T00:00:00.000Z' } } } });

    const session = await collaborationService.ensureSession('project-1');
    const message = await collaborationService.sendMessage(session.sessionId, 'Decision');

    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/collaboration/sessions', { projectId: 'project-1' });
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/collaboration/sessions/session-1/chat', { message: 'Decision' });
    expect(message.message).toBe('Decision');
  });

  it('reads active participants from the authenticated session', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: { participants: [{ userId: 'user-1', username: 'User', status: 'active' }] },
      },
    });

    const participants = await collaborationService.getParticipants('session-1');

    expect(apiClient.get).toHaveBeenCalledWith('/collaboration/sessions/session-1/participants');
    expect(participants).toEqual([expect.objectContaining({ userId: 'user-1', status: 'active' })]);
  });

  it('persists, resolves, and deletes file comments', async () => {
    const stored = { commentId: 'comment-1', sessionId: 'session-1', userId: 'user-1', username: 'User', fileId: 'src/App.tsx', line: 4, content: 'Decision', createdAt: '2026-10-08T00:00:00.000Z', updatedAt: '2026-10-08T00:00:00.000Z' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: { comment: stored } } });
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { success: true, data: { comments: [stored] } } });
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { success: true, data: { comment: { ...stored, resolvedBy: 'user-1' } } } });
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });

    await collaborationService.createComment('session-1', { fileId: 'src/App.tsx', line: 4, content: 'Decision' });
    await collaborationService.getComments('session-1', 'src/App.tsx');
    await collaborationService.updateComment('session-1', 'comment-1', { resolved: true });
    await collaborationService.deleteComment('session-1', 'comment-1');

    expect(apiClient.get).toHaveBeenCalledWith('/collaboration/sessions/session-1/comments', { params: { fileId: 'src/App.tsx' } });
    expect(apiClient.patch).toHaveBeenCalledWith('/collaboration/sessions/session-1/comments/comment-1', { resolved: true });
    expect(apiClient.delete).toHaveBeenCalledWith('/collaboration/sessions/session-1/comments/comment-1');
  });
});
