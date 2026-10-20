import { z } from 'zod';

/**
 * Zod schemas for Scene validation
 */
export const sceneSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'pending', 'inactive']).optional().default('active'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'pending', 'inactive']).optional(),
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

export type SceneCreateInput = z.infer<typeof sceneSchemas.create>;
export type SceneUpdateInput = z.infer<typeof sceneSchemas.update>;