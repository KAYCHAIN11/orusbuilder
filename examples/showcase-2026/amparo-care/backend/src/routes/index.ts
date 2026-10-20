import { Express } from 'express';
import patientRoutes from './patient.routes';
import professionalRoutes from './professional.routes';
import appointmentRoutes from './appointment.routes';
import careplanRoutes from './careplan.routes';
import clinicalrecordRoutes from './clinicalrecord.routes';
import followupRoutes from './followup.routes';
import caretaskRoutes from './caretask.routes';
import carealertRoutes from './carealert.routes';

/**
 * ✅ Routes Consolidator - Central registration point for all routes
 * Imports all individual route files and registers them with the Express app
 * @param app Express application instance
 */
export function setupRoutes(app: Express) {
 app.use('/api/patients', patientRoutes);
 app.use('/api/professionals', professionalRoutes);
 app.use('/api/appointments', appointmentRoutes);
 app.use('/api/care-plans', careplanRoutes);
 app.use('/api/clinical-records', clinicalrecordRoutes);
 app.use('/api/follow-ups', followupRoutes);
 app.use('/api/care-tasks', caretaskRoutes);
 app.use('/api/care-alerts', carealertRoutes);
}