import { Express } from 'express';
import jobopeningRoutes from './jobopening.routes';
import candidateRoutes from './candidate.routes';
import applicationRoutes from './application.routes';
import interviewRoutes from './interview.routes';
import reportRoutes from './report.routes';

/**
 * ✅ Routes Consolidator - Central registration point for all routes
 * Imports all individual route files and registers them with the Express app
 * @param app Express application instance
 */
export function setupRoutes(app: Express) {
 app.use('/api/job-openings', jobopeningRoutes);
 app.use('/api/candidates', candidateRoutes);
 app.use('/api/applications', applicationRoutes);
 app.use('/api/interviews', interviewRoutes);
 app.use('/api/reports', reportRoutes);
}