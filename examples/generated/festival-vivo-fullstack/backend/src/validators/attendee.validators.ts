import { z } from 'zod';

/**
 * Zod schemas for Attendee validation
 */
export const attendeeSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    phone: z.string().min(1).max(255).optional(),
    company: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['registered', 'confirmed', 'checked_in', 'cancelled']).optional().default('registered'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().min(1).max(255).optional(),
    company: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['registered', 'confirmed', 'checked_in', 'cancelled']).optional(),
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
      field: z.enum(['name', 'email', 'phone', 'company', 'description']).optional(),
    })
    .optional(),
};

export type AttendeeCreateInput = z.infer<typeof attendeeSchemas.create>;
export type AttendeeUpdateInput = z.infer<typeof attendeeSchemas.update>;