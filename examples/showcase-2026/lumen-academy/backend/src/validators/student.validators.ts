import { z } from 'zod';

/**
 * Zod schemas for Student validation
 */
export const studentSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    registrationCode: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'paused', 'inactive']).optional().default('active'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
    registrationCode: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'paused', 'inactive']).optional(),
  }),

  id: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  getById: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  delete: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  filter: z
    .object({
      status: z.string().optional(),
      limit: z.number().int().positive().optional(),
      offset: z.number().int().nonnegative().optional(),
    })
    .optional(),

  search: z
    .object({
      query: z.string().min(1, 'Search query required').optional(),
      field: z.enum(['name', 'email', 'registrationCode', 'description']).optional(),
    })
    .optional(),
};

export type StudentCreateInput = z.infer<typeof studentSchemas.create>;
export type StudentUpdateInput = z.infer<typeof studentSchemas.update>;