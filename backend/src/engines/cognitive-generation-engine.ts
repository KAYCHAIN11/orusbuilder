/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE GENERATION ENGINE - MAIN PIPELINE (CORRECTED)
 * ═══════════════════════════════════════════════════════════════
 * 
 * VERSION: 3.0 - FULLY INTEGRATED & CORRECTED
 * LAST_MODIFIED: 2025-10-24T14:16:00-03:00
 * STATUS: ✅ ZERO COMPILATION ERRORS
 */

// ═══════════════════════════════════════════════════════════════
// SECTION 1: IMPORTS & DEPENDENCIES
// ═══════════════════════════════════════════════════════════════

import { logger } from '../utils/logger';

// Trinity subsystem
import { TrinityOrchestrator } from '../trinity/trinity-orchestrator';
import { AIProviderFactory } from '../trinity/ai-provider-factory';

// Generation subsystem
import { codeGenerator } from '../generation/code-generator';
import { uiGenerator } from '../generation/ui-generator';
import { analyzeVisualIntent, type VisualIntent } from '../generation/visual-intent';
import { backendGenerator } from '../generation/backend-generator';
import { cigValidator } from '../generation/cig-validator';
import { qualityAnalyzer } from '../generation/quality-analyzer';
import { codeOptimizer } from '../generation/code-optimizer';
import { dependencyResolver } from '../generation/dependency-resolver';
import { CodeLanguage } from '../generation/cig-validator';
import { TrinityErrorCode } from '../core/types/trinity.types';
import { createI18nText } from '../core/types/i18n.types';
import type { ProductBlueprint } from '../blueprint/product-blueprint';

// Prompt subsystem
import { PromptProcessor } from '../prompt/prompt-processor';

import { intentClassifier } from '../prompt/intent-classifier';
import { requirementsExtractor } from '../prompt/requirements-extractor';

// Template subsystem
import { templateManager } from '../templates/template-manager';

// Types from actual files
import type {
  TemplateSearchQuery,
  TemplateSearchResult,
  Framework,
  ThemeConfig
} from '../core/types/template.types';

import type {
  TrinityRequest,
  TrinityResponse,
  TrinityMode,
  TrinityConfig
} from '../core/types/trinity.types';

import type {
  I18nText,
  SupportedLanguage,
  ResponseWrapper,
  ErrorResponse
} from '../core/types/index';

// Generator-specific types
import type {
  UIGenerationInput,
  UIGenerationResult,
} from '../generation/ui-generator';

import type {
  BackendGenerationInput,
  BackendGenerationResult,
  AuthConfig
} from '../generation/backend-generator';

import type {
  CodeGenerationInput,
  GenerationResult as CodeGenerationResult,

} from '../generation/code-generator';
import type {
  ValidationInput,
  ExtendedValidationResult
} from '../generation/cig-validator';

import type {
  QualityAnalysisInput,
  QualityAnalysisResult,
} from '../generation/quality-analyzer';

import type {
  OptimizationInput,
  OptimizationResult,
} from '../generation/code-optimizer';
import { detectScopeFromPrompt } from '../generation/prompt-scope-detector';


// ═══════════════════════════════════════════════════════════════
// SECTION 2: LOCAL INTERFACES 
// ═══════════════════════════════════════════════════════════════

/**
 * Scope types para geração precisa de código
 */
export enum ScopeType {
  SINGLE_COMPONENT = 'single-component',
  FEATURE = 'feature',
  PAGE = 'page',
  BACKEND = 'backend',
  FULLSTACK = 'fullstack',
  DATABASE = 'database',
  LANDING_PAGE = 'landing_page'
}


// ═══════════════════════════════════════════════════════════════
// COMPLEXITY LEVEL TYPE
// ═══════════════════════════════════════════════════════════════
type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'very_high';

// ═══════════════════════════════════════════════════════════════
// SCOPE DETECTION RESULT
// ═══════════════════════════════════════════════════════════════
export interface ScopeDetectionResult {
  type: ScopeType;
  complexity: ComplexityLevel;
  confidence: number;
  expectedFileCount: {
    min: number;
    max: number;
  };
  shouldIncludeFrontend: boolean;
  shouldIncludeBackend: boolean;
  shouldIncludeDatabase: boolean;
  detectedKeywords: string[];
}

interface PromptScopeSignals {
  hasFrontend: boolean;
  hasBackend: boolean;
  hasDatabase: boolean;
  hasFullstack: boolean;
  excludesFrontend: boolean;
  excludesBackend: boolean;
  excludesDatabase: boolean;
}

function detectPromptScopeSignals(prompt: string): PromptScopeSignals {
  const includesAny = (terms: string[]) => terms.some(term => prompt.includes(term));
  const frontendOnly = includesAny([
    'somente o frontend', 'somente frontend', 'apenas o frontend', 'apenas frontend',
    'só o frontend', 'so o frontend', 'frontend only', 'only the frontend',
  ]);
  const backendOnly = includesAny([
    'somente o backend', 'somente backend', 'apenas o backend', 'apenas backend',
    'só o backend', 'so o backend', 'backend only', 'only the backend',
  ]);

  const excludesBackend = frontendOnly || includesAny([
    'sem backend', 'não crie backend', 'nao crie backend', 'não inclua backend',
    'nao inclua backend', 'no backend', 'without backend',
  ]);
  const excludesFrontend = backendOnly || includesAny([
    'sem frontend', 'não crie frontend', 'nao crie frontend', 'não inclua frontend',
    'nao inclua frontend', 'no frontend', 'without frontend',
  ]);
  const excludesDatabase = frontendOnly || includesAny([
    'sem banco', 'sem database', 'sem banco de dados', 'não crie banco',
    'nao crie banco', 'não use banco', 'nao use banco', 'nem banco',
    'no database', 'without database',
  ]);

  const hasFrontend = !excludesFrontend && includesAny(['frontend', 'react', 'interface', 'ui']);
  const hasBackend = !excludesBackend && includesAny(['backend', 'express', 'api', 'servidor']);
  const hasDatabase = !excludesDatabase && includesAny([
    'database', 'prisma', 'mongodb', 'banco de dados', 'banco ', 'postgres', 'mysql', 'sqlite', ' sql',
  ]);
  const hasFullstackKeyword = includesAny([
    'fullstack', 'full-stack', 'full stack', 'aplicação completa', 'aplicacao completa',
    'frontend e backend', 'frontend + backend', 'react e express', 'react + express',
    'complete application', 'sistema completo', 'blog system', 'complete system', 'full system',
  ]);

  return {
    hasFrontend,
    hasBackend,
    hasDatabase,
    hasFullstack: !excludesFrontend && !excludesBackend && hasFullstackKeyword,
    excludesFrontend,
    excludesBackend,
    excludesDatabase,
  };
}
/**
 * Resultado da detecção de scope
 */
// ✅ FIX #11: Duplicate ScopeDetectionResult interface removed (was defined twice)


/**
 * Generation Request
 */
export interface GenerationRequest {
  // Identification
  id?: string;
  requestId?: string;
  userId?: string;
  projectId?: string;

  // Core
  prompt: string;
  framework?: string;
  language?: string;
  productBlueprint?: ProductBlueprint;

  // Context
  context?: {
    domain?: string;
    language?: string;
    complexity?: string;
    stylePreferences?: any;
    colorPalette?: any;
    personality?: string;
  };

  // Options & Configuration
  options?: any;
  version?: number;

  // Trinity
  enableTrinity?: boolean;
  specifications?: {
    complexity?: string;
    includeTests?: boolean;
    detectedContext?: {
      visualIntent?: VisualIntent;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };

  // Tracking & Metadata
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GeneratedComponent {
  name: string;
  type: 'component' | 'page' | 'service' | 'api' | 'model' | 'screen';
  code: string;
  path: string;
  language: string;
  framework: string;
  dependencies: string[];
  files?: Array<{ path: string; content: string }>;
  metadata: {
    linesOfCode: number;
    complexity: number;
    generated: boolean;
    autoFixed?: boolean;
    validated?: boolean;
    cigCompliant?: boolean;
    validationScore?: number;
    qualityScore?: number;
    coverage?: number;
    optimized?: boolean;
    optimizations?: string[];
  }
}

/**
 * Generation Result
 */
export interface GenerationResult {
  success: boolean;
  components: GeneratedComponent[];
  error?: string;
  metadata?: {
    framework: string;
    processingTime: number;
    generatedAt: string;
     scope?: string; 
    [key: string]: any; 
  };
  qualityScore: number;
  dependencies: string[];
  packageJson: string;
  readme: string;

  // ✅ Propriedades esperadas pelo generation.controller.ts
  data?: {
    components: GeneratedComponent[];
    files?: Array<{ path: string; content: string }>;
    structure?: any;
  };
  metrics?: {
    totalTime?: number;
    generationTime?: number;
    linesOfCode?: number;
    complexity?: number;
  };
  qualityReport?: {
    score: number;
    issues?: any[];
    recommendations?: any[];
    summary?: { 
      overallScore?: number;
    };
  };
}

export interface GenerationRepairRequest {
  prompt: string;
  files: Array<{ path: string; content: string }>;
  diagnostics: Array<{
    stage: string;
    category: string;
    message: string;
    output: string;
    affectedFiles: string[];
  }>;
  attempt: number;
}

export interface GenerationRepairResult {
  success: boolean;
  files: Array<{ path: string; content: string }>;
  changedFiles: string[];
  error?: string;
}

/**
 * Technical Specification
 */
export interface TechnicalSpecification {
  architecture: {
    style: string;
    layers: string[];
    patterns: string[];
  };
  components: Array<{
    name: string;
    type: string;
    purpose: string;
    responsibilities: string[];
  }>;
  dataModel: any[];
  technologies: {
    frontend: string[];
    backend: string[];
    database: string[];
    deployment: string[];
  };
  quality: {
    testingStrategy: string;
    securityRequirements: string[];
    performanceTargets: string[];
  };
}

/**
 * Prompt Analysis Result
 */
export interface PromptAnalysisResult {
  originalPrompt: string;
  intent: {
    type: string;
    description: string;
    confidence: number;
    subIntents: any[];
  };
  entities: any[];
  requirements: any[];
  ambiguities: any[];
  context: {
    domain: string;
    complexity: string;
    stylePreferences?: any;
    colorPalette?: any;
    personality?: string;
  };
  specification?: TechnicalSpecification;
  confidence: number;
}

/**
 * ValidationResult (local wrapper)
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  suggestions?: string[];
}

/**
 * Quality Score
 */
export interface QualityScore {
  overallScore: number;
  testCoverage?: number;
}

/**
 * Pipeline stage result
 */
interface PipelineStageResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: any;
  metadata?: Record<string, any>;
}

/**
 * Generation context
 */
interface GenerationContext {
  prompt: string;
  analysis: PromptAnalysisResult;
  templates: any[];
  framework: string;
  domain: string;
  specification: TechnicalSpecification;
  trinity?: TrinityResponse<any>;
    scope?: ScopeDetectionResult; 

}

/**
 * Pipeline configuration
 */
interface PipelineConfig {
  enableValidation: boolean;
  enableOptimization: boolean;
  enableQualityAnalysis: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}

/**
 * Cognitive Generation Engine
 * Main orchestrator for code generation pipeline
 */
// ═══════════════════════════════════════════════════════════════
// SECTION 3: COGNITIVE GENERATION ENGINE CLASS (FINAL VERSION)
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// SECTION 3: COGNITIVE GENERATION ENGINE CLASS (COMPATIBLE MODE)
// ═══════════════════════════════════════════════════════════════

export class CognitiveGenerationEngine {
  readonly engineId = 'cognitive-generation-engine-v2.0';
  readonly engineVersion = '2.0.0';
  private context?: GenerationContext;
  private io?: any;
  private running = false;
  private initialized = false;

  public setSocketIO(io: any): void {
    this.io = io;
  }

  public async initialize(...args: any[]): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    logger.info('🧠 CognitiveGenerationEngine initialized');
  }

/**
 * Start the Cognitive Generation Engine
 * Initializes all subsystems and makes engine ready for generation
 */
public async start(): Promise<void> {
  if (this.running) return;
  console.log('[CognitiveEngine] Starting...');
  
  // Ensure initialized first
  await this.initialize();
  this.running = true;
  
  console.log('[CognitiveEngine] ✅ Started successfully');
  logger.info('CognitiveGenerationEngine started and ready', {
    component: 'CognitiveGenerationEngine'
  });
}

  public async stop(): Promise<void> {
    this.running = false;
  }

  public getStatus(): 'running' | 'stopped' {
    return this.running ? 'running' : 'stopped';
  }

  public getMetrics(): unknown {
    return {
      engineId: this.engineId,
      initialized: this.initialized,
      running: this.running,
    };
  }


   /**
   * Main entry point: Generate code from prompt
   */
  public async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔥🔥🔥 [CognitiveEngine] generate() CHAMADO! 🔥🔥🔥');
    console.log('[CognitiveEngine] Request:', {
      promptLength: request.prompt.length,
      framework: request.framework,
      hasId: !!request.id
    });
    console.log('═══════════════════════════════════════════════════════');

