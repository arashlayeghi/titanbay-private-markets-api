import { InvestorType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CreateInvestorInput } from '../validators/investor.validator';

interface InvestorResponse {
  id: string;
  name: string;
  investor_type: string;
  email: string;
  created_at: Date;
}

/** Maps Prisma enum (Family_Office) to API format (Family Office) */
const toApiType = (type: InvestorType): string => {
  if (type === 'Family_Office') return 'Family Office';
  return type;
};

/** Maps API format (Family Office) to Prisma enum (Family_Office) */
const toPrismaType = (type: string): InvestorType => {
  if (type === 'Family Office') return 'Family_Office';
  return type as InvestorType;
};

const formatInvestor = (investor: {
  id: string;
  name: string;
  investor_type: InvestorType;
  email: string;
  created_at: Date;
}): InvestorResponse => ({
  ...investor,
  investor_type: toApiType(investor.investor_type),
});

export const investorService = {
  /** Retrieves all investors with API-formatted investor types */
  findAll: async (): Promise<InvestorResponse[]> => {
    const investors = await prisma.investor.findMany();
    return investors.map(formatInvestor);
  },

  /**
   * Creates a new investor.
   * Checks for email uniqueness before insertion to provide a clear 409 error,
   * as Prisma v7 driver adapter does not surface constraint violations reliably.
   */
  create: async (data: CreateInvestorInput): Promise<InvestorResponse> => {
    const existing = await prisma.investor.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const error = new Error('Investor with this email already exists');
      error.name = 'ConflictError';
      throw error;
    }

    const investor = await prisma.investor.create({
      data: {
        name: data.name,
        investor_type: toPrismaType(data.investor_type),
        email: data.email,
      },
    });
    return formatInvestor(investor);
  },
};
