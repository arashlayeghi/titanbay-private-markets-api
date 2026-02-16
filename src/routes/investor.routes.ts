import { Router } from 'express';
import { investorController } from '../controllers/investor.controller';
import { validateRequest } from '../middleware/validateRequest';
import { createInvestorSchema } from '../validators/investor.validator';

const router: Router = Router();

router.get('/', investorController.findAll);

router.post('/', validateRequest({ body: createInvestorSchema }), investorController.create);

export { router as investorRoutes };
