import { Request, Response } from 'express';
import { investorService } from '../services/investor.service';
import { CreateInvestorInput } from '../validators/investor.validator';
import { ApiResponse } from '../utils/apiResponse';

export const investorController = {
  findAll: async (_req: Request, res: Response): Promise<void> => {
    const investors = await investorService.findAll();
    ApiResponse.success(res, investors);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const investor = await investorService.create(req.body as CreateInvestorInput);
      ApiResponse.created(res, investor);
    } catch (error) {
      if (error instanceof Error && error.name === 'ConflictError') {
        ApiResponse.conflict(res, error.message);
        return;
      }
      throw error;
    }
  },
};
