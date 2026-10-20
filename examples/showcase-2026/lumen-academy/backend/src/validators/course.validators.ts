import { z } from 'zod';

/**
 * Zod schemas for Course validation
 */
export const courseSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    category: z.string().min(1).max(255).optional(),
    durationHours: z.coerce.number().nonnegative().optional().default(0),
    instructor: z.string().min(1).max(255).optional(),
    description: z.string().max(2000),
    status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    category: z.string().min(1).max(255).optional(),
    durationHours: z.coerce.number().nonnegative().optional(),
    instructor: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
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
      field: z.enum(['name', 'category', 'instructor', 'description']).optional(),
    })
    .optional(),
};

export type CourseCreateInput = z.infer<typeof courseSchemas.create>;
export type CourseUpdateInput = z.infer<typeof courseSchemas.update>;