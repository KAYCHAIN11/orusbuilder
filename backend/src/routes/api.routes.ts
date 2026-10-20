/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧬 ORUS BUILDER - MAIN API ROUTER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @module routes/api.routes
 * @description Main API router - aggregates all sub-routes
 * @version 1.0.0
 * @created 2025-10-09
 * 
 * Central router that combines all API endpoints into a cohesive REST API
 * following RESTful best practices and consistent response patterns.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router, Request, Response } from 'express';
import { authRoutes } from './auth.routes';
import { projectRoutes } from './project.routes';
import { generationRoutes } from './generation.routes';
import { collaborationRoutes } from './collaboration.routes';
import { blueprintRoutes } from './blueprint.routes';
import { logger } from '../system/logging-system';
import { orchestrationEngine } from '../engines/orchestrator-engine';
import { generationExecutionService } from '../generation/generation-execution-service';
import { generationJobStore } from '../generation/generation-job-store';

const router = Router();

/**
 * API Health Check
 * GET /api/health
 */
router.get('/health', (req: Request, res: Response) => {
  const engines = orchestrationEngine.getEngineStatus();
  const requiredFailures = engines.filter(engine => engine.required && !engine.healthy).length;
  const generation = generationExecutionService.getCapacity();
  const operational = requiredFailures === 0 && generation.accepting;
  res.status(operational ? 200 : 503).json({
    status: operational ? 'operational' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development',
    generation,
    generationMetrics: generationExecutionService.getOperationalMetrics(),
    generationRetention: generationJobStore.getRetentionMetrics(),
    requiredEngineFailures: requiredFailures,
  });
});

/**
 * Engines Status
 * GET /api/engines/status
 */
router.get('/engines/status', (req: Request, res: Response) => {
  const engines = orchestrationEngine.getEngineStatus();
  const activeEngines = engines.filter(engine => engine.healthy).length;
  const enabledEngines = engines.filter(engine => engine.enabled).length;
  const requiredFailures = engines.filter(engine => engine.required && !engine.healthy).length;
  res.json({
    status: requiredFailures === 0 ? 'operational' : 'degraded',
    timestamp: new Date().toISOString(),
    engines,
    totalEngines: engines.length,
    enabledEngines,
    disabledEngines: engines.length - enabledEngines,
    activeEngines,
    inactiveEngines: engines.length - activeEngines,
    systemHealth: requiredFailures === 0 ? 'healthy' : 'degraded',
  });
});
router.get('/info', (req: Request, res: Response) => {
  res.json({
    name: 'ORUS Builder API',
    version: '1.0.0',
    description: 'AI-Powered Code Generation Platform',
    endpoints: {
      health: '/api/health',
      enginesStatus: '/api/engines/status',
      info: '/api/info',
      auth: '/api/v1/auth',
      projects: '/api/v1/projects',
      generation: '/api/v1/generation',
      collaboration: '/api/v1/collaboration',
      blueprints: '/api/v1/blueprints'
    },
    capabilities: {
      deployment: {
        available: false,
        reason: 'Provider adapter not configured'
      },
      marketplace: {
        available: false,
        reason: 'Commerce and licensing providers not configured'
      },
      passwordRecovery: {
        available: false,
        reason: 'Email delivery provider not configured'
      },
      sso: {
        available: false,
        reason: 'Identity provider adapter not configured'
      },
      twoFactorAuthentication: {
        available: false,
        reason: 'Authenticator enrollment is not implemented'
      }
    },
    documentation: 'https://github.com/OrusMind/Orus-Builder-FullStack/tree/main/docs',
    support: 'https://github.com/OrusMind/Orus-Builder-FullStack/issues'
  });
});

/**
 * Mount API v1 Routes
 */
const apiV1Router = Router();

// Authentication routes
apiV1Router.use('/auth', authRoutes);
logger.debug('Auth routes mounted at /api/v1/auth');

// Project routes
apiV1Router.use('/projects', projectRoutes);
logger.debug('Project routes mounted at /api/v1/projects');

// Code generation routes
apiV1Router.use('/generation', generationRoutes);
logger.debug('Generation routes mounted at /api/v1/generation');

// Collaboration routes
apiV1Router.use('/collaboration', collaborationRoutes);
logger.debug('Collaboration routes mounted at /api/v1/collaboration');

// Blueprint routes
apiV1Router.use('/blueprints', blueprintRoutes);
logger.debug('Blueprint routes mounted at /api/v1/blueprints');

// Mount v1 router
router.use('/v1', apiV1Router);

/**
 * API Version Not Found Handler
 */
router.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    message: 'Please check the API documentation at /api/info'
  });
});

export { router as apiRouter };

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * END OF MAIN API ROUTER
 * ═══════════════════════════════════════════════════════════════════════════
 */
