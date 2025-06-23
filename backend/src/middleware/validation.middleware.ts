import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { HttpException } from '@utils/exceptions';

// Define the type for schema object
interface ValidationSchema {
  body?: Schema;
  query?: Schema;
  params?: Schema;
}

/**
 * Factory function to create validation middleware for request body, query params, and URL params
 */
const validate = (schemas: ValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validationErrors: string[] = [];
    
    // Validate each part of the request if schema is provided
    Object.entries(schemas).forEach(([key, schema]) => {
      if (!schema) return;
      
      const property = key as keyof Pick<Request, 'body' | 'query' | 'params'>;
      const dataToValidate = req[property];
      
      const { error } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
        errors: {
          wrap: {
            label: false,
          },
        },
      });
      
      if (error) {
        const messages = error.details.map((detail: any) => detail.message);
        validationErrors.push(...messages);
      }
    });
    
    // If any validation errors, return 400 with all errors
    if (validationErrors.length > 0) {
      next(new HttpException(400, validationErrors.join(', ')));
    } else {
      next();
    }
  };
};

export default validate;
