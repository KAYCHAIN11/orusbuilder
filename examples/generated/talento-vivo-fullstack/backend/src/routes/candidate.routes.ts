import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';
import { validate } from '../middleware/validate';
import { candidateSchemas } from '../validators/index';



const router = Router();

const controller = new CandidateController();



// GET all
router.get('/', controller.getAll.bind(controller));



// GET by id
router.get('/:id', controller.getById.bind(controller));

// POST create with validation
router.post(
  '/',
  
  validate(candidateSchemas.create),
  controller.create.bind(controller)
);

// PUT update with validation
router.put(
  '/:id',
  
  validate(candidateSchemas.update),
  controller.update.bind(controller)
);

router.patch('/:id/status', controller.transition.bind(controller));

router.delete('/:id', controller.delete.bind(controller));

export default router;