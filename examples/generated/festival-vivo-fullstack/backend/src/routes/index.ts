import { Express } from 'express';
import eventRoutes from './event.routes';
import eventsessionRoutes from './eventsession.routes';
import ticketRoutes from './ticket.routes';
import attendeeRoutes from './attendee.routes';
import checkinRoutes from './checkin.routes';

/**
 * ✅ Routes Consolidator - Central registration point for all routes
 * Imports all individual route files and registers them with the Express app
 * @param app Express application instance
 */
export function setupRoutes(app: Express) {
 app.use('/api/events', eventRoutes);
 app.use('/api/event-sessions', eventsessionRoutes);
 app.use('/api/tickets', ticketRoutes);
 app.use('/api/attendees', attendeeRoutes);
 app.use('/api/check-ins', checkinRoutes);
}