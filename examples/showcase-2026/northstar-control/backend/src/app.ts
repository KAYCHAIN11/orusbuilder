import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/database';
import shipmentRoutes from './routes/shipment.routes';
import vehicleRoutes from './routes/vehicle.routes';
import deliveryrouteRoutes from './routes/deliveryroute.routes';
import sensorreadingRoutes from './routes/sensorreading.routes';
import trackingeventRoutes from './routes/trackingevent.routes';
import incidentRoutes from './routes/incident.routes';

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
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'NorthstarControl', timestamp: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected', message: (error as Error).message });
  }
});
app.use('/api/auth', authRoutes);
 app.use('/api/shipments', shipmentRoutes);
 app.use('/api/vehicles', vehicleRoutes);
 app.use('/api/delivery-routes', deliveryrouteRoutes);
 app.use('/api/sensor-readings', sensorreadingRoutes);
 app.use('/api/tracking-events', trackingeventRoutes);
 app.use('/api/incidents', incidentRoutes);

// Error handling (MUST BE LAST)
app.use(errorHandler);

export default app;