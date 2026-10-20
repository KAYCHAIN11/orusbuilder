import { z } from 'zod';

/**
 * Zod schemas for Ticket validation
 */
export const ticketSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    eventId: z.string().uuid(),
    code: z.string().min(1).max(255),
    price: z.coerce.number().nonnegative().optional().default(0),
    description: z.string().max(2000).optional(),
    status: z.enum(['available', 'reserved', 'issued', 'used', 'cancelled']).optional().default('available'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    eventId: z.string().uuid().optional(),
    code: z.string().min(1).max(255).optional(),
    price: z.coerce.number().nonnegative().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['available', 'reserved', 'issued', 'used', 'cancelled']).optional(),
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
      field: z.enum(['name', 'code', 'description']).optional(),
    })
    .optional(),
};

export type TicketCreateInput = z.infer<typeof ticketSchemas.create>;
export type TicketUpdateInput = z.infer<typeof ticketSchemas.update>;