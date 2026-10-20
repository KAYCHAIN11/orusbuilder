import { z } from 'zod';

/**
 * Zod schemas for Assessment validation
 */
export const assessmentSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    courseId: z.string().uuid().optional(),
    dueAt: z.coerce.date().optional(),
    maximumScore: z.coerce.number().nonnegative().optional().default(10),
    description: z.string().max(2000),
    status: z.enum(['draft', 'open', 'closed']).optional().default('draft'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    courseId: z.string().uuid().optional(),
    dueAt: z.coerce.date().optional(),
    maximumScore: z.coerce.number().nonnegative().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['draft', 'open', 'closed']).optional(),
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

export type AssessmentCreateInput = z.infer<typeof assessmentSchemas.create>;
export type AssessmentUpdateInput = z.infer<typeof assessmentSchemas.update>;