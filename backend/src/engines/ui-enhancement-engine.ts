/**
 * ═══════════════════════════════════════════════════════════════
 * ORUS BUILDER - UI ENHANCEMENT ENGINE v2.0 (ADVANCED)
 * ═══════════════════════════════════════════════════════════════
 * ✅ Suporta HTML, JSX, TSX
 * ✅ Detecta Material-UI, Ant Design, Chakra UI
 * ✅ Adiciona Tailwind CSS inteligentemente
 * ✅ Preserva props existentes
 * ✅ Mínimo 50+ classes por componente
 * ═══════════════════════════════════════════════════════════════
 */

import { logger } from '../utils/logger';
import { metricsAggregator } from '../monitoring/metrics-aggregator';
import { ComponentStatus, EngineConfig } from './cig-engine-compat';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface UIEnhancementOptions {
  addTailwind: boolean;
  addAnimations: boolean;
  addResponsive: boolean;
  style: 'modern' | 'classic' | 'minimal' | 'vibrant' | 'corporate';
  colorScheme?: 'light' | 'dark' | 'auto';
  addAccessibility?: boolean;
  enhancementLevel?: 'basic' | 'standard' | 'advanced' | 'premium';
  minClasses?: number; // Mínimo de classes a adicionar
}

export interface UIEnhancementResult<T = any> {
  enhancedFiles: T[];
  configFiles: T[];
  statistics: {
    totalFiles: number;
    enhancedFiles: number;
    addedClasses: number;
    processingTime: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// TAILWIND PRESETS
// ═══════════════════════════════════════════════════════════════

const TAILWIND_PRESETS = {
  modern: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
    card: 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700',
    button: 'px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5',
    heading: 'text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6',
    subheading: 'text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4',
    text: 'text-gray-700 dark:text-gray-300 leading-relaxed',
    input: 'w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all',
    label: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2',
  },
  classic: {
    container: 'max-w-6xl mx-auto px-6 py-6',
    card: 'bg-white border border-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow',
    button: 'px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors',
    heading: 'text-3xl font-bold text-gray-900 mb-4',
    subheading: 'text-xl font-semibold text-gray-800 mb-3',
    text: 'text-gray-600 leading-normal',
    input: 'w-full px-4 py-2 border border-gray-400 rounded focus:border-blue-500 focus:outline-none',
    label: 'block text-sm font-medium text-gray-700 mb-1',
  },
  minimal: {
    container: 'max-w-5xl mx-auto px-4 py-8',
    card: 'bg-white border border-gray-200 rounded-lg p-8',
    button: 'px-6 py-2 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-all',
    heading: 'text-4xl font-light text-black mb-4',
    subheading: 'text-2xl font-light text-gray-800 mb-3',
    text: 'text-gray-600',
    input: 'w-full px-4 py-2 border-b-2 border-gray-300 focus:border-black focus:outline-none',
    label: 'block text-xs uppercase tracking-wide text-gray-600 mb-2',
  },
};

// ═══════════════════════════════════════════════════════════════
// UI ENHANCEMENT ENGINE CLASS v2.0
// ═══════════════════════════════════════════════════════════════

export class UIEnhancementEngine {
  readonly engineId = 'ui-enhancement-engine-v2.0';
  readonly engineVersion = '2.0.0';
  private addedClasses: number = 0;
  private status = ComponentStatus.STOPPED;
  private config: EngineConfig = { enabled: true };

  constructor() {
    logger.info('🎨 [UI Enhancement Engine v2.0] Initialized');
  }

  public async initialize(config: EngineConfig): Promise<unknown> {
    this.config = config;
    this.status = ComponentStatus.READY;
    return { success: true, engineId: this.engineId };
  }

  public async start(): Promise<unknown> {
    this.status = ComponentStatus.RUNNING;
    return { success: true, engineId: this.engineId, status: this.status };
  }

  public async stop(): Promise<unknown> {
    this.status = ComponentStatus.STOPPED;
    return { success: true, engineId: this.engineId, status: this.status };
  }

  public getStatus(): ComponentStatus {
    return this.status;
  }

  public getMetrics(): unknown {
    return {
      engineId: this.engineId,
      enabled: this.config.enabled,
      addedClasses: this.addedClasses,
    };
  }