    try {
      logger.info('🚀 [CognitiveEngine] Starting code generation', {
        component: 'CognitiveGenerationEngine',
        metadata: {
          promptLength: request.prompt.length,
          framework: request.framework || 'react'
        }
      });

      // Create generation pipeline
      const pipeline = new GenerationPipeline();
      console.log('═══════════════════════════════════════════════════════');
      console.log('🔍 [CognitiveEngine] ANTES de chamar pipeline.execute()');
      console.log('[CognitiveEngine] request type:', typeof request);
      console.log('[CognitiveEngine] request keys:', Object.keys(request || {}));
      console.log('═══════════════════════════════════════════════════════');

      // Execute pipeline
      logger.info('📊 [CognitiveEngine] Executing 4-stage pipeline...');
      const result = await pipeline.execute(request);

      logger.info('✅ [CognitiveEngine] Pipeline execution complete', {
        success: result.success,
        componentsCount: result.components?.length || 0,
        error: result.error || 'none'
      });

      const processingTime = Date.now() - startTime;
// ═══════════════════════════════════════════════════════════
// AÇÃO 1: COLETAR EXPORTS REALMENTE GERADOS
// ═══════════════════════════════════════════════════════════
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('AÇÃO 1: Coletando exports dos componentes gerados...');
console.log('═══════════════════════════════════════════════════════════');

const generatedExports = new Set<string>();

// Percorrer cada componente gerado
if (result.components && Array.isArray(result.components)) {
  result.components.forEach((comp: GeneratedComponent) => {
    if (!comp.code) return;
    
    // Regex para capturar exports:
    // - export class Nome
    // - export interface Nome
    // - export function Nome
    // - export const Nome
    // - export type Nome
    const exportRegex = /export\s+(class|interface|function|const|type)\s+(\w+)/g;
    let match: RegExpExecArray | null;
    
    while ((match = exportRegex.exec(comp.code)) !== null) {
      const exportName = match[2];
      if (exportName) {
        generatedExports.add(exportName);
        logger.debug(`Export coletado: ${exportName} de ${comp.name}`);
      }
    }
  });
}

// Armazenar no resultado para uso posterior
(result as any).generatedExports = Array.from(generatedExports);

console.log('');
console.log('✅ Exports coletados com sucesso!');
console.log(`   Total de exports: ${generatedExports.size}`);
console.log(`   Primeiros 10: ${Array.from(generatedExports).slice(0, 10).join(', ')}`);
console.log('═══════════════════════════════════════════════════════════');
console.log('');

logger.info('CognitiveEngine Exports coletados', {
  totalExports: generatedExports.size,
  exportsPreview: Array.from(generatedExports).slice(0, 10)
});

      // Verificar se pipeline retornou sucesso
      if (!result.success) {
        logger.error('❌ [CognitiveEngine] Pipeline returned failure', {
          error: result.error,
          processingTime
        });

        return {
          success: false,
          components: [],
          error: result.error || 'Pipeline execution failed',
          qualityScore: 0,
          dependencies: [],
          packageJson: '',
          readme: '',
          data: {
            components: [],
            files: [],
            structure: {}
          },
          metrics: {
            totalTime: processingTime,
            generationTime: processingTime,
            linesOfCode: 0,
            complexity: 0
          },
          qualityReport: {
            score: 0,
            issues: [{ message: result.error || 'Unknown error' }],
            recommendations: [],
            summary: {
              overallScore: 0
            }
          }
        };
      }

      // ✅ Calcular métricas
      const linesOfCode = result.components.reduce((acc, c) =>
        acc + (c.code?.split('\n').length || 0), 0
      );

      logger.info('✅ [CognitiveEngine] Generation successful', {
        totalTime: processingTime,
        components: result.components.length,
        linesOfCode
      });

      // ✅ IMPORTANTE: RETORNAR O RESULTADO
      return {
        ...result,
        metadata: {
          framework: request.framework || 'react',
          processingTime,
          generatedAt: new Date().toISOString()
        },
        data: {
          components: result.components,
          files: result.components.map(c => ({
            path: this.buildComponentFilePath(c),
            content: c.code || ''
          })),
          structure: {
            frontend: result.components.filter(c => c.type === 'component').length,
            backend: result.components.filter(c => c.type === 'api').length,
            total: result.components.length
          }
        },
        metrics: {
          totalTime: processingTime,
          generationTime: processingTime,
          linesOfCode: linesOfCode,
          complexity: result.qualityScore
        },
        qualityReport: {
          score: result.qualityScore,
          issues: [],
          recommendations: [],
          summary: {
            overallScore: result.qualityScore
          }
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error('❌ [CognitiveEngine] Code generation failed', {
        component: 'CognitiveGenerationEngine',
        error: (error as Error).message,
        stack: (error as Error).stack,
        processingTime
      });

      // ✅ IMPORTANTE: RETORNAR RESULTADO DE ERRO
      return {
        success: false,
        components: [],
        error: (error as Error).message,
        qualityScore: 0,
        dependencies: [],
        packageJson: '',
        readme: '',
        data: {
          components: [],
          files: [],
          structure: {}
        },
        metrics: {
          totalTime: processingTime,
          generationTime: processingTime,
          linesOfCode: 0,
          complexity: 0
        },
        qualityReport: {
          score: 0,
          issues: [{ message: (error as Error).message }],
          recommendations: [],
          summary: {
            overallScore: 0
          }
        }
      };
    }
  }

  public async repair(request: GenerationRepairRequest): Promise<GenerationRepairResult> {
    try {
      const provider = AIProviderFactory.getProvider();
      const affected = new Set(
        request.diagnostics.flatMap(diagnostic => diagnostic.affectedFiles)
          .map(file => file.replace(/\\/g, '/').replace(/^\.\//, ''))
      );
      const ansiPattern = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
      for (const diagnostic of request.diagnostics) {
        const text = `${diagnostic.message}\n${diagnostic.output || ''}`.replace(ansiPattern, '');
        for (const match of text.matchAll(/(?:^|[\s(])((?:backend\/|frontend\/)?src\/(?:controllers|services|repositories|models|routes|validators|components|pages|hooks|contexts|utils)\/[A-Za-z0-9._/-]+\.[cm]?[jt]sx?)/gm)) {
          if (match[1]) affected.add(match[1].replace(/^\.\//, ''));
        }
      }
      const contractResources = new Set<string>();
      for (const path of affected) {
        const match = path.match(/(?:^|\/)src\/(?:controllers|services|repositories|models)\/([^/]+)\.(?:controller|service|repository|model)\.ts$/);
        if (match?.[1]) contractResources.add(match[1]);
      }
      if (contractResources.size > 0) {
        for (const file of request.files) {
          const normalized = file.path.replace(/\\/g, '/').replace(/^\.\//, '');
          if ([...contractResources].some(resource => new RegExp(`(?:^|/)src/(?:controllers|services|repositories|models)/${resource}\\.(?:controller|service|repository|model)\\.ts$`).test(normalized))) {
            affected.add(normalized);
          }
        }
        affected.add('backend/prisma/schema.prisma');
      }
      const selected = request.files.filter(file =>
        affected.size === 0 ||
        affected.has(file.path) ||
        affected.has(file.path.replace(/^(?:.*\/)?(?:frontend|backend)\//, '')) ||
        /(^|\/)(package\.json|tsconfig.*\.json|schema\.prisma|vite\.config\.[jt]s)$/.test(file.path)
      );
      const repairFiles = (selected.length > 0 ? selected : request.files).slice(0, 40);
      const payload = JSON.stringify({
        originalPrompt: request.prompt,
        attempt: request.attempt,
        diagnostics: request.diagnostics,
        files: repairFiles
      }).slice(0, 120000);
      const response = await provider.chat([
        {
          role: 'system',
          content: 'Repair a generated TypeScript project from compiler, test, Prisma, or build diagnostics. Return only a JSON array of complete replacement files in the form [{"path":"relative/path","content":"complete content"}]. Change only files required to fix the reported errors. Treat controller, service, repository, model, and Prisma schema as one contract. Preserve every existing export and public method unless the diagnostic explicitly requires its removal. Preserve response shapes, behavior, and architecture. Do not use markdown.'
        },
        { role: 'user', content: payload }
      ], { temperature: 0.1, maxTokens: 8000 });
      let raw = response.content.trim();
      const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenced?.[1]) raw = fenced[1].trim();
      const array = raw.match(/\[[\s\S]*\]/)?.[0];
      if (!array) throw new Error('Repair provider returned no JSON file array');
      const parsed = JSON.parse(array) as unknown;
      if (!Array.isArray(parsed)) throw new Error('Repair provider returned an invalid payload');
      const existingPaths = new Map<string, string>();
      for (const file of request.files) {
        const normalized = file.path.replace(/\\/g, '/').replace(/^\.\//, '');
        existingPaths.set(normalized, normalized);
        existingPaths.set(normalized.replace(/^(?:.*\/)?(?:frontend|backend)\//, ''), normalized);
      }
      const replacements = parsed.filter((file): file is { path: string; content: string } =>
        !!file &&
        typeof file === 'object' &&
        typeof (file as Record<string, unknown>)['path'] === 'string' &&
        typeof (file as Record<string, unknown>)['content'] === 'string'
      ).map(file => {
        const normalized = file.path.replace(/\\/g, '/').replace(/^\.\//, '');
        const canonical = existingPaths.get(normalized)
          || existingPaths.get(normalized.replace(/^(?:.*\/)?(?:frontend|backend)\//, ''))
          || normalized;
        return { path: canonical, content: file.content };
      }).filter(file => file.path.length > 0 && !file.path.startsWith('../') && !/^([A-Za-z]:|\/)/.test(file.path))
        .filter(file => {
          const previous = request.files.find(candidate => candidate.path.replace(/\\/g, '/').replace(/^\.\//, '') === file.path);
          if (!previous || !/(?:^|\/)src\/(?:controllers|services|repositories|models)\//.test(file.path)) return true;
          const exports = [...previous.content.matchAll(/export\s+(?:default\s+)?(?:abstract\s+)?(?:class|const|interface|type|function|enum)\s+([A-Za-z_$][\w$]*)/g)].map(match => match[1]!);
          const methods = [...previous.content.matchAll(/^\s{2}(?:public\s+|private\s+|protected\s+)?(?:readonly\s+)?(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(/gm)].map(match => match[1]!);
          return exports.every(name => new RegExp(`\\b${name}\\b`).test(file.content))
            && methods.every(name => new RegExp(`\\b${name}\\s*\\(`).test(file.content));
        });
      if (replacements.length === 0) throw new Error('Repair provider returned no usable files');

      const merged = new Map(request.files.map(file => [file.path.replace(/\\/g, '/').replace(/^\.\//, ''), file]));
      for (const file of replacements) merged.set(file.path, file);
      return {
        success: true,
        files: Array.from(merged.values()),
        changedFiles: replacements.map(file => file.path)
      };
    } catch (error) {
      return {
        success: false,
        files: request.files,
        changedFiles: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // ------------------------------------------------------------------
  // HELPER METHODS (Adapted)
  // ------------------------------------------------------------------

  private buildComponentFilePath(component: GeneratedComponent): string {
    const path = (component.path || '').replace(/\\/g, '/').replace(/\/$/, '');
    const name = component.name || 'generated.ts';

    if (!path) return name;
    if (path === name || path.endsWith(`/${name}`)) return path;
    return `${path}/${name}`;
  }

  private async buildGenerationContext(request: GenerationRequest): Promise<GenerationContext> {
    const analysis = await this.analyzePrompt(request);
    const scope = this.detectScopeFromIntent(analysis, request.prompt);
    
    return {
      prompt: request.prompt,
      analysis,
      scope, // Agora permitido pois adicionamos 'scope?' na interface
      templates: [],
      framework: request.framework || 'react',
      domain: analysis.context?.domain || 'general',
      specification: analysis.specification || {
        architecture: { style: 'modular', layers: [], patterns: [] },
        components: [],
        dataModel: [],
        technologies: { frontend: [], backend: [], database: [], deployment: [] },
        quality: { testingStrategy: 'unit', securityRequirements: [], performanceTargets: [] }
      }
    };
  }
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCOPE DETECTION FROM INTENT - VERSION 4.0 (AI AUTO-DETECTION ONLY)
 * ═══════════════════════════════════════════════════════════════════════════
 */
public detectScopeFromIntent(
  analysis: PromptAnalysisResult,
  originalPrompt: string
): ScopeDetectionResult {
  return detectScopeFromPrompt(originalPrompt) as ScopeDetectionResult;

  const promptLower = originalPrompt.toLowerCase();
  const detectedKeywords: string[] = [];
  const scopeSignals = detectPromptScopeSignals(promptLower);

  console.log('🧠 [Scope] ═════════════════════════════════════════════════');
  console.log('🧠 [Scope] AI AUTO-DETECTION MODE (v4.0)');
  console.log('🧠 [Scope] Prompt length:', originalPrompt.length);
  console.log('🧠 [Scope] ═════════════════════════════════════════════════');

  // PRIORITY 1: SINGLE_COMPONENT
  const singleComponentKeywords = [
    'crie um componente',
    'componente de botão',
    'componente de',
    'componente customizável',
    'single component',
    'um componente',
    'component with',
    'create a component',
    'build a component',
    'apenas um',
    'só um',
    'somente um',
    'simples componente',
    'apenas o componente',
    'só o componente',
    'botão',
    'button',
    'card',
    'input',
    'select',
    'dropdown'
  ];

  const hasSingleComponentKeyword = singleComponentKeywords.some(kw =>
    promptLower.includes(kw)
  );

  if (
    hasSingleComponentKeyword &&
    !promptLower.includes('aplicação') &&
    !promptLower.includes('aplicacao') &&
    !promptLower.includes('sistema') &&
    !promptLower.includes('api') &&
    !promptLower.includes('fullstack') &&
    !promptLower.includes('full-stack') &&
    !scopeSignals.hasBackend &&
    !scopeSignals.hasDatabase
  ) {
    detectedKeywords.push('single_component');
    console.log('✅ [Scope] AUTO-DETECTED: SINGLE_COMPONENT');
    return {
      type: ScopeType.SINGLE_COMPONENT,
      complexity: 'simple' as ComplexityLevel,
      confidence: 0.9,
      expectedFileCount: { min: 3, max: 5 },
      shouldIncludeFrontend: true,
      shouldIncludeBackend: false,
      shouldIncludeDatabase: false,
      detectedKeywords
    };
  }

  // PRIORITY 2: FULLSTACK
  const hasFullstack = scopeSignals.hasFullstack;
  const hasFrontend = scopeSignals.hasFrontend;
  const hasBackend = scopeSignals.hasBackend;
  const hasDatabase = scopeSignals.hasDatabase;

  if (hasFullstack || (hasFrontend && hasBackend)) {
    detectedKeywords.push('fullstack');
    console.log('✅ [Scope] AUTO-DETECTED: FULLSTACK');
    return {
      type: ScopeType.FULLSTACK,
      complexity: 'very_high' as ComplexityLevel,
      confidence: 0.95,
      expectedFileCount: { min: 30, max: 60 },
      shouldIncludeFrontend: true,
      shouldIncludeBackend: true,
      shouldIncludeDatabase: hasDatabase,
      detectedKeywords
    };
  }

  // PRIORITY 3: BACKEND API ONLY
  const backendKeywords = [
    'api',
    'api rest',
    'api endpoint',
    'endpoint',
    'endpoints',
    'restful',
    'restful api',
    'backend',
    'express',
    'fastify',
    'nestjs',
    'routes',
    'controllers',
    'middleware',
    'servidor',
    'production-ready',
    'error handling'
  ];

  const hasBackendKeyword = !scopeSignals.excludesBackend && backendKeywords.some(keyword =>
    promptLower.includes(keyword)
  );

  const hasExplicitFrontend = 
    promptLower.includes('frontend') ||
    promptLower.includes('react') ||
    promptLower.includes('interface') ||
    promptLower.includes('ui component') ||
    promptLower.includes('frontend page');

  if (hasBackendKeyword && !hasFullstack && !hasExplicitFrontend) {
    detectedKeywords.push('backend');
    console.log('✅ [Scope] AUTO-DETECTED: BACKEND');
    return {
      type: ScopeType.BACKEND,
      complexity: 'high' as ComplexityLevel,
      confidence: 0.9,
      expectedFileCount: { min: 10, max: 20 },
      shouldIncludeFrontend: false,
      shouldIncludeBackend: true,
      shouldIncludeDatabase: hasDatabase,
      detectedKeywords
    };
  }

  // PRIORITY 4: LANDING PAGE
  const landingPageKeywords = [
    'landing page',
    'landing-page',
    'página de destino',
    'hero section',
    'call to action',
    'cta',
    'testimonials',
    'marketing page'
  ];

  const hasLandingPageKeyword = landingPageKeywords.some(keyword =>
    promptLower.includes(keyword)
  );

  if (hasLandingPageKeyword) {
    detectedKeywords.push('landing_page');
    console.log('✅ [Scope] AUTO-DETECTED: LANDING_PAGE');
    return {
      type: ScopeType.LANDING_PAGE,
      complexity: 'moderate' as ComplexityLevel,
      confidence: 0.85,
      expectedFileCount: { min: 8, max: 15 },
      shouldIncludeFrontend: true,
      shouldIncludeBackend: false,
      shouldIncludeDatabase: false,
      detectedKeywords
    };
  }

  // PRIORITY 5: DASHBOARD / FEATURE RICH
  const featureRichKeywords = [
    'dashboard',
    'admin panel',
    'painel',
    'gráficos',
    'charts',
    'analytics',
    'metrics',
    'relatórios',
    'multiple components',
    'vários componentes'
  ];

  const hasFeatureRichKeyword = featureRichKeywords.some(keyword =>
    promptLower.includes(keyword)
  );

  if (hasFeatureRichKeyword) {
    detectedKeywords.push('feature_rich');
    console.log('✅ [Scope] AUTO-DETECTED: FEATURE_RICH');
    return {
      type: ScopeType.FEATURE,  
      complexity: 'high' as ComplexityLevel,
      confidence: 0.8,
      expectedFileCount: { min: 12, max: 25 },
      shouldIncludeFrontend: true,
      shouldIncludeBackend: false,
      shouldIncludeDatabase: false,
      detectedKeywords
    };
  }

  // FALLBACK: STANDARD FEATURE
  console.log('⚠️ [Scope] AUTO-DETECTED: FEATURE (default fallback)');
  return {
    type: ScopeType.FEATURE,
    complexity: 'moderate' as ComplexityLevel,
    confidence: 0.6,
    expectedFileCount: { min: 6, max: 12 },
    shouldIncludeFrontend: true,
    shouldIncludeBackend: false,
    shouldIncludeDatabase: false,
    detectedKeywords: ['default', 'fallback']
  };
}


  private async analyzePrompt(request: GenerationRequest): Promise<PromptAnalysisResult> {
    return {
      originalPrompt: request.prompt,
      intent: { type: 'CREATE', description: 'Auto', confidence: 1, subIntents: [] },
      entities: [],
      requirements: [],
      ambiguities: [],
      context: { domain: 'general', complexity: 'standard' },
      confidence: 1
    };
  }



  private async generateFullstackComponents(context: GenerationContext): Promise<GeneratedComponent[]> {
    // Lógica de delegação para codeGenerator
    const input = { 
      projectName: 'App', 
      projectType: 'FULLSTACK' as any,
      requirements: { description: context.prompt, features: [], tech_stack: { frontend:['react'], backend:['node'] }, authentication: false }
    };
    const result = await codeGenerator.generate(input);
    return this.transformResult(result, context);
  }

  private async generateBackendComponents(context: GenerationContext): Promise<GeneratedComponent[]> {
    const input = {
      projectName: 'API',
      requirements: { description: context.prompt, features: [], apiEndpoints: [], database: false },
      options: { generateTests: true }
    };
    // Ajuste de tipagem forçada para evitar conflito com a interface do backendGenerator
    const result = await backendGenerator.generate(input as any);
    return this.transformResult(result, context);
  }

  private async generateLandingPageComponents(context: GenerationContext): Promise<GeneratedComponent[]> {
    const input = {
      framework: context.framework,
      generationType: 'LANDING_PAGE',
      complexity: 'moderate',
      context: { domain: context.domain }
    };
    const result = await uiGenerator.generate(input as any);
    return this.transformResult(result, context);
  }

  private async generateFrontendComponents(context: GenerationContext): Promise<GeneratedComponent[]> {
    const input = {
      framework: context.framework,
      generationType: 'COMPONENT',
      complexity: 'moderate',
      context: { domain: context.domain }
    };
    const result = await uiGenerator.generate(input as any);
    return this.transformResult(result, context);
  }

  // --- Utilities ---

  private transformResult(result: any, context: GenerationContext): GeneratedComponent[] {
    if (!result?.files) return [];
    return result.files.map((f: any) => ({
      name: f.filename || 'Component',
      type: 'component',
      code: f.content || '',
      path: f.path || '',
      language: 'typescript',
      framework: context.framework,
      dependencies: [],
      metadata: { 
        linesOfCode: 0, 
        complexity: 0, 
        generated: true, 
        validated: true 
      }
    }));
  }

  private async validateComponents(components: GeneratedComponent[]): Promise<GeneratedComponent[]> {
    return components; // Pass-through
  }

  private calculateOverallQuality(components: GeneratedComponent[]): number {
    return 100;
  }

  private extractDependenciesFromComponents(components: GeneratedComponent[]): string[] {
    return [];
  }

  private generatePackageJson(components: GeneratedComponent[]): string {
    return "{}";
  }

  private generateReadme(components: GeneratedComponent[]): string {
    return "# Readme";
  }
}

// ═══════════════════════════════════════════════════════════════
// SECTION 4: GENERATION PIPELINE CLASS
// ═══════════════════════════════════════════════════════════════

export class GenerationPipeline {
  private context?: GenerationContext;
  private config: PipelineConfig;
  private aiProvider?: any;

  private promptProcessor: PromptProcessor = PromptProcessor.getInstance();

  constructor(config?: Partial<PipelineConfig>) {
    this.config = {
      enableValidation: true,
      enableOptimization: true,
      enableQualityAnalysis: true,
      retryOnFailure: false,
      maxRetries: 3,
      ...config
    };

    logger.debug('Generation Pipeline created', {
      component: 'GenerationPipeline',
      metadata: this.config
    });  
  }

  private getAIProvider(): any {
    if (!this.aiProvider) {
      this.aiProvider = AIProviderFactory.getProvider();
      logger.debug('Generation AI provider ready', {
        component: 'GenerationPipeline',
        metadata: {
          provider: this.aiProvider?.constructor?.name || 'unknown',
          supportsCodeGeneration: typeof this.aiProvider?.generateCode === 'function'
        }
      });
    }
    return this.aiProvider;
  }
/**
 * ═════════════════════════════════════════════════════════════════════════════
 * MÉTODO PRINCIPAL (splitCodeIntoComponents) - v2.0 COM SCOPE SUPPORT
 * ═════════════════════════════════════════════════════════════════════════════
 * ✅ ADICIONADO: scope parameter para prefixar paths corretamente
 * ✅ ADICIONADO: getPathPrefix() helper function
 * ✅ CORRIGIDO: Todos os paths usam ${pathPrefix}
 */

// ✅ HELPER FUNCTION - Determinar prefix baseado em scope
private getPathPrefix(scope?: any): string {
  if (!scope) return 'src';
  
  switch (scope.type) {
    case 'BACKEND':
      return 'backend/src';
    case 'FRONTEND':
      return 'frontend/src';
    case 'FULLSTACK':
      return 'src'; // Fullstack vai ser detectado depois
    default:
      return 'src';
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// MÉTODO PRINCIPAL
// ═════════════════════════════════════════════════════════════════════════════

private splitCodeIntoComponents(aiCode: string, analysis: any, scope?: any): any[] {
  console.log('🔍 [Pipeline] splitCodeIntoComponents() CHAMADO');
  console.log('[Pipeline] AI code length:', aiCode.length);
  console.log('[Pipeline] AI code preview:', aiCode.substring(0, 500));
  console.log('[Pipeline] Scope:', scope?.type || 'none');

  const components: any[] = [];
  
  // ✅ GUARD: Early return se aiCode inválido
  if (!aiCode || typeof aiCode !== 'string') {
    console.log('⚠️ [Pipeline] aiCode inválido, retornando array vazio');
    return components;
  }

  // ✅ NOVO: Obter prefix baseado em scope
  const pathPrefix = this.getPathPrefix(scope);
  console.log(`[Pipeline] Path prefix: "${pathPrefix}"`);

  try {
    let match: RegExpExecArray | null;

    // ═══════════════════════════════════════════════════════════════
    // EXTRACT MAIN ENTITY NAME FROM PROMPT
    // ═══════════════════════════════════════════════════════════════
    // ✅ USANDO SEU extractMainEntity() EXISTENTE!
    const mainEntity = this.extractMainEntity(analysis?.originalPrompt || '');
    console.log(`[Pipeline] 🎯 Main entity detected: "${mainEntity}"`);

    // ═══════════════════════════════════════════════════════════════
    // TENTATIVA 0: MARKDOWN EXTRACTION (NEW!)
    // Extract code from ```typescript...``` blocks
    // ═══════════════════════════════════════════════════════════════
    console.log('🔍 [Pipeline] Tentativa 0: Extracting from markdown blocks');
    
    const markdownCodeBlocks = this.extractMarkdownCodeBlocks(aiCode);
    console.log(`[Pipeline] Markdown blocks found: ${markdownCodeBlocks.length}`);
    
    if (markdownCodeBlocks.length > 0) {
      for (const block of markdownCodeBlocks) {
        const componentName = this.extractComponentNameFromCode(block.code);
        
        if (componentName && block.code.length > 50) {
          console.log(`[Pipeline] ✅ Markdown: ${componentName} (${block.code.length} chars)`);
          
          components.push({
            name: componentName,
            type: 'component',
            code: block.code,
            path: `${pathPrefix}/${componentName}.tsx`,
            files: [{
              path: `${pathPrefix}/${componentName}.tsx`,
              content: block.code,
              language: 'typescript'
            }]
          });
        }
      }
    }

    console.log(`[Pipeline] Markdown extraction encontrou: ${components.length} componentes`);

    // ═══════════════════════════════════════════════════════════════
    // TENTATIVA 1: Formato component:Name:tsx:path
    // ═══════════════════════════════════════════════════════════════
    if (components.length === 0) {
      console.log('🔍 [Pipeline] Tentativa 1: Formato component:Name:tsx:path');
      
      const format1Pattern = /component:(\w+):(\w+):(.+?)\n/gi;

      while ((match = format1Pattern.exec(aiCode)) !== null) {
        const componentName = match[1] || '';
        const language = match[2] || 'typescript';
        const filePath = match[3] || '';
        const code = match[4] || '';

        if (code.length > 10 && componentName && filePath) {
          // ✅ Prefixar path se não tiver prefix já
          const finalPath = filePath.startsWith('backend/') || filePath.startsWith('frontend/')
            ? filePath
            : `${pathPrefix}/${filePath.replace(/^src\/?/, '')}`;

          console.log(`[Pipeline] ✅ Format1: ${componentName} at ${finalPath} (${code.length} chars)`);

          components.push({
            name: componentName,
            type: 'component',
            code: code,
            path: finalPath,
            files: [{
              path: finalPath,
              content: code,
              language: language
            }]
          });
        }
      }
    }

    console.log(`[Pipeline] Formato 1 encontrou: ${components.length} componentes`);

    // ═══════════════════════════════════════════════════════════════
    // TENTATIVA 2: Detectar por comentários // src/
    // ═══════════════════════════════════════════════════════════════
    if (components.length === 0) {
      console.log('🔍 [Pipeline] Tentativa 2: Detectar por comentários // src/');

const sections = aiCode.split(/(?=\/\/\s*(?:src\/|frontend\/src\/|backend\/src\/|pages\/|components\/|hooks\/|utils\/|types\/))/);      for (const section of sections) {
  const pathMatch = section.match(/\/\/\s*(?:frontend\/|backend\/)?(?:src\/)?([\w\/\-\.]+\.[a-z]+)\s*\n/);

        if (pathMatch && pathMatch[1]) {
          const filePath = `${pathPrefix}/${pathMatch[1]}`;
          
          const codeMatch = section.match(/\/\/\s*src\/[\w\/\-\.]+\s*\n([\s\S]+?)(?=\/\/\s*src\/|$)/);

          if (codeMatch && codeMatch[1]) {
            let code = codeMatch[1].trim();

            const tripleBacktick = '```';
            const markdownPattern1 = new RegExp(`${tripleBacktick}(?:typescript|tsx|jsx|javascript|ts|js)?\\s*\\n?`, 'g');
            const markdownPattern2 = new RegExp(`${tripleBacktick}\\s*$`, 'g');

            code = code.replace(markdownPattern1, '');
            code = code.replace(markdownPattern2, '');
            code = code.trim();

            if (code.length > 50) {
              const componentName = this.extractComponentName(filePath, code);

              console.log(`[Pipeline] ✅ Format2: ${componentName} at ${filePath} (${code.length} chars)`);

              components.push({
                name: componentName,
                type: 'component',
                code: code,
                path: filePath,
                files: [{
                  path: filePath,
                  content: code,
                  language: 'typescript'
                }]
              });
            }
          }
        }
      }
    }

    console.log(`[Pipeline] Formato 2 encontrou: ${components.length} componentes`);

    // ═══════════════════════════════════════════════════════════════
    // TENTATIVA 3: Múltiplos blocos markdown
    // ═══════════════════════════════════════════════════════════════
    if (components.length === 0) {
      console.log('🔍 [Pipeline] Tentativa 3: Múltiplos blocos markdown');

      const tripleBacktick = '```';
      const pattern = `${tripleBacktick}(?:typescript|tsx|jsx|javascript|ts|js)?\\s*\\n(?:\\/\\/\\s*(.+?\\.(?:tsx?|jsx?))\\s*)?\\n?([\\s\\S]*?)${tripleBacktick}`;
      const format3Pattern = new RegExp(pattern, 'gi');

      while ((match = format3Pattern.exec(aiCode)) !== null) {
        const filePath = match[1] || '';
        let code = match[2] || '';
        
        if (code.length > 50) {
          const componentName = filePath ? this.extractComponentName(filePath, code) : this.extractComponentNameFromCode(code);
          const finalPath = filePath || `${pathPrefix}/components/${componentName}.tsx`;

          console.log(`[Pipeline] ✅ Format3: ${componentName} at ${finalPath} (${code.length} chars)`);

          components.push({
            name: componentName,
            type: 'component',
            code: code,
            path: finalPath,
            files: [{
              path: finalPath,
              content: code,
              language: 'typescript'
            }]
          });
        }
      }
    }

    console.log(`[Pipeline] Formato 3 encontrou: ${components.length} componentes`);

    // ═══════════════════════════════════════════════════════════════
    // TENTATIVA 4: Detectar componentes React direto
    // ═══════════════════════════════════════════════════════════════
    if (components.length === 0) {
      console.log('🔍 [Pipeline] Tentativa 4: Detectar componentes React direto');

      const componentPattern = /(?:export\s+default\s+function\s+(\w+)|export\s+function\s+(\w+)|const\s+(\w+)\s*:\s*React\.FC)/g;
      const matches: Array<{ name: string; start: number }> = [];

      while ((match = componentPattern.exec(aiCode)) !== null) {
        const name = match[1] || match[2] || match[3] || '';
        if (name && name !== 'undefined') {
          matches.push({
            name: name,
            start: match.index
          });
        }
      }

      console.log(`[Pipeline] Componentes React detectados: ${matches.length}`);

      const tripleBacktick = '```';
      const markdownPattern1 = new RegExp(`${tripleBacktick}(?:typescript|tsx|jsx|javascript|ts|js)?\\s*\\n?`, 'g');
      const markdownPattern2 = new RegExp(`${tripleBacktick}\\s*$`, 'g');

      if (matches.length > 1) {
        for (let i = 0; i < matches.length; i++) {
          const currentMatch = matches[i];
          const nextMatch = matches[i + 1];
          if (!currentMatch) continue;

          const start = currentMatch.start;
          const end = nextMatch ? nextMatch.start : aiCode.length;
          let code = aiCode.substring(start, end).trim();

          code = code.replace(markdownPattern1, '');
          code = code.replace(markdownPattern2, '');
          code = code.trim();

          if (code.length > 50) {
            components.push({
              name: currentMatch.name,
              type: 'component',
              code,
              path: `${pathPrefix}/components/${currentMatch.name}.tsx`,
              files: [{
                path: `${pathPrefix}/components/${currentMatch.name}.tsx`,
                content: code,
                language: 'typescript'
              }]
            });
          }
        }
      } else if (matches.length === 1) {
        const singleMatch = matches[0];
        if (singleMatch) {
          let code = aiCode.trim();

          const tripleBacktick = '```';
          const markdownPattern1 = new RegExp(`${tripleBacktick}(?:typescript|tsx|jsx|javascript|ts|js)?\\s*\\n?`, 'g');
          const markdownPattern2 = new RegExp(`${tripleBacktick}\\s*$`, 'g');
          code = code.replace(markdownPattern1, '');
          code = code.replace(markdownPattern2, '');
          code = code.trim();

          components.push({
            name: singleMatch.name,
            type: 'component',
            code,
            path: `${pathPrefix}/${singleMatch.name}.tsx`,
            files: [{
              path: `${pathPrefix}/${singleMatch.name}.tsx`,
              content: code,
              language: 'typescript'
            }]
          });
        }
      }
    }

    console.log(`[Pipeline] Formato 4 encontrou: ${components.length} componentes`);

    // ═══════════════════════════════════════════════════════════════
    // TENTATIVA 5: Formato JSON do backend-generator
    // ═══════════════════════════════════════════════════════════════
    if (components.length === 0) {
      console.log('🔍 [Pipeline] Tentativa 5: Formato JSON do backend-generator');

      try {
        const jsonMatch = aiCode.trim().match(/^\s*\{[\s\S]*\}\s*$/);

        if (jsonMatch) {
          console.log('[Pipeline] JSON detectado, parseando...');
          const backendJson = JSON.parse(aiCode);

          if (backendJson.server) {
            console.log('[Pipeline] ✅ JSON: Adicionando server.ts');
            components.push({
              name: 'Server',
              type: 'component',
              code: backendJson.server,
              path: `${pathPrefix}/server.ts`,
              files: [{
                path: `${pathPrefix}/server.ts`,
                name: 'server.ts',
                content: backendJson.server,
                language: 'typescript'
              }]
            });
          }

          if (backendJson.app) {
            console.log('[Pipeline] ✅ JSON: Adicionando app.ts');
            components.push({
              name: 'App',
              type: 'component',
              code: backendJson.app,
              path: `${pathPrefix}/app.ts`,
              files: [{
                path: `${pathPrefix}/app.ts`,
                name: 'app.ts',
                content: backendJson.app,
                language: 'typescript'
              }]
            });
          }

          const arrayKeys = ['controllers', 'services', 'middleware', 'models', 'routes', 'config', 'utils', 'validators'];

          arrayKeys.forEach(key => {
            if (backendJson[key] && Array.isArray(backendJson[key])) {
              console.log(`[Pipeline] ✅ JSON: Adicionando ${backendJson[key].length} ${key}`);
              backendJson[key].forEach((item: any) => {
                if (item && item.content && item.name) {
                  // ✅ Prefixar path com pathPrefix
                  const itemPath = item.path || pathPrefix;
                  const finalPath = `${itemPath}/${item.name}`;

                  components.push({
                    name: item.name.replace(/\.ts$/i, ''),
                    type: 'component',
                    code: item.content,
                    path: finalPath,
                    files: [{
                      path: finalPath,
                      name: item.name,
                      content: item.content,
                      language: 'typescript'
                    }]
                  });
                }
              });
            }
          });

          console.log(`[Pipeline] Formato 5 (JSON) encontrou: ${components.length} arquivos`);
        } else {
          console.log('[Pipeline] Não é JSON válido');
        }
      } catch (jsonError) {
        console.log('[Pipeline] Formato 5 (JSON) não aplicável:', (jsonError as Error).message);
      }
    }

    console.log(`[Pipeline] Formato 5 encontrou: ${components.length} componentes`);

    // ═══════════════════════════════════════════════════════════════
    // FALLBACK: INTELIGENTE (FIXED!)
    // ═══════════════════════════════════════════════════════════════
    if (components.length === 0) {
      console.log('[Pipeline] ⚠️ Usando fallback inteligente');

      // ✅ FIX: Use mainEntity, never use prompt array
      // mainEntity já é string porque extractMainEntity() sempre retorna string
      const componentName: string = mainEntity && mainEntity !== 'Component' ? mainEntity : 'Component';
      
      console.log(`[Pipeline] Fallback component name: "${componentName}"`);

      let code = aiCode.trim();
      const tripleBacktick = '```';
      const markdownPattern1 = new RegExp(`${tripleBacktick}(?:typescript|tsx|jsx|javascript|ts|js)?\\s*\\n?`, 'g');
      const markdownPattern2 = new RegExp(`${tripleBacktick}\\s*$`, 'g');
      code = code.replace(markdownPattern1, '');
      code = code.replace(markdownPattern2, '');
      code = code.trim();

      components.push({
        name: componentName,
        type: 'component',
        code,
        path: `${pathPrefix}/${componentName}.tsx`,
        files: [{
          path: `${pathPrefix}/${componentName}.tsx`,
          content: code,
          language: 'typescript'
        }]
      });
    }

    console.log(`[Pipeline] Component blocks: ${components.length}`);
// Re-injetar imports ausentes baseado nos identificadores usados no código
    // POST-PROCESSING
this.reinjectMissingImports(components);
this.validateAndFixNaming(components, mainEntity);
    // SUMMARY & RETURN
    console.log(`✅ [Pipeline] Total components: ${components.length}`);
    console.log(`✅ [Pipeline] Path prefix used: "${pathPrefix}"`);
    components.forEach((comp, idx) => {
      console.log(`[Pipeline] Component ${idx + 1}: ${comp.name} | Files: ${comp.files?.length || 0} | Code: ${comp.code.length} chars | Path: ${comp.path}`);
    });

    return components;

  } catch (error) {
    console.error('[Pipeline] ❌ Erro no splitCodeIntoComponents:', error);
    return components;
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPER METHODS 
// ═══════════════════════════════════════════════════════════════

/**
 * ✅ NOVO: Extract code blocks from markdown
 * 
 * @param text - Full text with markdown blocks
 * @returns Array of extracted code blocks
 */
private extractMarkdownCodeBlocks(text: string): Array<{ language: string; code: string }> {
  const regex = /```(?:typescript|tsx|jsx|javascript|ts|js)?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const code = (match[1] ?? '').trim();
    if (code.length > 50) {
      blocks.push({
        language: 'typescript',
        code
      });
    }
    // Segunda fase: dividir blocos que contêm múltiplos componentes
const expanded: Array<{ language: string; code: string }> = [];
for (const block of blocks) {
  // Detectar múltiplos delimitadores de arquivo dentro do bloco
  const fileDelimiterPattern = /(?=\/\/\s*(?:src\/|pages\/|components\/|hooks\/|utils\/|frontend\/|backend\/)[\w\/\-\.]+)/g;
  const parts = block.code.split(fileDelimiterPattern).filter(p => p.trim().length > 50);
  
  if (parts.length > 1) {
    parts.forEach(part => expanded.push({ language: block.language, code: part.trim() }));
  } else {
    expanded.push(block);
  }
}
return expanded;
  }

  return blocks;
}

/**
 * ✅ NOVO: Extract component name from code
 * 
 * Detects: export default function Button() {}
 *          export const Button = () => {}
 *          function Button() {}
 *          const Button: React.FC = () => {}
 * 
 * @param code - Source code
 * @returns Component name or 'Component' as fallback
 */
private extractComponentNameFromCode(code: string): string {
  // export default function Button() {}
  let m = code.match(/export\s+default\s+function\s+(\w+)/);
  if (m && m[1]) return m[1];

  // export const Button = () => {}
  m = code.match(/export\s+const\s+(\w+)\s*=/);
  if (m && m[1]) return m[1];

  // function Button() {}
  m = code.match(/function\s+(\w+)/);
  if (m && m[1]) return m[1];

  // const Button: React.FC = () => {}
  m = code.match(/const\s+(\w+)\s*:/);
  if (m && m[1]) return m[1];

  return 'Component';
}



/**
 * ═══════════════════════════════════════════════════════════════
 * EXTRACT MAIN ENTITY NAME FROM PROMPT (UI + Backend Support)
 * ═══════════════════════════════════════════════════════════════
 */
private extractMainEntity(prompt: string): string {
  const promptLower = prompt.toLowerCase();
  
  // ═══════════════════════════════════════════════════════════════
  // PRIORIDADE 1: ENTIDADES DE NEGÓCIO (Backend/API/Database)
  // ═══════════════════════════════════════════════════════════════
  const businessEntityPatterns = [
    // Padrões explícitos de API/CRUD
    /(?:api|crud|sistema|sistema de|gerenciar|manage|listar)\s+(?:de\s+)?(\w+)/i,
    /(?:backend|database|prisma)\s+(?:para|de|with|com)\s+(\w+)/i,
    /(?:create|criar|gerar)\s+(?:um|uma|an?|the)?\s*(\w+)\s+(?:api|crud|system)/i,
    
    // Entidades de domínio comuns
    /\b(user|users|usuario|usuarios|cliente|customer|customers)\b/i,
    /\b(product|products|produto|produtos|item|items)\b/i,
    /\b(order|orders|pedido|pedidos|sale|sales|venda|vendas)\b/i,
    /\b(category|categories|categoria|categorias)\b/i,
    /\b(post|posts|article|articles|blog|blogs)\b/i,
    /\b(comment|comments|comentario|comentarios)\b/i,
    /\b(task|tasks|tarefa|tarefas|todo|todos)\b/i,
    /\b(event|events|evento|eventos)\b/i,
    /\b(booking|bookings|reserva|reservas)\b/i,
    /\b(invoice|invoices|fatura|faturas)\b/i,
    /\b(payment|payments|pagamento|pagamentos)\b/i,
    /\b(report|reports|relatorio|relatorios)\b/i,
    /\b(employee|employees|funcionario|funcionarios)\b/i,
    /\b(project|projects|projeto|projetos)\b/i
  ];

  // Testar padrões de entidades de negócio primeiro
  for (const pattern of businessEntityPatterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      const entity = this.toPascalCase(match[1]);
      console.log(`[extractMainEntity] ✅ Business entity found: "${entity}" (pattern match)`);
      return entity;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIORIDADE 2: COMPONENTES UI (Frontend)
  // ═══════════════════════════════════════════════════════════════
  const uiEntityMap: Record<string, string> = {
    // Componentes básicos
    'botão': 'Button', 'button': 'Button',
    'card': 'Card', 'cartão': 'Card',
    'modal': 'Modal', 'dialog': 'Dialog', 'diálogo': 'Dialog',
    'form': 'Form', 'formulário': 'Form', 'formulario': 'Form',
    
    // Listas e tabelas
    'lista': 'List', 'list': 'List',
    'tabela': 'Table', 'table': 'Table',
    'grid': 'Grid', 'grade': 'Grid',
    
    // Navegação
    'menu': 'Menu', 'navbar': 'Navbar', 'sidebar': 'Sidebar',
    'footer': 'Footer', 'header': 'Header', 'cabeçalho': 'Header',
    
    // Inputs
    'input': 'Input', 'textarea': 'Textarea', 'select': 'Select',
    'checkbox': 'Checkbox', 'radio': 'Radio',
    'toggle': 'Toggle', 'switch': 'Switch', 'slider': 'Slider',
    
    // Dropdowns e tooltips
    'dropdown': 'Dropdown', 'tooltip': 'Tooltip', 'popover': 'Popover',
    
    // Feedback
    'alert': 'Alert', 'notification': 'Notification', 'notificação': 'Notification',
    'toast': 'Toast', 'snackbar': 'Snackbar',
    
    // Badges e avatares
    'badge': 'Badge', 'avatar': 'Avatar',
    
    // Media
    'image': 'Image', 'imagem': 'Image', 'icon': 'Icon', 'ícone': 'Icon',
    
    // Loading
    'spinner': 'Spinner', 'loader': 'Loader', 'loading': 'Loading',
    'progress': 'Progress', 'stepper': 'Stepper',
    
    // Containers
    'tabs': 'Tabs', 'accordion': 'Accordion', 'acordeão': 'Accordion',
    'carousel': 'Carousel', 'carrossel': 'Carousel',
    'pagination': 'Pagination', 'paginação': 'Pagination',
    'breadcrumb': 'Breadcrumb', 'chip': 'Chip', 'tag': 'Tag',
    'divider': 'Divider', 'divisor': 'Divider'
  };

  // Apenas usar UI entities se NÃO for contexto de API/Backend
  const isBackendContext = 
    promptLower.includes('api') ||
    promptLower.includes('backend') ||
    promptLower.includes('crud') ||
    promptLower.includes('database') ||
    promptLower.includes('prisma') ||
    promptLower.includes('express');

  if (!isBackendContext) {
    for (const [keyword, entity] of Object.entries(uiEntityMap)) {
      if (promptLower.includes(keyword)) {
        console.log(`[extractMainEntity] ✅ UI component found: "${entity}" (keyword: ${keyword})`);
        return entity;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIORIDADE 3: PALAVRAS CAPITALIZADAS (Fallback inteligente)
  // ═══════════════════════════════════════════════════════════════
  // Buscar palavras capitalizadas que não sejam palavras comuns
  const commonWords = new Set([
    'API', 'REST', 'CRUD', 'HTTP', 'GET', 'POST', 'PUT', 'DELETE',
    'Express', 'React', 'TypeScript', 'JavaScript', 'Node', 'Prisma',
    'Frontend', 'Backend', 'Fullstack', 'Database', 'SQL', 'NoSQL'
  ]);

  const capitalizedMatches = prompt.match(/\b([A-Z][a-z]+)\b/g);
  if (capitalizedMatches) {
    for (const match of capitalizedMatches) {
      if (!commonWords.has(match) && match.length > 2) {
        console.log(`[extractMainEntity] ✅ Entity from capitalized word: "${match}"`);
        return match;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIORIDADE 4: PRIMEIRA PALAVRA SIGNIFICATIVA (Last resort)
  // ═══════════════════════════════════════════════════════════════
  const words = prompt
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !['para', 'with', 'usando', 'using', 'sistema', 'system'].includes(w));
  
 if (words.length > 0) {
  const entity = this.toPascalCase(words[0] || 'Component');
  console.log(`[extractMainEntity] ⚠️ Using first significant word: "${entity}"`);
  return entity;
}

  // ═══════════════════════════════════════════════════════════════
  // FALLBACK FINAL
  // ═══════════════════════════════════════════════════════════════
  console.log('[extractMainEntity] ⚠️ No entity detected, using default "Component"');
  return 'Component';
}
private reinjectMissingImports(components: any[]): void {
  const reactHooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext'];
  const routerItems = ['Link', 'NavLink', 'useNavigate', 'useParams'];

  components.forEach(comp => {
    if (!comp.code || comp.code.trimStart().startsWith('import')) return;

    const lines: string[] = [];
    const usedHooks = reactHooks.filter(h => comp.code.includes(h));
    if (usedHooks.length > 0) {
      lines.push(`import { ${usedHooks.join(', ')} } from 'react';`);
    } else if (comp.code.includes('React.') || comp.code.includes(': React.FC')) {
      lines.push(`import React from 'react';`);
    }

    const usedRouter = routerItems.filter(r => comp.code.includes(r));
    if (usedRouter.length > 0) {
      lines.push(`import { ${usedRouter.join(', ')} } from 'react-router-dom';`);
    }

    if (comp.code.includes('api.get') || comp.code.includes('api.post') ||
        comp.code.includes('api.put') || comp.code.includes('api.delete')) {
      lines.push(`import api from '../utils/api';`);
    }

    if (lines.length > 0) {
      comp.code = lines.join('\n') + '\n\n' + comp.code;
      if (comp.files) {
        comp.files.forEach((f: any) => { f.content = comp.code; });
      }
    }
  });
}
  /**
   * ═══════════════════════════════════════════════════════════════
   * VALIDATE AND AUTO-FIX COMPONENT NAMING
   * ═══════════════════════════════════════════════════════════════
   */
  private validateAndFixNaming(components: any[], expectedEntity: string): void {
    console.log(`[Pipeline] 🔧 Validating naming... Expected entity: "${expectedEntity}"`);

    components.forEach((comp, idx) => {
      const currentName = comp.name;

      if (currentName === expectedEntity) {
        console.log(`[Pipeline] ✅ Component ${idx + 1}: "${currentName}" is correct`);
        return;
      }

      const genericNames = ['Item', 'Component', 'Element', 'Widget'];

      if (genericNames.includes(currentName)) {
        console.log(`[Pipeline] ⚠️ NAMING MISMATCH: "${currentName}" should be "${expectedEntity}"`);
        console.log(`[Pipeline] 🔧 Auto-fixing naming...`);

        comp.name = expectedEntity;

        if (comp.path) {
          comp.path = comp.path.replace(new RegExp(`${currentName}`, 'g'), expectedEntity);
        }

        if (comp.code) {
          comp.code = comp.code.replace(new RegExp(`\\b${currentName}\\b`, 'g'), expectedEntity);
          comp.code = comp.code.replace(new RegExp(`${currentName}Props`, 'g'), `${expectedEntity}Props`);
          comp.code = comp.code.replace(new RegExp(`${currentName}\\.tsx`, 'g'), `${expectedEntity}.tsx`);
          comp.code = comp.code.replace(new RegExp(`${currentName}\\.types\\.ts`, 'g'), `${expectedEntity}.types.ts`);
        }

        if (comp.files && Array.isArray(comp.files)) {
          comp.files.forEach((file: any) => {
            if (file.path) {
              file.path = file.path.replace(new RegExp(`${currentName}`, 'g'), expectedEntity);
            }
            if (file.name) {
              file.name = file.name.replace(new RegExp(`${currentName}`, 'g'), expectedEntity);
            }
            if (file.content) {
              file.content = file.content.replace(new RegExp(`\\b${currentName}\\b`, 'g'), expectedEntity);
              file.content = file.content.replace(new RegExp(`${currentName}Props`, 'g'), `${expectedEntity}Props`);
            }
          });
        }

        if (!comp.metadata) {
          comp.metadata = {};
        }
        comp.metadata.autoFixedNaming = true;
        comp.metadata.originalName = currentName;

        console.log(`[Pipeline] ✅ Fixed: "${currentName}" → "${expectedEntity}"`);
      } else {
        console.log(`[Pipeline] ℹ️ Component ${idx + 1}: "${currentName}" kept as-is (not generic)`);
      }
    });
  }

  /**


/**
 * ═══════════════════════════════════════════════════════════════
 * EXTRACT COMPONENT NAME FROM FILE PATH OR CODE
 * ═══════════════════════════════════════════════════════════════
 * ⚠️ ATENÇÃO: MANTENHA APENAS ESTA DEFINIÇÃO! APAGUE SE TIVER OUTRA!
 */
  private extractComponentName(filePath: string, code: string): string {
    if (filePath) {
      const pathMatch = filePath.match(/\/([^\/]+)\.(tsx?|jsx?)$/);
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1];
      }
    }

    const exportMatch = code.match(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/);
    if (exportMatch && exportMatch[1]) {
      return exportMatch[1];
    }

    return 'Component';
  }


/**
 * Execute complete generation pipeline
 */
public async execute(request: GenerationRequest): Promise<GenerationResult> {
  try {
    // ✅ VERIFICAR SE REQUEST CHEGOU
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 [Pipeline] execute() CHAMADO');
    console.log('[Pipeline] request type:', typeof request);
    console.log('[Pipeline] request keys:', Object.keys(request || {}));
    console.log('═══════════════════════════════════════════════════════');

    logger.info('🔄 [Pipeline] Starting 4-stage execution', {
      component: 'GenerationPipeline',
      promptLength: request.prompt.length
    });

    // Stage 1: Prepare (analysis + templates)
    logger.info('📥 [Pipeline] STAGE 1: Prepare (analysis + templates)');
    const prepareResult = await this.stagePrepare(request);
    if (!prepareResult.success) {
      logger.error('❌ [Pipeline] Stage 1 (Prepare) failed', {
        error: prepareResult.error
      });
      throw new Error(prepareResult.error || 'Prepare stage failed');
    }
    logger.info('✅ [Pipeline] Stage 1 complete', {
      hasAnalysis: !!prepareResult.data.analysis,
      templatesCount: prepareResult.data.templates?.length || 0
    });

    // Stage 2: Generate components
    logger.info('🔨 [Pipeline] STAGE 2: Generate (AI + code generation)');
    const generateResult = await this.stageGenerate(prepareResult.data);
    if (!generateResult.success) {
      logger.error('❌ [Pipeline] Stage 2 (Generate) failed', {
        error: generateResult.error
      });
      throw new Error(generateResult.error || 'Generate stage failed');
    }
    logger.info('✅ [Pipeline] Stage 2 complete', {
      componentsGenerated: generateResult.data.components?.length || 0
    });

    let components = generateResult.data.components;
    const generationSource = generateResult.data.generationSource as string | undefined;
    const projectAlreadyValidated = generationSource?.endsWith('-direct') === true
      || generationSource?.startsWith('code-generator-') === true;

    // Validar que temos componentes
    if (!components || components.length === 0) {
      logger.error('❌ [Pipeline] No components generated');
      throw new Error('No components generated by Stage 2');
    }

    // Stage 3: Validate (if enabled)
    if (this.config.enableValidation && !projectAlreadyValidated) {
      logger.info('✔️ [Pipeline] STAGE 3: Validate');
      try {
        const validateResult = await this.stageValidate(components);
        if (validateResult.success && validateResult.data) {
          components = validateResult.data;
          logger.info('✅ [Pipeline] Stage 3 complete (validated)');
        } else {
          logger.warn('⚠️ [Pipeline] Stage 3 validation issues (non-blocking)', {
            error: validateResult.error
          });
        }
      } catch (validateError) {
        logger.warn('⚠️ [Pipeline] Stage 3 failed (non-blocking)', {
          error: (validateError as Error).message
        });
      }
    }

    // Stage 4: Optimize (if enabled)
    if (this.config.enableOptimization && !projectAlreadyValidated) {
      logger.info('⚡ [Pipeline] STAGE 4: Optimize');
      try {
        const optimizeResult = await this.stageOptimize(components);
        if (optimizeResult.success && optimizeResult.data) {
          components = optimizeResult.data;
          logger.info('✅ [Pipeline] Stage 4 complete (optimized)');
        } else {
          logger.warn('⚠️ [Pipeline] Stage 4 optimization issues (non-blocking)', {
            error: optimizeResult.error
          });
        }
      } catch (optimizeError) {
        logger.warn('⚠️ [Pipeline] Stage 4 failed (non-blocking)', {
          error: (optimizeError as Error).message
        });
      }
    }

      // ═══════════════════════════════════════════════════════════
    // ✨ AÇÃO 3: STAGE 4.5 - DEPENDENCY RESOLUTION ✨
    // ═══════════════════════════════════════════════════════════
    if (this.config.enableValidation && !projectAlreadyValidated) {
      logger.info('🔗 [Pipeline] STAGE 4.5: Dependency Resolution');
      
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('AÇÃO 3: Resolvendo dependências...');
      console.log('═══════════════════════════════════════════════════════════');
      
      try {
        // Obter dados da AÇÃO 2
        const orphanedImports = (this as any).orphanedImports || [];
        const allImports = (this as any).allImports || new Set<string>();
        const generatedExports = (this as any).generatedExports || new Set<string>();
        
        console.log(`   Total de imports: ${allImports.size}`);
        console.log(`   Total de exports: ${generatedExports.size}`);
        console.log(`   Imports orphãos: ${orphanedImports.length}`);
        
        if (allImports.size > 0) {
          // ✅ FIX FINAL: Import DependencyType e cast correto
          const { DependencyType } = await import('../generation/dependency-resolver');
          
          // ✅ Cast Set<string> para string[] explicitamente
          const allImportsArray: string[] = Array.from(allImports as Set<string>);
          const generatedExportsArray: string[] = Array.from(generatedExports as Set<string>);
          
          const dependencies = allImportsArray.map((imp: string) => ({
            name: imp,
            type: DependencyType.RUNTIME,  // ✅ Usar enum, não string
            required: true
          }));
          
          const existingPackages = generatedExportsArray.map((exp: string) => ({
            name: exp,
            version: '1.0.0',
            dependencies: {}
          }));
          
          console.log('');
          console.log('   Chamando Dependency Resolver...');
          
          // Chamar Dependency Resolver
          const { dependencyResolver } = await import('../generation/dependency-resolver');
          const resolutionResult = await dependencyResolver.resolve({
            dependencies,
            existingPackages
          });
          
          // ✅ cycles está em graph.cycles
          const cycles = resolutionResult.graph?.cycles || [];
          
          console.log('');
          console.log('✅ Dependency Resolution completado!');
          console.log(`   Resolvidos: ${resolutionResult.resolved.length}`);
          console.log(`   Conflitos: ${resolutionResult.conflicts.length}`);
          console.log(`   Ciclos: ${cycles.length}`);
          
          if (resolutionResult.conflicts.length > 0) {
            console.log('');
            console.log('⚠️  CONFLITOS DETECTADOS:');
            resolutionResult.conflicts.slice(0, 5).forEach(conflict => {
              console.log(`   - ${conflict.package}: ${conflict.versions.join(', ')} (${conflict.severity})`);
            });
            if (resolutionResult.conflicts.length > 5) {
              console.log(`   ... e mais ${resolutionResult.conflicts.length - 5} conflitos`);
            }
          }
          
          if (cycles.length > 0) {
            console.log('');
            console.log('⚠️  DEPENDÊNCIAS CIRCULARES DETECTADAS:');
            cycles.slice(0, 3).forEach((cycle: string[]) => {
              console.log(`   - ${cycle.join(' → ')}`);
            });
            if (cycles.length > 3) {
              console.log(`   ... e mais ${cycles.length - 3} ciclos`);
            }
          }
          
          logger.info('Dependency resolution completed', {
            component: 'GenerationPipeline',
            resolved: resolutionResult.resolved.length,
            conflicts: resolutionResult.conflicts.length,
            cycles: cycles.length
          });
          
          // Armazenar resultado para uso posterior (AÇÃO 3.5)
          (this as any).dependencyResolution = resolutionResult;
          
          // Verificar se há conflitos CRÍTICOS
          const criticalConflicts = resolutionResult.conflicts.filter(
            (c: any) => c.severity === 'CRITICAL'
          );
          
          if (criticalConflicts.length > 0) {
            logger.error('CRITICAL dependency conflicts detected', {
              component: 'GenerationPipeline',
              criticalCount: criticalConflicts.length,
              conflicts: criticalConflicts
            });
            
            console.log('');
            console.log('❌ CONFLITOS CRÍTICOS! Pipeline continuará mas com warnings.');
          }
          
        } else {
          console.log('   ℹ️  Nenhum import para resolver.');
        }
        
      } catch (depError) {
        logger.warn('Dependency resolution failed (non-blocking)', {
          component: 'GenerationPipeline',
          error: (depError as Error).message
        });
        
        console.log('');
        console.log('⚠️  Dependency Resolution falhou (continuando...)');
        console.log(`   Erro: ${(depError as Error).message}`);
      }
      
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
    }
    // ═══════════════════════════════════════════════════════════
    // FIM AÇÃO 3
    // ═══════════════════════════════════════════════════════════


    // ═══════════════════════════════════════════════════════════
    // ✨ AÇÃO 3.5: STAGE 5 - REGENERATE MISSING FILES ✨
    // ═══════════════════════════════════════════════════════════
    if (this.config.enableValidation && !projectAlreadyValidated) {
      const orphanedImports = (this as any).orphanedImports || [];
      const generatedExports = (this as any).generatedExports || new Set<string>();
      
      if (orphanedImports.length > 0) {
        logger.info('🔄 [Pipeline] STAGE 5: Regenerate Missing');
        
        try {
          const regenerateResult = await this.stageRegenerateMissing(
            components,
            orphanedImports,
            generatedExports,
            prepareResult.data.analysis
          );
          
          if (regenerateResult.success && regenerateResult.data) {
            const previousCount = components.length;
            components = regenerateResult.data;
            const addedCount = components.length - previousCount;
            
            logger.info('✅ [Pipeline] Stage 5 complete (regenerated)', {
              previousCount,
              newCount: components.length,
              addedCount
            });
            
            // ═══════════════════════════════════════════════════════════
            // REVALIDAR APÓS REGENERAÇÃO
            // ═══════════════════════════════════════════════════════════
            if (addedCount > 0) {
              console.log('');
              console.log('═══════════════════════════════════════════════════════════');
              console.log('🔍 REVALIDANDO após regeneração...');
              console.log('═══════════════════════════════════════════════════════════');
              
              const revalidateResult = await this.stageValidate(components);
              if (revalidateResult.success && revalidateResult.data) {
                components = revalidateResult.data;
                
                const newOrphanedImports = (this as any).orphanedImports || [];
                
                console.log('');
                console.log('✅ REVALIDAÇÃO COMPLETA!');
                console.log(`   Imports orphãos restantes: ${newOrphanedImports.length}`);
                
                if (newOrphanedImports.length === 0) {
                  console.log('   🎉 TODOS os imports agora têm correspondência!');
                } else {
                  console.log(`   ⚠️  Ainda restam ${newOrphanedImports.length} imports orphãos`);
                }
                console.log('═══════════════════════════════════════════════════════════');
                console.log('');
              }
            }
          } else {
            logger.warn('⚠️ [Pipeline] Stage 5 regeneration failed (non-blocking)', {
              error: regenerateResult.error
            });
          }
        } catch (regenerateError) {
          logger.warn('⚠️ [Pipeline] Stage 5 failed (non-blocking)', {
            error: (regenerateError as Error).message
          });
        }
      } else {
        logger.info('✅ [Pipeline] Stage 5 skipped (no missing files)');
      }
    }
    

    // Calculate quality score
    const qualityScore = components.reduce((sum: number, c: GeneratedComponent) =>
      sum + (c.metadata?.qualityScore || 0), 0
    ) / (components.length || 1);

    logger.info('✅ [Pipeline] All stages complete', {
      finalComponents: components.length,
      qualityScore: qualityScore.toFixed(2)
    });

    return {
      success: true,
      components,
      qualityScore,
      dependencies: this.extractAllDependencies(components),
      packageJson: this.generatePackageJson(components),
      readme: this.generateReadme(components)
    };

  } catch (error) {
    logger.error('❌ [Pipeline] Execution failed', {
      component: 'GenerationPipeline',
      error: (error as Error).message,
      stack: (error as Error).stack
    });

    return {
      success: false,
      components: [],
      error: (error as Error).message,
      qualityScore: 0,
      dependencies: [],
      packageJson: '',
      readme: ''
    };
  }
}

 private async stagePrepare(request: GenerationRequest): Promise<PipelineStageResult> {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 [Pipeline] stagePrepare() CHAMADO');
  console.log('[Pipeline] request received:', Boolean(request));
  console.log('═══════════════════════════════════════════════════════');

  logger.info('Pipeline Stage 1: Prepare', {
    component: 'GenerationPipeline',
    promptLength: request?.prompt?.length || 0
  });

  try {
    // ═══════════════════════════════════════════════════════════════
    // VALIDAÇÃO DE REQUEST
    // ═══════════════════════════════════════════════════════════════
    if (!request || !request.prompt) {
      console.error('❌ [Pipeline] stagePrepare - request inválido');
      throw new Error('Invalid request: prompt is required');
    }

    console.log('✅ [Pipeline] Request validado');

    // ═══════════════════════════════════════════════════════════════
    // ANÁLISE COM PROMPT PROCESSOR
    // ═══════════════════════════════════════════════════════════════
    console.log('🧠 [Pipeline] Calling PromptProcessor.process()...');

    let analysis: PromptAnalysisResult;

    try {
      const processingResult = await this.promptProcessor.process({
        sessionId: request.id || `session-${Date.now()}`,
        userId: request.userId || 'system',
        prompt: request.prompt,
        options: {
          enableDetailedAnalysis: true,
          conversationMode: false
        }
      });

      analysis = {
        originalPrompt: request.prompt,
        intent: {
          type: (processingResult as any).classification?.primary?.intent || 'CREATE_APP',
          description: (processingResult as any).classification?.primary?.description || 'Create application',
          confidence: (processingResult as any).classification?.primary?.confidence || 60,
          subIntents: []
        },
        entities: (() => {
          const entities = (processingResult as any).requirements?.extracted?.entities ||
            (processingResult as any).requirements?.entities || [];
          return entities.map((e: any) => typeof e === 'string' ? e : e.name || String(e));
        })(),
        requirements: (processingResult as any).requirements?.functional || [],
        ambiguities: (processingResult as any).ambiguity?.ambiguities || [],
        context: {
          domain: (() => {
            const domain = (processingResult as any).context?.domain;
            if (typeof domain === 'string') return domain;
            if (domain && typeof domain === 'object') return domain.name || 'general';
            return 'general';
          })(),
          complexity: (processingResult as any).context?.complexity ||
            (processingResult as any).analysis?.complexity ||
            'standard'
        },
        confidence: (processingResult as any).classification?.primary?.confidence || 60
      };

    } catch (processorError) {
      console.warn('⚠️ [Pipeline] PromptProcessor failed, using fallback');
      console.warn('[Pipeline] Processor error:', (processorError as Error).message);

      analysis = this.generateFallbackAnalysis(request);
    }

    if (request.productBlueprint) {
      analysis.entities = request.productBlueprint.data.map(entity => entity.name);
      analysis.requirements = request.productBlueprint.capabilities.map(capability => capability.purpose);
      analysis.context = {
        ...analysis.context,
        domain: request.productBlueprint.visualIntent.archetype,
        complexity: request.productBlueprint.depth === 'complete' ? 'advanced' : request.productBlueprint.depth === 'essential' ? 'simple' : 'standard',
        stylePreferences: request.productBlueprint.visualIntent.style,
        colorPalette: [
          request.productBlueprint.visualIntent.palette.cssPrimary,
          request.productBlueprint.visualIntent.palette.cssAccent,
        ],
      };
    }

    // ═══════════════════════════════════════════════════════════════
    // DETECÇÃO DE SCOPE (AI AUTO-DETECTION)
    // ═══════════════════════════════════════════════════════════════
    console.log('🎯 [Pipeline] Detecting scope from intent...');
    
    // ❌ REMOVIDO: userComplexity override
    // ✅ AGORA: Apenas AI detection
    const scope = this.detectScopeFromIntent(analysis, request.prompt);

    console.log('✅ [Pipeline] Scope detected:', {
      type: scope.type,
      complexity: scope.complexity,
      confidence: scope.confidence,
      expectedFiles: `${scope.expectedFileCount.min}-${scope.expectedFileCount.max}`,
      frontend: scope.shouldIncludeFrontend,
      backend: scope.shouldIncludeBackend,
      database: scope.shouldIncludeDatabase
    });

    // ═══════════════════════════════════════════════════════════════
    // BUSCAR TEMPLATES RELEVANTES
    // ═══════════════════════════════════════════════════════════════
    console.log('🔍 [Pipeline] Searching templates...');
    const templates = await this.searchTemplates(analysis, request);

    console.log('✅ [Pipeline] Templates found:', templates?.length || 0);

    // ═══════════════════════════════════════════════════════════════
    // BUILD SPECIFICATION
    // ═══════════════════════════════════════════════════════════════
    if (!analysis.specification) {
      console.log('🔧 [Pipeline] Building specification...');
      analysis.specification = await this.buildSpecification(analysis);
      console.log('✅ [Pipeline] Specification built');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ [Pipeline] stagePrepare() COMPLETE');
    console.log('[Pipeline] Returning with scope and analysis');
    console.log('═══════════════════════════════════════════════════════');

    return {
      success: true,
      data: {
        analysis,
        scope,
        templates,
        specification: analysis.specification,
        request
      }
    };

  } catch (error) {
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ [Pipeline] stagePrepare() ERRO!');
    console.error('[Pipeline] Error:', (error as Error).message);
    console.error('[Pipeline] Stack:', (error as Error).stack);
    console.error('═══════════════════════════════════════════════════════');

    return {
      success: false,
      error: (error as Error).message
    };
  }
}

  /**
   * Analyze prompt using PromptProcessor
   */
  private async analyzePrompt(request: GenerationRequest): Promise<PromptAnalysisResult> {
    try {
      // PromptProcessor.process() returns string currently
      // Use fallback until full integration
      logger.info('Using fallback analysis (PromptProcessor integration pending)', {
        component: 'ContextBuilder'
      });

      return this.generateFallbackAnalysis(request);

    } catch (error) {
      logger.warn('PromptProcessor failed, using fallback', {
        component: 'ContextBuilder'
      });
      return this.generateFallbackAnalysis(request);
    }
  }

  /**
   * Search templates using TemplateManager
   */
  private async searchTemplates(
    analysis: PromptAnalysisResult,
    request: GenerationRequest
  ): Promise<any[]> {
    try {
      const templates = await templateManager.searchTemplates({
        keyword: analysis.intent.description,
        framework: (request.framework || 'react') as Framework,
      });

      // TemplateSearchResult can be array or object with .templates
      const templatesArray = Array.isArray(templates)
        ? templates
        : (templates.templates || []);

      logger.info(`Found ${templatesArray.length} matching templates`, {
        component: 'ContextBuilder'
      });

      return templatesArray;

    } catch (error) {
      logger.warn('Template search failed, using empty array', {
        component: 'ContextBuilder'
      });
      return [];
    }
  }

  /**
   * Build technical specification
   */
  private async buildSpecification(
    analysis: PromptAnalysisResult
  ): Promise<TechnicalSpecification> {
    return {
      architecture: {
        style: 'modular',
        layers: ['presentation', 'business', 'data'],
        patterns: ['mvc', 'repository']
      },
      components: [
        {
          name: 'MainComponent',
          type: 'component',
          purpose: 'Primary interface',
          responsibilities: ['rendering', 'state management']
        }
      ],
      dataModel: [],
      technologies: {
        frontend: ['react', 'typescript'],
        backend: ['node', 'express'],
        database: ['mongodb'],
        deployment: ['docker']
      },
      quality: {
        testingStrategy: 'unit + integration',
        securityRequirements: ['authentication', 'authorization'],
        performanceTargets: ['<100ms response time']
      }
    };
  }

  /**
   * Generate fallback analysis
   */
  private generateFallbackAnalysis(request: GenerationRequest): PromptAnalysisResult {
    return {
      originalPrompt: request.prompt,
      intent: {
        type: 'CREATE_APP',
        description: 'Create application from prompt',
        confidence: 60,
        subIntents: []
      },
entities: [],
      requirements: [],
      ambiguities: [],
      context: {
        domain: request.context?.domain || 'general',
        complexity: request.context?.complexity || 'standard',
        stylePreferences: request.context?.stylePreferences,
        colorPalette: request.context?.colorPalette,
        personality: request.context?.personality
      },
      confidence: 60
    };
  }
/**
 * Stage 2: Generate
 * - Uses specialized generators (backend-generator, ui-generator, code-generator) FIRST
 * - Falls back to AI Provider ONLY if specialized generators fail
 * - Creates MULTIPLE rich components based on scope
 */
private async stageGenerate(prepareData: any): Promise<PipelineStageResult> {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 [Pipeline] stageGenerate() CHAMADO');
  console.log('[Pipeline] prepareData recebido:', prepareData);
  console.log('[Pipeline] prepareData keys:', Object.keys(prepareData || {}));
  console.log('═══════════════════════════════════════════════════════');

  logger.info('Pipeline Stage 2: Generate (SPECIALIZED GENERATORS PREFERRED)', {
    component: 'GenerationPipeline'
  });

  try {
    // ✅ DESTRUCTURE CORRETO (sem request)
    const { analysis, specification, templates } = prepareData;
    const components: GeneratedComponent[] = [];

    console.log('✅ [Pipeline] Destructure complete');
    console.log('[Pipeline] analysis available:', Boolean(analysis));
    console.log('[Pipeline] specification available:', Boolean(specification));
    console.log('[Pipeline] templates count:', templates?.length || 0);

    // ✅ OBTER PROMPT DO ANALYSIS (que veio do request original)
    const originalPrompt = analysis?.originalPrompt || 'Create a React component';
    console.log('✅ [Pipeline] prompt length:', originalPrompt.length);

    // ═══════════════════════════════════════════════════════════════
    // SCOPE DETECTION
    // ═══════════════════════════════════════════════════════════════
    console.log('🔧 [Pipeline] Detecting scope...');
    const scope = prepareData.scope || this.detectScopeFromIntent(prepareData.analysis, originalPrompt);
    const productBlueprint = prepareData.request?.productBlueprint as ProductBlueprint | undefined;
    const visualIntent: VisualIntent =
      productBlueprint?.visualIntent ||
      prepareData.request?.specifications?.detectedContext?.visualIntent ||
      analyzeVisualIntent(originalPrompt, scope.type === ScopeType.LANDING_PAGE ? 'LANDING_PAGE' : undefined);

    analysis.entities = productBlueprint
      ? productBlueprint.data.map(entity => entity.name)
      : this.sanitizeDomainEntities(analysis.entities || [], originalPrompt);

    console.log('🎯 [Pipeline] Scope detected:', {
      type: scope.type,
      confidence: scope.confidence,
      expectedFiles: `${scope.expectedFileCount.min}-${scope.expectedFileCount.max}`
    });

    // Se o escopo precisa de backend/banco e o PromptProcessor não achou
    // nenhuma entidade, tenta extrair via IA antes de seguir - sem isso, todo
    // mundo abaixo (schema, repository, controller...) cai em placeholders
    // genéricos ("Item"/"User") desconectados do que foi pedido de verdade.
    if ((scope.shouldIncludeBackend || scope.shouldIncludeDatabase) && (!analysis.entities || analysis.entities.length === 0)) {
      console.log('🧠 [Pipeline] Nenhuma entidade detectada - tentando extração via IA...');
      const aiEntities = await this.extractEntitiesViaAI(originalPrompt);
      if (aiEntities.length > 0) {
        analysis.entities = this.sanitizeDomainEntities(aiEntities, originalPrompt);
        console.log(`✅ [Pipeline] Entidades extraídas via IA: ${analysis.entities.join(', ')}`);
      } else {
        analysis.entities = this.extractDomainEntitiesFromPrompt(originalPrompt);
        console.warn(`⚠️ [Pipeline] Extração via IA indisponível - entidades determinísticas: ${analysis.entities.join(', ') || 'nenhuma'}`);
      }
    }

(this as any).projectName = visualIntent.brandName || analysis?.entities?.[0] ||
  this.extractMainEntity(analysis?.originalPrompt || '') ||
  'project';
    // ═══════════════════════════════════════════════════════════════
    // BUILD ENRICHED PROMPT (com Minerva Protocol)
    // ═══════════════════════════════════════════════════════════════
    console.log('🔧 [Pipeline] Building enriched prompt...');
    let enrichedPrompt = this.buildEnrichedPrompt(originalPrompt, prepareData.analysis, scope);
    
    // ✅ ADICIONAR FILE COUNT INSTRUCTION AO PROMPT
    if (scope && scope.expectedFileCount) {
      const { min, max } = scope.expectedFileCount;
      const mainEntity = analysis?.entities?.[0] || 'Component';
      const includeTests = prepareData.request?.options?.includeTests !== false;
      
      enrichedPrompt += `

═══════════════════════════════════════════════════════════════════════════
⚠️ CRITICAL FILE COUNT REQUIREMENT ⚠️
═══════════════════════════════════════════════════════════════════════════

YOU MUST GENERATE BETWEEN ${min} AND ${max} FILES!

Current scope: ${scope.type}
User selected complexity: ${scope.complexity}
Expected file count: ${min}-${max} files

MANDATORY FILES TO INCLUDE:

${scope.complexity === 'simple' ? `
For MINIMAL/SIMPLE complexity (${min}-${max} files):
1. ${mainEntity}.tsx - Main component file
2. ${mainEntity}.types.ts - TypeScript interfaces/types
3. ${mainEntity}.mock.ts - Mock data for testing/preview
` : scope.complexity === 'moderate' ? `
For STANDARD/MODERATE complexity (${min}-${max} files):
1. ${mainEntity}.tsx - Main component file
2. ${mainEntity}.types.ts - TypeScript interfaces/types
3. ${mainEntity}.styles.css - Component-specific styles
4. ${mainEntity}.mock.ts - Mock data for testing/preview
5. ${mainEntity}.test.tsx - Unit tests ${includeTests ? '(REQUIRED)' : '(optional)'}
6. ${mainEntity}.stories.tsx - Storybook stories (optional)
7. README.md - Component documentation (optional)
` : `
For FEATURE_RICH/COMPLEX complexity (${min}-${max} files):
Generate complete feature set with:
- Multiple component files
- Shared types and interfaces
- Utilities and helpers
- Styles for each component
- Mock data
- Tests
- Documentation
`}

═══════════════════════════════════════════════════════════════════════════
⚠️ VALIDATION RULES ⚠️
═══════════════════════════════════════════════════════════════════════════

❌ DO NOT generate only 3 files for "standard" complexity
❌ DO NOT skip types file
❌ DO NOT skip mock data
✅ ALWAYS include component file + types + mock at minimum
✅ ADD styles file for standard+ complexity
✅ ADD tests if includeTests is true

═══════════════════════════════════════════════════════════════════════════

`;

      console.log(`✅ [Pipeline] File count instruction added: ${min}-${max} files`);
    }
    
    console.log('✅ [Pipeline] Enriched prompt built (with file count instruction)');

    logger.info('Generating code with scope-aware strategy...', {
      scope: scope.type,
      entities: analysis.entities?.length || 0,
      actions: analysis.actions?.length || 0,
      complexity: analysis.complexity
    });

    // ═══════════════════════════════════════════════════════════════
    // USAR GERADORES ESPECIALIZADOS QUANDO APROPRIADO
    // ═══════════════════════════════════════════════════════════════
    let generatedCode: string = '';
    let generationSource: string = '';
    const plannedEntities = productBlueprint?.data.map(entity => entity.name).filter(Boolean) || analysis.entities || [];

    // ═══════════════════════════════════════════════════════════════
    // DETECTAR SCOPE E ESCOLHER GERADOR APROPRIADO
    // ═══════════════════════════════════════════════════════════════
    if (scope.type === ScopeType.FULLSTACK) {
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔧 [Pipeline] Using code-generator (orchestrator) for FULLSTACK scope');
      console.log('═══════════════════════════════════════════════════════════════');

      const fullstackNeedsDatabase = scope.shouldIncludeDatabase
        || this.requiresAuthentication(originalPrompt)
        || /\b(persistencia|persistence|armazenamento|storage|dados?\s+locais?|local\s+data)\b/i.test(originalPrompt.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

      try {
        console.log('🔧 [Pipeline] Building proper CodeGenerationInput...');
        
        const properInput = {
          projectName: productBlueprint?.product.name || visualIntent.brandName || analysis?.entities?.[0] || `project-${Date.now()}`,
          projectType: 'FULLSTACK' as any,
          entities: plannedEntities,
          visualIntent,
          productBlueprint,
          requirements: {
            description: originalPrompt,
            features: productBlueprint?.capabilities.map(capability => capability.purpose) || analysis.requirements || analysis.entities || this.extractFeaturesFromPrompt(originalPrompt),
            tech_stack: {
              frontend: ['react', 'typescript', 'tailwindcss'],
              backend: ['express', 'typescript'],
              database: fullstackNeedsDatabase
                ? this.detectDatabaseTypeFromPrompt(originalPrompt)
                : undefined
            },
            authentication: productBlueprint?.architecture.authentication ?? this.requiresAuthentication(originalPrompt),
            testing: prepareData.request?.options?.includeTests !== false
          },
          // ✅ Reaproveita scope.shouldIncludeDatabase (já calculado em detectScopeFromIntent,
          // que reconhece "banco de dados" em PT-BR) em vez de re-detectar aqui só em inglês.
          database: fullstackNeedsDatabase ? {
            type: (productBlueprint?.architecture.database || this.detectDatabaseTypeFromPrompt(originalPrompt)) as 'postgresql' | 'mongodb' | 'mysql' | 'sqlite',
            entities: plannedEntities
          } : undefined,
          authentication: productBlueprint?.architecture.authentication ?? this.requiresAuthentication(originalPrompt),
          api_type: productBlueprint?.architecture.api || 'rest' as any,
          options: {
            generateTests: prepareData.request?.options?.includeTests !== false,
            generateDocs: true,
            optimizeCode: true,
            analyzeQuality: true,
            includeDocker: false,
            includeCICD: false
          }
        };

        console.log('✅ [Pipeline] Proper input built:', {
          projectName: properInput.projectName,
          projectType: properInput.projectType,
          features: properInput.requirements.features.length
        });

        // ✅ CHAMADA CORRIGIDA com input no formato adequado
        const fullstackResult = await codeGenerator.generate(properInput);

        console.log('✅ [Pipeline] code-generator returned result');
        console.log('[Pipeline] Result type:', typeof fullstackResult);
        console.log('[Pipeline] Result keys:', Object.keys(fullstackResult || {}));
        console.log('[Pipeline] Has files array:', 'files' in fullstackResult && Array.isArray((fullstackResult as any).files));

        // ═══════════════════════════════════════════════════════════════
        // ✅ SEMPRE USAR FILES DIRETO (NUNCA FAZER PARSING)
        // ═══════════════════════════════════════════════════════════════
        if ('files' in fullstackResult && Array.isArray((fullstackResult as any).files) && (fullstackResult as any).files.length > 0) {
          const directComponents = this.filesToComponents(
            (fullstackResult as any).files,
            analysis?.context?.framework || 'react',
            'code-generator-direct',
            this.extractGeneratorQuality(fullstackResult)
          );
          console.log(`✅ Using ${directComponents.length} files DIRECTLY (NO PARSING - NO DUPLICATES)`);
          components.push(...directComponents);
          generationSource = 'code-generator-direct';
        } else {
          // ═══════════════════════════════════════════════════════════════
          // ❌ code-generator NÃO RETORNOU FILES
          // ═══════════════════════════════════════════════════════════════
          console.error('❌ [Pipeline] code-generator did NOT return files array!');
          console.error('[Pipeline] code-generator result has no files');
          throw new Error('code-generator did not return files array - this should never happen');
        }

      } catch (fullstackError) {
        console.error('═══════════════════════════════════════════════════════════════');
        console.error('❌ [Pipeline] CODE-GENERATOR FAILED! Error details:');
        console.error('[Pipeline] Error message:', (fullstackError as Error).message);
        console.error('[Pipeline] Error stack:', (fullstackError as Error).stack);
        console.error('[Pipeline] Retrying with deterministic domain entities...');
        console.error('═══════════════════════════════════════════════════════════════');

        const retryEntities = this.sanitizeDomainEntities(
          this.extractDomainEntitiesFromPrompt(originalPrompt),
          originalPrompt
        );

        if (retryEntities.length === 0) {
          throw fullstackError;
        }

        const retryInput = {
          projectName: visualIntent.brandName || retryEntities[0] || `project-${Date.now()}`,
          projectType: 'FULLSTACK' as any,
          entities: retryEntities,
          visualIntent,
          requirements: {
            description: originalPrompt,
            features: analysis.requirements || retryEntities || this.extractFeaturesFromPrompt(originalPrompt),
            tech_stack: {
              frontend: ['react', 'typescript', 'tailwindcss'],
              backend: ['express', 'typescript'],
              database: fullstackNeedsDatabase
                ? this.detectDatabaseTypeFromPrompt(originalPrompt)
                : undefined
            },
            authentication: this.requiresAuthentication(originalPrompt),
            testing: prepareData.request?.options?.includeTests !== false
          },
          database: fullstackNeedsDatabase ? {
            type: this.detectDatabaseTypeFromPrompt(originalPrompt),
            entities: retryEntities
          } : undefined,
          authentication: this.requiresAuthentication(originalPrompt),
          api_type: 'rest' as any,
          options: {
            generateTests: prepareData.request?.options?.includeTests !== false,
            generateDocs: true,
            optimizeCode: true,
            analyzeQuality: true,
            includeDocker: false,
            includeCICD: false
          }
        };

        const retryResult = await codeGenerator.generate(retryInput);
        if (!('files' in retryResult) || !Array.isArray((retryResult as any).files) || (retryResult as any).files.length === 0) {
          throw fullstackError;
        }

        analysis.entities = retryEntities;
        components.push(...this.filesToComponents(
          (retryResult as any).files,
          analysis?.context?.framework || 'react',
          'code-generator-deterministic-retry',
          this.extractGeneratorQuality(retryResult)
        ));
        generationSource = 'code-generator-deterministic-retry';
        console.log(`✅ [Pipeline] Deterministic retry completed with ${components.length} files`);
      }

    } else if (scope.type === ScopeType.BACKEND) {
      // ═══════════════════════════════════════════════════════════════
      // BACKEND SCOPE → USA O ORQUESTRADOR COMPLETO (configs + CIG + workspace)
      // ═══════════════════════════════════════════════════════════════
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔧 [Pipeline] Using code-generator for BACKEND scope');
      console.log('═══════════════════════════════════════════════════════════════');

      try {
        const backendInput = {
          projectName: analysis?.entities?.[0] || 'API',
          projectType: 'backend' as any,
          entities: plannedEntities,
          requirements: {
            description: originalPrompt,
            features: analysis.requirements || [],
            tech_stack: {
              backend: ['node', 'express', 'typescript'],
              database: scope.shouldIncludeDatabase
                ? this.detectDatabaseTypeFromPrompt(originalPrompt)
                : undefined
            },
            authentication: this.requiresAuthentication(originalPrompt),
            testing: prepareData.request?.options?.includeTests !== false
          },
          database: scope.shouldIncludeDatabase ? {
            type: this.detectDatabaseTypeFromPrompt(originalPrompt),
            entities: plannedEntities
          } : undefined,
          authentication: this.requiresAuthentication(originalPrompt),
          api_type: 'rest' as const,
          options: {
            generateTests: prepareData.request?.options?.includeTests !== false,
            generateDocs: true,
            optimizeCode: true,
            analyzeQuality: true,
            includeDocker: false,
            includeCICD: false
          }
        };

        console.log('✅ [Pipeline] Backend input built:', backendInput);

        const backendResult = await codeGenerator.generate(backendInput as CodeGenerationInput);

        console.log('✅ [Pipeline] backend-generator returned result');

        if ('files' in backendResult && Array.isArray((backendResult as any).files) && (backendResult as any).files.length > 0) {
          // ✅ USAR FILES ESTRUTURADO DIRETO (mesmo padrão do FULLSTACK - sem parsing via regex)
          const directComponents = this.filesToComponents(
            (backendResult as any).files,
            'node',
            'backend-generator-direct',
            this.extractGeneratorQuality(backendResult)
          );
          console.log(`✅ Using ${directComponents.length} files DIRECTLY from backend-generator (NO PARSING)`);
          components.push(...directComponents);
          generationSource = 'code-generator-backend-direct';
        } else {
          throw new Error('backend-generator returned empty files array');
        }

      } catch (backendError) {
        console.error('═══════════════════════════════════════════════════════════════');
        console.error('❌ [Pipeline] BACKEND-GENERATOR FAILED! Error details:');
        console.error('[Pipeline] Error message:', (backendError as Error).message);
        console.error('[Pipeline] Falling back to AI Provider...');
        console.error('═══════════════════════════════════════════════════════════════');

        const aiResponse = await this.getAIProvider().generateCode({
          prompt: enrichedPrompt,
          maxTokens: 16000,
          temperature: 0.7
        });

        generatedCode = (aiResponse && typeof aiResponse === 'object' && 'code' in aiResponse)
          ? (aiResponse as any).code
          : String(aiResponse || '');

        generationSource = 'ai-provider-fallback-from-backend-generator';
        
        console.log(`⚠️ [Pipeline] Fallback completed, code length: ${generatedCode.length} chars`);
      }

    } else if (scope.type === ScopeType.LANDING_PAGE || scope.type === ScopeType.SINGLE_COMPONENT) {
      // ═══════════════════════════════════════════════════════════════
      // FRONTEND/COMPONENT/PAGE → USA ui-generator SEMPRE
      // ═══════════════════════════════════════════════════════════════
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔧 [Pipeline] Using ui-generator for scope:', scope.type);
      console.log('═══════════════════════════════════════════════════════════════');

      try {
        const uiInput = {
          framework: analysis?.context?.framework || 'react',
          generationType: scope.type === ScopeType.LANDING_PAGE ? 'LANDING_PAGE' : 'COMPONENT',
          complexity: scope.complexity,
          context: { domain: analysis.context.domain },
          visualIntent,
          entities: plannedEntities,
          // ⚠️ uiGenerator.generate() acessa requirements.description/.features
          // internamente (extractEntities/checkAuthRequired) mesmo quando
          // `entities` já vem pronto - sem isso ele lança exceção e cai no
          // fallback mínimo (1-2 arquivos genéricos), silenciosamente.
          requirements: {
            description: originalPrompt,
            features: analysis.requirements || [],
            tech_stack: { frontend: ['react', 'typescript'] }
          }
        };

        console.log('✅ [Pipeline] UI input built:', uiInput);

        const uiResult = await uiGenerator.generate(uiInput as any);

        console.log('✅ [Pipeline] ui-generator returned result');

        const uiFiles = ('files' in uiResult && Array.isArray((uiResult as any).files) && (uiResult as any).files.length > 0)
          ? (uiResult as any).files
          : (('components' in uiResult && Array.isArray((uiResult as any).components)) ? (uiResult as any).components : []);

        if (uiFiles.length > 0) {
          // ✅ USAR FILES ESTRUTURADO DIRETO (mesmo padrão do FULLSTACK - sem parsing via regex)
          const directComponents = this.filesToComponents(
            uiFiles,
            analysis?.context?.framework || 'react',
            'ui-generator-direct',
            this.extractGeneratorQuality(uiResult)
          );
          console.log(`✅ Using ${directComponents.length} files DIRECTLY from ui-generator (NO PARSING)`);
          components.push(...directComponents);
          generationSource = 'ui-generator-direct';
        } else {
          throw new Error('ui-generator returned empty files array');
        }

      } catch (uiError) {
        console.error('═══════════════════════════════════════════════════════════════');
        console.error('❌ [Pipeline] UI-GENERATOR FAILED! Error details:');
        console.error('[Pipeline] Error message:', (uiError as Error).message);
        console.error('[Pipeline] Falling back to AI Provider...');
        console.error('═══════════════════════════════════════════════════════════════');

        const aiResponse = await this.getAIProvider().generateCode({
          prompt: enrichedPrompt,
          maxTokens: 12000,
          temperature: 0.7
        });

        generatedCode = (aiResponse && typeof aiResponse === 'object' && 'code' in aiResponse)
          ? (aiResponse as any).code
          : String(aiResponse || '');

        generationSource = 'ai-provider-fallback-from-ui-generator';
        
        console.log(`⚠️ [Pipeline] Fallback completed, code length: ${generatedCode.length} chars`);
      }

    } else {
      // ═══════════════════════════════════════════════════════════════
      // OUTROS SCOPES → USA code-generator genérico PRIMEIRO
      // ═══════════════════════════════════════════════════════════════
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('🔧 [Pipeline] Using code-generator (generic) for scope:', scope.type);
      console.log('═══════════════════════════════════════════════════════════════');

      try {
       const genericInput = {
projectName: analysis?.entities?.[0] || this.extractMainEntity(analysis?.originalPrompt || '') || 'App',

  projectType: 'frontend' as any,          // ← era 'FEATURE'
  entities: plannedEntities,
  requirements: {
    description: originalPrompt,
    features: analysis.requirements || [],
    tech_stack: {
      frontend: ['react', 'typescript']
    }
  }
};

        console.log('✅ [Pipeline] Generic input built:', genericInput);

        const genericResult = await codeGenerator.generate(genericInput);

        console.log('✅ [Pipeline] code-generator returned result');

        if ('files' in genericResult && Array.isArray((genericResult as any).files) && (genericResult as any).files.length > 0) {
          // ✅ USAR FILES ESTRUTURADO DIRETO (mesmo padrão do FULLSTACK - sem parsing via regex)
          const directComponents = this.filesToComponents(
            (genericResult as any).files,
            analysis?.context?.framework || 'react',
            'code-generator-generic-direct',
            this.extractGeneratorQuality(genericResult)
          );
          console.log(`✅ Using ${directComponents.length} files DIRECTLY from code-generator (NO PARSING)`);
          components.push(...directComponents);
          generationSource = 'code-generator-generic-direct';
        } else {
          throw new Error('code-generator returned empty files array');
        }

      } catch (genericError) {
        console.error('═══════════════════════════════════════════════════════════════');
        console.error('❌ [Pipeline] CODE-GENERATOR (generic) FAILED! Error details:');
        console.error('[Pipeline] Error message:', (genericError as Error).message);
        console.error('[Pipeline] Falling back to AI Provider...');
        console.error('═══════════════════════════════════════════════════════════════');

        const aiResponse = await this.getAIProvider().generateCode({
          prompt: enrichedPrompt,
          maxTokens: 8000,
          temperature: 0.7
        });

        generatedCode = (aiResponse && typeof aiResponse === 'object' && 'code' in aiResponse)
          ? (aiResponse as any).code
          : String(aiResponse || '');

        generationSource = 'ai-provider-last-resort';
        
        console.log(`⚠️ [Pipeline] Fallback completed, code length: ${generatedCode.length} chars`);
      }
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ [Pipeline] Code generated via: ${generationSource}`);
    console.log('[Pipeline] Final code length:', generatedCode?.length || 0);
    console.log('═══════════════════════════════════════════════════════════════');

    // ═══════════════════════════════════════════════════════════════
    // SPLIT CODE INTO COMPONENTS (APENAS SE NÃO RETORNOU DIRETO - i.e.
    // só quando nenhum gerador especializado populou `components` com
    // files[] estruturado e caímos no fallback bruto de AI provider)
    // ═══════════════════════════════════════════════════════════════
    if (components.length === 0 && generatedCode && generatedCode.trim().length > 0) {
      console.log('✅ [Pipeline] Code generated successfully, splitting into components...');

      const componentBlocks = this.splitCodeIntoComponents(generatedCode, analysis, scope);

      console.log('[Pipeline] Component blocks:', componentBlocks.length);

      componentBlocks.forEach((block: any) => {
        components.push({
          name: block.name,
          type: block.type,
          code: block.code,
          path: block.path,
          language: 'typescript',
          framework: analysis?.context?.framework || 'react',
          dependencies: this.extractDependencies(block.code),
          files: block.files || [{
            path: block.path,
            content: block.code,
            language: 'typescript'
          }],
          metadata: {
            linesOfCode: block.code.split('\n').length,
            complexity: this.calculateComplexity(block.code),
            generated: true,
            qualityScore: 75
          }
        });
      });

      logger.info(`✅ Generated ${components.length} components`);

    } else if (components.length === 0) {
      console.warn('⚠️ [Pipeline] No code generated (empty or null)');
    } else {
      console.log(`✅ [Pipeline] ${components.length} components already populated directly from specialized generator (source: ${generationSource}), skipping split`);
    }

    // ═══════════════════════════════════════════════════════════════
    // FILE COUNT VALIDATION & WARNING
    // ═══════════════════════════════════════════════════════════════
    const fileCount = components.length;
    const expectedMin = scope.expectedFileCount.min;
    const expectedMax = scope.expectedFileCount.max;

    console.log('📊 [Pipeline] File count validation:', {
      generated: fileCount,
      expectedMin,
      expectedMax,
      scope: scope.type
    });

    if (fileCount < expectedMin) {
      logger.warn(`⚠️ File count below expected minimum!`, {
        component: 'GenerationPipeline',
        metadata: { generated: fileCount, expectedMin, scope: scope.type }
      });
    } else if (fileCount > expectedMax) {
      logger.warn(`⚠️ File count exceeds expected maximum`, {
        component: 'GenerationPipeline',
        metadata: { generated: fileCount, expectedMax }
      });
    } else {
      console.log(`✅ [Pipeline] File count within expected range: ${fileCount} files`);
    }

    // ═══════════════════════════════════════════════════════════════
    // FALLBACK: Se nada foi gerado
    // ═══════════════════════════════════════════════════════════════
    if (components.length === 0) {
      console.log('⚠️ [Pipeline] No components generated, using fallback');
      logger.warn('No components generated, using fallback');

      components.push({
        name: 'App',
        type: 'component',
        code: this.generateFallbackComponent(originalPrompt),
        path: 'src/App.tsx',
        language: 'typescript',
        framework: 'react',
        dependencies: ['react'],
        metadata: {
          linesOfCode: 20,
          complexity: 3,
          generated: true,
          qualityScore: 60
        }
      });
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ [Pipeline] stageGenerate() COMPLETE');
    console.log(`[Pipeline] Total components generated: ${components.length}`);
    console.log(`[Pipeline] Generation source: ${generationSource}`);
    console.log('═══════════════════════════════════════════════════════');

    logger.info(`✅ Total components generated: ${components.length}`);
// Coletar exports para uso no stageValidate (antes do pipeline continuar)
const generatedExports = new Set<string>();
components.forEach((comp: any) => {
  if (!comp.code) return;
  const exportRegex = /export\s+(?:default\s+)?(?:class|interface|function|const|type)\s+(\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = exportRegex.exec(comp.code)) !== null) {
    if (match[1]) generatedExports.add(match[1]);
  }
});
(this as any).generatedExports = generatedExports;
console.log(`✅ [stageGenerate] Exports pré-coletados: ${generatedExports.size}`);
    return {
      success: true,
      data: { components, generationSource }
    };

  } catch (error) {
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ [Pipeline] stageGenerate() ERRO!');
    console.error('[Pipeline] Error:', (error as Error).message);
    console.error('[Pipeline] Stack:', (error as Error).stack);
    console.error('═══════════════════════════════════════════════════════');

    logger.error('Stage 2 failed', { error: (error as Error).message });

    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * Converte resultado de generators para string
 * Usado para compatibilidade com splitCodeIntoComponents()
 */
private convertGeneratorResultToString(result: any): string {
  if (typeof result === 'string') return result;
  
  // Se tem files[] array
  if ('files' in result && Array.isArray(result.files)) {
    return result.files
      .map((f: any) => {
        const path = f.path || f.name || 'unknown';
        const content = f.content || f.code || '';
        return `// ${path}\n${content}`;
      })
      .join('\n\n');
  }
  
  // Se tem components[] array
  if ('components' in result && Array.isArray(result.components)) {
    return result.components
      .map((c: any) => {
        const name = c.name || 'Component';
        const code = c.code || c.content || '';
        return `// Component: ${name}\n${code}`;
      })
      .join('\n\n');
  }
  
  // Fallback: stringify
  return JSON.stringify(result, null, 2);
}

/**
 * Converte o files[] estruturado devolvido por um gerador especializado
 * (codeGenerator/backendGenerator/uiGenerator) diretamente em GeneratedComponent[],
 * sem passar por convertGeneratorResultToString()/splitCodeIntoComponents().
 * Evita achatar arquivos estruturados num blob de texto para depois
 * readivinhar os limites de arquivo com regex.
 */
private filesToComponents(
  files: any[],
  framework: string,
  source: string,
  qualityScore = 75
): GeneratedComponent[] {
  return files
    .filter((f: any) => f && (f.content || f.code))
    .map((f: any) => {
      const code = f.content || f.code || '';
      // backendGenerator/uiGenerator/codeGenerator devolvem path (diretório)
      // e filename/name (nome do arquivo) em campos SEPARADOS - normalizeFile()
      // no generation.controller.ts precisa dos dois para montar o path final
      // corretamente; sem name/filename ele cai no default "generated.ts" para
      // todo mundo e a deduplicação por path apaga os arquivos.
      const filename = f.filename || f.name || (f.path ? f.path.split('/').pop() : 'file');
      return {
        name: filename,
        type: (f.type as GeneratedComponent['type']) || 'component',
        code,
        path: f.path || filename,
        language: 'typescript',
        framework,
        dependencies: this.extractDependencies(code),
        files: [{
          path: f.path,
          name: filename,
          filename,
          content: code,
          metadata: f.metadata
        }],
        metadata: {
          ...f.metadata,
          linesOfCode: code.split('\n').length,
          complexity: this.calculateComplexity(code),
          generated: true,
          qualityScore
        }
      };
    });
}

private extractGeneratorQuality(result: any): number {
  const candidates = [
    result?.pipeline?.stageResults?.quality?.output?.overallScore,
    result?.metadata?.visualAudit?.score,
    result?.metadata?.qualityScore,
    result?.qualityScore,
  ];
  const score = candidates.find(value => typeof value === 'number' && Number.isFinite(value));
  return typeof score === 'number' ? Math.max(0, Math.min(100, score)) : 75;
}


/**
 * Extrai features básicas do prompt quando não estão estruturadas
 */
private requiresAuthentication(prompt: string): boolean {
  const normalized = prompt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return /\b(auth|authentication|autenticacao|login|jwt)\b/.test(normalized);
}

private extractFeaturesFromPrompt(prompt: string): string[] {
  const features: string[] = [];
  const lowerPrompt = prompt.toLowerCase();
  
  if (this.requiresAuthentication(prompt)) {
    features.push('User Authentication');
  }
  if (lowerPrompt.includes('crud') || (lowerPrompt.includes('create') && lowerPrompt.includes('delete'))) {
    features.push('CRUD Operations');
  }
  if (lowerPrompt.includes('dashboard')) {
    features.push('Dashboard');
  }
  if (lowerPrompt.includes('task') || lowerPrompt.includes('todo') || lowerPrompt.includes('tarefa')) {
    features.push('Task Management');
  }
  if (lowerPrompt.includes('project') || lowerPrompt.includes('projeto')) {
    features.push('Project Management');
  }
  if (lowerPrompt.includes('team') || lowerPrompt.includes('equipe')) {
    features.push('Team Management');
  }
  if (lowerPrompt.includes('user') && lowerPrompt.includes('manage')) {
    features.push('User Management');
  }
  
  return features.length > 0 ? features : ['Core Functionality'];
}

private extractDomainEntitiesFromPrompt(prompt: string): string[] {
  const normalized = prompt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const vocabulary: Array<[RegExp, string]> = [
    [/\b(users?|usuarios?)\b/, 'User'],
    [/\b(contacts?|contatos?)\b/, 'Contact'],
    [/\b(companies|company|empresas?)\b/, 'Company'],
    [/\b(deals?|negocios?|oportunidades?)\b/, 'Deal'],
    [/\b(leads)\b/, 'Lead'],
    [/\b(customers?|clientes?|consumidores?)\b/, 'Customer'],
    [/\b(tasks?|todos?|tarefas?)\b/, 'Task'],
    [/\b(projects?|projetos?)\b/, 'Project'],
    [/\b(teams|equipes)\b/, 'Team'],
    [/\b(products?|produtos?)\b/, 'Product'],
    [/\b(orders?|pedidos?)\b/, 'Order'],
    [/\b(appointments?|agendamentos?|consultas?)\b/, 'Appointment'],
    [/\b(patients?|pacientes?)\b/, 'Patient'],
    [/\b(invoices?|faturas?)\b/, 'Invoice'],
    [/\b(posts?|publicacoes?)\b/, 'Post'],
    [/\b(comments?|comentarios?)\b/, 'Comment'],
    [/\b(documents?|documentos?)\b/, 'Document'],
    [/\b(events?|eventos?)\b/, 'Event'],
  ];
  const entities = vocabulary
    .filter(([pattern]) => pattern.test(normalized))
    .map(([, entity]) => entity);
  return Array.from(new Set(entities)).slice(0, 8);
}

private sanitizeDomainEntities(entities: unknown[], prompt = ''): string[] {
  const technicalTerms = new Set([
    'api', 'rest', 'crud', 'http', 'https', 'get', 'post', 'put', 'patch', 'delete',
    'express', 'react', 'typescript', 'javascript', 'node', 'nodejs', 'prisma',
    'postgres', 'postgresql', 'mongodb', 'mysql', 'sqlite', 'sql', 'frontend',
    'backend', 'fullstack', 'database', 'interface', 'controller', 'service',
    'repository', 'route', 'routes', 'validator', 'middleware', 'dashboard',
    'app', 'application', 'aplicacao', 'sistema', 'system', 'software', 'platform',
    'plataforma', 'screen', 'tela', 'page', 'pagina', 'login', 'logout', 'auth',
    'authentication', 'autenticacao', 'deve', 'criar', 'create', 'permitir', 'allow',
    'include', 'inclui', 'incluir', 'support', 'suporte', 'visual', 'interface',
  ]);

  const normalizedPrompt = prompt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const hasProductDomain = /\b(produtos|products|catalogo|catalog|estoque|inventory|sku|checkout|carrinho|cart|e-?commerce|loja|store)\b/.test(normalizedPrompt)
    || /\b(gerir|gerenciar|gestao|cadastro|vender|manage)\s+(?:de\s+)?(?:o\s+)?produto\b/.test(normalizedPrompt);
  const hasUserDomain = /\b(users?|usuarios?)\b/.test(normalizedPrompt);

  const aliases = new Map<string, string>([
    ['users', 'User'], ['usuarios', 'User'], ['usuario', 'User'],
    ['contacts', 'Contact'], ['contatos', 'Contact'], ['contato', 'Contact'],
    ['companies', 'Company'], ['empresas', 'Company'], ['empresa', 'Company'],
    ['deals', 'Deal'], ['negocios', 'Deal'], ['negocio', 'Deal'], ['oportunidades', 'Deal'],
    ['tasks', 'Task'], ['tarefas', 'Task'], ['tarefa', 'Task'],
    ['customers', 'Customer'], ['clientes', 'Customer'], ['cliente', 'Customer'],
    ['patients', 'Patient'], ['pacientes', 'Patient'], ['paciente', 'Patient'],
    ['appointments', 'Appointment'], ['agendamentos', 'Appointment'], ['consultas', 'Appointment'],
    ['products', 'Product'], ['produtos', 'Product'], ['produto', 'Product'],
    ['orders', 'Order'], ['pedidos', 'Order'], ['pedido', 'Order'],
  ]);
  const deterministic = this.extractDomainEntitiesFromPrompt(prompt)
    .filter(entity => entity.toLowerCase() !== 'product' || hasProductDomain);
  const sanitized = entities
      .filter((entity): entity is string => typeof entity === 'string')
      .map(entity => entity.trim().replace(/[^A-Za-z0-9À-ÿ]/g, ''))
      .map(entity => aliases.get(entity.toLowerCase()) || entity)
      .filter(entity => entity.length > 1 && !technicalTerms.has(entity.toLowerCase()))
      .filter(entity => entity.toLowerCase() !== 'product' || hasProductDomain)
      .filter(entity => entity.toLowerCase() !== 'user' || hasUserDomain)
      .filter(entity => /^[A-Za-zÀ-ÿ][A-Za-z0-9À-ÿ]*$/.test(entity));

  return Array.from(new Set([...sanitized, ...deterministic])).slice(0, 8);
}

/**
 * Detecta tipo de database mencionado no prompt
 */
private detectDatabaseFromPrompt(prompt: string): string | undefined {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('prisma')) return 'prisma';
  if (lowerPrompt.includes('postgres') || lowerPrompt.includes('postgresql')) return 'postgresql';
  if (lowerPrompt.includes('mongo')) return 'mongodb';
  if (lowerPrompt.includes('mysql')) return 'mysql';
  if (lowerPrompt.includes('database') || lowerPrompt.includes('db') || lowerPrompt.includes('banco de dados')) return 'postgresql'; // default

  return undefined;
}

private detectDatabaseTypeFromPrompt(
  prompt: string
): 'postgresql' | 'mongodb' | 'mysql' | 'sqlite' {
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes('sqlite')) return 'sqlite';
  if (/persist[eê]ncia local|armazenamento local|dados? locais?|local persistence|local storage/.test(lowerPrompt)) return 'sqlite';
  if (lowerPrompt.includes('mongo')) return 'mongodb';
  if (lowerPrompt.includes('mysql')) return 'mysql';
  return 'postgresql';
}

/**
 * Extrai entidades de domínio via IA quando o PromptProcessor não encontrou
 * nenhuma (analysis.entities vazio). O extrator de entidades interno do
 * PromptProcessor/code-generator só reconhece um punhado fixo de palavras em
 * inglês (user/task/product...) e nunca bate com domínios/idiomas diferentes -
 * por isso um pedido pontual à IA aqui, só quando realmente falta.
 */
private async extractEntitiesViaAI(prompt: string): Promise<string[]> {
  try {
    const response = await this.getAIProvider().chat(
      [
        {
          role: 'system',
          content:
            'Extract the main domain/business entities (data models) implied by the user request below. Respond with ONLY a JSON array of 1 to 6 entity names, each a singular PascalCase English identifier (e.g. "Book", "Author", "Loan"), even if the request is written in another language. No explanations, no markdown, just the JSON array.'
        },
        { role: 'user', content: prompt }
      ],
      { temperature: 0.1, maxTokens: 200 }
    );

    let raw = (response.content || '').trim();
    const fenceMatch = raw.match(/```(?:json)?\n?([\s\S]*?)```/);
    if (fenceMatch && fenceMatch[1]) {
      raw = fenceMatch[1].trim();
    }

    const arrayMatch = raw.match(/\[[\s\S]*\]/);
    if (!arrayMatch) return [];

    const parsed = JSON.parse(arrayMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((e: any) => typeof e === 'string' && /^[A-Za-z][A-Za-z0-9]*$/.test(e))
      .slice(0, 6);
  } catch (error) {
    console.warn('[Pipeline] extractEntitiesViaAI falhou:', (error as Error).message);
    return [];
  }
}


/**
 * ═══════════════════════════════════════════════════════════════
 * BUILD ENRICHED PROMPT WITH SCOPE-AWARE INSTRUCTIONS v9.0
 * ═══════════════════════════════════════════════════════════════
 * Constrói prompt otimizado baseado no scope detectado
 * INTEGRA: Minerva Omega Cognitive Generation Protocol v3.0
 * SUPORTE: Frontend, Backend, Fullstack, Landing Pages
 * 
 * ✅ NOVO v9.0: 
 * - Pre-calculates expected filenames
 * - Banned patterns enforcement
 * - Visual checklist for AI
 * ═══════════════════════════════════════════════════════════════
 */
private buildEnrichedPrompt(
  originalPrompt: string,
  analysis: PromptAnalysisResult,
  scope: ScopeDetectionResult
): string {

  // ═══════════════════════════════════════════════════════════════
  // EXTRACT ANALYSIS DATA (com fallbacks seguros)
  // ═══════════════════════════════════════════════════════════════
  const entitiesList = analysis.entities?.join(', ') || 'general entities';
  const actionsList = (analysis as any).actions?.join(', ') || 'standard actions';
  const uiElementsList = (analysis as any).uiElements?.map((ui: any) => ui.type).join(', ') || 'UI components';
  const framework = (analysis as any).suggestedFramework || 'react';
  const complexity = scope.complexity;
  const mainEntity = analysis.entities && analysis.entities.length > 0
    ? analysis.entities[0]
    : 'Item';

  // ═══════════════════════════════════════════════════════════════
  // ✅ NOVO v9.0: PRE-CALCULATE EXPECTED FILENAMES
  // ═══════════════════════════════════════════════════════════════
  const expectedFileNames = this.generateExpectedFileNames(analysis.entities || [mainEntity]);

  // ═══════════════════════════════════════════════════════════════
  // ✅ NOVO v9.0: BANNED PATTERNS (dot notation prohibition)
  // ═══════════════════════════════════════════════════════════════
  const bannedFileNames = this.generateBannedFileNames(analysis.entities || [mainEntity]);

  // ═══════════════════════════════════════════════════════════════
  // MINERVA OMEGA BASE PROTOCOL (aplicado em TODOS os prompts)
  // ═══════════════════════════════════════════════════════════════
  const minervaBaseProtocol = `
╔═══════════════════════════════════════════════════════════════╗
║ 🧬 MINERVA OMEGA COGNITIVE GENERATION PROTOCOL v3.0           ║
╚═══════════════════════════════════════════════════════════════╝

You are Minerva Omega TypeScript Supreme - Master AI Code Generator.

⚡ CORE PRINCIPLES (NON-NEGOTIABLE):

1. COMPILER-INTEGRITY GUARANTEED (CIG-2.0)
   ✅ Zero compilation errors
   ✅ Zero runtime type errors
   ✅ All imports/exports correct (no missing imports)
   ✅ All dependencies declared
   ✅ Add closing braces } for ALL functions, components, classes

2. TYPES-FIRST APPROACH
   ✅ Define interfaces BEFORE implementation
   ✅ Never use 'any' type (use Request, Response, NextFunction for Express)
   ✅ Export all types as named exports (export interface X, export type Y)
   ✅ Create .types.ts files for shared types

3. DEPENDENCY CONSCIOUSNESS
   ✅ Map all symbols before first line of code
   ✅ Generate missing types immediately
   ✅ Use import type { } for type-only imports
   ✅ Resolve circular dependencies

4. FUNCTIONAL CODE ONLY
   ✅ No TODOs or placeholders
   ✅ No "implement this later" comments
   ✅ All functions have real implementation
   ✅ Mock data is structured and realistic
   ✅ All components referenced in imports must exist

5. NAMED EXPORTS STANDARD
   ✅ Use "export const ComponentName" for React components
   ✅ Use "export default router" for Express routers
   ✅ Use "export interface TypeName" for types
   ✅ Consistent import/export patterns
   ✅ Clear module boundaries

6. CORRECT EXPORT SYNTAX
   ✅ export const MyComponent: React.FC = () => { return (...); };
   ✅ export default MyComponent; (when needed)
   ❌ NEVER: export const MyComponent; (without implementation)

═══════════════════════════════════════════════════════════════`;

  // ═══════════════════════════════════════════════════════════════
  // ✅ NOVO v9.0: ULTRA-STRONG NAMING ENFORCEMENT (MOVED TO TOP!)
  // ═══════════════════════════════════════════════════════════════
  const namingEnforcementSection = `

╔═══════════════════════════════════════════════════════════════╗
║ 🚨🚨🚨 CRITICAL: FILENAME RULES (MOST IMPORTANT!) 🚨🚨🚨        ║
╚═══════════════════════════════════════════════════════════════╝

**⚠️  READ THIS FIRST - VERIFY EVERY FILENAME BEFORE GENERATING!**

═══════════════════════════════════════════════════════════════
📋 SECTION 1: EXPECTED FILENAMES (GENERATE EXACTLY THESE)
═══════════════════════════════════════════════════════════════

You MUST generate files with EXACTLY these names:

${expectedFileNames.correct.map((name, i) => `${i + 1}. ✅ ${name}`).join('\n')}

═══════════════════════════════════════════════════════════════
🚫 SECTION 2: BANNED FILENAMES (NEVER GENERATE THESE)
═══════════════════════════════════════════════════════════════

DO NOT GENERATE these patterns (DOT NOTATION IS FORBIDDEN):

${bannedFileNames.map((name, i) => `${i + 1}. ❌ ${name} (BANNED!)`).join('\n')}

═══════════════════════════════════════════════════════════════
📐 SECTION 3: NAMING RULES (MANDATORY PATTERNS)
═══════════════════════════════════════════════════════════════

**Backend Files:**
- Controllers:  {Entity}Controller.ts    → ✅ UserController.ts    ❌ User.controller.ts
- Services:     {Entity}Service.ts       → ✅ UserService.ts       ❌ User.service.ts
- Repositories: {Entity}Repository.ts    → ✅ UserRepository.ts    ❌ User.repository.ts

**Lowercase Files (only in specific folders):**
- Routes:       {entity}.routes.ts       → ✅ user.routes.ts       ❌ User.routes.ts
- Validators:   {entity}.validators.ts   → ✅ user.validators.ts   ❌ User.validators.ts
- Types:        {entity}.types.ts        → ✅ user.types.ts        ❌ User.types.ts

**Frontend Files:**
- Components:   {Entity}{Type}.tsx       → ✅ UserForm.tsx         ❌ User.form.tsx
- Pages:        {Entity}{Page}.tsx       → ✅ UserListPage.tsx     ❌ UserList.page.tsx
- Hooks:        use{Entity}.ts           → ✅ useAuth.ts           ❌ use.auth.ts

═══════════════════════════════════════════════════════════════
✅ SECTION 4: PRE-GENERATION CHECKLIST (VERIFY BEFORE OUTPUT)
═══════════════════════════════════════════════════════════════

BEFORE generating EACH file, ask yourself:

[ ] Does the filename match the EXPECTED FILENAMES list above? ✅
[ ] Is there a DOT (.) in the middle of the filename? ❌ (if yes, STOP!)
[ ] Is the Controller/Service/Repository in PascalCase? ✅
[ ] Are routes/validators/types in lowercase? ✅
[ ] Did I check the BANNED FILENAMES list? ✅

**IF ANY CHECK FAILS → STOP AND FIX BEFORE GENERATING!**

═══════════════════════════════════════════════════════════════
🎯 SECTION 5: CORRECT VS WRONG EXAMPLES
═══════════════════════════════════════════════════════════════

**✅ CORRECT IMPORTS (COPY THESE):**
\`\`\`typescript
import { UserController } from './controllers/UserController';
import { TaskService } from './services/TaskService';
import { ProjectRepository } from './repositories/ProjectRepository';
import { userRouter } from './routes/user.routes';
\`\`\`

**❌ WRONG IMPORTS (NEVER USE THESE):**
\`\`\`typescript
import { UserController } from './controllers/User.controller'; // ❌ DOT FORBIDDEN!
import { TaskService } from './services/Task.service'; // ❌ DOT FORBIDDEN!
import { user_controller } from './controllers/user_controller'; // ❌ UNDERSCORE FORBIDDEN!
\`\`\`

═══════════════════════════════════════════════════════════════
⚠️  FINAL WARNING: VERIFY FILENAME BEFORE EACH FILE GENERATION!
═══════════════════════════════════════════════════════════════`;

  // ═══════════════════════════════════════════════════════════════
  // SCOPE-SPECIFIC PROMPTS
  // ═══════════════════════════════════════════════════════════════

  if (scope.type === ScopeType.SINGLE_COMPONENT) {
    return `${minervaBaseProtocol}

╔═══════════════════════════════════════════════════════════════╗
║ SCOPE: SINGLE COMPONENT (MINIMAL)                             ║
╚═══════════════════════════════════════════════════════════════╝

**USER REQUEST:** "${originalPrompt}"

**STRICT GENERATION RULES:**

📦 FILE COUNT: Generate EXACTLY 2-4 files maximum
   1. ${mainEntity}.tsx (the component)
   2. ${mainEntity}.types.ts (TypeScript types)
   3. ${mainEntity}.mock.ts (mock data - optional)
   4. ${mainEntity}.styles.css (styles - optional)

🚫 DO NOT GENERATE:
   ❌ App.tsx or index.tsx
   ❌ API layers or services
   ❌ Routing files
   ❌ Multiple components (only the requested one)  
   ❌ Backend code

✅ COMPONENT REQUIREMENTS:
   - Use React functional component with hooks
   - Include TypeScript props interface in separate .types.ts file
   - Use Tailwind CSS for styling (inline classes)
   - Make it responsive (mobile-first with sm:, md:, lg: breakpoints)
   - Add proper prop validation
   - Include JSDoc comments
   - Use semantic HTML elements
   - Implement hover states and transitions

📤 OUTPUT FORMAT:
\`\`\`typescript:${mainEntity}.tsx
import React from 'react';
import { ${mainEntity}Props } from './${mainEntity}.types';

/**
 * ${mainEntity} component
 * @description [Brief description]
 */
export const ${mainEntity}: React.FC<${mainEntity}Props> = ({ ...props }) => {
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
};
\`\`\`

\`\`\`typescript:${mainEntity}.types.ts
/**
 * ${mainEntity} types
 */
export interface ${mainEntity}Props {
  // Props definition with JSDoc
}
\`\`\`

**ENTITIES DETECTED:** ${entitiesList}
**FRAMEWORK:** ${framework}
**UI ELEMENTS:** ${uiElementsList}

GENERATE NOW - ONLY THE REQUESTED COMPONENT WITH COMPLETE IMPLEMENTATION.`;
  }

  // ───────────────────────────────────────────────────────────────

  if (scope.type === ScopeType.LANDING_PAGE) {
    return `${minervaBaseProtocol}

╔═══════════════════════════════════════════════════════════════╗
║ SCOPE: LANDING PAGE (HIGH CONVERSION)                         ║
╚═══════════════════════════════════════════════════════════════╝

**USER REQUEST:** "${originalPrompt}"

**STRICT GENERATION RULES:**

📦 FILE COUNT: Generate 8-15 files for complete landing page
   - Multiple sections (Hero, Features, CTA, Footer)
   - Reusable components
   - Types and utilities
   - Responsive images

✅ REQUIRED SECTIONS (Generate ALL):
   
   🏠 HERO SECTION:
      - Eye-catching headline (H1 with large text)
      - Compelling sub-headline (value proposition)
      - Primary CTA button (prominent, contrasting color)
      - Secondary CTA button (optional)
      - Hero image or gradient background
      - Social proof (logos, testimonials, stats)
   
   ✨ FEATURES SECTION:
      - 3-6 feature cards with icons
      - Feature titles and descriptions
      - Grid layout (responsive)
      - Hover effects
   
   💰 PRICING SECTION (if applicable):
      - Pricing tiers (3 options recommended)
      - Feature comparison
      - Recommended badge
      - Monthly/yearly toggle
   
   📝 TESTIMONIALS:
      - Customer quotes
      - Avatar images
      - Names and titles
      - Star ratings
   
   📧 CTA SECTION:
      - Email capture form
      - Benefit-focused copy
      - Privacy assurance
      - Submit button with loading state
   
   🦶 FOOTER:
      - Company links
      - Social media icons
      - Copyright notice
      - Legal links (Privacy, Terms)

✅ DESIGN REQUIREMENTS:
   - Modern, clean aesthetic
   - Tailwind CSS with custom design tokens
   - Smooth scroll behavior
   - Sticky header (optional)
   - Mobile-first responsive (sm:, md:, lg:, xl:)
   - Accessibility (ARIA labels, semantic HTML)
   - Fast loading (optimized images)
   - Animations (fade-in, slide-in using Intersection Observer)
   - Color scheme: primary, secondary, accent colors
   - Typography: clear hierarchy (text-sm to text-6xl)

✅ CONVERSION OPTIMIZATION:
   - Above-the-fold CTA
   - Trust signals (badges, testimonials)
   - Urgency elements (limited time, spots left)
   - Clear value proposition
   - Minimal friction (simple forms)
   - Social proof
   - Exit-intent popup (optional)

📁 FILE STRUCTURE:
   components/
   ├── Hero.tsx (main hero section)
   ├── Features.tsx (features grid)
   ├── Pricing.tsx (pricing tiers)
   ├── Testimonials.tsx (customer quotes)
   ├── CTA.tsx (call-to-action section)
   ├── Footer.tsx (footer with links)
   ├── Button.tsx (reusable button component)
   ├── FeatureCard.tsx (individual feature card)
   types/
   ├── landing.types.ts (all interfaces)
   data/
   ├── features.ts (feature data)
   ├── testimonials.ts (testimonial data)
   pages/
   ├── LandingPage.tsx (main orchestrator)

📤 OUTPUT FORMAT:
\`\`\`typescript:components/Hero.tsx
export const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {/* Compelling headline */}
        </h1>
        {/* Rest of hero content */}
      </div>
    </section>
  );
};
\`\`\`

**PRODUCT/SERVICE:** ${entitiesList}
**TARGET ACTION:** ${actionsList}
**DESIGN STYLE:** Modern, conversion-focused

GENERATE COMPLETE LANDING PAGE WITH ALL SECTIONS - PRODUCTION-READY.`;
  }

  // ───────────────────────────────────────────────────────────────
  // ✅ BACKEND SECTION COM ULTRA-NAMING ENFORCEMENT
  // ───────────────────────────────────────────────────────────────

  if (scope.type === ScopeType.BACKEND) {
    return `${minervaBaseProtocol}${namingEnforcementSection}

╔═══════════════════════════════════════════════════════════════╗
║ SCOPE: BACKEND API ONLY (NO FRONTEND)                         ║
╚═══════════════════════════════════════════════════════════════╝

**USER REQUEST:** "${originalPrompt}"

**STRICT GENERATION RULES:**

📦 FILE COUNT: Generate 10-15 backend files
   Structure: routes/ controllers/ services/ repositories/ middleware/ validators/ types/ utils/

🚫 ABSOLUTELY NO FRONTEND:
   ❌ NO React components
   ❌ NO .tsx files
   ❌ NO frontend pages
   ❌ NO UI code whatsoever

✅ BACKEND STRUCTURE (Generate ALL):
   
   📁 src/
   ├── server.ts (entry point with app.listen)
   ├── app.ts (Express app setup with middleware, CORS, routes)
   │
   ├── routes/
   │   ├── ${mainEntity.toLowerCase()}.routes.ts (CRUD endpoints)
   │   └── auth.routes.ts (login, register, verify)
   │
   ├── controllers/
   │   ├── ${mainEntity}Controller.ts ✅ (PascalCase!)
   │   └── AuthController.ts ✅ (PascalCase!)
   │
   ├── services/
   │   ├── ${mainEntity}Service.ts ✅ (PascalCase!)
   │   └── AuthService.ts ✅ (PascalCase!)
   │
   ├── repositories/
   │   ├── ${mainEntity}Repository.ts ✅ (PascalCase!)
   │   └── UserRepository.ts ✅ (PascalCase!)
   │
   ├── middleware/
   │   ├── auth.middleware.ts ✅ (lowercase)
   │   ├── errorHandler.middleware.ts ✅ (camelCase)
   │   └── logger.middleware.ts ✅ (lowercase)
   │
   ├── validators/
   │   ├── ${mainEntity.toLowerCase()}.validators.ts ✅ (lowercase)
   │   └── auth.validators.ts ✅ (lowercase)
   │
   ├── types/
   │   └── ${mainEntity.toLowerCase()}.types.ts ✅ (lowercase)
   │
   └── utils/
       ├── jwt.utils.ts (token generation/validation)
       └── helpers.ts (utility functions)

✅ IMPLEMENTATION REQUIREMENTS:
   - Express.js with TypeScript
   - Zod validation for ALL request bodies
   - Proper error handling (try-catch + custom error classes)
   - JWT middleware for protected routes
   - Named exports for all modules
   - JSDoc comments for public APIs
   - Environment variables (process.env.JWT_SECRET, etc.)
   - CORS configuration
   - Request logging
   - Error responses with status codes

✅ ENTRY POINTS (MANDATORY):
\`\`\`typescript:server.ts
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

\`\`\`typescript:app.ts
import express, { Application } from 'express';
import cors from 'cors';
import { ${mainEntity.toLowerCase()}Router } from './routes/${mainEntity.toLowerCase()}.routes';
import { authRouter } from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api/${mainEntity.toLowerCase()}', ${mainEntity.toLowerCase()}Router);
app.use('/api/auth', authRouter);

app.use(errorHandler);

export default app;
\`\`\`

\`\`\`typescript:controllers/${mainEntity}Controller.ts
// ✅ CORRECT FILENAME: ${mainEntity}Controller.ts (PascalCase)
import { Request, Response } from 'express';
import { ${mainEntity}Service } from '../services/${mainEntity}Service';

/**
 * ${mainEntity}Controller - REST API endpoints
 */
export class ${mainEntity}Controller {
  constructor(private service: ${mainEntity}Service) {}
  
  async index(req: Request, res: Response) {
    try {
      const items = await this.service.getAll();
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
  
  // ... other CRUD methods
}
\`\`\`

✅ TYPE-SAFE MIDDLEWARE:
\`\`\`typescript:middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
\`\`\`

✅ ZOD VALIDATION:
\`\`\`typescript:validators/${mainEntity.toLowerCase()}.validators.ts
import { z } from 'zod';

export const create${mainEntity}Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  // Additional validation rules
});
\`\`\`

**ENTITIES:** ${entitiesList}
**ACTIONS:** ${actionsList}
**FRAMEWORK:** Express + TypeScript

⚠️  FINAL VALIDATION BEFORE GENERATION:
1. All Controller files use PascalCase: {Entity}Controller.ts ✅
2. All Service files use PascalCase: {Entity}Service.ts ✅
3. All Repository files use PascalCase: {Entity}Repository.ts ✅
4. All Routes files use lowercase: {entity}.routes.ts ✅
5. All Validators use lowercase: {entity}.validators.ts ✅
6. All imports match exact filenames ✅

GENERATE COMPLETE BACKEND WITH SERVER.TS, APP.TS, AND ALL FILES USING CORRECT NAMING - NO FRONTEND CODE.`;
  }

  // ───────────────────────────────────────────────────────────────

  if (scope.type === ScopeType.PAGE || scope.type === ScopeType.FEATURE) {
    return `${minervaBaseProtocol}

╔═══════════════════════════════════════════════════════════════╗
║ SCOPE: ${scope.type.toUpperCase()} (MODERATE COMPLEXITY)      ║
╚═══════════════════════════════════════════════════════════════╝

**USER REQUEST:** "${originalPrompt}"

**GENERATION RULES:**

📦 FILE COUNT: Generate 8-12 files
   - Multiple related components
   - Shared types
   - Utility functions
   - Mock data
   - Hooks

✅ STRUCTURE:
   src/
   ├── components/
   │   ├── ${mainEntity}Dashboard.tsx (main orchestrator)
   │   ├── ${mainEntity}List.tsx (list view)
   │   ├── ${mainEntity}Item.tsx (individual item)
   │   ├── ${mainEntity}Form.tsx (create/edit form)
   │   └── ${mainEntity}Stats.tsx (statistics cards)
   │
   ├── hooks/
   │   └── use${mainEntity}.ts (data fetching hook)
   │
   ├── types/
   │   └── ${mainEntity.toLowerCase()}.types.ts (shared types)
   │
   ├── utils/
   │   └── ${mainEntity.toLowerCase()}.utils.ts (helper functions)
   │
   └── data/
       └── mock${mainEntity}.ts (mock data)

✅ REQUIREMENTS:
   - React functional components with hooks (useState, useEffect, custom hooks)
   - TypeScript with proper types (no 'any')
   - Tailwind CSS styling with responsive breakpoints
   - Component composition (smaller reusable components)
   - Named exports
   - Data flow (props drilling or context)
   - Loading states
   - Error handling
   - Empty states

✅ COMPONENT PATTERNS:
   - List/Detail pattern
   - Form with validation
   - Modal dialogs
   - Search/filter functionality
   - Pagination
   - Sorting

📤 OUTPUT FORMAT:
\`\`\`typescript:components/${mainEntity}Dashboard.tsx
import React, { useState } from 'react';
import { ${mainEntity}List } from './${mainEntity}List';
import { ${mainEntity}Form } from './${mainEntity}Form';

export const ${mainEntity}Dashboard: React.FC = () => {
  const [items, setItems] = useState([]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">${mainEntity} Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
};
\`\`\`

**ENTITIES:** ${entitiesList}
**UI ELEMENTS:** ${uiElementsList}
**ACTIONS:** ${actionsList}

GENERATE COHESIVE FEATURE SET WITH ALL COMPONENTS.`;
  }

  // ───────────────────────────────────────────────────────────────
  // ✅ FULLSTACK SECTION COM ULTRA-NAMING ENFORCEMENT
  // ───────────────────────────────────────────────────────────────

  if (scope.type === ScopeType.FULLSTACK) {
    return `${minervaBaseProtocol}${namingEnforcementSection}

╔═══════════════════════════════════════════════════════════════╗
║ SCOPE: FULL-STACK APPLICATION (COMPLEX)                       ║
╚═══════════════════════════════════════════════════════════════╝

**USER REQUEST:** "${originalPrompt}"

**GENERATION RULES:**

📦 FILE COUNT: Generate 30-45 files (MINIMUM ${scope.expectedFileCount.min})
   - Complete frontend (React + TypeScript)
   - Complete backend (Express + TypeScript)
   - Database schema (Prisma)
   - Shared types
   - Authentication flow
   - Entry points

═══════════════════════════════════════════════════════════════
MANDATORY COMPONENTS (Generate ALL):
═══════════════════════════════════════════════════════════════

📁 FRONTEND (React + TypeScript):
  
  Components:
    - ${mainEntity}List.tsx (list view with pagination)
    - ${mainEntity}Item.tsx (item display)
    - Add${mainEntity}Form.tsx (create form with validation)
    - Edit${mainEntity}Form.tsx (edit form)
    - ${mainEntity}Stats.tsx or ${mainEntity}Chart.tsx (data visualization)
  
  Pages:
    - Home.tsx (main dashboard)
    - Login.tsx (authentication page)
    - Register.tsx (user registration page)
  
  Layout:
    - App.tsx (main app component with Router)
    - Layout.tsx (common layout wrapper with header/footer)
    - PrivateRoute.tsx (protected route wrapper)
  
  Hooks:
    - useAuth.ts (authentication hook with login/logout)
    - use${mainEntity}.ts (data fetching hook with CRUD operations)
  
  API Clients:
    - api.ts (axios instance with interceptors)
    - ${mainEntity.toLowerCase()}Api.ts (CRUD methods)
    - authApi.ts (auth methods: login, register, verify)
  
  Entry:
    - index.tsx (ReactDOM.render with BrowserRouter)

📁 BACKEND (Express + TypeScript):
  
  Entry:
    - server.ts (app.listen with port and error handling)
    - app.ts (Express app setup with CORS, middleware, routes)
  
  Routes:
    - ${mainEntity.toLowerCase()}.routes.ts ✅ (lowercase)
    - auth.routes.ts ✅ (lowercase)
  
  Controllers:
    - ${mainEntity}Controller.ts ✅ (PascalCase!)
    - AuthController.ts ✅ (PascalCase!)
  
  Services:
    - ${mainEntity}Service.ts ✅ (PascalCase!)
    - AuthService.ts ✅ (PascalCase!)
  
  Repositories:
    - ${mainEntity}Repository.ts ✅ (PascalCase!)
    - UserRepository.ts ✅ (PascalCase!)
  
  Middleware:
    - auth.middleware.ts (JWT validation)
    - errorHandler.middleware.ts (centralized error handling)
    - logger.middleware.ts (request logging with timestamps)
  
  Validators:
    - ${mainEntity.toLowerCase()}.validators.ts ✅ (lowercase)
    - auth.validators.ts ✅ (lowercase)

📁 SHARED:
  - types/index.ts (all TypeScript interfaces shared between frontend/backend)

📁 DATABASE:
  - prisma/schema.prisma (Prisma models with relations)

📁 CONFIGURATION:
  - .env.example (environment variables template with comments)
  - frontend/tsconfig.json (frontend TypeScript config)
  - backend/tsconfig.json (backend TypeScript config)
  - frontend/package.json (frontend dependencies: react, axios, etc)
  - backend/package.json (backend dependencies: express, prisma, zod, etc)

CRITICAL RULES:
1. Generate ALL components listed above (minimum ${scope.expectedFileCount.min} files)
2. Every component must be COMPLETE (no TODOs, no placeholders)
3. All exports must be correct:
   - React components: export const ComponentName: React.FC = () => {...};
   - Express routers: export default router;
   - Types: export interface TypeName {...}
4. All imports must reference existing files (no phantom imports)
5. Add closing braces } for all functions, components, classes
6. Use proper TypeScript types:
   - Express: Request, Response, NextFunction (NOT 'any')
   - Prisma: PrismaClient
   - React: React.FC<PropsType>
7. All referenced components in imports MUST be generated
8. **BACKEND FILES MUST USE CORRECT NAMING:**
   - Controllers: ${mainEntity}Controller.ts (NOT ${mainEntity.toLowerCase()}.controller.ts)
   - Services: ${mainEntity}Service.ts (NOT ${mainEntity.toLowerCase()}.service.ts)
   - Repositories: ${mainEntity}Repository.ts (NOT ${mainEntity.toLowerCase()}.repository.ts)

ENTRY POINTS MUST INCLUDE:

\`\`\`typescript:frontend/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
\`\`\`

\`\`\`typescript:backend/src/server.ts
import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

\`\`\`typescript:backend/src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import { ${mainEntity.toLowerCase()}Router } from './routes/${mainEntity.toLowerCase()}.routes';
import { authRouter } from './routes/auth.routes';
import { errorHandler } from './middleware/errorHandler.middleware';
import { logger } from './middleware/logger.middleware';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use('/api/${mainEntity.toLowerCase()}', ${mainEntity.toLowerCase()}Router);
app.use('/api/auth', authRouter);

app.use(errorHandler);

export default app;
\`\`\`

\`\`\`typescript:backend/src/controllers/${mainEntity}Controller.ts
// ✅ CORRECT FILENAME: ${mainEntity}Controller.ts (PascalCase)
import { Request, Response } from 'express';
import { ${mainEntity}Service } from '../services/${mainEntity}Service';

export class ${mainEntity}Controller {
  constructor(private service: ${mainEntity}Service) {}
  
  async index(req: Request, res: Response) {
    try {
      const items = await this.service.getAll();
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
  
  // ... CRUD methods
}
\`\`\`

**ENTITIES:** ${entitiesList}
**ACTIONS:** ${actionsList}
**UI ELEMENTS:** ${uiElementsList}

GENERATE COMPLETE FULL-STACK APPLICATION WITH ALL ${scope.expectedFileCount.min}+ FILES - PRODUCTION-READY.`;
  }

  // ═══════════════════════════════════════════════════════════════
  // DEFAULT FALLBACK (não deveria chegar aqui)
  // ═══════════════════════════════════════════════════════════════
  return `${minervaBaseProtocol}

**USER REQUEST:** "${originalPrompt}"

Generate a ${complexity} complexity application with:
- Entities: ${entitiesList}
- Actions: ${actionsList}
- Framework: ${framework}

Follow Minerva Omega protocols above.`;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * ✅ NOVO v9.0: HELPER - Generate Expected Filenames
 * ═══════════════════════════════════════════════════════════════
 */
private generateExpectedFileNames(entities: string[]): { correct: string[], wrong: string[] } {
  const correct: string[] = [];
  const wrong: string[] = [];
  
  entities.forEach(entity => {
    // Controllers (CORRECT: PascalCase)
    correct.push(`${entity}Controller.ts`);
    
    // Services (CORRECT: PascalCase)
    correct.push(`${entity}Service.ts`);
    
    // Repositories (CORRECT: PascalCase)
    correct.push(`${entity}Repository.ts`);
    
    // Routes (CORRECT: lowercase)
    correct.push(`${entity.toLowerCase()}.routes.ts`);
    
    // Validators (CORRECT: lowercase)
    correct.push(`${entity.toLowerCase()}.validators.ts`);
    
    // Types (CORRECT: lowercase)
    correct.push(`${entity.toLowerCase()}.types.ts`);
    
    // Models (CORRECT: PascalCase)
    correct.push(`${entity}.model.ts`);
  });
  
  return { correct, wrong };
}

/**
 * ═══════════════════════════════════════════════════════════════
 * ✅ NOVO v9.0: HELPER - Generate Banned Filenames (dot notation)
 * ═══════════════════════════════════════════════════════════════
 */
private generateBannedFileNames(entities: string[]): string[] {
  const banned: string[] = [];
  
  entities.forEach(entity => {
    // BANNED: dot notation in Controllers
    banned.push(`${entity}.controller.ts`);
    banned.push(`${entity.toLowerCase()}.controller.ts`);
    
    // BANNED: dot notation in Services
    banned.push(`${entity}.service.ts`);
    banned.push(`${entity.toLowerCase()}.service.ts`);
    
    // BANNED: dot notation in Repositories
    banned.push(`${entity}.repository.ts`);
    banned.push(`${entity.toLowerCase()}.repository.ts`);
    
    // BANNED: dot notation in Models
    banned.push(`${entity}.model.ts` + ' (wrong case)');
    banned.push(`${entity.toLowerCase()}.model.ts`);
    
    // BANNED: underscore notation
    banned.push(`${entity.toLowerCase()}_controller.ts`);
    banned.push(`${entity.toLowerCase()}_service.ts`);
    banned.push(`${entity.toLowerCase()}_repository.ts`);
    
    // BANNED: wrong case in routes
    banned.push(`${entity}.routes.ts`); // Must be lowercase entity
    banned.push(`${entity}Routes.ts`); // Must have .routes extension
  });
  
  return banned;
}


/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SCOPE DETECTION FROM INTENT - VERSION 4.0 (AI AUTO-DETECTION ONLY)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Detecta scope preciso baseado APENAS no prompt do usuário (Natural Language)
 * 
 * REMOVED: User complexity override (frontend selector)
 * NOW: Pure AI-based detection from prompt analysis
 * 
 * PRIORITY ORDER (Auto-Detection):
 * 1. SINGLE_COMPONENT (simple button, card, etc)
 * 2. FULLSTACK (complete app with frontend + backend + db)
 * 3. BACKEND (API only)
 * 4. LANDING_PAGE (marketing page)
 * 5. FEATURE (default fallback)
 * 
 * @param analysis - Prompt analysis result from PromptProcessor
 * @param originalPrompt - Original user prompt
 * @returns ScopeDetectionResult with confidence and file count expectations
 */
private detectScopeFromIntent(
  analysis: PromptAnalysisResult,
  originalPrompt: string
): ScopeDetectionResult {
  return detectScopeFromPrompt(originalPrompt) as ScopeDetectionResult;

  const promptLower = originalPrompt.toLowerCase();
  const detectedKeywords: string[] = [];
  const scopeSignals = detectPromptScopeSignals(promptLower);

  console.log('🧠 [Scope] ═════════════════════════════════════════════════');
  console.log('🧠 [Scope] AI AUTO-DETECTION MODE (v4.0)');
  console.log('🧠 [Scope] Prompt length:', originalPrompt.length);
  console.log('🧠 [Scope] ═════════════════════════════════════════════════');

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIORITY 1: SINGLE_COMPONENT
  // ═══════════════════════════════════════════════════════════════════════════
  const singleComponentKeywords = [
    'crie um componente',
    'componente de botão',
    'componente de',
    'componente customizável',
    'single component',
    'um componente',
    'component with',
    'create a component',
    'build a component',
    'apenas um',
    'só um',
    'somente um',
    'simples componente',
    'apenas o componente',
    'só o componente',
    'botão',
    'button',
    'card',
    'input',
    'select',
    'dropdown'
  ];

  const hasSingleComponentKeyword = singleComponentKeywords.some(kw =>
    promptLower.includes(kw)
  );

  if (
    hasSingleComponentKeyword &&
    !promptLower.includes('aplicação') &&
    !promptLower.includes('aplicacao') &&
    !promptLower.includes('sistema') &&
    !promptLower.includes('api') &&
    !promptLower.includes('fullstack') &&
    !promptLower.includes('full-stack') &&
    !scopeSignals.hasBackend &&
    !scopeSignals.hasDatabase
  ) {
    detectedKeywords.push('single_component');
    
    console.log('✅ [Scope] AUTO-DETECTED: SINGLE_COMPONENT');

    return {
      type: ScopeType.SINGLE_COMPONENT,
      complexity: 'simple' as ComplexityLevel,
      confidence: 0.9,
      expectedFileCount: { min: 3, max: 5 },
      shouldIncludeFrontend: true,
      shouldIncludeBackend: false,
      shouldIncludeDatabase: false,
      detectedKeywords
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIORITY 2: FULLSTACK
  // ═══════════════════════════════════════════════════════════════════════════
  const hasFullstack = scopeSignals.hasFullstack;
  const hasFrontend = scopeSignals.hasFrontend;
  const hasBackend = scopeSignals.hasBackend;
  const hasDatabase = scopeSignals.hasDatabase;

  if (hasFullstack || (hasFrontend && hasBackend)) {
    detectedKeywords.push('fullstack');
    
    console.log('✅ [Scope] AUTO-DETECTED: FULLSTACK');

    return {
      type: ScopeType.FULLSTACK,
      complexity: 'very_high' as ComplexityLevel,
      confidence: 0.95,
      expectedFileCount: { min: 30, max: 60 },
      shouldIncludeFrontend: true,
      shouldIncludeBackend: true,
      shouldIncludeDatabase: hasDatabase,
      detectedKeywords
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIORITY 3: BACKEND API ONLY
  // ═══════════════════════════════════════════════════════════════════════════
  const backendKeywords = [
  'api',                    // ← NOVO: genérico
  'api rest',
  'api endpoint',           // ← NOVO: exatamente como no prompt!
  'endpoint',               // ← NOVO: singular!
  'endpoints',              // ← Mantido
  'restful',
  'restful api',
  'backend',
  'express',
  'fastify',
  'nestjs',
  'routes',
  'controllers',
  'middleware',
  'servidor',
  'production-ready',       // ← NOVO: pista comum
  'error handling'          // ← NOVO: pista comum
];

  const hasBackendKeyword = !scopeSignals.excludesBackend && backendKeywords.some(keyword =>
    promptLower.includes(keyword)
  );

  const hasExplicitFrontend = 
  promptLower.includes('frontend') ||
  promptLower.includes('react') ||
  promptLower.includes('interface') ||
  promptLower.includes('ui component') ||
  promptLower.includes('frontend page');

if (hasBackendKeyword && !hasFullstack && !hasExplicitFrontend) {
    detectedKeywords.push('backend');
    
    console.log('✅ [Scope] AUTO-DETECTED: BACKEND');

    return {
      type: ScopeType.BACKEND,
      complexity: 'high' as ComplexityLevel,
      confidence: 0.9,
      expectedFileCount: { min: 10, max: 20 },
      shouldIncludeFrontend: false,
      shouldIncludeBackend: true,
      shouldIncludeDatabase: hasDatabase,
      detectedKeywords
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIORITY 4: LANDING PAGE
  // ═══════════════════════════════════════════════════════════════════════════
  const landingPageKeywords = [
    'landing page',
    'landing-page',
    'página de destino',
    'hero section',
    'call to action',
    'cta',
    'testimonials',
    'marketing page'
  ];

  const hasLandingPageKeyword = landingPageKeywords.some(keyword =>
    promptLower.includes(keyword)
  );

  if (hasLandingPageKeyword) {
    detectedKeywords.push('landing_page');
    
    console.log('✅ [Scope] AUTO-DETECTED: LANDING_PAGE');

    return {
      type: ScopeType.LANDING_PAGE,
      complexity: 'moderate' as ComplexityLevel,
      confidence: 0.85,
      expectedFileCount: { min: 8, max: 15 },
      shouldIncludeFrontend: true,
      shouldIncludeBackend: false,
      shouldIncludeDatabase: false,
      detectedKeywords
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIORITY 5: DASHBOARD / FEATURE RICH
  // ═══════════════════════════════════════════════════════════════════════════
  const featureRichKeywords = [
    'dashboard',
    'admin panel',
    'painel',
    'gráficos',
    'charts',
    'analytics',
    'metrics',
    'relatórios',
    'multiple components',
    'vários componentes'
  ];

  const hasFeatureRichKeyword = featureRichKeywords.some(keyword =>
    promptLower.includes(keyword)
  );
if (hasFeatureRichKeyword) {
  detectedKeywords.push('feature_rich');
  
  console.log('✅ [Scope] AUTO-DETECTED: FEATURE_RICH');

  return {
    type: ScopeType.FEATURE,  
    complexity: 'high' as ComplexityLevel,
    confidence: 0.8,
    expectedFileCount: { min: 12, max: 25 },
    shouldIncludeFrontend: true,
    shouldIncludeBackend: false,
    shouldIncludeDatabase: false,
    detectedKeywords
  };
}


  // ═══════════════════════════════════════════════════════════════════════════
  // FALLBACK: STANDARD FEATURE
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('⚠️ [Scope] AUTO-DETECTED: FEATURE (default fallback)');

  return {
    type: ScopeType.FEATURE,
    complexity: 'moderate' as ComplexityLevel,
    confidence: 0.6,
    expectedFileCount: { min: 6, max: 12 },
    shouldIncludeFrontend: true,
    shouldIncludeBackend: false,
    shouldIncludeDatabase: false,
    detectedKeywords: ['default', 'fallback']
  };
}


  /**
   * Generate fallback component when AI fails
   */
  private generateFallbackComponent(prompt: string): string {
    return `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ${prompt}
        </h1>
        <p className="text-gray-600">
          Generated by ORUS Builder AI
        </p>
      </div>
    </div>
  );
}`;

  }


/**
 * ═══════════════════════════════════════════════════════════════
 * AÇÃO 2: STAGE 3 - VALIDATE (FIX 1)
 * ═══════════════════════════════════════════════════════════════
 * Validação CIG OBRIGATÓRIA com relatório completo
 */
private async stageValidate(
  components: GeneratedComponent[]
): Promise<PipelineStageResult> {

  logger.info('Pipeline Stage 3: Validate (CIG Enforced)', {
    component: 'GenerationPipeline',
    componentsCount: components.length
  });

  try {
    const validatedComponents: GeneratedComponent[] = [];
    const validationErrors: Array<{
      component: string;
      errors: string[];
    }> = [];

    // ═══════════════════════════════════════════════════════════════
    // VALIDAR CADA COMPONENTE (CIG-2.0 COMPLIANCE OBRIGATÓRIO)
    // ═══════════════════════════════════════════════════════════════
    for (const component of components) {

      console.log(`🔍 [Validation] Validating component: ${component.name}`);

      // ✅ Preparar input para CIG Validator
      const validationInput: ValidationInput = {
        code: component.code,
        language: CodeLanguage.TYPESCRIPT,
        context: {
          projectId: 'generated',
          componentName: component.name
        },
        options: {
          strictMode: true,              // ✅ FORÇAR modo strict
          checkDependencies: true,       // ✅ Validar imports/exports
          checkContracts: true,          // ✅ Validar contratos
          generateReport: true           // ✅ Gerar relatório completo
        }
      };

      // ✅ EXECUTAR VALIDAÇÃO CIG
      const validation: ExtendedValidationResult = await cigValidator.validate(validationInput);

      // ═══════════════════════════════════════════════════════════════
      // TRATAR RESULTADO DA VALIDAÇÃO
      // ═══════════════════════════════════════════════════════════════

      if (!validation.isValid || !validation.passed) {
        // ❌ COMPONENTE NÃO PASSOU NA VALIDAÇÃO
        const errors = [
          ...(validation.errors || []).map(err => {
            if (typeof err === 'string') {
              return err;
            }
            // Se for objeto I18nText ou similar, extrair texto
            if (err && typeof err === 'object') {
              return (err as any).en || (err as any).message || JSON.stringify(err);
            }
            return String(err);
          }),
          ...(validation.codeIssues?.map(issue => {
            const msg = issue.message;
            if (typeof msg === 'string') {
              return msg;
            }
            // Se message for I18nText
            if (msg && typeof msg === 'object') {
              return (msg as any).en || JSON.stringify(msg);
            }
            return String(msg);
          }) || [])
        ];

        validationErrors.push({
          component: component.name,
          errors
        });

        console.error(`❌ [Validation] Component ${component.name} FAILED validation`);
        console.error(`[Validation] Errors (${errors.length}):`, errors);

        logger.error(`CIG Validation failed for ${component.name}`, {
          component: 'GenerationPipeline',
          metadata: {
            errorCount: errors.length,
            errors: errors.slice(0, 3) // Primeiros 3 erros
          }
        });

      } else {
        // ✅ COMPONENTE PASSOU NA VALIDAÇÃO
        console.log(`✅ [Validation] Component ${component.name} PASSED validation`);

        logger.info(`Component ${component.name} validated successfully`, {
          component: 'GenerationPipeline',
          metadata: {
            linesOfCode: component.code.split('\n').length,
            cigCompliant: true
          }
        });
      }

      // Adicionar metadados de validação ao componente
      component.metadata.validated = validation.isValid && validation.passed;
      component.metadata.cigCompliant = validation.isValid && validation.passed;
      component.metadata.validationScore = validation.score || 0;

      validatedComponents.push(component);
    }

    // ═══════════════════════════════════════════════════════════════
    // RESULTADO FINAL DA VALIDAÇÃO CIG
    // ═══════════════════════════════════════════════════════════════

    const allValid = validationErrors.length === 0;
    const validCount = validatedComponents.filter(c => c.metadata.validated).length;

    console.log('═══════════════════════════════════════════════════════');
    console.log(`${allValid ? '✅' : '⚠️'} [Validation] Validation complete`);
    console.log(`[Validation] Valid components: ${validCount}/${validatedComponents.length}`);

    if (!allValid) {
      console.warn('[Validation] Components with errors:', validationErrors.length);
      validationErrors.forEach(({ component, errors }) => {
        console.warn(`  - ${component}: ${errors.length} errors`);
      });
    }
    console.log('═══════════════════════════════════════════════════════');

    logger.info('Validation stage completed', {
      component: 'GenerationPipeline',
      metadata: {
        total: validatedComponents.length,
        valid: validCount,
        invalid: validatedComponents.length - validCount,
        allValid
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // ✨ AÇÃO 2: VALIDAR IMPORTS CONTRA EXPORTS GERADOS (FIX 1) ✨
    // ═══════════════════════════════════════════════════════════════
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('AÇÃO 2: Validando imports contra exports gerados...');
    console.log('═══════════════════════════════════════════════════════════');

    // Obter generatedExports do contexto (passado da AÇÃO 1)
    const generatedExports = (this as any).generatedExports || new Set<string>();
    console.log(`   Exports disponíveis: ${generatedExports.size}`);

    // Coletar TODOS os imports de todos os componentes (COM PATH!)
    const allImports = new Set<string>();
    const importsPerFile: Record<string, string[]> = {};
    const orphanedImportsWithPath: Array<{ name: string; path: string }> = []; // ✅ FIX 1: Array com path

    // Um import só pode ser "órfão" (arquivo local faltando) se o caminho for
    // relativo/absoluto ('./x', '../x', '/x'). Bare specifiers ('express', 'zod',
    // 'react-router-dom'...) são sempre pacotes npm - nunca "faltam gerar", só
    // precisam existir no package.json. Checar isso pelo PATH (não por uma lista
    // de nomes conhecidos) elimina a manutenção infinita de whitelist e para de
    // tentar "regenerar" express/cors/zod/react como se fossem arquivos do projeto.
    const isLocalImportPath = (path: string): boolean =>
      path.startsWith('.') || path.startsWith('/');

    validatedComponents.forEach((comp: GeneratedComponent) => {
      if (!comp.code) return;

      const imports: string[] = [];

      // ✅ FIX 1: Regex ATUALIZADO para capturar PATH também
      // Captura: import { X, Y } from './validators'
      //          import X from '../utils'
      const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
      let match: RegExpExecArray | null;

      while ((match = importRegex.exec(comp.code)) !== null) {
        const namedImports = match[1];      // { X, Y, Z }
        const defaultImport = match[2];     // X
        const fullPath = match[3] || '';    // ✅ '../validators' ou './utils'
        const isLocal = isLocalImportPath(fullPath);

        if (namedImports) {
          // Processar imports nomeados
          namedImports
            .split(',')
            .map(imp => imp.trim())
            .filter(imp => imp.length > 0 && !imp.includes('type '))
            .forEach(imp => {
              // Remover "type" se for type import
              const cleanImp = imp.replace(/^type\s+/, '').trim();
              if (cleanImp) {
                allImports.add(cleanImp);
                imports.push(cleanImp);

                // ✅ Só considerar órfão se for import LOCAL e não tiver export correspondente
                if (isLocal && !generatedExports.has(cleanImp)) {
                  orphanedImportsWithPath.push({ name: cleanImp, path: fullPath });
                }
              }
            });
        }

        if (defaultImport) {
          allImports.add(defaultImport);
          imports.push(defaultImport);

          // ✅ Só considerar órfão se for import LOCAL e não tiver export correspondente
          if (isLocal && !generatedExports.has(defaultImport)) {
            orphanedImportsWithPath.push({ name: defaultImport, path: fullPath });
          }
        }
      }

      if (imports.length > 0) {
        importsPerFile[comp.name] = imports;
      }
    });

    console.log(`   Total de imports encontrados: ${allImports.size}`);

    // Identificar imports ORPHÃOS (que não foram gerados)
    // orphanedImportsWithPath já só contém imports locais sem export correspondente
    // (filtrado por path no loop acima) - basta extrair os nomes únicos daqui,
    // sem precisar de uma segunda lista de pacotes externos pra manter.
    const orphanedImports = Array.from(new Set(orphanedImportsWithPath.map(o => o.name)));
    console.log('');
    if (orphanedImports.length > 0) {
      console.log(`⚠️  ALERTA: ${orphanedImports.length} imports orphãos detectados!`);
      console.log(`   Orphãos: ${orphanedImports.slice(0, 10).join(', ')}`);
      console.log(`   Com paths: ${orphanedImportsWithPath.slice(0, 5).map(o => `${o.name} (${o.path})`).join(', ')}`);
      if (orphanedImports.length > 10) {
        console.log(`   ... e mais ${orphanedImports.length - 10}`);
      }
      
      logger.warn(`Found ${orphanedImports.length} orphaned imports!`, {
        component: 'GenerationPipeline',
        action: 'stageValidate',
        orphanedCount: orphanedImports.length,
        orphanedList: orphanedImportsWithPath.slice(0, 10)
      });
      
      // Marcar componentes afetados
      validatedComponents.forEach(comp => {
        const componentImports = importsPerFile[comp.name] || [];
        const componentOrphans = componentImports.filter(imp => 
          orphanedImports.includes(imp)
        );
        
        if (componentOrphans.length > 0) {
          if (!comp.metadata) comp.metadata = {} as any;
          (comp.metadata as any).orphanedImports = componentOrphans;
          (comp.metadata as any).hasOrphanedImports = true;
          
          logger.warn(`Component ${comp.name} has orphaned imports`, {
            component: 'GenerationPipeline',
            componentName: comp.name,
            orphanedImports: componentOrphans
          });
        }
      });
    } else {
      console.log('✅ Nenhum import orphão detectado!');
      console.log('   Todos os imports têm correspondência nos exports.');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    // Adicionar metadados de validação ao resultado
    const validationMetadata = {
      totalImports: allImports.size,
      totalExports: generatedExports.size,
      orphanedImportsCount: orphanedImports.length,
      orphanedImports: orphanedImports.slice(0, 20), // Primeiros 20
      importsPerFile: Object.keys(importsPerFile).length
    };

    // ✅ FIX 1: Armazenar orphanedImportsWithPath para FIX 2
    (this as any).orphanedImports = orphanedImports;
    (this as any).orphanedImportsWithPath = orphanedImportsWithPath; // ✅ COM PATH!
    (this as any).allImports = allImports;
    (this as any).validationMetadata = validationMetadata;

    logger.info('Pipeline Validation metadata collected', validationMetadata);

    // ═══════════════════════════════════════════════════════════════
    // SE HOUVER ERROS CRÍTICOS, FALHAR (opcional - configure conforme necessário)
    // ═══════════════════════════════════════════════════════════════

    // MODO STRICT: Falhar se houver qualquer erro
    // if (!allValid) {
    //   throw new Error(
    //     `CIG Validation failed for ${validationErrors.length} component(s). ` +
    //     `Details: ${JSON.stringify(validationErrors, null, 2)}`
    //   );
    // }

    // MODO LENIENT: Retornar sucesso mas incluir warnings
    return {
      success: true,
      data: validatedComponents,
      warnings: validationErrors.length > 0 ? validationErrors : undefined
    };

  } catch (error) {
    logger.error('Validation stage failed', {
      component: 'GenerationPipeline',
      error: (error as Error).message
    });

    return {
      success: false,
      error: (error as Error).message
    };
  }
}



  /**
   * Stage 4: Optimize
   * - Use quality analyzer + code optimizer
   */
  private async stageOptimize(components: GeneratedComponent[]): Promise<PipelineStageResult> {
    logger.info('Pipeline Stage 4: Optimize', { component: 'GenerationPipeline' });

    try {
      const optimizedComponents: GeneratedComponent[] = [];

      for (const component of components) {
        // ✅ Quality Analyzer
        if (this.config.enableQualityAnalysis) {
          const qualityInput: QualityAnalysisInput = {
            code: component.code,
          };


          const quality: QualityAnalysisResult = await qualityAnalyzer.analyze(qualityInput);
          component.metadata.qualityScore = quality.overallScore;
component.metadata.coverage = quality.metrics?.testability || 0;
        }

        // ✅ Code Optimizer
        const optimizationInput: OptimizationInput = {
          code: component.code,
          options: {
            removeUnusedCode: false,
            consolidateDuplicates: true,
            optimizeLoops: false,
            improveReadability: false,
            applyBestPractices: false,
          }
        };

        const optimized: OptimizationResult = await codeOptimizer.optimize(optimizationInput);

        component.code = optimized.optimizedCode;
        component.metadata.optimized = true;
        component.metadata.optimizations = optimized.changes.map((c: any) => c.type) || [];

        optimizedComponents.push(component);
      }

      logger.info('Optimize stage completed', {
        component: 'GenerationPipeline',
        metadata: { optimizedCount: optimizedComponents.length }
      });

      return {
        success: true,
        data: optimizedComponents
      };

    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

/**
 * ═══════════════════════════════════════════════════════════════
 * AÇÃO 3.5: STAGE 5 - REGENERATE MISSING FILES (FIX 2)
 * ═══════════════════════════════════════════════════════════════
 * Regenera automaticamente arquivos faltantes detectados
 */
private async stageRegenerateMissing(
  components: GeneratedComponent[],
  orphanedImports: string[],
  generatedExports: Set<string>,
  analysis: PromptAnalysisResult
): Promise<PipelineStageResult> {
  
  logger.info('🔄 [Pipeline] STAGE 5: Regenerate Missing Files', {
    component: 'GenerationPipeline',
    orphanedImportsCount: orphanedImports.length
  });

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('AÇÃO 3.5: Regenerando arquivos faltantes...');
  console.log('═══════════════════════════════════════════════════════════');

  if (orphanedImports.length === 0) {
    console.log('   ✅ Nenhum arquivo faltando! Nada a regenerar.');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    logger.info('No missing files to regenerate', {
      component: 'GenerationPipeline'
    });
    
    return {
      success: true,
      data: components
    };
  }

  try {
    console.log(`   📋 Detectados ${orphanedImports.length} imports faltando`);
    console.log(`   🎯 Imports: ${orphanedImports.slice(0, 5).join(', ')}${orphanedImports.length > 5 ? '...' : ''}`);
    console.log('');
    
    // ═══════════════════════════════════════════════════════════
    // STEP 1: Identificar arquivos faltantes COM PATH (FIX 2)
    // ═══════════════════════════════════════════════════════════
    console.log('   📂 STEP 1: Identificar arquivos específicos...');
    console.log('');

    // ✅ FIX 2: Usar orphanedImportsWithPath (array com {name, path})
    const orphanedWithPath = ((this as any).orphanedImportsWithPath || []) as Array<{name: string, path: string}>;

    const missingFiles: Array<{
      name: string;
      type: string;
      folder: string;
      filename: string;
      importedBy: string[];
      importPath: string;
    }> = [];

    const generatedNames = new Set(
      components.map(c => c.name.replace(/\.(ts|tsx|js|jsx)$/, ''))
    );

    // Mapear cada orphaned import com seu path
    orphanedWithPath.forEach(({ name: imp, path }) => {
      if (!generatedNames.has(imp) && !generatedExports.has(imp)) {
        // ✅ FIX 2: Usar path do import para inferir pasta e tipo corretos
        const fileInfo = this.inferFileTypeFromPath(imp, path);
        
        // Encontrar quem está importando
        const importedBy = components
          .filter(c => c.code && c.code.includes(imp))
          .map(c => c.name);
        
        if (importedBy.length > 0) {
          missingFiles.push({
            name: imp,
            type: fileInfo.type,
            folder: fileInfo.folder,
            filename: fileInfo.filename,
            importedBy,
            importPath: path // ✅ Armazenar path original
          });
        }
      }
    });

    console.log(`   🔍 Identificados ${missingFiles.length} arquivos para gerar:`);
    missingFiles.forEach(f => {
      console.log(`      - ${f.folder}/${f.filename} (${f.type})`);
      console.log(`        ← usado por: ${f.importedBy.slice(0, 2).join(', ')}`);
    });
    console.log('');

    if (missingFiles.length === 0) {
      console.log('   ℹ️  Nenhum arquivo específico identificado para regenerar.');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
      
      return {
        success: true,
        data: components
      };
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Construir prompt de regeneração
    // ═══════════════════════════════════════════════════════════
    const regenerationPrompt = this.buildRegenerationPrompt(
      missingFiles,
      orphanedImports,
      analysis
    );

    console.log('   📝 Prompt de regeneração construído');
    console.log('');

    // ═══════════════════════════════════════════════════════════
    // STEP 3: Chamar AI Provider para gerar arquivos faltantes
    // ═══════════════════════════════════════════════════════════
    console.log('   🤖 Chamando AI Provider para gerar arquivos faltantes...');
    
    const regeneratedCode = await this.getAIProvider().generateCode({
      prompt: regenerationPrompt,
      maxTokens: 8000,
      temperature: 0.7
    });

    const codeContent = typeof regeneratedCode === 'object' && 'code' in regeneratedCode
      ? (regeneratedCode as any).code
      : String(regeneratedCode);

    console.log(`   ✅ Código regenerado recebido (${codeContent.length} chars)`);
    console.log('');

    // ═══════════════════════════════════════════════════════════
    // STEP 4: Parse dos novos componentes
    // ═══════════════════════════════════════════════════════════
    console.log('   🔨 Processando componentes regenerados...');
    
    const newComponents = this.splitCodeIntoComponents(codeContent, analysis);
    
    console.log(`   ✅ ${newComponents.length} componentes regenerados`);
    newComponents.forEach((comp, idx) => {
      console.log(`      ${idx + 1}. ${comp.name} (${comp.code?.length || 0} chars)`);
    });
    console.log('');

    // ═══════════════════════════════════════════════════════════
    // STEP 5: Mesclar com componentes existentes
    // ═══════════════════════════════════════════════════════════
    console.log('   🔗 Mesclando componentes...');
    
    const originalCount = components.length;
    const mergedComponents = this.mergeComponentSets(components, newComponents);
    const addedCount = mergedComponents.length - originalCount;
    
    console.log(`   ✅ Mesclagem completa!`);
    console.log(`      - Componentes originais: ${originalCount}`);
    console.log(`      - Componentes regenerados: ${newComponents.length}`);
    console.log(`      - Novos adicionados: ${addedCount}`);
    console.log(`      - Total final: ${mergedComponents.length}`);
    console.log('');

    logger.info('Missing files regenerated and merged', {
      component: 'GenerationPipeline',
      originalCount,
      newCount: newComponents.length,
      addedCount,
      totalCount: mergedComponents.length
    });

    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    return {
      success: true,
      data: mergedComponents
    };

  } catch (error) {
    logger.warn('Failed to regenerate missing files, continuing with what we have', {
      component: 'GenerationPipeline',
      error: (error as Error).message
    });
    
    console.log('');
    console.log('⚠️  Regeneração falhou! Continuando com componentes atuais.');
    console.log(`   Erro: ${(error as Error).message}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
    return {
      success: false,
      data: components,
      error: (error as Error).message
    };
  }
}



/**
 * ═══════════════════════════════════════════════════════════════
 * Inferir tipo e pasta do arquivo baseado no nome E path do import (FIX 2B)
 * ═══════════════════════════════════════════════════════════════
 * ✅ CORRIGIDO: Agora usa toPascalCase corretamente
 */
private inferFileTypeFromPath(name: string, importPath: string): { 
  type: string; 
  folder: string;
  filename: string;
} {
  const lowerPath = importPath.toLowerCase();
  const lowerName = name.toLowerCase();
  
  console.log(`🔍 inferFileTypeFromPath: "${name}" from "${importPath}"`);
  
  // ✅ PRIORIDADE 1: VALIDATORS - CRÍTICO (ItemSchemas, OrderSchemas)
  if (lowerPath.includes('validators') || lowerName.includes('schema') || lowerName.includes('schemas')) {
    const result = { 
      type: 'validator', 
      folder: 'validators',
      filename: `${this.toPascalCase(name)}.ts`
    };
    console.log(`   → validator: ${result.folder}/${result.filename}`);
    return result;
  }
  
  // ✅ PRIORIDADE 2: REPOSITORIES
  if (lowerPath.includes('repositories') || lowerName.includes('repository')) {
    const result = { 
      type: 'repository', 
      folder: 'repositories', 
      filename: `${this.toPascalCase(name)}.ts` 
    };
    console.log(`   → repository: ${result.folder}/${result.filename}`);
    return result;
  }
  
  // ✅ PRIORIDADE 3: CONTROLLERS
  if (lowerPath.includes('controllers') || lowerName.includes('controller')) {
    const result = { 
      type: 'controller', 
      folder: 'controllers', 
      filename: `${this.toPascalCase(name)}.ts` 
    };
    console.log(`   → controller: ${result.folder}/${result.filename}`);
    return result;
  }
  
  // ✅ PRIORIDADE 4: SERVICES
  if (lowerPath.includes('services') || lowerName.includes('service')) {
    const result = { 
      type: 'service', 
      folder: 'services', 
      filename: `${this.toPascalCase(name)}.service.ts` 
    };
    console.log(`   → service: ${result.folder}/${result.filename}`);
    return result;
  }
  
  // ✅ PRIORIDADE 5: MIDDLEWARE
  if (lowerPath.includes('middleware')) {
    const result = { 
      type: 'middleware', 
      folder: 'middleware', 
      filename: `${this.toPascalCase(name)}.ts` 
    };
    console.log(`   → middleware: ${result.folder}/${result.filename}`);
    return result;
  }
  
  // ✅ PRIORIDADE 6: MODELS
  if (lowerPath.includes('models')) {
    const result = { 
      type: 'model', 
      folder: 'models', 
      filename: `${this.toPascalCase(name)}.ts` 
    };
    console.log(`   → model: ${result.folder}/${result.filename}`);
    return result;
  }
  
  // ✅ PRIORIDADE 7: UTILS/CONFIG
  if (lowerPath.includes('utils') || lowerPath.includes('config')) {
    const result = { 
      type: 'utility', 
      folder: 'utils', 
      filename: `${this.toPascalCase(name)}.ts` 
    };
    console.log(`   → utility: ${result.folder}/${result.filename}`);
    return result;
  }
  
  // ✅ FALLBACK BASEADO NO NOME
  if (lowerName.includes('controller')) {
    return { type: 'controller', folder: 'controllers', filename: `${this.toPascalCase(name)}.ts` };
  }
  if (lowerName.includes('service')) {
    return { type: 'service', folder: 'services', filename: `${this.toPascalCase(name)}.service.ts` };
  }
  if (lowerName.includes('repository')) {
    return { type: 'repository', folder: 'repositories', filename: `${this.toPascalCase(name)}.ts` };
  }
  if (lowerName.includes('middleware') || lowerName.includes('validate') || lowerName.includes('auth')) {
    return { type: 'middleware', folder: 'middleware', filename: `${this.toPascalCase(name)}.ts` };
  }
  
  // ✅ FALLBACK FINAL
  console.log(`   → fallback: utils/${this.toPascalCase(name)}.ts`);
  return {
    type: 'module',
    folder: 'utils',
    filename: `${this.toPascalCase(name)}.ts`
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ═══════════════════════════════════════════════════════════════
 * HELPER: Converter string para PascalCase
 * ═══════════════════════════════════════════════════════════════
 * Exemplos:
 * - "itemSchemas" → "ItemSchemas"
 * - "item-schemas" → "ItemSchemas"
 * - "item_schemas" → "ItemSchemas"
 * - "item schemas" → "ItemSchemas"
 */
private toPascalCase(name: string): string {
  if (!name) return 'Component';
  
  // Remover extensão se tiver
  let cleanName = name.replace(/\.(ts|tsx|js|jsx)$/, '');
  
  // Converter para PascalCase
  return cleanName
    .toLowerCase()
    .split(/[\s\-_]+/)                    // Split por espaço, hífen, underscore
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');                            // Juntar sem espaços
}

/**
 * Templates de código de alta qualidade para regeneração
 */
private getCodeTemplate(type: string, name: string): string {
  const safeName = name || 'Item'; // ✅ FIX: Garantir que name não é undefined
  
  const templates: Record<string, string> = {
    validator: `
import { z } from 'zod';

export const ${safeName.toLowerCase()}Schemas = {
  create: z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    status: z.enum(['active', 'inactive']).optional().default('active')
  }),
  update: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
};
    `,
    
    middleware: `
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('Validation failed', error.errors));
      } else {
        next(error);
      }
    }
  };
};
    `,
    
    errors: `
export class ValidationError extends Error {
  public errors: Array<{ field: string; message: string }>;
  constructor(message: string, errors: any[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
    `,

    repository: `
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ${safeName} {
  async findAll() {
    return prisma.${safeName.toLowerCase()}.findMany();
  }

  async findById(id: string) {
    return prisma.${safeName.toLowerCase()}.findUnique({ where: { id } });
  }

  async create(data: any) {
    return prisma.${safeName.toLowerCase()}.create({ data });
  }

  async update(id: string, data: any) {
    return prisma.${safeName.toLowerCase()}.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.${safeName.toLowerCase()}.delete({ where: { id } });
  }
}

export default new ${safeName}();
    `,

    controller: `
import { Request, Response, NextFunction } from 'express';
import { ${safeName}Service } from '../services/${safeName}.service';
import { ValidationError } from '../utils/errors';

export class ${safeName}Controller {
  private service: ${safeName}Service;

  constructor() {
    this.service = new ${safeName}Service();
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await this.service.findAll();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await this.service.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, message: '${safeName} not found' });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await this.service.update(req.params.id, req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
    `
  };

  return templates[type] || '';
}


/**
 * Construir prompt de regeneração COM TEMPLATES (FIX 3 - TypeScript Safe)
 */
private buildRegenerationPrompt(
  missingFiles: Array<{ 
    name: string; 
    type: string; 
    folder: string;
    filename: string;
    importedBy: string[];
    importPath: string;
  }>,
  orphanedImports: string[],
  analysis: PromptAnalysisResult
): string {
  
  console.log('🔨 [buildRegenerationPrompt] Construindo prompt...');
  
  const mainEntity = this.extractMainEntity(analysis.originalPrompt || '');
  
  // Agrupar por tipo
  const byType = missingFiles.reduce((acc, f) => {
    if (!acc[f.type]) acc[f.type] = [];
    acc[f.type]!.push(f);
    return acc;
  }, {} as Record<string, typeof missingFiles>);
  
  let prompt = `# REGENERATE MISSING FILES - HIGH-QUALITY IMPLEMENTATION

## CONTEXT
Original prompt: "${analysis.originalPrompt || 'N/A'}"
Main entity: ${mainEntity}
Domain: ${analysis.context.domain}
Complexity: ${analysis.context.complexity}

## MISSING FILES DETECTED
Total: ${missingFiles.length} files

`;

  // Listar por tipo
  Object.entries(byType).forEach(([type, files]) => {
    prompt += `### ${type.toUpperCase()} (${files.length})\n`;
    files.forEach(f => {
      prompt += `- **${f.name}** → \`${f.folder}/${f.filename}\`\n`;
      prompt += `  Import path: \`${f.importPath}\`\n`;
      prompt += `  Used by: ${f.importedBy.join(', ')}\n`;
    });
    prompt += '\n';
  });
  
  // ✅ FIX: ADICIONAR NAMING ENFORCEMENT ANTES DOS TEMPLATES
  prompt += `
╔═══════════════════════════════════════════════════════════════╗
║ ⚠️  CRITICAL NAMING CONVENTIONS (STRICT ENFORCEMENT)          ║
╚═══════════════════════════════════════════════════════════════╝

**YOU MUST FOLLOW THESE EXACT PATTERNS:**

┌─────────────┬──────────────────────────┬─────────────────────────┐
│ File Type   │ Pattern                  │ Example (Entity="User") │
├─────────────┼──────────────────────────┼─────────────────────────┤
│ Controller  │ {Entity}Controller.ts    │ UserController.ts       │
│ Service     │ {Entity}Service.ts       │ UserService.ts          │
│ Repository  │ {Entity}Repository.ts    │ UserRepository.ts       │
│ Routes      │ {entity}.routes.ts       │ user.routes.ts          │
│ Validators  │ {entity}.validators.ts   │ user.validators.ts      │
│ Types       │ {entity}.types.ts        │ user.types.ts           │
│ Middleware  │ {name}.middleware.ts     │ auth.middleware.ts      │
│ Model       │ {Entity}.model.ts        │ User.model.ts           │
└─────────────┴──────────────────────────┴─────────────────────────┘

**✅ CORRECT IMPORTS (USE THESE):**
\`\`\`typescript
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { userSchemas } from '../validators/user.validators';
\`\`\`

**❌ WRONG IMPORTS (DO NOT USE):**
\`\`\`typescript
import { UserController } from '../controllers/User.controller'; ❌ WRONG
import { UserService } from '../services/User.service'; ❌ WRONG
import { user_controller } from '../controllers/user_controller'; ❌ WRONG
\`\`\`

**FILENAME RULES:**
- Controllers, Services, Repositories: PascalCase with suffix
- Routes, validators, types: lowercase with dots
- ALL imports MUST match EXACT filename

## TEMPLATES DE REFERÊNCIA (COPY STRUCTURE)

`;

  // ✅ TEMPLATES INLINE - FIX: Usar colchetes para acessar Record
  
  if (byType['validator'] && byType['validator'].length > 0) {
    const validatorName = byType['validator'][0]?.name || 'Item';
    // ✅ FIX: Normalizar nome para lowercase no filename
    const validatorFilename = `${validatorName.toLowerCase()}.validators.ts`;
    
    prompt += `### VALIDATOR TEMPLATE (Zod Schema)
\`\`\`typescript
// validators/${validatorFilename} ✅ (lowercase!)
import { z } from 'zod';

/**
 * ${validatorName} - Zod validation schemas
 */

// Create schema
export const ${validatorName}CreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive').optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  createdAt: z.date().default(() => new Date())
});

// Update schema (all fields optional)
export const ${validatorName}UpdateSchema = ${validatorName}CreateSchema.partial();

// Full schema with ID
export const ${validatorName}Schema = ${validatorName}CreateSchema.extend({
  id: z.string().uuid(),
  updatedAt: z.date()
});

// TypeScript types
export type ${validatorName}Create = z.infer<typeof ${validatorName}CreateSchema>;
export type ${validatorName}Update = z.infer<typeof ${validatorName}UpdateSchema>;
export type ${validatorName} = z.infer<typeof ${validatorName}Schema>;

// Export all schemas as object
export const ${validatorName}Schemas = {
  create: ${validatorName}CreateSchema,
  update: ${validatorName}UpdateSchema,
  full: ${validatorName}Schema
};
\`\`\`

`;
  }
  
  if (byType['repository'] && byType['repository'].length > 0) {
    const repoName = byType['repository'][0]?.name || 'ItemRepository';
    const entityName = repoName.replace('Repository', '');
    // ✅ FIX: Usar PascalCase no filename
    const repoFilename = `${entityName}Repository.ts`;
    
    prompt += `### REPOSITORY TEMPLATE (Data Access Layer)
\`\`\`typescript
// repositories/${repoFilename} ✅ (PascalCase!)
import { PrismaClient } from '@prisma/client';

/**
 * ${repoName} - Data access layer for ${entityName}
 */
export class ${repoName} {
  constructor(private prisma: PrismaClient) {}
  
  /**
   * Find all ${entityName.toLowerCase()}s
   */
  async findAll() {
    try {
      return await this.prisma.${entityName.toLowerCase()}.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      throw new Error(\`Failed to fetch ${entityName.toLowerCase()}s: \${error}\`);
    }
  }
  
  /**
   * Find ${entityName.toLowerCase()} by ID
   */
  async findById(id: string) {
    try {
      return await this.prisma.${entityName.toLowerCase()}.findUnique({
        where: { id }
      });
    } catch (error) {
      throw new Error(\`Failed to fetch ${entityName.toLowerCase()}: \${error}\`);
    }
  }
  
  /**
   * Create new ${entityName.toLowerCase()}
   */
  async create(data: any) {
    try {
      return await this.prisma.${entityName.toLowerCase()}.create({
        data
      });
    } catch (error) {
      throw new Error(\`Failed to create ${entityName.toLowerCase()}: \${error}\`);
    }
  }
  
  /**
   * Update ${entityName.toLowerCase()}
   */
  async update(id: string, data: any) {
    try {
      return await this.prisma.${entityName.toLowerCase()}.update({
        where: { id },
        data
      });
    } catch (error) {
      throw new Error(\`Failed to update ${entityName.toLowerCase()}: \${error}\`);
    }
  }
  
  /**
   * Delete ${entityName.toLowerCase()}
   */
  async delete(id: string) {
    try {
      return await this.prisma.${entityName.toLowerCase()}.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(\`Failed to delete ${entityName.toLowerCase()}: \${error}\`);
    }
  }
}
\`\`\`

`;
  }
  
  if (byType['service'] && byType['service'].length > 0) {
    const serviceName = byType['service'][0]?.name || 'ItemService';
    const entityName = serviceName.replace('Service', '');
    // ✅ FIX: Usar PascalCase no filename
    const serviceFilename = `${entityName}Service.ts`;
    
    prompt += `### SERVICE TEMPLATE (Business Logic Layer)
\`\`\`typescript
// services/${serviceFilename} ✅ (PascalCase!)
import { ${entityName}Repository } from '../repositories/${entityName}Repository';
import { ${entityName}CreateSchema, ${entityName}UpdateSchema } from '../validators/${entityName.toLowerCase()}.validators';

/**
 * ${serviceName} - Business logic for ${entityName}
 */
export class ${serviceName} {
  constructor(private repository: ${entityName}Repository) {}
  
  /**
   * Get all ${entityName.toLowerCase()}s
   */
  async getAll() {
    try {
      return await this.repository.findAll();
    } catch (error) {
      throw new Error(\`Service error: \${error}\`);
    }
  }
  
  /**
   * Get ${entityName.toLowerCase()} by ID
   */
  async getById(id: string) {
    try {
      const ${entityName.toLowerCase()} = await this.repository.findById(id);
      if (!${entityName.toLowerCase()}) {
        throw new Error('${entityName} not found');
      }
      return ${entityName.toLowerCase()};
    } catch (error) {
      throw new Error(\`Service error: \${error}\`);
    }
  }
  
  /**
   * Create new ${entityName.toLowerCase()}
   */
  async create(data: unknown) {
    try {
      // Validate input
      const validated = ${entityName}CreateSchema.parse(data);
      return await this.repository.create(validated);
    } catch (error) {
      throw new Error(\`Validation/Creation error: \${error}\`);
    }
  }
  
  /**
   * Update ${entityName.toLowerCase()}
   */
  async update(id: string, data: unknown) {
    try {
      // Validate input
      const validated = ${entityName}UpdateSchema.parse(data);
      return await this.repository.update(id, validated);
    } catch (error) {
      throw new Error(\`Validation/Update error: \${error}\`);
    }
  }
  
  /**
   * Delete ${entityName.toLowerCase()}
   */
  async delete(id: string) {
    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new Error(\`Service error: \${error}\`);
    }
  }
}
\`\`\`

`;
  }
  
  if (byType['controller'] && byType['controller'].length > 0) {
    const controllerName = byType['controller'][0]?.name || 'ItemController';
    const entityName = controllerName.replace('Controller', '');
    // ✅ FIX: Usar PascalCase no filename
    const controllerFilename = `${entityName}Controller.ts`;
    
    prompt += `### CONTROLLER TEMPLATE (REST API Endpoints)
\`\`\`typescript
// controllers/${controllerFilename} ✅ (PascalCase!)
import { Request, Response } from 'express';
import { ${entityName}Service } from '../services/${entityName}Service';

/**
 * ${controllerName} - REST API endpoints for ${entityName}
 */
export class ${controllerName} {
  constructor(private service: ${entityName}Service) {}
  
  /**
   * GET /api/${entityName.toLowerCase()}s - List all
   */
  async index(req: Request, res: Response) {
    try {
      const ${entityName.toLowerCase()}s = await this.service.getAll();
      res.json({ success: true, data: ${entityName.toLowerCase()}s });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
  
  /**
   * GET /api/${entityName.toLowerCase()}s/:id - Get by ID
   */
  async show(req: Request, res: Response) {
    try {
      const ${entityName.toLowerCase()} = await this.service.getById(req.params.id);
      res.json({ success: true, data: ${entityName.toLowerCase()} });
    } catch (error) {
      res.status(404).json({ success: false, error: (error as Error).message });
    }
  }
  
  /**
   * POST /api/${entityName.toLowerCase()}s - Create new
   */
  async create(req: Request, res: Response) {
    try {
      const ${entityName.toLowerCase()} = await this.service.create(req.body);
      res.status(201).json({ success: true, data: ${entityName.toLowerCase()} });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }
  
  /**
   * PUT /api/${entityName.toLowerCase()}s/:id - Update
   */
  async update(req: Request, res: Response) {
    try {
      const ${entityName.toLowerCase()} = await this.service.update(req.params.id, req.body);
      res.json({ success: true, data: ${entityName.toLowerCase()} });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }
  
  /**
   * DELETE /api/${entityName.toLowerCase()}s/:id - Delete
   */
  async delete(req: Request, res: Response) {
    try {
      await this.service.delete(req.params.id);
      res.json({ success: true, message: '${entityName} deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }
}
\`\`\`

`;
  }
  
  if (byType['middleware'] && byType['middleware'].length > 0) {
    const middlewareName = byType['middleware'][0]?.name || 'validateMiddleware';
    const middlewareFilename = `${middlewareName}.middleware.ts`;
    
    prompt += `### MIDDLEWARE TEMPLATE
\`\`\`typescript
// middleware/${middlewareFilename} ✅ (camelCase + .middleware.ts)
import { Request, Response, NextFunction } from 'express';

/**
 * ${middlewareName} - Express middleware
 */
export async function ${middlewareName}(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Middleware logic here
    console.log('${middlewareName} executed');
    next();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
\`\`\`

`;
  }
  
  prompt += `## CRITICAL REQUIREMENTS

1. **TypeScript Strict Mode**: Use proper types, avoid \`any\`
2. **Exact Exports**: Export exactly what is imported (name must match)
3. **Error Handling**: Try/catch in all async methods
4. **JSDoc Comments**: Add for all public methods
5. **Async/Await**: Use for all async operations
6. **Dependencies**: Import Express, Zod, Prisma as needed
7. **REST Best Practices**: Follow HTTP methods, status codes
8. **Validation**: Use Zod schemas for input validation
9. **Naming Conventions**: 
   - Controllers: {Entity}Controller.ts (PascalCase)
   - Services: {Entity}Service.ts (PascalCase)
   - Repositories: {Entity}Repository.ts (PascalCase)
   - Routes: {entity}.routes.ts (lowercase)
   - Validators: {entity}.validators.ts (lowercase)
   - Types: {entity}.types.ts (lowercase)
10. **File Comments**: Add \`// folder/filename.ts\` at top of each file

## FOLDER STRUCTURE TO FOLLOW
\`\`\`
backend/src/
${missingFiles.map(f => `  ${f.folder}/${f.filename}`).join('\n')}
\`\`\`

## OUTPUT FORMAT
Generate each file using this EXACT format:

\`\`\`typescript
// folder/filename.ts
[COMPLETE CODE HERE]
\`\`\`

⚠️  FINAL VALIDATION BEFORE GENERATION:
- [ ] All Controller files: {Entity}Controller.ts ✅
- [ ] All Service files: {Entity}Service.ts ✅
- [ ] All Repository files: {Entity}Repository.ts ✅
- [ ] All Routes files: {entity}.routes.ts ✅
- [ ] All Validator files: {entity}.validators.ts ✅
- [ ] All imports match exact filenames ✅

**GENERATE ALL ${missingFiles.length} FILES NOW WITH COMPLETE IMPLEMENTATION:**
`;
  
  console.log(`   ✅ Prompt construído: ${prompt.length} chars`);
  console.log(`   📋 Files to generate: ${missingFiles.map(f => f.filename).join(', ')}`);
  
  return prompt;
}

/**
 * Mesclar dois conjuntos de componentes
 */
private mergeComponentSets(
  original: GeneratedComponent[],
  newComponents: GeneratedComponent[]
): GeneratedComponent[] {
  
  const originalNames = new Set(original.map(c => c.name));
  const merged = [...original];

  newComponents.forEach(newComp => {
    if (!originalNames.has(newComp.name)) {
      merged.push(newComp);
      logger.info(`Added new component: ${newComp.name}`, {
        component: 'GenerationPipeline'
      });
    } else {
      logger.debug(`Component ${newComp.name} already exists, skipping new version`, {
        component: 'GenerationPipeline'
      });
    }
  });

  return merged;
}

private buildFolderStructure(missingFiles: any[]): string {
  const folders = new Map<string, string[]>();
  
  missingFiles.forEach(f => {
    if (!folders.has(f.folder)) {
      folders.set(f.folder, []);
    }
    folders.get(f.folder)!.push(f.filename);
  });
  
  let structure = '';
  folders.forEach((files, folder) => {
    structure += `${folder}/\n`;
    files.forEach(file => {
      structure += `  ├── ${file}\n`;
    });
  });
  
  return structure;
}

  // ═══════════════════════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════════════════════

  private generatePath(spec: any, framework: string): string {
    const base = framework === 'react' ? 'src/components' : 'src';
    return `${base}/${spec.name}.tsx`;
  }

  private extractDependencies(code: string): string[] {
    const deps: string[] = [];
    const importRegex = /import .+ from ['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      if (match && match[1] && !match[1].startsWith('.')) {
        deps.push(match[1]);
      }
    }

    return [...new Set(deps)];
  }

  private extractAllDependencies(components: GeneratedComponent[]): string[] {
    const allDeps = components.flatMap(c => c.dependencies);
    return [...new Set(allDeps)];
  }

  private calculateComplexity(code: string): number {
    // Simple cyclomatic complexity approximation
    const keywords = ['if', 'else', 'for', 'while', 'switch', 'case', '&&', '||'];
    let complexity = 1;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      complexity += matches ? matches.length : 0;
    });

    return complexity;
  }

  private generatePackageJson(components: GeneratedComponent[]): string {
    const dependencies = this.extractAllDependencies(components);

    return JSON.stringify({
     name: (this as any).projectName || 'generated-project',
      version: '1.0.0',
      dependencies: dependencies.reduce((acc, dep) => {
        acc[dep] = 'latest';
        return acc;
      }, {} as Record<string, string>)
    }, null, 2);
  }

  private generateReadme(components: GeneratedComponent[]): string {
    return `# Generated Project

## Components

${components.map(c => `- **${c.name}** (${c.type})`).join('\n')}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Generated by ORUS Builder - Cognitive Generation Engine
`;
  }
}

// ═══════════════════════════════════════════════════════════════
// SECTION 5: CONTEXT BUILDER CLASS
// ═══════════════════════════════════════════════════════════════

/**
 * Context Builder
 * Builds generation context from request
 */
export class ContextBuilder {
  /**
   * Build context from generation request
   */
  public async build(request: GenerationRequest): Promise<GenerationContext> {
    logger.info('Building generation context', {
      component: 'ContextBuilder'
    });

    try {
      // Analyze prompt
      const analysis = await this.analyzePrompt(request);

      // Search templates
      const templates = await this.searchTemplates(analysis, request);

      // Build specification (inline - método foi removido)
      const specification = analysis.specification || {
        architecture: {
          style: 'modular',
          layers: ['presentation', 'business', 'data'],
          patterns: ['mvc', 'repository']
        },
        components: [{
          name: 'MainComponent',
          type: 'component',
          purpose: 'Primary interface',
          responsibilities: ['rendering', 'state management']
        }],
        dataModel: [],
        technologies: {
          frontend: ['react', 'typescript'],
          backend: ['node', 'express'],
          database: ['mongodb'],
          deployment: ['docker']
        },
        quality: {
          testingStrategy: 'unit + integration',
          securityRequirements: ['authentication', 'authorization'],
          performanceTargets: ['<100ms response time']
        }
      };

      // Trinity integration (if enabled)
      let trinity: TrinityResponse<any> | undefined;
      if (request.enableTrinity) {
        trinity = await this.invokeTrinity(request);
      }

      const context: GenerationContext = {
        prompt: request.prompt,
        analysis,
        templates,
        framework: request.framework || 'react',
        domain: analysis.context.domain,
        specification,
        trinity
      };

      logger.info('Context built successfully', {
        component: 'ContextBuilder',
        metadata: {
          templatesFound: templates.length,
          trinityEnabled: !!trinity
        }
      });

      return context;

    } catch (error) {
      logger.error('Failed to build context', {
        component: 'ContextBuilder',
        error: (error as Error).message
      });
      throw error;
    }
  }

  /**
   * Analyze prompt (fallback mode)
   */
  private async analyzePrompt(request: GenerationRequest): Promise<PromptAnalysisResult> {
    try {
      logger.info('Using fallback analysis', {
        component: 'ContextBuilder'
      });

      return {
        originalPrompt: request.prompt,
        intent: {
          type: 'CREATE_APP',
          description: 'Create application',
          confidence: 60,
          subIntents: []
        },
        entities: [],
        requirements: [],
        ambiguities: [],
        context: {
          domain: request.context?.domain || 'general',
          complexity: request.context?.complexity || 'standard',
          stylePreferences: request.context?.stylePreferences,
          colorPalette: request.context?.colorPalette,
          personality: request.context?.personality
        },
        confidence: 60
      };

    } catch (error) {
      throw new Error('Prompt analysis failed', { cause: error });
    }
  }

  /**
   * Search templates
   */
  private async searchTemplates(
    analysis: PromptAnalysisResult,
    request: GenerationRequest
  ): Promise<any[]> {
    try {
      const templates = await templateManager.searchTemplates({
        keyword: analysis.intent.description,
        framework: (request.framework || 'react') as Framework,
      });

      const templatesArray = Array.isArray(templates)
        ? templates
        : (templates.templates || []);

      return templatesArray;

    } catch (error) {
      return [];
    }
  }


  /**
   * Invoke Trinity (if enabled)
   */
  private async invokeTrinity(request: GenerationRequest): Promise<TrinityResponse<any>> {
    try {
      // ✅ Get Trinity singleton instance
      const trinity = TrinityOrchestrator.getInstance();

      const trinityRequest: TrinityRequest = {
        requestId: `gen-${Date.now()}`,
        component: 'cerebro',
        operation: 'code_analysis',
        action: 'generate', // ✅ Propriedade obrigatória
        params: {
          prompt: request.prompt,
          context: request.context
        },
        timestamp: new Date()
      };


      // Trinity não expõe método público ainda - usar fallback
      const result: TrinityResponse<any> = {
        requestId: trinityRequest.requestId,
        timestamp: new Date(),
        component: trinityRequest.component,
        operation: trinityRequest.operation,
        success: false,
        metadata: {
          processingTime: 0,
          component: trinityRequest.component,
          executionTime: 0,
          cacheHit: false,
          retryCount: 0
        },
        source: 'fallback'
      };
      return result;

    } catch (error) {
      logger.warn('Trinity invocation failed, continuing without it', {
        component: 'ContextBuilder'
      });

      return {
        success: false,
        requestId: `gen-${Date.now()}`,
        timestamp: new Date(),
        component: 'cerebro',
        operation: 'code_analysis',
        metadata: {
          processingTime: 0,
          component: 'cerebro',
          executionTime: 0,
          cacheHit: false,
          retryCount: 0
        },
        source: 'fallback',
        error: {
          code: TrinityErrorCode.COMPONENT_UNAVAILABLE,
          message: createI18nText('Trinity not available', 'Trinity indisponível'),
          details: undefined,
          recoverable: true,
          fallbackAttempted: true
        }
      };

    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SECTION 6: VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Validate generated code
 */
export async function validateGeneration(
  code: string,
  framework: string
): Promise<ValidationResult> {
  try {
    const validationInput: ValidationInput = {
      code,
      language: CodeLanguage.TYPESCRIPT,
      context: {
        projectId: 'generated-validation',
        componentName: 'validation'
      }

    };

    const validation = await cigValidator.validate(validationInput);

    return {
      isValid: validation.isValid,
      errors: validation.codeIssues
        ?.filter((i: any) => i.severity === 'error')
        .map((i: any) => i.message?.en || 'Error') || [],
      warnings: validation.codeIssues
        ?.filter((i: any) => i.severity === 'warning')
        .map((i: any) => i.message?.en || 'Warning') || [],
      suggestions: []


    };


  } catch (error) {
    return {
      isValid: false,
      errors: [(error as Error).message]
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// SECTION 7: EXPORTS & SINGLETON
// ═══════════════════════════════════════════════════════════════

/**
 * Singleton instance
 */
let cognitiveGenerationEngineInstance: CognitiveGenerationEngine | null = null;

/**
 * Get or create singleton instance
 */
export function getCognitiveGenerationEngine(): CognitiveGenerationEngine {
  if (!cognitiveGenerationEngineInstance) {
    cognitiveGenerationEngineInstance = new CognitiveGenerationEngine();
  }
  return cognitiveGenerationEngineInstance;
}

/**
 * Reset singleton (useful for testing)
 */
export function resetCognitiveGenerationEngine(): void {
  cognitiveGenerationEngineInstance = null;
}
/**
 * Default export (for backward compatibility)
 */
export default getCognitiveGenerationEngine();
