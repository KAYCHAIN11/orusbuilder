import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/database';
import eventRoutes from './routes/event.routes';
import eventsessionRoutes from './routes/eventsession.routes';
import ticketRoutes from './routes/ticket.routes';
import attendeeRoutes from './routes/attendee.routes';
import checkinRoutes from './routes/checkin.routes';

import { errorHandler } from './middleware/errorHandler.middleware';
import { logger } from './middleware/logger.middleware';


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
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'OrusStudio', timestamp: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected', message: (error as Error).message });
  }
});

 app.use('/api/events', eventRoutes);
 app.use('/api/event-sessions', eventsessionRoutes);
 app.use('/api/tickets', ticketRoutes);
 app.use('/api/attendees', attendeeRoutes);
 app.use('/api/check-ins', checkinRoutes);

// Error handling (MUST BE LAST)
app.use(errorHandler);

export default app;