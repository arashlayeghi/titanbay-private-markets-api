import { z } from 'zod';

const FundStatus = z.enum(['Fundraising', 'Investing', 'Closed']);

export const createFundSchema = z.object({
  name: z.string().min(1, 'Fund name is required'),
  vintage_year: z.number().int('Vintage year must be an integer'),
  target_size_usd: z.number().positive('Target size must be positive'),
  status: FundStatus,
});

export const updateFundSchema = z.object({
  name: z.string().min(1, 'Fund name is required'),
  vintage_year: z.number().int('Vintage year must be an integer'),
  target_size_usd: z.number().positive('Target size must be positive'),
  status: FundStatus,
});

export const uuidParamSchema = z.object({
  id: z.uuid('Invalid UUID format'),
});

export type CreateFundInput = z.infer<typeof createFundSchema>;
export type UpdateFundInput = z.infer<typeof updateFundSchema>;
