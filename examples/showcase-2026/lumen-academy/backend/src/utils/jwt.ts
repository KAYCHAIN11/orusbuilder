import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'editor' | 'member' | 'viewer';
}

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  return process.env.JWT_SECRET;
};

export const jwtUtil = {
  sign: (payload: AuthTokenPayload) => {
    return jwt.sign(payload, secret(), { expiresIn: '7d', algorithm: 'HS256' });
  },

  verify: (token: string): AuthTokenPayload => {
    return jwt.verify(token, secret(), { algorithms: ['HS256'] }) as AuthTokenPayload;
  },
};