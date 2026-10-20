import { z } from 'zod';

/**
 * Zod schemas for DeliveryRoute validation
 */
export const deliveryrouteSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    vehicleId: z.string().uuid().optional(),
    scheduledAt: z.coerce.date(),
    stops: z.coerce.number().nonnegative().optional().default(0),
    distance: z.coerce.number().nonnegative().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['planning', 'dispatched', 'in_progress', 'completed']).optional().default('planning'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    vehicleId: z.string().uuid().optional(),
    scheduledAt: z.coerce.date().optional(),
    stops: z.coerce.number().nonnegative().optional(),
    distance: z.coerce.number().nonnegative().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['planning', 'dispatched', 'in_progress', 'completed']).optional(),
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

export type DeliveryRouteCreateInput = z.infer<typeof deliveryrouteSchemas.create>;
export type DeliveryRouteUpdateInput = z.infer<typeof deliveryrouteSchemas.update>;