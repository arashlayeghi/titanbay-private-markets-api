import { z } from 'zod';

const FundStatus = z.enum(['Fundraising', 'Investing', 'Closed'], {
  error: 'Status must be one of: Fundraising, Investing, or Closed',
});

export const createFundSchema = z.strictObject({
  name: z
    .string({
      error: (iss) =>
        iss.input === undefined ? 'Fund name is required' : 'Fund name must be a string',
    })
    .min(1, 'Fund name must not be empty'),
  vintage_year: z
    .number({
      error: (iss) =>
        iss.input === undefined ? 'Vintage year is required' : 'Vintage year must be a number',
    })
    .int('Vintage year must be an integer'),
  target_size_usd: z
    .number({
      error: (iss) =>
        iss.input === undefined ? 'Target size is required' : 'Target size must be a number',
    })
    .positive('Target size must be positive'),
  status: FundStatus,
});

export const updateFundSchema = z.strictObject({
  name: z
    .string({
      error: (iss) =>
        iss.input === undefined ? 'Fund name is required' : 'Fund name must be a string',
    })
    .min(1, 'Fund name must not be empty'),
  vintage_year: z
    .number({
      error: (iss) =>
        iss.input === undefined ? 'Vintage year is required' : 'Vintage year must be a number',
    })
    .int('Vintage year must be an integer'),
  target_size_usd: z
    .number({
      error: (iss) =>
        iss.input === undefined ? 'Target size is required' : 'Target size must be a number',
    })
    .positive('Target size must be positive'),
  status: FundStatus,
});

export const uuidParamSchema = z.object({
  id: z.uuid({ error: 'Invalid UUID format' }),
});

export type CreateFundInput = z.infer<typeof createFundSchema>;
export type UpdateFundInput = z.infer<typeof updateFundSchema>;
