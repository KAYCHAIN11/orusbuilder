import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { authSchemas } from '../validators/auth.validator';

const router = Router();
const controller = new AuthController();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });

router.post('/register', authLimiter, validate(authSchemas.register), controller.register.bind(controller));
router.post('/login', authLimiter, validate(authSchemas.login), controller.login.bind(controller));
router.get('/me', authMiddleware, controller.me.bind(controller));

export default router;