import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors';

/**
 * Allocate management fee proportionally across investors.
 * TODO: Implement this function - currently returns empty array.
 */
function allocateManagementFees(
  _totalFeeAmount: number,
  _investments: Array<{ investor_id: string; investor_name: string; amount: number }>,
): Array<{ investor_id: string; investor_name: string; fee: number; percentage: number }> {
  return [];
}

export const analyticsController = {
  getAnalytics: async (req: Request, res: Response): Promise<void> => {
    const fundId = req.params.fund_id as string;

    // Fetch fund data
    const fund = await prisma.fund.findUnique({ where: { id: fundId } });
    if (!fund) {
      throw new NotFoundError('Fund not found');
    }

    // Fetch investments for this fund
    const investments = await prisma.investment.findMany({
      where: { fund_id: fundId },
    });

    // Fetch investor details
    const investorsData: Array<{
      investor_id: string;
      investor_name: string;
      investor_type: string;
      amount: number;
    }> = [];
    for (const investment of investments) {
      const investor = await prisma.investor.findUnique({
        where: { id: investment.investor_id },
      });
      investorsData.push({
        investor_id: investor!.id,
        investor_name: investor!.name,
        investor_type:
          investor!.investor_type === 'Family_Office' ? 'Family Office' : investor!.investor_type,
        amount: Number(investment.amount_usd),
      });
    }

    // Calculate total raised
    let totalRaised = 0;
    for (let i = 0; i < investorsData.length; i++) {
      totalRaised = totalRaised + investorsData[i].amount;
    }

    // Calculate fund metrics
    const utilizationPct = (totalRaised / Number(fund.target_size_usd)) * 100;
    const avgInvestment = totalRaised / investments.length;

    // Group by investor type
    const byType: Record<string, { count: number; total: number }> = {};
    investorsData.forEach((inv) => {
      const type = inv.investor_type;
      if (!byType[type]) byType[type] = { count: 0, total: 0 };
      byType[type].count++;
      byType[type].total += inv.amount;
    });

    // Calculate type percentages
    const byInvestorType: Record<string, { count: number; total: number; percentage: number }> = {};
    Object.entries(byType).map(([type, data]) => {
      byInvestorType[type] = {
        ...data,
        percentage: Math.round((data.total / totalRaised) * 100 * 100) / 100,
      };
    });

    // Get top 5 investors
    const sorted = [...investorsData].sort((a, b) => b.amount - a.amount);
    const topInvestors = sorted.slice(0, 5).map((inv, index) => ({
      investor_id: inv.investor_id,
      investor_name: inv.investor_name,
      total_invested: inv.amount,
      percentage: Math.round((inv.amount / totalRaised) * 100 * 100) / 100,
      rank: index + 1,
    }));

    // Calculate fee distribution
    const managementFeeRate = 0.02;
    const totalManagementFee = totalRaised * managementFeeRate;
    const feeAllocations = allocateManagementFees(
      totalManagementFee,
      investorsData.map((inv) => ({
        investor_id: inv.investor_id,
        investor_name: inv.investor_name,
        amount: inv.amount,
      })),
    );

    // Build response
    res.json({
      fund_id: fund.id,
      total_raised: totalRaised,
      target_size: Number(fund.target_size_usd),
      utilization_pct: Math.round(utilizationPct * 100) / 100,
      investor_count: investorsData.length,
      average_investment: Math.round(avgInvestment * 100) / 100,
      top_investors: topInvestors,
      by_investor_type: byInvestorType,
      fee_distribution: {
        total_management_fee: totalManagementFee,
        by_investor: feeAllocations,
      },
    });
  },
};
