import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller';
import { validate } from '../middleware/validate';
import { interviewSchemas } from '../validators/index';



const router = Router();

const controller = new InterviewController();



// GET all
router.get('/', controller.getAll.bind(controller));



// GET by id
router.get('/:id', controller.getById.bind(controller));

// POST create with validation
router.post(
  '/',
  
  validate(interviewSchemas.create),
  controller.create.bind(controller)
);

// PUT update with validation
router.put(
  '/:id',
  
  validate(interviewSchemas.update),
  controller.update.bind(controller)
);

router.patch('/:id/status', controller.transition.bind(controller));

router.delete('/:id', controller.delete.bind(controller));

export default router;