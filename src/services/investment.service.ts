import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CreateInvestmentInput } from '../validators/investment.validator';

interface InvestmentResponse {
  id: string;
  investor_id: string;
  fund_id: string;
  amount_usd: number;
  investment_date: string;
}

/** Converts Decimal to number and Date to YYYY-MM-DD string */
const formatInvestment = (investment: {
  id: string;
  investor_id: string;
  fund_id: string;
  amount_usd: Prisma.Decimal;
  investment_date: Date;
}): InvestmentResponse => ({
  ...investment,
  amount_usd: Number(investment.amount_usd),
  investment_date: investment.investment_date.toISOString().split('T')[0],
});

export const investmentService = {
  /** Retrieves all investments for a given fund. Returns null if fund not found. */
  findAllByFundId: async (fundId: string): Promise<InvestmentResponse[] | null> => {
    const fund = await prisma.fund.findUnique({ where: { id: fundId } });
    if (!fund) return null;

    const investments = await prisma.investment.findMany({
      where: { fund_id: fundId },
    });
    return investments.map(formatInvestment);
  },

  /**
   * Creates an investment linking an investor to a fund.
   * Validates both fund and investor existence before creation.
   * @throws NotFoundError if fund or investor does not exist
   */
  create: async (
    fundId: string,
    data: CreateInvestmentInput,
  ): Promise<InvestmentResponse | null> => {
    const fund = await prisma.fund.findUnique({ where: { id: fundId } });
    if (!fund) {
      const error = new Error('Fund not found');
      error.name = 'NotFoundError';
      throw error;
    }

    const investor = await prisma.investor.findUnique({
      where: { id: data.investor_id },
    });
    if (!investor) {
      const error = new Error('Investor not found');
      error.name = 'NotFoundError';
      throw error;
    }

    const investment = await prisma.investment.create({
      data: {
        fund_id: fundId,
        investor_id: data.investor_id,
        amount_usd: data.amount_usd,
        investment_date: new Date(data.investment_date),
      },
    });
    return formatInvestment(investment);
  },
};
