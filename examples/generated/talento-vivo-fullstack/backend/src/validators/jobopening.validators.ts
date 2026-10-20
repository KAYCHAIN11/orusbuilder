import { z } from 'zod';

/**
 * Zod schemas for JobOpening validation
 */
export const jobopeningSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    department: z.string().min(1).max(255),
    location: z.string().min(1).max(255).optional(),
    workMode: z.enum(['onsite', 'hybrid', 'remote']).optional().default('hybrid'),
    description: z.string().max(2000),
    status: z.enum(['draft', 'open', 'paused', 'closed']).optional().default('draft'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    department: z.string().min(1).max(255).optional(),
    location: z.string().min(1).max(255).optional(),
    workMode: z.enum(['onsite', 'hybrid', 'remote']).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['draft', 'open', 'paused', 'closed']).optional(),
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
      field: z.enum(['name', 'department', 'location', 'description']).optional(),
    })
    .optional(),
};

export type JobOpeningCreateInput = z.infer<typeof jobopeningSchemas.create>;
export type JobOpeningUpdateInput = z.infer<typeof jobopeningSchemas.update>;