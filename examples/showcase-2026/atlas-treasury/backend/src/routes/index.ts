import { Express } from 'express';
import accountRoutes from './account.routes';
import transactionRoutes from './transaction.routes';
import invoiceRoutes from './invoice.routes';
import costcenterRoutes from './costcenter.routes';
import cashforecastRoutes from './cashforecast.routes';
import reconciliationRoutes from './reconciliation.routes';
import approvalRoutes from './approval.routes';
import financialalertRoutes from './financialalert.routes';

/**
 * ✅ Routes Consolidator - Central registration point for all routes
 * Imports all individual route files and registers them with the Express app
 * @param app Express application instance
 */
export function setupRoutes(app: Express) {
 app.use('/api/accounts', accountRoutes);
 app.use('/api/transactions', transactionRoutes);
 app.use('/api/invoices', invoiceRoutes);
 app.use('/api/cost-centers', costcenterRoutes);
 app.use('/api/cash-forecasts', cashforecastRoutes);
 app.use('/api/reconciliations', reconciliationRoutes);
 app.use('/api/approvals', approvalRoutes);
 app.use('/api/financial-alerts', financialalertRoutes);
}