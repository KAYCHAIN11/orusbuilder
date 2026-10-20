import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Middleware to validate request data using Zod schemas
 */
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ValidationError(
          'Validation failed',
          error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        );
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};