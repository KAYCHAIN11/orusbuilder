/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COGNITIVE AGENT CODE DNA - ORUS BUILDER COLLABORATION CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════
 * DEVELOPERS: Minerva Omega TypeScript Supreme | Tulio (ORUS Creator)
 * CREATED: 2025-10-11T10:36:00-0300
 * COMPONENT_HASH: orus.builder.controller.collaboration.002.20261007
 * VERSION: 2.0
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import type { NextFunction, Request, Response } from 'express';
import { canAccessProject } from './project.controller';
import { AppError, ErrorCategory, ErrorSeverity, HttpStatus } from '../system/error-handler';
import { logger } from '../system/logging-system';

export interface CollaborationSession {
  sessionId: string;
  projectId: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'ended';
}

export interface Participant {
  userId: string;
  username: string;
  status: 'active' | 'idle' | 'away';
  joinedAt: string;
  updatedAt: string;
  cursor?: CursorPosition;
  currentFile?: string;
}

export interface CursorPosition {
  fileId: string;
  line: number;
  column: number;
}

export interface ChatMessage {
  messageId: string;
  sessionId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface CodeComment {
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

interface CollaborationState {
  sessions: CollaborationSession[];
  chatHistory: Array<{ sessionId: string; messages: ChatMessage[] }>;
  comments: Array<{ sessionId: string; comments: CodeComment[] }>;
}

const collaborationStorePath = process.env['ORUS_COLLABORATION_STORE_FILE'] || resolve(process.cwd(), '.orus-data', 'collaboration.json');

export class CollaborationController {
  private static instance: CollaborationController;
  private readonly sessions = new Map<string, CollaborationSession>();
  private readonly chatHistory = new Map<string, ChatMessage[]>();
  private readonly comments = new Map<string, CodeComment[]>();

  private constructor() {
    this.load();
  }

  public static getInstance(): CollaborationController {
    if (!CollaborationController.instance) CollaborationController.instance = new CollaborationController();
    return CollaborationController.instance;
  }

  private load(): void {
    if (process.env['NODE_ENV'] === 'test' || !existsSync(collaborationStorePath)) return;
    try {
      const state = JSON.parse(readFileSync(collaborationStorePath, 'utf8')) as CollaborationState;
      for (const session of state.sessions || []) this.sessions.set(session.sessionId, session);
      for (const history of state.chatHistory || []) this.chatHistory.set(history.sessionId, history.messages || []);
      for (const entry of state.comments || []) this.comments.set(entry.sessionId, entry.comments || []);
    } catch {
      renameSync(collaborationStorePath, `${collaborationStorePath}.corrupt-${Date.now()}`);
    }
  }

  private persist(): void {
    if (process.env['NODE_ENV'] === 'test') return;
    const state: CollaborationState = {
      sessions: Array.from(this.sessions.values()),
      chatHistory: Array.from(this.chatHistory.entries()).map(([sessionId, messages]) => ({ sessionId, messages })),
      comments: Array.from(this.comments.entries()).map(([sessionId, comments]) => ({ sessionId, comments })),
    };
    mkdirSync(dirname(collaborationStorePath), { recursive: true });
    const temporaryPath = `${collaborationStorePath}.tmp`;
    writeFileSync(temporaryPath, JSON.stringify(state, null, 2), 'utf8');
    renameSync(temporaryPath, collaborationStorePath);
  }

  private failure(message: string, code: string, statusCode: number, category = ErrorCategory.AUTHORIZATION): never {
    throw new AppError(message, code, statusCode, category, ErrorSeverity.MEDIUM);
  }

  private user(req: Request): { userId: string; username: string } {
    const userId = req.user?.userId;
    if (!userId) this.failure('Authentication required', 'AUTHENTICATION_REQUIRED', 401);
    return { userId, username: req.user?.username || req.user?.email || 'User' };
  }

  private ensureProjectAccess(userId: string, projectId: string): void {
    if (!canAccessProject(userId, projectId)) this.failure('Project access denied', 'PROJECT_ACCESS_DENIED', 403);
  }

  private session(req: Request, sessionId: string): CollaborationSession {
    const session = this.sessions.get(sessionId);
    if (!session) this.failure('Collaboration session not found', 'SESSION_NOT_FOUND', 404, ErrorCategory.VALIDATION);
    this.ensureProjectAccess(this.user(req).userId, session.projectId);
    return session;
  }

  private participant(session: CollaborationSession, userId: string, username: string): Participant {
    const now = new Date().toISOString();
    const existing = session.participants.find(participant => participant.userId === userId);
    if (existing) {
      existing.username = username;
      existing.status = 'active';
      existing.updatedAt = now;
      return existing;
    }
    const participant: Participant = { userId, username, status: 'active', joinedAt: now, updatedAt: now };
    session.participants.push(participant);
    return participant;
  }

  public async listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = String(req.query['projectId'] || '');
      const { userId } = this.user(req);
      if (!projectId) this.failure('projectId is required', 'PROJECT_ID_REQUIRED', 400, ErrorCategory.VALIDATION);
      this.ensureProjectAccess(userId, projectId);
      const sessions = Array.from(this.sessions.values()).filter(session => session.projectId === projectId);
      res.status(HttpStatus.OK).json({ success: true, data: { sessions, total: sessions.length } });
    } catch (error) {
      next(error);
    }
  }

