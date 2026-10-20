import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { jwtUtil } from '../utils/jwt';

const publicUser = {
  id: true,
  name: true,
  email: true,
  status: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (existing) {
        res.status(409).json({ success: false, message: 'Email already registered' });
        return;
      }
      const password = await bcrypt.hash(req.body.password, 12);
      const administratorEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean);
      const role = administratorEmails.includes(req.body.email.toLowerCase()) ? 'admin' : 'member';
      const user = await prisma.user.create({
        data: { name: req.body.name, email: req.body.email, password, role },
        select: publicUser,
      });
      const token = jwtUtil.sign({ userId: user.id, email: user.email, role: user.role as 'admin' | 'editor' | 'member' | 'viewer' });
      res.status(201).json({ success: true, data: { user, token } });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({ where: { email: req.body.email } });
      if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }
      const token = jwtUtil.sign({ userId: user.id, email: user.email, role: user.role as 'admin' | 'editor' | 'member' | 'viewer' });
      const { password: _password, ...safeUser } = user;
      res.json({ success: true, data: { user: safeUser, token } });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.auth!.userId },
        select: publicUser,
      });
      if (!user) {
        res.status(401).json({ success: false, message: 'User no longer exists' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}