import { Router } from 'express';
import { CarePlanController } from '../controllers/careplan.controller';
import { validate } from '../middleware/validate';
import { careplanSchemas } from '../validators/index';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

const controller = new CarePlanController();

router.use(authMiddleware);

// GET all
router.get('/', controller.getAll.bind(controller));



// GET by id
router.get('/:id', controller.getById.bind(controller));

// POST create with validation
router.post(
  '/',
  authorize('admin', 'editor', 'member'),
  validate(careplanSchemas.create),
  controller.create.bind(controller)
);

// PUT update with validation
router.put(
  '/:id',
  authorize('admin', 'editor', 'member'),
  validate(careplanSchemas.update),
  controller.update.bind(controller)
);



router.delete('/:id', authorize('admin', 'editor'), controller.delete.bind(controller));

export default router;