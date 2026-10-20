import { z } from 'zod';

/**
 * Zod schemas for Shipment validation
 */
export const shipmentSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    trackingCode: z.string().min(1).max(255),
    origin: z.string().min(1).max(255),
    destination: z.string().min(1).max(255),
    estimatedDeliveryAt: z.coerce.date().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['created', 'dispatched', 'in_transit', 'delivered', 'exception']).optional().default('created'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    trackingCode: z.string().min(1).max(255).optional(),
    origin: z.string().min(1).max(255).optional(),
    destination: z.string().min(1).max(255).optional(),
    estimatedDeliveryAt: z.coerce.date().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['created', 'dispatched', 'in_transit', 'delivered', 'exception']).optional(),
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
      field: z.enum(['name', 'trackingCode', 'origin', 'destination', 'description']).optional(),
    })
    .optional(),
};

export type ShipmentCreateInput = z.infer<typeof shipmentSchemas.create>;
export type ShipmentUpdateInput = z.infer<typeof shipmentSchemas.update>;