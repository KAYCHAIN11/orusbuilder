import { z } from 'zod';

/**
 * Zod schemas for Application validation
 */
export const applicationSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    candidateId: z.string().uuid(),
    jobOpeningId: z.string().uuid(),
    appliedAt: z.coerce.date(),
    score: z.coerce.number().nonnegative().optional().default(0),
    description: z.string().max(2000).optional(),
    status: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']).optional().default('applied'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    candidateId: z.string().uuid().optional(),
    jobOpeningId: z.string().uuid().optional(),
    appliedAt: z.coerce.date().optional(),
    score: z.coerce.number().nonnegative().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']).optional(),
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
      field: z.enum(['name', 'description']).optional(),
    })
    .optional(),
};

export type ApplicationCreateInput = z.infer<typeof applicationSchemas.create>;
export type ApplicationUpdateInput = z.infer<typeof applicationSchemas.update>;