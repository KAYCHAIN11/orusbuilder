import { z } from 'zod';

/**
 * Zod schemas for Delivery validation
 */
export const deliverySchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    shipmentId: z.string().uuid(),
    address: z.string().min(1).max(255),
    scheduledAt: z.coerce.date().optional(),
    proofUrl: z.string().url().max(500).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['scheduled', 'en_route', 'delivered', 'failed']).optional().default('scheduled'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    shipmentId: z.string().uuid().optional(),
    address: z.string().min(1).max(255).optional(),
    scheduledAt: z.coerce.date().optional(),
    proofUrl: z.string().url().max(500).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['scheduled', 'en_route', 'delivered', 'failed']).optional(),
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
      field: z.enum(['name', 'address', 'description']).optional(),
    })
    .optional(),
};

export type DeliveryCreateInput = z.infer<typeof deliverySchemas.create>;
export type DeliveryUpdateInput = z.infer<typeof deliverySchemas.update>;