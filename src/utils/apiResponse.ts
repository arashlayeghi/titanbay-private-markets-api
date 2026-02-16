import { Response } from 'express';

interface ErrorDetail {
  field: string;
  message: string;
}

interface ApiErrorBody {
  error: string;
  details?: ErrorDetail[];
}

export const ApiResponse = {
  success: (res: Response, data: unknown, statusCode = 200): void => {
    res.status(statusCode).json(data);
  },

  created: (res: Response, data: unknown): void => {
    res.status(201).json(data);
  },

  notFound: (res: Response, message = 'Resource not found'): void => {
    res.status(404).json({ error: message });
  },

  badRequest: (res: Response, message: string, details?: ErrorDetail[]): void => {
    const body: ApiErrorBody = { error: message };
    if (details) body.details = details;
    res.status(400).json(body);
  },

  conflict: (res: Response, message: string): void => {
    res.status(409).json({ error: message });
  },

  internalError: (res: Response): void => {
    res.status(500).json({ error: 'Internal server error' });
  },
};
