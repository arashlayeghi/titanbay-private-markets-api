import { Request, Response } from 'express';
import { investmentService } from '../services/investment.service';
import { CreateInvestmentInput } from '../validators/investment.validator';
import { ApiResponse } from '../utils/apiResponse';

export const investmentController = {
  findAllByFundId: async (req: Request, res: Response): Promise<void> => {
    const fundId: string = req.params.fund_id as string;
    const investments = await investmentService.findAllByFundId(fundId);

    if (investments === null) {
      ApiResponse.notFound(res, 'Fund not found');
      return;
    }
    ApiResponse.success(res, investments);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const fundId: string = req.params.fund_id as string;

    try {
      const investment = await investmentService.create(fundId, req.body as CreateInvestmentInput);
      ApiResponse.created(res, investment);
    } catch (error) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        ApiResponse.notFound(res, error.message);
        return;
      }
      throw error;
    }
  },
};
