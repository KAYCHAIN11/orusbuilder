import { Router } from 'express';
import { ObraController } from '../controllers/obra.controller';
import { validate } from '../middleware/validate';
import { obraSchemas } from '../validators/index';



const router = Router();

const controller = new ObraController();



// GET all
router.get('/', controller.getAll.bind(controller));



// GET by id
router.get('/:id', controller.getById.bind(controller));

// POST create with validation
router.post(
  '/',
  
  validate(obraSchemas.create),
  controller.create.bind(controller)
);

// PUT update with validation
router.put(
  '/:id',
  
  validate(obraSchemas.update),
  controller.update.bind(controller)
);



router.delete('/:id', controller.delete.bind(controller));

export default router;