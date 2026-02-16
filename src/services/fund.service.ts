import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CreateFundInput, UpdateFundInput } from '../validators/fund.validator';

const fundSelect: Prisma.FundSelect = {
  id: true,
  name: true,
  vintage_year: true,
  target_size_usd: true,
  status: true,
  created_at: true,
};

interface FundResponse {
  id: string;
  name: string;
  vintage_year: number;
  target_size_usd: number;
  status: string;
  created_at: Date;
}

/** Converts Prisma Decimal to a JavaScript number for JSON serialisation */
const formatFund = (fund: {
  id: string;
  name: string;
  vintage_year: number;
  target_size_usd: Prisma.Decimal;
  status: string;
  created_at: Date;
}): FundResponse => ({
  ...fund,
  target_size_usd: Number(fund.target_size_usd),
});

export const fundService = {
  /** Retrieves all funds with formatted monetary values */
  findAll: async (): Promise<FundResponse[]> => {
    const funds = await prisma.fund.findMany({ select: fundSelect });
    return funds.map(formatFund);
  },

  /** Finds a fund by UUID, returns null if not found */
  findById: async (id: string): Promise<FundResponse | null> => {
    const fund = await prisma.fund.findUnique({
      where: { id },
      select: fundSelect,
    });
    return fund ? formatFund(fund) : null;
  },

  /** Creates a new fund and returns the formatted result */
  create: async (data: CreateFundInput): Promise<FundResponse> => {
    const fund = await prisma.fund.create({
      data: {
        name: data.name,
        vintage_year: data.vintage_year,
        target_size_usd: data.target_size_usd,
        status: data.status,
      },
      select: fundSelect,
    });
    return formatFund(fund);
  },

  /** Updates a fund by ID. Returns null if fund not found (Prisma P2025) */
  update: async (data: UpdateFundInput): Promise<FundResponse | null> => {
    try {
      const fund = await prisma.fund.update({
        where: { id: data.id },
        data: {
          name: data.name,
          vintage_year: data.vintage_year,
          target_size_usd: data.target_size_usd,
          status: data.status,
        },
        select: fundSelect,
      });
      return formatFund(fund);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  },
};
