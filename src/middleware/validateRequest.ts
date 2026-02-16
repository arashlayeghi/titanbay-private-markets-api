import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

interface ValidationSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
}

interface ValidationErrorDetail {
  field: string;
  message: string;
}

const formatZodErrors = (issues: z.core.$ZodIssue[]): ValidationErrorDetail[] =>
  issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

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
        res.status(400).json({
          error: 'Validation failed',
          details: formatZodErrors(error.issues),
        });
        return;
      }
      next(error);
    }
  };
};
