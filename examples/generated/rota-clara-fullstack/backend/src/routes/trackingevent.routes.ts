import { Router } from 'express';
import { TrackingEventController } from '../controllers/trackingevent.controller';
import { validate } from '../middleware/validate';
import { trackingeventSchemas } from '../validators/index';



const router = Router();

const controller = new TrackingEventController();



// GET all
router.get('/', controller.getAll.bind(controller));



// GET by id
router.get('/:id', controller.getById.bind(controller));

// POST create with validation
router.post(
  '/',
  
  validate(trackingeventSchemas.create),
  controller.create.bind(controller)
);

// PUT update with validation
router.put(
  '/:id',
  
  validate(trackingeventSchemas.update),
  controller.update.bind(controller)
);



router.delete('/:id', controller.delete.bind(controller));

export default router;