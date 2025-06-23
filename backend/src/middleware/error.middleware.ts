import { Request, Response, NextFunction } from 'express';
import logger from '@config/logger';
import { HttpException } from '@utils/exceptions';

/**
 * Custom error handler middleware
 */
export const errorHandler = (
  err: HttpException,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  // Log detailed error for debugging
  if (status === 500) {
    logger.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${err.message || err}`,
    );
    logger.error(err.stack || '');
  } else {
    logger.warn(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
  }

  // Don't expose stack trace in production
  const response = {
    status: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && err.stack ? { stack: err.stack } : {}),
  };

  res.status(status).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new HttpException(404, `Resource not found - ${req.originalUrl}`);
  next(error);
};
