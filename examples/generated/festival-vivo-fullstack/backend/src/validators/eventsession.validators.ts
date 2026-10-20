import { z } from 'zod';

/**
 * Zod schemas for EventSession validation
 */
export const eventsessionSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    eventId: z.string().uuid(),
    startsAt: z.coerce.date(),
    speaker: z.string().min(1).max(255).optional(),
    room: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['scheduled', 'live', 'completed', 'cancelled']).optional().default('scheduled'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    eventId: z.string().uuid().optional(),
    startsAt: z.coerce.date().optional(),
    speaker: z.string().min(1).max(255).optional(),
    room: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['scheduled', 'live', 'completed', 'cancelled']).optional(),
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
      field: z.enum(['name', 'speaker', 'room', 'description']).optional(),
    })
    .optional(),
};

export type EventSessionCreateInput = z.infer<typeof eventsessionSchemas.create>;
export type EventSessionUpdateInput = z.infer<typeof eventsessionSchemas.update>;