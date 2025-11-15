import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Error:', err);

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.message) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Not Found middleware
 */
export function notFound(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
}

