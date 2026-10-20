import { z } from 'zod';

/**
 * Zod schemas for TrackingEvent validation
 */
export const trackingeventSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    shipmentId: z.string().uuid(),
    occurredAt: z.coerce.date(),
    location: z.string().min(1).max(255).optional(),
    description: z.string().max(2000),
    status: z.enum(['update', 'exception', 'delivered']).optional().default('update'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    shipmentId: z.string().uuid().optional(),
    occurredAt: z.coerce.date().optional(),
    location: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['update', 'exception', 'delivered']).optional(),
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
      field: z.enum(['name', 'location', 'description']).optional(),
    })
    .optional(),
};

export type TrackingEventCreateInput = z.infer<typeof trackingeventSchemas.create>;
export type TrackingEventUpdateInput = z.infer<typeof trackingeventSchemas.update>;