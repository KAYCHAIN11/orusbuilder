import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/database';
import patientRoutes from './routes/patient.routes';
import professionalRoutes from './routes/professional.routes';
import appointmentRoutes from './routes/appointment.routes';
import careplanRoutes from './routes/careplan.routes';
import clinicalrecordRoutes from './routes/clinicalrecord.routes';
import followupRoutes from './routes/followup.routes';
import caretaskRoutes from './routes/caretask.routes';
import carealertRoutes from './routes/carealert.routes';

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
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'AmparoCare', timestamp: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected', message: (error as Error).message });
  }
});
app.use('/api/auth', authRoutes);
 app.use('/api/patients', patientRoutes);
 app.use('/api/professionals', professionalRoutes);
 app.use('/api/appointments', appointmentRoutes);
 app.use('/api/care-plans', careplanRoutes);
 app.use('/api/clinical-records', clinicalrecordRoutes);
 app.use('/api/follow-ups', followupRoutes);
 app.use('/api/care-tasks', caretaskRoutes);
 app.use('/api/care-alerts', carealertRoutes);

// Error handling (MUST BE LAST)
app.use(errorHandler);

export default app;