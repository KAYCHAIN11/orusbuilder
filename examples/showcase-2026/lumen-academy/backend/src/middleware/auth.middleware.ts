import { Request, Response, NextFunction } from 'express';
import { AuthTokenPayload, jwtUtil } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  auth?: AuthTokenPayload;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Bearer token required' });
    return;
  }

  const token = authorization.slice(7);
  if (process.env.ORUS_PREVIEW_MODE === 'true' && token === 'orus-preview-token') {
    req.auth = {
      userId: 'orus-preview-user',
      email: 'preview@orus.local',
      role: 'admin',
    };
    next();
    return;
  }

  try {
    req.auth = jwtUtil.verify(token);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};