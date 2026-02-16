import { Router } from 'express';
import { fundController } from '../controllers/fund.controller';
import { validateRequest } from '../middleware/validateRequest';
import { createFundSchema, updateFundSchema, uuidParamSchema } from '../validators/fund.validator';

const router: Router = Router();

router.get('/', fundController.findAll);

router.post('/', validateRequest({ body: createFundSchema }), fundController.create);

router.put(
  '/:id',
  validateRequest({ params: uuidParamSchema, body: updateFundSchema }),
  fundController.update,
);

router.get('/:id', validateRequest({ params: uuidParamSchema }), fundController.findById);

export { router as fundRoutes };
