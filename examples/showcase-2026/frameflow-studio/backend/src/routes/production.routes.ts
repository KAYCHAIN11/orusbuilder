import { Router } from 'express';
import { ProductionController } from '../controllers/production.controller';
import { validate } from '../middleware/validate';
import { productionSchemas } from '../validators/index';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

const controller = new ProductionController();

router.use(authMiddleware);

// GET all
router.get('/', controller.getAll.bind(controller));



// GET by id
router.get('/:id', controller.getById.bind(controller));

// POST create with validation
router.post(
  '/',
  authorize('admin', 'editor', 'member'),
  validate(productionSchemas.create),
  controller.create.bind(controller)
);

// PUT update with validation
router.put(
  '/:id',
  authorize('admin', 'editor', 'member'),
  validate(productionSchemas.update),
  controller.update.bind(controller)
);



router.delete('/:id', authorize('admin', 'editor'), controller.delete.bind(controller));

export default router;