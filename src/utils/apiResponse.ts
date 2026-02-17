import { Response } from 'express';

interface ErrorDetail {
  field: string;
  message: string;
}

interface ApiErrorBody {
  error: string;
  details?: ErrorDetail[];
}

/** Centralised response handler ensuring consistent API response shapes */
export const ApiResponse = {
  /** Send a successful response (200) */
  success: (res: Response, data: unknown, statusCode = 200): void => {
    res.status(statusCode).json(data);
  },

  /** Send a resource created response (201) */
  created: (res: Response, data: unknown): void => {
    res.status(201).json(data);
  },

  /** Send an error response with a given status code */
  error: (res: Response, statusCode: number, message: string): void => {
    res.status(statusCode).json({ error: message });
  },

  /** Send a not found error (404) */
  notFound: (res: Response, message = 'Resource not found'): void => {
    res.status(404).json({ error: message });
  },

  /** Send a validation error with optional field-level details (400) */
  badRequest: (res: Response, message: string, details?: ErrorDetail[]): void => {
    const body: ApiErrorBody = { error: message };
    if (details) body.details = details;
    res.status(400).json(body);
  },

  /** Send a conflict error for duplicate resources (409) */
  conflict: (res: Response, message: string): void => {
    res.status(409).json({ error: message });
  },

  /** Send an internal server error (500) */
  internalError: (res: Response): void => {
    res.status(500).json({ error: 'Internal server error' });
  },
};
