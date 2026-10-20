/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS GENERATION ACCESS
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-06T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.generation.access.20261006.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import { createHash, timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { generationJobStore } from '../generation/generation-job-store';

export function hashGenerationAccessToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function cookieValue(req: Request, name: string): string | undefined {
  const cookies = String(req.headers.cookie || '').split(';');
  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return undefined;
}

function sameHash(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export async function requireGenerationAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  const generationId = String(req.params['generationId'] || '');
  const job = generationJobStore.get(generationId);
  if (!job) {
    next();
    return;
  }
  const expiresAt = typeof job['expiresAt'] === 'string' ? Date.parse(job['expiresAt']) : Number.NaN;
  if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
    res.status(410).json({ success: false, error: 'Generation access expired' });
    return;
  }
  if (job['userId'] && job['userId'] !== 'anonymous' && req.user?.userId === job['userId']) {
    next();
    return;
  }
  if (job['accessTokenRevokedAt']) {
    res.status(403).json({ success: false, error: 'Generation access revoked' });
    return;
  }
  const header = req.headers['x-orus-job-token'];
  const query = req.query['access_token'];
  const cookieName = `orus_job_${generationId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const token = typeof header === 'string'
    ? header
    : typeof query === 'string'
      ? query
      : cookieValue(req, cookieName);
  const expected = typeof job['accessTokenHash'] === 'string' ? job['accessTokenHash'] : '';
  if (!token || !expected || !sameHash(hashGenerationAccessToken(token), expected)) {
    res.status(403).json({ success: false, error: 'Generation access denied' });
    return;
  }
  if (typeof query === 'string') {
    res.cookie(cookieName, query, {
      httpOnly: true,
      sameSite: 'strict',
      path: `/api/v1/generation/${generationId}`,
      maxAge: 60 * 60 * 1000,
    });
    if (req.method === 'GET' && /\/preview\/?$/.test(req.path)) {
      res.redirect(303, req.originalUrl.split('?')[0] || req.path);
      return;
    }
  }
  next();
}
