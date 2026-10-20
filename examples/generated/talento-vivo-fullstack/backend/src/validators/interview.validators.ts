import { z } from 'zod';

/**
 * Zod schemas for Interview validation
 */
export const interviewSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    candidateId: z.string().uuid(),
    scheduledAt: z.coerce.date(),
    interviewer: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled']).optional().default('scheduled'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    candidateId: z.string().uuid().optional(),
    scheduledAt: z.coerce.date().optional(),
    interviewer: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
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
      field: z.enum(['name', 'interviewer', 'description']).optional(),
    })
    .optional(),
};

export type InterviewCreateInput = z.infer<typeof interviewSchemas.create>;
export type InterviewUpdateInput = z.infer<typeof interviewSchemas.update>;