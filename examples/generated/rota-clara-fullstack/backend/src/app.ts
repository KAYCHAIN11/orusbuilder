import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/database';
import shipmentRoutes from './routes/shipment.routes';
import deliveryRoutes from './routes/delivery.routes';
import vehicleRoutes from './routes/vehicle.routes';
import driverRoutes from './routes/driver.routes';
import deliveryrouteRoutes from './routes/deliveryroute.routes';
import trackingeventRoutes from './routes/trackingevent.routes';

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

 app.use('/api/shipments', shipmentRoutes);
 app.use('/api/deliveries', deliveryRoutes);
 app.use('/api/vehicles', vehicleRoutes);
 app.use('/api/drivers', driverRoutes);
 app.use('/api/delivery-routes', deliveryrouteRoutes);
 app.use('/api/tracking-events', trackingeventRoutes);

// Error handling (MUST BE LAST)
app.use(errorHandler);

export default app;