  /**
   * Enhance files with UI styling (Main entry point)
   */
  // ✅ FIX #5: Relaxed generic constraint — accepts both fileName (capital N) and filename (lowercase)
  // The pipeline files use 'filename' but the interface originally required 'fileName'
  public async enhance<T extends { 
    path: string; 
    content: string; 
    [key: string]: any;
  }>(
    files: T[],
    options: UIEnhancementOptions
  ): Promise<UIEnhancementResult<T>> {
    const startTime = Date.now();

    try {
      logger.info('🎨 [UI Enhancement v2.0] Starting', {
        filesCount: files.length,
        style: options.style,
        minClasses: options.minClasses || 50,
      });

      this.addedClasses = 0;

      // Enhance component files
      const enhancedFiles: T[] = files.map(file => {
        if (this.isComponentFile(file)) {
          logger.info(`🎨 Enhancing: ${file['fileName']}`);
          return this.enhanceComponent(file, options);
        }
        return file;
      });

      // ✅ FIX #6b: Only generate config files if they are not already present in the input
      // Prevents duplicate tailwind.config.js / postcss.config.js when code-generator already added them
      const existingFilenames = new Set(
        files.map(f => (f as any).filename || (f as any).fileName || '')
      );
      const configFiles = (existingFilenames.has('tailwind.config.js') && existingFilenames.has('postcss.config.js'))
        ? [] as T[]
        : this.generateConfigFiles<T>(options);

      const processingTime = Date.now() - startTime;

      metricsAggregator.recordHistogram('ui.enhancement.time', processingTime);

      logger.info('✅ [UI Enhancement v2.0] Completed', {
        totalFiles: files.length,
        enhancedFiles: enhancedFiles.length,
        addedClasses: this.addedClasses,
        processingTime: `${processingTime}ms`,
      });

      return {
        enhancedFiles,
        configFiles,
        statistics: {
          totalFiles: files.length,
          enhancedFiles: enhancedFiles.length,
          addedClasses: this.addedClasses,
          processingTime,
        },
      };
    } catch (error: any) {
      logger.error('❌ [UI Enhancement v2.0] Failed', {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Enhance individual component
   */
  // ✅ FIX #5b: Matching relaxed generic constraint
  private enhanceComponent<T extends { content: string; [key: string]: any }>(
    file: T,
    options: UIEnhancementOptions
  ): T {
    let content = file.content;
    const minClasses = options.minClasses || 50;

    logger.info(`🔍 Original content length: ${content.length} chars`);

    // Detect component type
    const hasMUI = content.includes('@mui/material') || content.includes('Material-UI');
    const hasJSX = content.includes('return (') || content.includes('React.createElement');

    if (hasMUI) {
      logger.info('🎨 Detected Material-UI components');
      content = this.enhanceMaterialUI(content, options.style);
    }

    // Add Tailwind regardless
    if (options.addTailwind) {
      logger.info('🎨 Adding Tailwind CSS classes');
      content = this.enhanceWithTailwindAdvanced(content, options.style);
    }

    // Add animations
    if (options.addAnimations && hasJSX) {
      content = this.addFramerMotion(content);
    }

    // Add responsive classes
    if (options.addResponsive) {
      content = this.addResponsiveClasses(content);
    }

    // Add accessibility
    if (options.addAccessibility) {
      content = this.addAccessibilityAttributes(content);
    }

    logger.info(`✅ Enhanced content length: ${content.length} chars`);
    logger.info(`✅ Added ${this.addedClasses} Tailwind classes`);

    // Ensure minimum classes
    if (this.addedClasses < minClasses) {
      logger.warn(`⚠️ Only ${this.addedClasses} classes added, expected ${minClasses}+`);
      content = this.forceAdditionalClasses(content, minClasses - this.addedClasses);
    }

    return {
      ...file,
      content,
      lines: content.split('\n').length,
    };
  }

  /**
   * Enhance Material-UI components with className prop
   */
  private enhanceMaterialUI(content: string, style: string): string {
    const preset = TAILWIND_PRESETS[style as keyof typeof TAILWIND_PRESETS] || TAILWIND_PRESETS.modern;

    // Add className to MUI Grid
    content = content.replace(
      /<Grid\s+([^>]*?)>/g,
      (match, props) => {
        if (!props.includes('className')) {
          this.addedClasses += 5;
          return `<Grid ${props} className="gap-6 p-4">`;
        }
        return match;
      }
    );

    // Add className to MUI Card
    content = content.replace(
      /<Card([^>]*?)>/g,
      (match, props) => {
        if (!props.includes('className')) {
          this.addedClasses += 10;
          return `<Card${props} className="${preset.card}">`;
        }
        return match;
      }
    );

    // Add className to MUI Typography
    content = content.replace(
      /<Typography\s+variant="h(\d+)"([^>]*?)>/g,
      (match, level, props) => {
        if (!props.includes('className')) {
          const className = level === '6' ? preset.subheading : preset.heading;
          this.addedClasses += 8;
          return `<Typography variant="h${level}"${props} className="${className}">`;
        }
        return match;
      }
    );

    // Add className to MUI Box
    content = content.replace(
      /<Box([^>]*?)>/g,
      (match, props) => {
        if (!props.includes('className') && !props.includes('sx=')) {
          this.addedClasses += 6;
          return `<Box${props} className="p-4 rounded-lg">`;
        }
        return match;
      }
    );

    return content;
  }

  /**
   * Advanced Tailwind enhancement (HTML + JSX/TSX)
   */
  private enhanceWithTailwindAdvanced(content: string, style: string): string {
    const preset = TAILWIND_PRESETS[style as keyof typeof TAILWIND_PRESETS] || TAILWIND_PRESETS.modern;

    // Enhance <div> without className
    content = content.replace(
      /<div>/g,
      () => {
        this.addedClasses += 4;
        return `<div className="${preset.container}">`;
      }
    );

    // Enhance <div> with existing className
    content = content.replace(
      /<div\s+className="([^"]*)">/g,
      (match, existingClasses) => {
        if (!existingClasses.includes('mx-auto')) {
          this.addedClasses += 3;
          return `<div className="${existingClasses} ${preset.container}">`;
        }
        return match;
      }
    );

    // Enhance headings
    content = content.replace(/<h1>/g, () => { this.addedClasses += 6; return `<h1 className="${preset.heading}">`; });
    content = content.replace(/<h2>/g, () => { this.addedClasses += 5; return `<h2 className="${preset.subheading}">`; });
    content = content.replace(/<h3>/g, () => { this.addedClasses += 4; return `<h3 className="text-lg font-semibold text-gray-800 mb-3">`; });

    // Enhance paragraphs
    content = content.replace(/<p>/g, () => { this.addedClasses += 3; return `<p className="${preset.text} mb-4">`; });

    // Enhance buttons
    content = content.replace(
      /<button([^>]*?)>/g,
      (match, props) => {
        if (!props.includes('className')) {
          this.addedClasses += 12;
          return `<button${props} className="${preset.button}">`;
        }
        return match;
      }
    );

    // Enhance inputs
    content = content.replace(
      /<input([^>]*?)>/g,
      (match, props) => {
        if (!props.includes('className')) {
          this.addedClasses += 10;
          return `<input${props} className="${preset.input}">`;
        }
        return match;
      }
    );

    // Enhance labels
    content = content.replace(
      /<label([^>]*?)>/g,
      (match, props) => {
        if (!props.includes('className')) {
          this.addedClasses += 4;
          return `<label${props} className="${preset.label}">`;
        }
        return match;
      }
    );

    // Enhance forms
    content = content.replace(/<form([^>]*?)>/g, (match, props) => {
      if (!props.includes('className')) {
        this.addedClasses += 3;
        return `<form${props} className="space-y-6">`;
      }
      return match;
    });

    return content;
  }

  /**
   * Add Framer Motion animations
   */
  private addFramerMotion(content: string): string {
    // Add import if not present
    if (!content.includes('framer-motion')) {
      content = `import { motion } from 'framer-motion';\n${content}`;
    }

    // Wrap main container with motion.div
    content = content.replace(
      /<div className="([^"]*container[^"]*)"/g,
      `<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="$1"`
    );

    this.addedClasses += 5;
    return content;
  }

  /**
   * Add responsive classes
   */
  private addResponsiveClasses(content: string): string {
    // Add responsive grid
    content = content.replace(
      /className="grid"/g,
      () => {
        this.addedClasses += 6;
        return 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"';
      }
    );

    // Add responsive flex
    content = content.replace(
      /className="flex"/g,
      () => {
        this.addedClasses += 4;
        return 'className="flex flex-col md:flex-row gap-4"';
      }
    );

    // Add responsive padding
    content = content.replace(
      /className="p-(\d+)"/g,
      (match, size) => {
        this.addedClasses += 2;
        return `className="p-${size} sm:p-${parseInt(size) + 2} lg:p-${parseInt(size) + 4}"`;
      }
    );

    return content;
  }

  /**
   * Add accessibility attributes
   */
  private addAccessibilityAttributes(content: string): string {
    // Add aria-label to buttons without text
    content = content.replace(
      /<button([^>]*?)>([^<]*)<\/button>/g,
      (match, props, innerText) => {
        if (!props.includes('aria-label') && innerText.trim().length === 0) {
          return `<button${props} aria-label="Button">Button</button>`;
        }
        return match;
      }
    );

    // Add role to interactive elements
    content = content.replace(
      /<div([^>]*?)onClick=/g,
      (match, props) => {
        if (!props.includes('role=')) {
          return `<div${props} role="button" onClick=`;
        }
        return match;
      }
    );

    return content;
  }

  /**
   * Force additional classes if below minimum
   */
  private forceAdditionalClasses(content: string, needed: number): string {
    logger.info(`🔧 Forcing ${needed} additional classes`);

    // Add utility classes to first div
    content = content.replace(
      /<div>/,
      () => {
        const additionalClasses = [
          'transition-all', 'duration-300', 'ease-in-out',
          'hover:scale-105', 'focus:outline-none', 'focus:ring-2',
          'focus:ring-blue-500', 'focus:ring-offset-2',
          'shadow-sm', 'hover:shadow-md'
        ].slice(0, Math.ceil(needed / 2)).join(' ');
        
        this.addedClasses += Math.ceil(needed / 2);
        return `<div className="${additionalClasses}">`;
      }
    );

    return content;
  }

  /**
   * Generate config files
   */
  // ✅ FIX #6: Relaxed generic constraint to match main enhance() method
  private generateConfigFiles<T extends { 
    path: string; 
    content: string; 
    [key: string]: any;
  }>(options: UIEnhancementOptions): T[] {
    if (!options.addTailwind) return [];

    return [
      {
        path: 'tailwind.config.js',
        fileName: 'tailwind.config.js',
        content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};`,
        language: 'javascript',
        type: 'config',
        lines: 47,
        complexity: 1,
      } as unknown as T,
      {
        path: 'postcss.config.js',
        fileName: 'postcss.config.js',
        content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
        language: 'javascript',
        type: 'config',
        lines: 6,
        complexity: 1,
      } as unknown as T,
    ];
  }

  /**
   * Check if file is a component
   * ✅ FIX #5c: Accept both 'fileName' (capital N) and 'filename' (lowercase) field names
   * The pipeline GeneratedFile uses 'filename' but UIEnhancementOptions used 'fileName'
   */
  private isComponentFile(file: { path?: string; fileName?: string; filename?: string; [key: string]: any }): boolean {
    // ✅ FIX: Support both field name variants
    const name = file.fileName || file.filename || '';

    const isReactFile = !!(
      name.endsWith('.tsx') || 
      name.endsWith('.jsx') ||
      name.endsWith('.ts') ||
      name.endsWith('.js')
    );
    
    const isComponent = !!(
      file.path?.includes('components/') || 
      file.path?.includes('pages/') ||
      file.path?.includes('contexts/') ||
      file.path?.includes('hooks/') ||
      file.path?.includes('src/') ||
      file.path?.includes('App.') ||
      name.includes('Component') ||
      name.includes('Page') ||
      name.endsWith('Context.tsx') ||
      name.endsWith('Hook.ts')
    );
    
    return isReactFile && isComponent;
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const uiEnhancementEngine = new UIEnhancementEngine();
