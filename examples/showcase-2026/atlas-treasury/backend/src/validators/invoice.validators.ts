import { z } from 'zod';

/**
 * Zod schemas for Invoice validation
 */
export const invoiceSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    amount: z.coerce.number().nonnegative().optional().default(0),
    dueDate: z.coerce.date(),
    paidAt: z.coerce.date().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['open', 'paid', 'overdue', 'cancelled']).optional().default('open'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    amount: z.coerce.number().nonnegative().optional(),
    dueDate: z.coerce.date().optional(),
    paidAt: z.coerce.date().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['open', 'paid', 'overdue', 'cancelled']).optional(),
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

export type InvoiceCreateInput = z.infer<typeof invoiceSchemas.create>;
export type InvoiceUpdateInput = z.infer<typeof invoiceSchemas.update>;