import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err.message);

  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  const status = err instanceof NotFoundError ? 404
    : err instanceof UnauthorizedError ? 401
    : err instanceof ForbiddenError ? 403
    : err instanceof ConflictError ? 409
    : 500;

  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal Server Error' : err.message,
  });
};