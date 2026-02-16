import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const fundIdParamSchema = z.object({
  fund_id: z.uuid('Invalid fund ID format'),
});

export const createInvestmentSchema = z.object({
  investor_id: z.uuid('Invalid investor ID'),
  amount_usd: z.number().positive('Amount must be positive'),
  investment_date: z.string().regex(dateRegex, 'Invalid date format. Use YYYY-MM-DD'),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
