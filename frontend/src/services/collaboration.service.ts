/**
 * ============================================================================
 * ORUS BUILDER - COLLABORATION SERVICE
 * ============================================================================
 *
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-09T20:57:00-03:00
 * COMPONENT_HASH: orus.frontend.service.collaboration.20261007.v2
 *
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: CollaborationCommunicationAgent
 * - COGNITIVE_LEVEL: Advanced
 * - AUTONOMY_DEGREE: 90
 * - TRINITY_INTEGRATED: None
 * ============================================================================
 */

import apiClient from './api.service';

export interface CollaborationParticipant {
  userId: string;
  username: string;
  status: 'active' | 'idle' | 'away';
  joinedAt: string;
  updatedAt: string;
  currentFile?: string;
}

export interface CollaborationSession {
  sessionId: string;
  projectId: string;
  participants: CollaborationParticipant[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'ended';
}

export interface CollaborationMessage {
  messageId: string;
  sessionId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface CollaborationComment {
  commentId: string;
  sessionId: string;
  userId: string;
  username: string;
  fileId: string;
  line?: number;
  content: string;
  parentId?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface Envelope<T> {
  success: boolean;
  data: T;
}

class CollaborationService {
  async ensureSession(projectId: string): Promise<CollaborationSession> {
    const response = await apiClient.post<Envelope<{ session: CollaborationSession }>>('/collaboration/sessions', { projectId });
    return response.data.data.session;
  }

  async getSession(sessionId: string): Promise<CollaborationSession> {
    const response = await apiClient.get<Envelope<{ session: CollaborationSession }>>(`/collaboration/sessions/${sessionId}`);
    return response.data.data.session;
  }

  async getMessages(sessionId: string, limit = 100): Promise<CollaborationMessage[]> {
    const response = await apiClient.get<Envelope<{ messages: CollaborationMessage[] }>>(
      `/collaboration/sessions/${sessionId}/chat`,
      { params: { limit } }
    );
    return response.data.data.messages;
  }

  async sendMessage(sessionId: string, message: string): Promise<CollaborationMessage> {
    const response = await apiClient.post<Envelope<{ message: CollaborationMessage }>>(
      `/collaboration/sessions/${sessionId}/chat`,
      { message }
    );
    return response.data.data.message;
  }

  async updatePresence(sessionId: string, status: CollaborationParticipant['status'], currentFile?: string): Promise<CollaborationParticipant> {
    const response = await apiClient.post<Envelope<{ participant: CollaborationParticipant }>>(
      `/collaboration/sessions/${sessionId}/presence`,
      { status, fileId: currentFile, line: 0, column: 0 }
    );
    return response.data.data.participant;
  }

  async getParticipants(sessionId: string): Promise<CollaborationParticipant[]> {
    const response = await apiClient.get<Envelope<{ participants: CollaborationParticipant[] }>>(
      `/collaboration/sessions/${sessionId}/participants`
    );
    return response.data.data.participants;
  }

  async getComments(sessionId: string, fileId?: string): Promise<CollaborationComment[]> {
    const response = await apiClient.get<Envelope<{ comments: CollaborationComment[] }>>(
      `/collaboration/sessions/${sessionId}/comments`,
      { params: fileId ? { fileId } : {} }
    );
    return response.data.data.comments;
  }

  async createComment(sessionId: string, input: { fileId: string; line?: number; content: string; parentId?: string }): Promise<CollaborationComment> {
    const response = await apiClient.post<Envelope<{ comment: CollaborationComment }>>(
      `/collaboration/sessions/${sessionId}/comments`,
      input
    );
    return response.data.data.comment;
  }

  async updateComment(sessionId: string, commentId: string, input: { content?: string; resolved?: boolean }): Promise<CollaborationComment> {
    const response = await apiClient.patch<Envelope<{ comment: CollaborationComment }>>(
      `/collaboration/sessions/${sessionId}/comments/${commentId}`,
      input
    );
    return response.data.data.comment;
  }

  async deleteComment(sessionId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/collaboration/sessions/${sessionId}/comments/${commentId}`);
  }
}

export const collaborationService = new CollaborationService();
export default collaborationService;
