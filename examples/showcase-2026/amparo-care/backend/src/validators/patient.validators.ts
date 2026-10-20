import { z } from 'zod';

/**
 * Zod schemas for Patient validation
 */
export const patientSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255).optional(),
    phone: z.string().min(1).max(255).optional(),
    birthDate: z.coerce.date().optional(),
    document: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'pending', 'inactive']).optional().default('active'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().min(1).max(255).optional(),
    birthDate: z.coerce.date().optional(),
    document: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['active', 'pending', 'inactive']).optional(),
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
      field: z.enum(['name', 'email', 'phone', 'document', 'description']).optional(),
    })
    .optional(),
};

export type PatientCreateInput = z.infer<typeof patientSchemas.create>;
export type PatientUpdateInput = z.infer<typeof patientSchemas.update>;