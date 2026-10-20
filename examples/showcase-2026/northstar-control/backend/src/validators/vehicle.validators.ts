import { z } from 'zod';

/**
 * Zod schemas for Vehicle validation
 */
export const vehicleSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    plate: z.string().min(1).max(255),
    capacity: z.coerce.number().nonnegative().optional(),
    lastMaintenanceAt: z.coerce.date().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['available', 'assigned', 'maintenance', 'inactive']).optional().default('available'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    plate: z.string().min(1).max(255).optional(),
    capacity: z.coerce.number().nonnegative().optional(),
    lastMaintenanceAt: z.coerce.date().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['available', 'assigned', 'maintenance', 'inactive']).optional(),
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
      field: z.enum(['name', 'plate', 'description']).optional(),
    })
    .optional(),
};

export type VehicleCreateInput = z.infer<typeof vehicleSchemas.create>;
export type VehicleUpdateInput = z.infer<typeof vehicleSchemas.update>;