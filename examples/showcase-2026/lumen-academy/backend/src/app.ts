import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/database';
import courseRoutes from './routes/course.routes';
import learningpathRoutes from './routes/learningpath.routes';
import lessonRoutes from './routes/lesson.routes';
import studentRoutes from './routes/student.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import assessmentRoutes from './routes/assessment.routes';
import certificateRoutes from './routes/certificate.routes';

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
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'LumenAcademy', timestamp: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected', message: (error as Error).message });
  }
});
app.use('/api/auth', authRoutes);
 app.use('/api/courses', courseRoutes);
 app.use('/api/learning-paths', learningpathRoutes);
 app.use('/api/lessons', lessonRoutes);
 app.use('/api/students', studentRoutes);
 app.use('/api/enrollments', enrollmentRoutes);
 app.use('/api/assessments', assessmentRoutes);
 app.use('/api/certificates', certificateRoutes);

// Error handling (MUST BE LAST)
app.use(errorHandler);

export default app;