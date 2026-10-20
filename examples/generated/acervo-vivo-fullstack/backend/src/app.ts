import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma from './config/database';
import obraRoutes from './routes/obra.routes';
import emprestimoRoutes from './routes/emprestimo.routes';
import devolucaoRoutes from './routes/devolucao.routes';
import reservaRoutes from './routes/reserva.routes';
import multaRoutes from './routes/multa.routes';

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

 app.use('/api/obras', obraRoutes);
 app.use('/api/emprestimos', emprestimoRoutes);
 app.use('/api/devolucaos', devolucaoRoutes);
 app.use('/api/reservas', reservaRoutes);
 app.use('/api/multas', multaRoutes);

// Error handling (MUST BE LAST)
app.use(errorHandler);

export default app;