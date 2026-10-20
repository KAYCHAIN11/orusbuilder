import { z } from 'zod';

/**
 * Zod schemas for Enrollment validation
 */
export const enrollmentSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    studentId: z.string().uuid(),
    courseId: z.string().uuid(),
    enrolledAt: z.coerce.date(),
    progress: z.coerce.number().nonnegative().optional().default(0),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'completed', 'cancelled']).optional().default('active'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    studentId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    enrolledAt: z.coerce.date().optional(),
    progress: z.coerce.number().nonnegative().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'completed', 'cancelled']).optional(),
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

export type EnrollmentCreateInput = z.infer<typeof enrollmentSchemas.create>;
export type EnrollmentUpdateInput = z.infer<typeof enrollmentSchemas.update>;