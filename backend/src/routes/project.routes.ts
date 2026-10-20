/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🗂️ ORUS BUILDER - PROJECT WORKSPACE ROUTES
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticationMiddleware } from '../middleware/authentication.middleware';
import { authorizationMiddleware } from '../middleware/authorization.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimiterMiddleware } from '../middleware/rate-limiter.middleware';

const router = Router();

// Global authentication + rate limiting
router.use(authenticationMiddleware.authenticate);
router.use(rateLimiterMiddleware.globalLimiter);

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROJECT WORKSPACE OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════
 */

// GET /api/v1/projects - List projects
router.get('/', projectController.listProjects.bind(projectController));

// POST /api/v1/projects - Create project
router.post(
  '/',
  rateLimiterMiddleware.strictLimiter,
  validationMiddleware.validateProjectCreation,
  projectController.createProject.bind(projectController)
);

router.post(
  '/from-generation',
  validationMiddleware.validateGeneratedProjectCreation,
  projectController.createProjectFromGeneration.bind(projectController)
);

router.post(
  '/:projectId/regenerate',
  rateLimiterMiddleware.strictLimiter,
  validationMiddleware.validateProjectRegeneration,
  authorizationMiddleware.checkProjectAccess,
  projectController.regenerateProject.bind(projectController)
);

// GET /api/v1/projects/:projectId - Get project
router.get(
  '/:projectId',
  authorizationMiddleware.checkProjectAccess,
  projectController.getProject.bind(projectController)
);

// PATCH /api/v1/projects/:projectId - Update project
router.patch(
  '/:projectId',
  authorizationMiddleware.checkProjectAccess,
  validationMiddleware.validateProjectUpdate,
  projectController.updateProject.bind(projectController)
);

// DELETE /api/v1/projects/:projectId - Delete project
router.delete(
  '/:projectId',
  authorizationMiddleware.checkProjectOwnership,
  projectController.deleteProject.bind(projectController)
);

router.get(
  '/:projectId/files',
  authorizationMiddleware.checkProjectAccess,
  projectController.getProjectFiles.bind(projectController)
);

router.get(
  '/:projectId/files/:fileId',
  authorizationMiddleware.checkProjectAccess,
  projectController.getFileContent.bind(projectController)
);

router.put(
  '/:projectId/files/:fileId',
  authorizationMiddleware.checkProjectAccess,
  validationMiddleware.validateFileUpdate,
  projectController.updateFileContent.bind(projectController)
);

router.patch(
  '/:projectId/files/:fileId',
  authorizationMiddleware.checkProjectAccess,
  validationMiddleware.validateFileRename,
  projectController.renameFile.bind(projectController)
);

router.delete(
  '/:projectId/files/:fileId',
  authorizationMiddleware.checkProjectAccess,
  projectController.deleteFile.bind(projectController)
);

router.post(
  '/:projectId/files/:fileId/duplicate',
  authorizationMiddleware.checkProjectAccess,
  projectController.duplicateFile.bind(projectController)
);

router.get(
  '/:projectId/export',
  authorizationMiddleware.checkProjectAccess,
  projectController.exportProject.bind(projectController)
);

router.get(
  '/:projectId/history',
  authorizationMiddleware.checkProjectAccess,
  projectController.getProjectHistory.bind(projectController)
);

router.get(
  '/:projectId/history/:revisionId',
  authorizationMiddleware.checkProjectAccess,
  projectController.getProjectRevision.bind(projectController)
);

router.post(
  '/:projectId/history/:revisionId/restore',
  authorizationMiddleware.checkProjectAccess,
  projectController.restoreProjectRevision.bind(projectController)
);

export { router as projectRoutes };
