import { z } from 'zod';

/**
 * Zod schemas for Lesson validation
 */
export const lessonSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    courseId: z.string().uuid(),
    position: z.coerce.number().nonnegative().optional().default(1),
    contentUrl: z.string().url().max(500).optional(),
    description: z.string().max(2000),
    status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    courseId: z.string().uuid().optional(),
    position: z.coerce.number().nonnegative().optional(),
    contentUrl: z.string().url().max(500).optional(),
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
      field: z.enum(['name', 'description']).optional(),
    })
    .optional(),
};

export type LessonCreateInput = z.infer<typeof lessonSchemas.create>;
export type LessonUpdateInput = z.infer<typeof lessonSchemas.update>;