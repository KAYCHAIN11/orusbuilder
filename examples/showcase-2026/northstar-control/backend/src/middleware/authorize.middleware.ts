import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export type AppRole = 'admin' | 'editor' | 'member' | 'viewer';

export const authorize = (...roles: AppRole[]) => (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const role = req.auth?.role || 'viewer';
  if (!roles.includes(role)) {
    res.status(403).json({ success: false, message: 'Insufficient permissions' });
    return;
  }
  next();
};