  public async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = String(req.body.projectId || '');
      const user = this.user(req);
      this.ensureProjectAccess(user.userId, projectId);
      const existing = Array.from(this.sessions.values()).find(session => session.projectId === projectId && session.status === 'active');
      if (existing) {
        this.participant(existing, user.userId, user.username);
        existing.updatedAt = new Date().toISOString();
        this.persist();
        res.status(HttpStatus.OK).json({ success: true, data: { session: existing } });
        return;
      }
      const now = new Date().toISOString();
      const session: CollaborationSession = {
        sessionId: `session-${randomUUID()}`,
        projectId,
        participants: [],
        createdAt: now,
        updatedAt: now,
        status: 'active',
      };
      this.participant(session, user.userId, user.username);
      this.sessions.set(session.sessionId, session);
      this.chatHistory.set(session.sessionId, []);
      this.comments.set(session.sessionId, []);
      this.persist();
      logger.info('Collaboration session created', { component: 'CollaborationController', action: 'createSession', metadata: { sessionId: session.sessionId, projectId } });
      res.status(HttpStatus.CREATED).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  }

  public async joinSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const user = this.user(req);
      const participant = this.participant(session, user.userId, user.username);
      session.status = 'active';
      session.updatedAt = new Date().toISOString();
      this.persist();
      res.status(HttpStatus.OK).json({ success: true, data: { participant, sessionState: session } });
    } catch (error) {
      next(error);
    }
  }

  public async leaveSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const user = this.user(req);
      session.participants = session.participants.filter(participant => participant.userId !== user.userId);
      session.status = session.participants.length ? 'active' : 'ended';
      session.updatedAt = new Date().toISOString();
      this.persist();
      res.status(HttpStatus.OK).json({ success: true, data: { sessionId: session.sessionId, status: session.status } });
    } catch (error) {
      next(error);
    }
  }

  public async getSessionState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      res.status(HttpStatus.OK).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  }

  public async sendChatMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const user = this.user(req);
      this.participant(session, user.userId, user.username);
      const message: ChatMessage = {
        messageId: `msg-${randomUUID()}`,
        sessionId: session.sessionId,
        userId: user.userId,
        username: user.username,
        message: String(req.body.message || '').trim(),
        timestamp: new Date().toISOString(),
      };
      const history = this.chatHistory.get(session.sessionId) || [];
      history.push(message);
      this.chatHistory.set(session.sessionId, history.slice(-500));
      session.updatedAt = message.timestamp;
      this.persist();
      res.status(HttpStatus.CREATED).json({ success: true, data: { message } });
    } catch (error) {
      next(error);
    }
  }

  public async getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const limit = Math.min(200, Math.max(1, Number(req.query['limit']) || 50));
      const history = this.chatHistory.get(session.sessionId) || [];
      res.status(HttpStatus.OK).json({ success: true, data: { messages: history.slice(-limit), total: history.length } });
    } catch (error) {
      next(error);
    }
  }

  public async updatePresence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const user = this.user(req);
      const participant = this.participant(session, user.userId, user.username);
      const status = String(req.body.status || 'active');
      if (!['active', 'idle', 'away'].includes(status)) this.failure('Invalid presence status', 'INVALID_PRESENCE', 400, ErrorCategory.VALIDATION);
      participant.status = status as Participant['status'];
      participant.updatedAt = new Date().toISOString();
      if (req.body.fileId) {
        participant.currentFile = String(req.body.fileId);
        participant.cursor = {
          fileId: String(req.body.fileId),
          line: Math.max(0, Number(req.body.line) || 0),
          column: Math.max(0, Number(req.body.column) || 0),
        };
      }
      session.updatedAt = participant.updatedAt;
      this.persist();
      res.status(HttpStatus.OK).json({ success: true, data: { participant } });
    } catch (error) {
      next(error);
    }
  }

  public async getActiveParticipants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const participants = session.participants.filter(participant => participant.status === 'active');
      res.status(HttpStatus.OK).json({ success: true, data: { participants, total: participants.length } });
    } catch (error) {
      next(error);
    }
  }

  public async listComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const fileId = String(req.query['fileId'] || '');
      const comments = (this.comments.get(session.sessionId) || [])
        .filter(comment => !fileId || comment.fileId === fileId);
      res.status(HttpStatus.OK).json({ success: true, data: { comments, total: comments.length } });
    } catch (error) {
      next(error);
    }
  }

  public async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const user = this.user(req);
      const now = new Date().toISOString();
      const comment: CodeComment = {
        commentId: `comment-${randomUUID()}`,
        sessionId: session.sessionId,
        userId: user.userId,
        username: user.username,
        fileId: String(req.body.fileId),
        content: String(req.body.content).trim(),
        createdAt: now,
        updatedAt: now,
        ...(Number.isInteger(req.body.line) ? { line: Math.max(1, Number(req.body.line)) } : {}),
        ...(req.body.parentId ? { parentId: String(req.body.parentId) } : {}),
      };
      const comments = this.comments.get(session.sessionId) || [];
      if (comment.parentId && !comments.some(item => item.commentId === comment.parentId)) {
        this.failure('Parent comment not found', 'COMMENT_PARENT_NOT_FOUND', 404, ErrorCategory.VALIDATION);
      }
      comments.push(comment);
      this.comments.set(session.sessionId, comments.slice(-1000));
      session.updatedAt = now;
      this.persist();
      res.status(HttpStatus.CREATED).json({ success: true, data: { comment } });
    } catch (error) {
      next(error);
    }
  }

  public async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const user = this.user(req);
      const comments = this.comments.get(session.sessionId) || [];
      const comment = comments.find(item => item.commentId === String(req.params['commentId']));
      if (!comment) this.failure('Comment not found', 'COMMENT_NOT_FOUND', 404, ErrorCategory.VALIDATION);
      if (req.body.content !== undefined) {
        if (comment.userId !== user.userId) this.failure('Only the author can edit this comment', 'COMMENT_EDIT_DENIED', 403);
        comment.content = String(req.body.content).trim();
      }
      if (req.body.resolved === true) {
        comment.resolvedAt = new Date().toISOString();
        comment.resolvedBy = user.userId;
      } else if (req.body.resolved === false) {
        delete comment.resolvedAt;
        delete comment.resolvedBy;
      }
      comment.updatedAt = new Date().toISOString();
      session.updatedAt = comment.updatedAt;
      this.persist();
      res.status(HttpStatus.OK).json({ success: true, data: { comment } });
    } catch (error) {
      next(error);
    }
  }

  public async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = this.session(req, String(req.params['sessionId']));
      const user = this.user(req);
      const comments = this.comments.get(session.sessionId) || [];
      const comment = comments.find(item => item.commentId === String(req.params['commentId']));
      if (!comment) this.failure('Comment not found', 'COMMENT_NOT_FOUND', 404, ErrorCategory.VALIDATION);
      if (comment.userId !== user.userId) this.failure('Only the author can delete this comment', 'COMMENT_DELETE_DENIED', 403);
      const removedIds = new Set([comment.commentId]);
      for (const item of comments) if (item.parentId === comment.commentId) removedIds.add(item.commentId);
      this.comments.set(session.sessionId, comments.filter(item => !removedIds.has(item.commentId)));
      session.updatedAt = new Date().toISOString();
      this.persist();
      res.status(HttpStatus.OK).json({ success: true, data: { commentId: comment.commentId } });
    } catch (error) {
      next(error);
    }
  }
}

export const collaborationController = CollaborationController.getInstance();
