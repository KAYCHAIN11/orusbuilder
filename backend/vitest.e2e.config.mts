/**
 * ============================================================================
 * ORUS BUILDER - BACKEND E2E TEST CONFIGURATION
 * ============================================================================
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.e2e.ts'],
    setupFiles: ['./tests/setup.ts'],
    clearMocks: true,
    testTimeout: 1_200_000,
    hookTimeout: 1_200_000,
    fileParallelism: false,
    maxWorkers: 1,
  },
});
