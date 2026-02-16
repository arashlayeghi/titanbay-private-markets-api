import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

interface SyntaxError extends Error {
  type?: string;
}

export const errorHandler = (
  err: SyntaxError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err.type === 'entity.parse.failed') {
    ApiResponse.badRequest(res, 'Invalid JSON in request body');
    return;
  }

  console.error(`[Error] ${err.message}`);
  ApiResponse.internalError(res);
};
