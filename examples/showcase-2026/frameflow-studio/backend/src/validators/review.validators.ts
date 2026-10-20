import { z } from 'zod';

/**
 * Zod schemas for Review validation
 */
export const reviewSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    reviewer: z.string().min(1).max(255),
    rating: z.coerce.number().nonnegative().optional().default(0),
    description: z.string().max(2000),
    status: z.enum(['pending', 'changes_requested', 'approved']).optional().default('pending'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    reviewer: z.string().min(1).max(255).optional(),
    rating: z.coerce.number().nonnegative().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['pending', 'changes_requested', 'approved']).optional(),
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
      field: z.enum(['name', 'reviewer', 'description']).optional(),
    })
    .optional(),
};

export type ReviewCreateInput = z.infer<typeof reviewSchemas.create>;
export type ReviewUpdateInput = z.infer<typeof reviewSchemas.update>;