import { Express } from 'express';
import obraRoutes from './obra.routes';
import emprestimoRoutes from './emprestimo.routes';
import devolucaoRoutes from './devolucao.routes';
import reservaRoutes from './reserva.routes';
import multaRoutes from './multa.routes';

/**
 * ✅ Routes Consolidator - Central registration point for all routes
 * Imports all individual route files and registers them with the Express app
 * @param app Express application instance
 */
export function setupRoutes(app: Express) {
 app.use('/api/obras', obraRoutes);
 app.use('/api/emprestimos', emprestimoRoutes);
 app.use('/api/devolucaos', devolucaoRoutes);
 app.use('/api/reservas', reservaRoutes);
 app.use('/api/multas', multaRoutes);
}