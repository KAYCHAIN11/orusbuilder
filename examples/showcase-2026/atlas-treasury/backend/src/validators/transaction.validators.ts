import { z } from 'zod';

/**
 * Zod schemas for Transaction validation
 */
export const transactionSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    amount: z.coerce.number().nonnegative().optional().default(0),
    type: z.enum(['income', 'expense']).optional().default('income'),
    occurredAt: z.coerce.date(),
    category: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['pending', 'completed', 'cancelled']).optional().default('pending'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    amount: z.coerce.number().nonnegative().optional(),
    type: z.enum(['income', 'expense']).optional(),
    occurredAt: z.coerce.date().optional(),
    category: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['pending', 'completed', 'cancelled']).optional(),
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
      field: z.enum(['name', 'category', 'description']).optional(),
    })
    .optional(),
};

export type TransactionCreateInput = z.infer<typeof transactionSchemas.create>;
export type TransactionUpdateInput = z.infer<typeof transactionSchemas.update>;