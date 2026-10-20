import { z } from 'zod';

/**
 * Zod schemas for Report validation
 */
export const reportSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    metric: z.string().min(1).max(255),
    value: z.coerce.number().nonnegative().optional().default(0),
    periodStart: z.coerce.date().optional(),
    periodEnd: z.coerce.date().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['current', 'stale', 'archived']).optional().default('current'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    metric: z.string().min(1).max(255).optional(),
    value: z.coerce.number().nonnegative().optional(),
    periodStart: z.coerce.date().optional(),
    periodEnd: z.coerce.date().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['current', 'stale', 'archived']).optional(),
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
      field: z.enum(['name', 'metric', 'description']).optional(),
    })
    .optional(),
};

export type ReportCreateInput = z.infer<typeof reportSchemas.create>;
export type ReportUpdateInput = z.infer<typeof reportSchemas.update>;