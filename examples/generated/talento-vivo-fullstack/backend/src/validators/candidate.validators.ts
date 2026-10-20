import { z } from 'zod';

/**
 * Zod schemas for Candidate validation
 */
export const candidateSchemas = {
  create: z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    phone: z.string().min(1).max(255).optional(),
    headline: z.string().min(1).max(255).optional(),
    resumeUrl: z.string().url().max(500).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['available', 'in_process', 'hired', 'archived']).optional().default('available'),
  }),

  update: z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().min(1).max(255).optional(),
    headline: z.string().min(1).max(255).optional(),
    resumeUrl: z.string().url().max(500).optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(['available', 'in_process', 'hired', 'archived']).optional(),
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
      field: z.enum(['name', 'email', 'phone', 'headline', 'description']).optional(),
    })
    .optional(),
};

export type CandidateCreateInput = z.infer<typeof candidateSchemas.create>;
export type CandidateUpdateInput = z.infer<typeof candidateSchemas.update>;