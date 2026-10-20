/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔐 ORUS BUILDER - AUTHENTICATION CONTROLLER (FULL)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticationService, UserRole } from '../system/authentication-service';
import { logger } from '../system/logging-system';
import { userStore, type StoredUser } from '../system/user-store';
import { randomUUID } from 'crypto';
import { AuthenticationError, ConflictError, CustomError, NotFoundError, ValidationError } from '../middleware/error-handler.middleware';

const authenticationService = AuthenticationService.getInstance();

class AuthController {
  private publicUser(user: StoredUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }

  private issueSession(user: StoredUser) {
    const tokens = authenticationService.generateTokenPair({
      userId: user.id,
      email: user.email,
      username: user.name,
      role: user.role as UserRole,
    });
    return {
      user: this.publicUser(user),
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    };
  }

  // ========================================================================
  // BASIC AUTH METHODS
  // ========================================================================

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' },
        });
        return;
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      if (userStore.findByEmail(normalizedEmail)) {
        res.status(409).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
        return;
      }
      const passwordValidation = authenticationService.validatePasswordStrength(String(password));
      if (!passwordValidation.valid) {
        res.status(400).json({ success: false, error: { code: 'WEAK_PASSWORD', message: passwordValidation.errors.join('. ') } });
        return;
      }
      const now = new Date().toISOString();
      const user = userStore.save({
        id: randomUUID(),
        email: normalizedEmail,
        name: String(name).trim(),
        passwordHash: await authenticationService.hashPassword(String(password)),
        role: 'user',
        createdAt: now,
        updatedAt: now,
      });
      res.status(201).json({ success: true, data: this.issueSession(user) });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Missing credentials' },
        });
        return;
      }

      const user = userStore.findByEmail(String(email));
      if (!user || !await authenticationService.verifyPassword(String(password), user.passwordHash)) {
        res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
        return;
      }
      user.lastLogin = new Date().toISOString();
      user.updatedAt = user.lastLogin;
      userStore.save(user);
      res.status(200).json({ success: true, data: this.issueSession(user) });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = authenticationService.extractTokenFromHeader(req.headers.authorization);
      if (token) await authenticationService.logout(token);
      const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';
      if (refreshToken) {
        const verification = await authenticationService.verifyToken(refreshToken, 'refresh');
        if (verification.valid && verification.payload?.userId === req.user?.userId) {
          await authenticationService.logout(refreshToken);
        }
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Refresh token required' },
        });
        return;
      }

      const verification = await authenticationService.verifyToken(refreshToken, 'refresh');
      const user = verification.payload ? userStore.findById(verification.payload.userId) : null;
      if (!verification.valid || !user) {
        res.status(401).json({ success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' } });
        return;
      }
      const result = await authenticationService.refreshTokens(refreshToken);
      if (!result) {
        res.status(401).json({ success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' } });
        return;
      }
      res.json({
        success: true,
        data: {
          user: this.publicUser(user),
          token: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Email required' },
        });
        return;
      }

      // TODO: Implement password reset
      res.status(501).json({
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Password reset not yet implemented' },
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Token and password required' },
        });
        return;
      }

      // TODO: Implement password reset
      res.status(501).json({
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Password reset not yet implemented' },
      });
    } catch (error) {
      next(error);
    }
  }

  // ========================================================================
  // SSO METHODS (Enterprise)
  // ========================================================================

  async initiateSSOLogin(provider: string): Promise<string> {
    logger.warn(`SSO not implemented for provider: ${provider}`, { component: 'AuthController' });
    throw new CustomError('SSO is not available', 501, 'NOT_IMPLEMENTED');
  }

  async handleSSOCallback(provider: string, data: any): Promise<any> {
    logger.warn(`SSO callback not implemented for provider: ${provider}`, { component: 'AuthController' });
    void data;
    throw new CustomError('SSO is not available', 501, 'NOT_IMPLEMENTED');
  }

  // ========================================================================
  // PROFILE METHODS
  // ========================================================================

  async getCurrentUser(userId: string): Promise<any> {
    const user = userStore.findById(userId);
    if (!user) throw new NotFoundError('User');
    return this.publicUser(user);
  }

  async updateProfile(userId: string, data: any): Promise<any> {
    const user = userStore.findById(userId);
    if (!user) throw new NotFoundError('User');
    if (data.email) {
      const email = String(data.email).trim().toLowerCase();
      const existing = userStore.findByEmail(email);
      if (existing && existing.id !== userId) throw new ConflictError('Email already registered');
      user.email = email;
    }
    if (data.name !== undefined) {
      const name = String(data.name).trim();
      if (!name) throw new ValidationError('Name is required');
      user.name = name;
    }
    if (data.avatar !== undefined) user.avatar = String(data.avatar).trim();
    if (data.bio !== undefined) user.bio = String(data.bio).trim();
    user.updatedAt = new Date().toISOString();
    return this.publicUser(userStore.save(user));
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = userStore.findById(userId);
    if (!user) throw new NotFoundError('User');
    if (!await authenticationService.verifyPassword(currentPassword, user.passwordHash)) {
      throw new AuthenticationError('Current password is invalid');
    }
    const validation = authenticationService.validatePasswordStrength(newPassword);
    if (!validation.valid) throw new ValidationError(validation.errors.join('. '));
    user.passwordHash = await authenticationService.hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    userStore.save(user);
  }

  // ========================================================================
  // 2FA METHODS
  // ========================================================================

  async enable2FA(userId: string): Promise<any> {
    logger.info(`Enable 2FA: ${userId}`, { component: 'AuthController' });
    throw new CustomError('Two-factor authentication is not available', 501, 'NOT_IMPLEMENTED');
  }

  async verify2FA(userId: string, token: string): Promise<boolean> {
    logger.info(`Verify 2FA: ${userId}, token: ${token}`, { component: 'AuthController' });
    throw new CustomError('Two-factor authentication is not available', 501, 'NOT_IMPLEMENTED');
  }
}

export const authController = new AuthController();
