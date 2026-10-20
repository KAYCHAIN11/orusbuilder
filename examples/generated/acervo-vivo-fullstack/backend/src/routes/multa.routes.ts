import { Router } from 'express';
import { MultaController } from '../controllers/multa.controller';
import { validate } from '../middleware/validate';
import { multaSchemas } from '../validators/index';



const router = Router();

const controller = new MultaController();



// GET all
router.get('/', controller.getAll.bind(controller));

router.get('/insights/summary', controller.getSummary.bind(controller));

// GET by id
router.get('/:id', controller.getById.bind(controller));

// POST create with validation
router.post(
  '/',
  
  validate(multaSchemas.create),
  controller.create.bind(controller)
);

// PUT update with validation
router.put(
  '/:id',
  
  validate(multaSchemas.update),
  controller.update.bind(controller)
);



router.delete('/:id', controller.delete.bind(controller));

export default router;