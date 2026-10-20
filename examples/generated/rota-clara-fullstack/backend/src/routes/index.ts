import { Express } from 'express';
import shipmentRoutes from './shipment.routes';
import deliveryRoutes from './delivery.routes';
import vehicleRoutes from './vehicle.routes';
import driverRoutes from './driver.routes';
import deliveryrouteRoutes from './deliveryroute.routes';
import trackingeventRoutes from './trackingevent.routes';

/**
 * ✅ Routes Consolidator - Central registration point for all routes
 * Imports all individual route files and registers them with the Express app
 * @param app Express application instance
 */
export function setupRoutes(app: Express) {
 app.use('/api/shipments', shipmentRoutes);
 app.use('/api/deliveries', deliveryRoutes);
 app.use('/api/vehicles', vehicleRoutes);
 app.use('/api/drivers', driverRoutes);
 app.use('/api/delivery-routes', deliveryrouteRoutes);
 app.use('/api/tracking-events', trackingeventRoutes);
}