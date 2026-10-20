import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/database';
import productionRoutes from './routes/production.routes';
import sceneRoutes from './routes/scene.routes';
import takeRoutes from './routes/take.routes';
import mediaassetRoutes from './routes/mediaasset.routes';
import reviewRoutes from './routes/review.routes';
import commentRoutes from './routes/comment.routes';
import approvalRoutes from './routes/approval.routes';
import deliveryRoutes from './routes/delivery.routes';

import { errorHandler } from './middleware/errorHandler.middleware';
import { logger } from './middleware/logger.middleware';
import authRoutes from './routes/auth.routes';

const app = express();
const configuredOrigins = (process.env.CORS_ORIGIN || '').split(',').map(origin => origin.trim()).filter(Boolean);
if (process.env.NODE_ENV === 'production' && configuredOrigins.length === 0) {
  throw new Error('CORS_ORIGIN is required in production');
}

// Middleware
app.use(helmet());
app.use(cors({ origin: configuredOrigins.length > 0 ? configuredOrigins : ['http://localhost:5173'], credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(logger);

// Routes
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'FrameFlowStudio', timestamp: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected', message: (error as Error).message });
  }
});
app.use('/api/auth', authRoutes);
 app.use('/api/productions', productionRoutes);
 app.use('/api/scenes', sceneRoutes);
 app.use('/api/takes', takeRoutes);
 app.use('/api/media-assets', mediaassetRoutes);
 app.use('/api/reviews', reviewRoutes);
 app.use('/api/comments', commentRoutes);
 app.use('/api/approvals', approvalRoutes);
 app.use('/api/deliveries', deliveryRoutes);

// Error handling (MUST BE LAST)
app.use(errorHandler);

export default app;