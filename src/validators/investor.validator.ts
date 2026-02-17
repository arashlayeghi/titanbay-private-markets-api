import { z } from 'zod';

const InvestorType = z.enum(['Individual', 'Institution', 'Family Office'], {
  error: 'Investor type must be one of: Individual, Institution, or Family Office',
});

export const createInvestorSchema = z.strictObject({
  name: z
    .string({
      error: (iss) =>
        iss.input === undefined ? 'Investor name is required' : 'Investor name must be a string',
    })
    .min(1, 'Investor name must not be empty'),
  investor_type: InvestorType,
  email: z.email({
    error: (iss) =>
      iss.input === undefined
        ? 'Email is required'
        : typeof iss.input !== 'string'
          ? 'Email must be a string'
          : 'Invalid email format',
  }),
});

export type CreateInvestorInput = z.infer<typeof createInvestorSchema>;
