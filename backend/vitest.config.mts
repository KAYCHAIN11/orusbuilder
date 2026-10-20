/**
 * ============================================================================
 * ORUS BUILDER - BACKEND TEST CONFIGURATION
 * ============================================================================
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/**/*.e2e.ts'],
    setupFiles: ['./tests/setup.ts'],
    clearMocks: true,
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['src/generation/**/*.ts'],
      exclude: ['src/generation/**/*.d.ts'],
    },
  },
});
