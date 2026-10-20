import { z } from 'zod';

/**
 * Zod schemas for Appointment validation
 */
export const appointmentSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    scheduledAt: z.coerce.date(),
    durationMinutes: z.coerce.number().int().positive().max(1440).optional().default(30),
    professional: z.string().min(1).max(255),
    patientId: z.string().uuid().optional(),
    type: z.enum(['consultation', 'return', 'procedure']).optional().default('consultation'),
    description: z.string().max(2000).optional(),
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).optional().default('scheduled'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    scheduledAt: z.coerce.date().optional(),
    durationMinutes: z.coerce.number().int().positive().max(1440).optional(),
    professional: z.string().min(1).max(255).optional(),
    patientId: z.string().uuid().optional(),
    type: z.enum(['consultation', 'return', 'procedure']).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).optional(),
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
      field: z.enum(['name', 'professional', 'description']).optional(),
    })
    .optional(),
};

export type AppointmentCreateInput = z.infer<typeof appointmentSchemas.create>;
export type AppointmentUpdateInput = z.infer<typeof appointmentSchemas.update>;