/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧬 ORUS BUILDER - CODE GENERATION ROUTES v2.5 (DOWNLOAD FIX!)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @module routes/generation.routes
 * @description AI-powered code generation with Generation Controller
 * @version 2.5.0
 * @created 2025-10-09
 * @updated 2025-10-23T11:25:00-03:00
 * 
 * CHANGES IN v2.5:
 * - ✅ MOVED `/download/:generationId` BEFORE `router.use()` (NO AUTH!)
 * - ✅ ALL public routes BEFORE authentication middleware
 * - ✅ All authenticated routes AFTER `router.use()`
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { generationController } from '../controllers/generation.controller';
import { projectController } from '../controllers/project.controller';
import { authenticationMiddleware } from '../middleware/authentication.middleware';
import { authorizationMiddleware } from '../middleware/authorization.middleware';
import { rateLimiterMiddleware } from '../middleware/rate-limiter.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { requireGenerationAccess } from '../middleware/generation-access.middleware';

const router = Router();
const generationCreationLimiter = rateLimiterMiddleware.rateLimiter({ max: 10, windowMs: 15 * 60 * 1000 });

// ═══════════════════════════════════════════════════════════════
// 🔥 PUBLIC ROUTES (NO AUTH REQUIRED) - MUST BE BEFORE router.use()!
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/v1/generation
 * Main code generation endpoint (NO AUTH!) - BACKWARD COMPATIBLE
 */
router.post('/', generationCreationLimiter, authenticationMiddleware.optionalAuthenticate, generationController.generateFromPrompt.bind(generationController));

/**
 * POST /api/v1/generation/prompt
 * Alternative code generation endpoint (NO AUTH!)
 */
router.post('/prompt', generationCreationLimiter, authenticationMiddleware.optionalAuthenticate, generationController.generateFromPrompt.bind(generationController));

router.post('/generate', generationCreationLimiter, authenticationMiddleware.optionalAuthenticate, generationController.generateFromPrompt.bind(generationController));

router.post('/validate-prompt', authenticationMiddleware.optionalAuthenticate, generationController.validatePrompt.bind(generationController));

router.post('/blueprint/plan', authenticationMiddleware.optionalAuthenticate, generationController.planProductBlueprint.bind(generationController));
router.post('/blueprint', generationCreationLimiter, authenticationMiddleware.optionalAuthenticate, generationController.generateFromBlueprint.bind(generationController));

/**
 * GET /api/v1/generation/:jobId/status
 * Check generation job status (NO AUTH)
 */
router.get('/:generationId/status', authenticationMiddleware.optionalAuthenticate, requireGenerationAccess, generationController.getGenerationStatus.bind(generationController));

/**
 * GET /api/v1/generation/:jobId/result
 * Get generation job result (NO AUTH)
 */
router.get('/:generationId/result', authenticationMiddleware.optionalAuthenticate, requireGenerationAccess, generationController.getGenerationResult.bind(generationController));

router.all('/:generationId/preview-api/*', authenticationMiddleware.optionalAuthenticate, requireGenerationAccess, generationController.proxyGeneratedPreviewApi.bind(generationController));
router.get('/:generationId/preview', authenticationMiddleware.optionalAuthenticate, requireGenerationAccess, generationController.serveGeneratedPreview.bind(generationController));
router.get('/:generationId/preview/*', authenticationMiddleware.optionalAuthenticate, requireGenerationAccess, generationController.serveGeneratedPreview.bind(generationController));

router.post('/:generationId/retry', authenticationMiddleware.optionalAuthenticate, requireGenerationAccess, generationController.retryGeneration.bind(generationController));
router.post('/:generationId/cancel', authenticationMiddleware.optionalAuthenticate, requireGenerationAccess, generationController.cancelGeneration.bind(generationController));
router.post('/:generationId/revoke-access', authenticationMiddleware.optionalAuthenticate, requireGenerationAccess, generationController.revokeGenerationAccess.bind(generationController));

/**
 * GET /api/v1/generation/download/:generationId
 * 📦 DOWNLOAD ZIP - NO AUTH REQUIRED! (MOVED HERE!)
 */
router.get('/download/:generationId', authenticationMiddleware.optionalAuthenticate, requireGenerationAccess, generationController.downloadGeneratedCode.bind(generationController));

// ═══════════════════════════════════════════════════════════════
// 🔒 AUTHENTICATED ROUTES (REQUIRE AUTH) - AFTER THIS LINE!
// ═══════════════════════════════════════════════════════════════
router.use(authenticationMiddleware.authenticate);

/**
 * GET /api/v1/generation/history
 * Get user's generation history (REQUIRES AUTH)
 */
router.get('/history',
  generationController.getGenerationHistory.bind(generationController)
);

/**
 * POST /api/v1/generation/save
 * Save generated project (REQUIRES AUTH)
 */
router.post('/save',
  rateLimiterMiddleware.tieredLimiter,
  validationMiddleware.validateGeneratedProjectCreation,
  projectController.createProjectFromGeneration.bind(projectController)
);

export default router;
export { router as generationRoutes };

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * END OF CODE GENERATION ROUTES v2.5 (DOWNLOAD FIX!)
 * ═══════════════════════════════════════════════════════════════════════════
 */
