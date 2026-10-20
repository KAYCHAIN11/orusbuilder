import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { validate } from '../middleware/validate';
import { invoiceSchemas } from '../validators/index';
import { authMiddleware } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

const controller = new InvoiceController();

router.use(authMiddleware);

// GET all
router.get('/', controller.getAll.bind(controller));

router.get('/insights/summary', controller.getSummary.bind(controller));

// GET by id
router.get('/:id', controller.getById.bind(controller));

// POST create with validation
router.post(
  '/',
  authorize('admin', 'editor', 'member'),
  validate(invoiceSchemas.create),
  controller.create.bind(controller)
);

// PUT update with validation
router.put(
  '/:id',
  authorize('admin', 'editor', 'member'),
  validate(invoiceSchemas.update),
  controller.update.bind(controller)
);

router.patch('/:id/status', authorize('admin', 'editor', 'member'), controller.transition.bind(controller));

router.delete('/:id', authorize('admin', 'editor'), controller.delete.bind(controller));

export default router;