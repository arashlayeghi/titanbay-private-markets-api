import { Router } from 'express';
import { investmentController } from '../controllers/investment.controller';
import { validateRequest } from '../middleware/validateRequest';
import { fundIdParamSchema, createInvestmentSchema } from '../validators/investment.validator';

const router: Router = Router({ mergeParams: true });

router.get(
  '/',
  validateRequest({ params: fundIdParamSchema }),
  investmentController.findAllByFundId,
);

router.post(
  '/',
  validateRequest({ params: fundIdParamSchema, body: createInvestmentSchema }),
  investmentController.create,
);

export { router as investmentRoutes };
