import { z } from 'zod';

/**
 * Zod schemas for Driver validation
 */
export const driverSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    phone: z.string().min(1).max(255),
    licenseNumber: z.string().min(1).max(255),
    region: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['available', 'assigned', 'offline']).optional().default('available'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    phone: z.string().min(1).max(255).optional(),
    licenseNumber: z.string().min(1).max(255).optional(),
    region: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['available', 'assigned', 'offline']).optional(),
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
      field: z.enum(['name', 'phone', 'licenseNumber', 'region', 'description']).optional(),
    })
    .optional(),
};

export type DriverCreateInput = z.infer<typeof driverSchemas.create>;
export type DriverUpdateInput = z.infer<typeof driverSchemas.update>;