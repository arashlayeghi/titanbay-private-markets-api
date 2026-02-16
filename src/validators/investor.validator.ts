import { z } from 'zod';

const InvestorType = z.enum(['Individual', 'Institution', 'Family Office']);

export const createInvestorSchema = z.object({
  name: z.string().min(1, 'Investor name is required'),
  investor_type: InvestorType,
  email: z.email('Invalid email format'),
});

export type CreateInvestorInput = z.infer<typeof createInvestorSchema>;
