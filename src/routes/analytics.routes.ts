import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { validateRequest } from '../middleware/validateRequest';
import { fundIdParamSchema } from '../validators/investment.validator';

const router: Router = Router({ mergeParams: true });

router.get('/', validateRequest({ params: fundIdParamSchema }), analyticsController.getAnalytics);

export { router as analyticsRoutes };
