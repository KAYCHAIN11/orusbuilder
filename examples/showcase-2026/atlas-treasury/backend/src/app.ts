import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/database';
import accountRoutes from './routes/account.routes';
import transactionRoutes from './routes/transaction.routes';
import invoiceRoutes from './routes/invoice.routes';
import costcenterRoutes from './routes/costcenter.routes';
import cashforecastRoutes from './routes/cashforecast.routes';
import reconciliationRoutes from './routes/reconciliation.routes';
import approvalRoutes from './routes/approval.routes';
import financialalertRoutes from './routes/financialalert.routes';

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
app.get('/health', (_req, res) => res.json({ status: 'healthy', service: 'AtlasTreasury', timestamp: new Date().toISOString() }));
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', database: 'disconnected', message: (error as Error).message });
  }
});
app.use('/api/auth', authRoutes);
 app.use('/api/accounts', accountRoutes);
 app.use('/api/transactions', transactionRoutes);
 app.use('/api/invoices', invoiceRoutes);
 app.use('/api/cost-centers', costcenterRoutes);
 app.use('/api/cash-forecasts', cashforecastRoutes);
 app.use('/api/reconciliations', reconciliationRoutes);
 app.use('/api/approvals', approvalRoutes);
 app.use('/api/financial-alerts', financialalertRoutes);

// Error handling (MUST BE LAST)
app.use(errorHandler);

export default app;