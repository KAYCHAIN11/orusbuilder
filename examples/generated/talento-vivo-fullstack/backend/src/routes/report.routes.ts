import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { validate } from '../middleware/validate';
import { reportSchemas } from '../validators/index';



const router = Router();

const controller = new ReportController();



// GET all
router.get('/', controller.getAll.bind(controller));

router.get('/insights/summary', controller.getSummary.bind(controller));

// GET by id
router.get('/:id', controller.getById.bind(controller));

// POST create with validation
router.post(
  '/',
  
  validate(reportSchemas.create),
  controller.create.bind(controller)
);

// PUT update with validation
router.put(
  '/:id',
  
  validate(reportSchemas.update),
  controller.update.bind(controller)
);



router.delete('/:id', controller.delete.bind(controller));

export default router;