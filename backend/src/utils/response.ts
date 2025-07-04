import { Response } from 'express';

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
): Response => {
  return res.status(statusCode).json({
    status: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message = 'An error occurred',
  statusCode = 500,
  error?: any,
): Response => {
  const response: { status: boolean; message: string; error?: any } = {
    status: false,
    message,
  };

  // Only include error details in non-production environments
  if (error && process.env.NODE_ENV !== 'production') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

export const createdResponse = <T>(
  res: Response,
  data: T,
  message = 'Resource created successfully',
): Response => {
  return successResponse(res, data, message, 201);
};

export const noContentResponse = (res: Response, message = 'No content'): Response => {
  return res.status(204).json({
    status: true,
    message,
  });
};
