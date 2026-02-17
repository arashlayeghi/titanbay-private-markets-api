import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const fundIdParamSchema = z.object({
  fund_id: z.uuid({ error: 'Invalid fund ID format' }),
});

export const createInvestmentSchema = z.strictObject({
  investor_id: z.uuid({
    error: (iss) =>
      iss.input === undefined
        ? 'Investor ID is required'
        : typeof iss.input !== 'string'
          ? 'Investor ID must be a string'
          : 'Invalid investor ID format',
  }),
  amount_usd: z
    .number({
      error: (iss) => (iss.input === undefined ? 'Amount is required' : 'Amount must be a number'),
    })
    .positive('Amount must be positive'),
  investment_date: z
    .string({
      error: (iss) =>
        iss.input === undefined
          ? 'Investment date is required'
          : 'Investment date must be a string',
    })
    .regex(dateRegex, 'Invalid date format. Use YYYY-MM-DD'),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
