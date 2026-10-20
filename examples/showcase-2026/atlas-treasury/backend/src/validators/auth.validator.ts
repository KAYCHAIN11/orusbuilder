import { z } from 'zod';

export const authSchemas = {
  register: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().transform(value => value.toLowerCase()),
    password: z.string().min(8).max(128)
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  }),
  login: z.object({
    email: z.string().trim().email().transform(value => value.toLowerCase()),
    password: z.string().min(1).max(128),
  }),
};