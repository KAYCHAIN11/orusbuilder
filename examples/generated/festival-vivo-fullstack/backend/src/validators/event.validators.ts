import { z } from 'zod';

/**
 * Zod schemas for Event validation
 */
export const eventSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date().optional(),
    venue: z.string().min(1).max(255).optional(),
    capacity: z.coerce.number().nonnegative().optional(),
    description: z.string().max(2000),
    status: z.enum(['draft', 'published', 'live', 'finished', 'cancelled']).optional().default('draft'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
    venue: z.string().min(1).max(255).optional(),
    capacity: z.coerce.number().nonnegative().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['draft', 'published', 'live', 'finished', 'cancelled']).optional(),
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
      field: z.enum(['name', 'venue', 'description']).optional(),
    })
    .optional(),
};

export type EventCreateInput = z.infer<typeof eventSchemas.create>;
export type EventUpdateInput = z.infer<typeof eventSchemas.update>;