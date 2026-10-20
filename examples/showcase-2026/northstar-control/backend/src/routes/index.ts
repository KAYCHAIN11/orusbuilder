import { Express } from 'express';
import shipmentRoutes from './shipment.routes';
import vehicleRoutes from './vehicle.routes';
import deliveryrouteRoutes from './deliveryroute.routes';
import sensorreadingRoutes from './sensorreading.routes';
import trackingeventRoutes from './trackingevent.routes';
import incidentRoutes from './incident.routes';

/**
 * ✅ Routes Consolidator - Central registration point for all routes
 * Imports all individual route files and registers them with the Express app
 * @param app Express application instance
 */
export function setupRoutes(app: Express) {
 app.use('/api/shipments', shipmentRoutes);
 app.use('/api/vehicles', vehicleRoutes);
 app.use('/api/delivery-routes', deliveryrouteRoutes);
 app.use('/api/sensor-readings', sensorreadingRoutes);
 app.use('/api/tracking-events', trackingeventRoutes);
 app.use('/api/incidents', incidentRoutes);
}