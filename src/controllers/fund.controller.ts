import { Request, Response } from 'express';
import { fundService } from '../services/fund.service';
import { CreateFundInput, UpdateFundInput } from '../validators/fund.validator';
import { ApiResponse } from '../utils/apiResponse';

export const fundController = {
  findAll: async (_req: Request, res: Response): Promise<void> => {
    const funds = await fundService.findAll();
    ApiResponse.success(res, funds);
  },

  findById: async (req: Request, res: Response): Promise<void> => {
    const id: string = req.params.id as string;
    const fund = await fundService.findById(id);
    if (!fund) {
      ApiResponse.notFound(res, 'Fund not found');
      return;
    }
    ApiResponse.success(res, fund);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const fund = await fundService.create(req.body as CreateFundInput);
    ApiResponse.created(res, fund);
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const fund = await fundService.update(req.body as UpdateFundInput);
    if (!fund) {
      ApiResponse.notFound(res, 'Fund not found');
      return;
    }
    ApiResponse.success(res, fund);
  },
};
