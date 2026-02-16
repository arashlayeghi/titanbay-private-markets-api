import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

interface ValidationSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.params) {
        schemas.params.parse(req.params);
      }
      if (schemas.body) {
        schemas.body.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        ApiResponse.badRequest(
          res,
          'Validation failed',
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        );
        return;
      }
      next(error);
    }
  };
};
