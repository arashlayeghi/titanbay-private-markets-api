import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { CreateInvestmentInput } from '../validators/investment.validator';
import { NotFoundError, BadRequestError } from '../errors';

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
   * Validates:
   * - Fund exists
   * - Fund is not closed
   * - Investment does not exceed fund's remaining capacity (target_size_usd)
   * - Investor exists
   * @throws NotFoundError if fund or investor does not exist
   * @throws BadRequestError if fund is closed or investment exceeds target size
   */
  create: async (
    fundId: string,
    data: CreateInvestmentInput,
  ): Promise<InvestmentResponse | null> => {
    const fund = await prisma.fund.findUnique({ where: { id: fundId } });
    if (!fund) {
      throw new NotFoundError('Fund not found');
    }

    if (fund.status === 'Closed') {
      throw new BadRequestError('Cannot invest in a closed fund');
    }

    const existingInvestments = await prisma.investment.aggregate({
      where: { fund_id: fundId },
      _sum: { amount_usd: true },
    });

    const totalCommitted = Number(existingInvestments._sum.amount_usd ?? 0);
    const targetSize = Number(fund.target_size_usd);
    const remaining = targetSize - totalCommitted;

    if (data.amount_usd > remaining) {
      throw new BadRequestError(
        `Investment of ${data.amount_usd} exceeds fund's remaining capacity of ${remaining} (target: ${targetSize}, committed: ${totalCommitted})`,
      );
    }

    const investor = await prisma.investor.findUnique({
      where: { id: data.investor_id },
    });
    if (!investor) {
      throw new NotFoundError('Investor not found');
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
