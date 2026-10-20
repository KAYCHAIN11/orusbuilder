import { Express } from 'express';
import courseRoutes from './course.routes';
import learningpathRoutes from './learningpath.routes';
import lessonRoutes from './lesson.routes';
import studentRoutes from './student.routes';
import enrollmentRoutes from './enrollment.routes';
import assessmentRoutes from './assessment.routes';
import certificateRoutes from './certificate.routes';

/**
 * ✅ Routes Consolidator - Central registration point for all routes
 * Imports all individual route files and registers them with the Express app
 * @param app Express application instance
 */
export function setupRoutes(app: Express) {
 app.use('/api/courses', courseRoutes);
 app.use('/api/learning-paths', learningpathRoutes);
 app.use('/api/lessons', lessonRoutes);
 app.use('/api/students', studentRoutes);
 app.use('/api/enrollments', enrollmentRoutes);
 app.use('/api/assessments', assessmentRoutes);
 app.use('/api/certificates', certificateRoutes);
}