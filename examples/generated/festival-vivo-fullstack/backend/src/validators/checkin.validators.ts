import { z } from 'zod';

/**
 * Zod schemas for CheckIn validation
 */
export const checkinSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    ticketId: z.string().uuid(),
    checkedInAt: z.coerce.date().optional(),
    gate: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['pending', 'approved', 'denied']).optional().default('pending'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    ticketId: z.string().uuid().optional(),
    checkedInAt: z.coerce.date().optional(),
    gate: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['pending', 'approved', 'denied']).optional(),
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
      field: z.enum(['name', 'gate', 'description']).optional(),
    })
    .optional(),
};

export type CheckInCreateInput = z.infer<typeof checkinSchemas.create>;
export type CheckInUpdateInput = z.infer<typeof checkinSchemas.update>;