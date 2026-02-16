import { Request, Response } from 'express';
import { fundService } from '../services/fund.service';
import { CreateFundInput, UpdateFundInput } from '../validators/fund.validator';

export const fundController = {
  findAll: async (_req: Request, res: Response): Promise<void> => {
    const funds = await fundService.findAll();
    res.json(funds);
  },

  findById: async (req: Request, res: Response): Promise<void> => {
    const id: string = req.params.id as string;
    const fund = await fundService.findById(id);
    if (!fund) {
      res.status(404).json({ error: 'Fund not found' });
      return;
    }
    res.json(fund);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const fund = await fundService.create(req.body as CreateFundInput);
    res.status(201).json(fund);
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const fund = await fundService.update(req.body as UpdateFundInput);
    if (!fund) {
      res.status(404).json({ error: 'Fund not found' });
      return;
    }
    res.json(fund);
  },
};
