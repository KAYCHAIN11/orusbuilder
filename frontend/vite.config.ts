/**
 * ============================================================================
 * ORUS BUILDER - VITE CONFIGURATION (FIXED)
 * ============================================================================
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // SWC optimization (remover emotion se não usar)
      plugins: [],
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@components': path.resolve(import.meta.dirname, './src/components'),
      '@pages': path.resolve(import.meta.dirname, './src/pages'),
      '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@services': path.resolve(import.meta.dirname, './src/services'),
      '@store': path.resolve(import.meta.dirname, './src/store'),
      '@types': path.resolve(import.meta.dirname, './src/types'),
      '@styles': path.resolve(import.meta.dirname, './src/styles'),
      '@utils': path.resolve(import.meta.dirname, './src/utils'),
    },
  },

  // ✅ ADICIONAR ISSO (CRÍTICO PARA TAILWIND)
  css: {
    postcss: './postcss.config.js',
  },

  server: {
    port: 3000,
    host: true,
    strictPort: true,
    open: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },

  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules[\\/]react(?:-dom|-router-dom)?[\\/]/.test(id)) return 'vendor-react';
          if (/node_modules[\\/](zustand|@tanstack[\\/]react-query)[\\/]/.test(id)) return 'vendor-state';
          if (/node_modules[\\/](framer-motion|lucide-react)[\\/]/.test(id)) return 'vendor-ui';
          if (/node_modules[\\/](@monaco-editor[\\/]react|monaco-editor)[\\/]/.test(id)) return 'vendor-editor';
          if (/node_modules[\\/](socket.io-client|axios)[\\/]/.test(id)) return 'vendor-socket';
          return undefined;
        },
      },
    },
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'axios',
      'socket.io-client',
    ],
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
