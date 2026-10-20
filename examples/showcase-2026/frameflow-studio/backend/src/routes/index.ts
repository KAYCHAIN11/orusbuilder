import { Express } from 'express';
import productionRoutes from './production.routes';
import sceneRoutes from './scene.routes';
import takeRoutes from './take.routes';
import mediaassetRoutes from './mediaasset.routes';
import reviewRoutes from './review.routes';
import commentRoutes from './comment.routes';
import approvalRoutes from './approval.routes';
import deliveryRoutes from './delivery.routes';

/**
 * ✅ Routes Consolidator - Central registration point for all routes
 * Imports all individual route files and registers them with the Express app
 * @param app Express application instance
 */
export function setupRoutes(app: Express) {
 app.use('/api/productions', productionRoutes);
 app.use('/api/scenes', sceneRoutes);
 app.use('/api/takes', takeRoutes);
 app.use('/api/media-assets', mediaassetRoutes);
 app.use('/api/reviews', reviewRoutes);
 app.use('/api/comments', commentRoutes);
 app.use('/api/approvals', approvalRoutes);
 app.use('/api/deliveries', deliveryRoutes);
}