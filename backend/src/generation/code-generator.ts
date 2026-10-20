/*
* ═══════════════════════════════════════════════════════════════
* 🧬 COGNITIVE AGENT CODE DNA - ORUS BUILDER CODE GENERATOR
* ═══════════════════════════════════════════════════════════════
*
* 👨💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
* ⏰ CREATED: 2025-10-04T21:13:00-03:00
* 🔄 LAST_MODIFIED: 2025-12-11T22:48:00-03:00
* 🏷️ COMPONENT_HASH: orus.builder.generation.orchestrator.20251211.v6.FULLY-FIXED
*
* ═══════════════════════════════════════════════════════════════
* COMPONENT PURPOSE & FUNCTIONALITY
* ═══════════════════════════════════════════════════════════════
*
* WHAT IT DOES: Supreme orchestration of all code generation processes
* WHY IT EXISTS: Coordinate all specialized generators in an intelligent pipeline
* HOW IT WORKS: Pipeline orchestration + dependency management + file aggregation
* COGNITIVE IMPACT: +1000% complete development automation
*
* 🎯 ORCHESTRATOR CAPABILITIES:
* - Coordinates ALL generators (UI, Backend, API, DB, Tests)
* - 9-stage intelligent pipeline execution
* - Proper file aggregation from all generator outputs
* - Detailed logging for debugging
* - Type-safe generator integration using 'as any' for flexibility
*
* ═══════════════════════════════════════════════════════════════
*/

import { logger } from '../utils/logger';
import * as path from 'path';
import { architectureDesigner } from './architecture-designer';
import { databaseDesigner } from './database-designer';
import { backendGenerator } from './backend-generator';
import { apiGenerator } from './api-generator';
import { uiGenerator } from './ui-generator';
import type { VisualIntent } from './visual-intent';
import { testGenerator } from './test-generator';
import { codeOptimizer } from './code-optimizer';
import { qualityAnalyzer } from './quality-analyzer';
import { cigValidator, CodeLanguage } from './cig-validator';
import { getEntityFields, getEntityRelations } from './domain-model-catalog';
import type { ProductBlueprint } from '../blueprint/product-blueprint';

// ═══════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export enum ProjectType {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  FULLSTACK = 'fullstack',
  API = 'api',
  LIBRARY = 'library',
  MOBILE = 'mobile'
}

export enum FileType {
  TYPESCRIPT = 'typescript',
  JAVASCRIPT = 'javascript',
  TSX = 'tsx',
  JSX = 'jsx',
  CSS = 'css',
  HTML = 'html',
  JSON = 'json',
  MARKDOWN = 'markdown'
}

export interface TechStack {
  frontend?: string[];
  backend?: string[];
  database?: string;
}

export interface ProjectRequirements {
  description: string;
  features: string[];
  tech_stack: TechStack;
  authentication?: boolean;
  testing?: boolean;
}

export interface DatabaseConfig {
  type: 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';
  entities: string[];
}

export interface GenerationOptions {
  language?: 'typescript' | 'javascript';
  generateTests?: boolean;
  generateDocs?: boolean;
  optimizeCode?: boolean;
  analyzeQuality?: boolean;
  includeDocker?: boolean;
  includeTests?: boolean;
  includeCICD?: boolean;
}

export interface CodeGenerationInput {
  projectName: string;
  projectType: ProjectType;
  requirements: ProjectRequirements;
  database?: DatabaseConfig;
  authentication?: boolean;
  api_type?: 'rest' | 'graphql';
  options?: GenerationOptions;
  /**
   * Entidades de domínio já detectadas (ex: extraídas por IA do prompt original).
   * Quando presente, tem prioridade sobre a extração por palavra-chave feita
   * internamente a partir de `requirements.features` - essa extração interna só
   * reconhece um punhado de palavras em inglês (user/task/product...) e nunca
   * bate com entidades reais em outros domínios/idiomas.
   */
  entities?: string[];
  /** Canonical visual plan prepared before file generation. */
  visualIntent?: VisualIntent;
  productBlueprint?: ProductBlueprint;
}

export interface GeneratedFile {
  path: string;
  filename: string;
  name: string;
  content: string;
  type: FileType;
  size: number;
  metadata: {
    generator: string;
    timestamp: string;
    dependencies?: string[];
    isRoot?: boolean;
  };
}

export interface GenerationResult {
  success: boolean;
  projectName: string;
  files: GeneratedFile[];
  structure: Record<string, any>;
  metrics: {
    totalFiles: number;
    totalLines: number;
    generationTime: number;
  };
  pipeline: {
    stagesExecuted: number;
    stageResults: Record<string, any>;
  };
  metadata: {
    timestamp: string;
    version: string;
  };
}

interface PipelineStage {
  name: string;
  success: boolean;
  output?: any;
  duration: number;
  error?: string;
}

// ✅ FIX #6: Entity interface para type casting
interface DataRequirement {
  id: string;
  entity: string;
  attributes?: any[];
  relationships?: any[];
  constraints?: any[];
}

// ═══════════════════════════════════════════════════════════════
// CODE GENERATOR CLASS
// ═══════════════════════════════════════════════════════════════

class CodeGenerator {
  private version = '6.FULLY-FIXED';

  async generate(input: CodeGenerationInput): Promise<GenerationResult> {
    const startTime = Date.now();

    // ✅ FIX #4.2.2: Garantir TypeScript como default
    if (!input.options) {
      input.options = {
        language: 'typescript',
        includeTests: true,
        generateTests: true,
        optimizeCode: true,
        analyzeQuality: true
      };
      console.log('[CodeGenerator] ⚠️ Options not provided, using defaults');
    }

    if (!input.options.language) {
      input.options.language = 'typescript';
      console.log('[CodeGenerator] ⚠️ Language not set, defaulting to TypeScript');
    }

    if (input.options.language === 'javascript') {
      console.log('[CodeGenerator] 🔧 Forcing TypeScript (was JavaScript)');
      input.options.language = 'typescript';
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔥 [CodeGenerator] STARTING GENERATION PIPELINE v6.FULLY-FIXED');
    console.log(`[CodeGenerator] Project: ${input.projectName}`);
    console.log(`[CodeGenerator] Type: ${input.projectType}`);
    console.log(`[CodeGenerator] Features: ${input.requirements.features.length}`);
    console.log('═══════════════════════════════════════════════════════════════');

    console.log(`[CodeGenerator] Type check: ${typeof input.projectType}`);
    console.log(`[CodeGenerator] FULLSTACK enum: ${ProjectType.FULLSTACK}`);
    console.log(`[CodeGenerator] Match: ${input.projectType === ProjectType.FULLSTACK}`);
    console.log('═══════════════════════════════════════════════════════════════');

    // ✅ FIX: Normalize projectType to enum (case-insensitive)
    if (typeof input.projectType === 'string') {
      const normalized = input.projectType.toLowerCase() as ProjectType;
      console.log(`[CodeGenerator] 🔧 Normalizing type: ${input.projectType} → ${normalized}`);
      input.projectType = normalized;
    }

    const hasBackend = input.projectType === ProjectType.BACKEND || input.projectType === ProjectType.FULLSTACK;
    const hasFrontend = input.projectType === ProjectType.FRONTEND || input.projectType === ProjectType.FULLSTACK;

    try {
      const files: GeneratedFile[] = [];
      const stageResults: Record<string, any> = {};

      if (input.productBlueprint) {
        const content = JSON.stringify(input.productBlueprint, null, 2);
        const acceptancePlan = JSON.stringify({
          schemaVersion: input.productBlueprint.schemaVersion,
          blueprintId: input.productBlueprint.blueprintId,
          blueprintVersion: input.productBlueprint.version,
          criteria: input.productBlueprint.acceptanceCriteria.map(criterion => {
            const capability = input.productBlueprint!.capabilities.find(item => item.id === criterion.capabilityId);
            const screens = input.productBlueprint!.screens.filter(item => item.capabilityIds.includes(criterion.capabilityId));
            return {
              ...criterion,
              capability: capability ? {
                id: capability.id,
                name: capability.name,
                strategy: capability.strategy,
                entities: capability.entities,
              } : undefined,
              screens: screens.map(screen => ({ id: screen.id, name: screen.name, route: screen.route })),
              status: 'planned',
            };
          }),
        }, null, 2);
        files.push({
          path: 'docs',
          filename: 'product-blueprint.json',
          name: 'product-blueprint.json',
          content,
          type: FileType.JSON,
          size: Buffer.byteLength(content, 'utf8'),
          metadata: {
            generator: 'product-blueprint',
            timestamp: new Date().toISOString(),
          },
        });
        files.push({
          path: '.orus',
          filename: 'acceptance-plan.json',
          name: 'acceptance-plan.json',
          content: acceptancePlan,
          type: FileType.JSON,
          size: Buffer.byteLength(acceptancePlan, 'utf8'),
          metadata: {
            generator: 'product-blueprint',
            timestamp: new Date().toISOString(),
          },
        });
        stageResults['productBlueprint'] = input.productBlueprint;
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 1: ARCHITECTURE DESIGN
      // ═══════════════════════════════════════════════════════════

      const archStage = await this.executeStage(
        'Architecture Design',
        () => architectureDesigner.design({
          requirements: input.requirements.description,
          techStack: input.requirements.tech_stack
        } as any)
      );

      stageResults['architecture'] = archStage;
      if (archStage.success && archStage.output) {
        console.log(`✅ [CodeGenerator] Architecture designed`);
        console.log('[CodeGenerator] Architecture designed (files NOT extracted - design only)');
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 2: DATABASE DESIGN
      // ═══════════════════════════════════════════════════════════

      if (input.database) {
        const dbStage = await this.executeStage(
          'Database Design',
          () => databaseDesigner.design({
            type: input.database!.type,
            profile: input.productBlueprint?.capabilities.some(capability => capability.entities.includes('Task') && capability.strategy === 'workflow')
              ? 'task-management'
              : 'crud',
            authentication: input.authentication === true,
            entities: input.database!.entities.map(name => ({
              id: name.toLowerCase(),
              entity: name,
              attributes: getEntityFields(name).map(field => ({
                name: field.name,
                type: field.prismaType,
                required: field.required,
                defaultValue: field.defaultValue,
                relationTo: field.relationTo,
              })),
              relationships: getEntityRelations(name),
              constraints: []
            })),
            requirements: input.requirements.description
          } as any)
        );

        stageResults['database'] = dbStage;
        if (dbStage.success && dbStage.output) {
          console.log(`✅ [CodeGenerator] Database designed`);
          const dbFiles = this.extractFiles(dbStage.output, 'database-designer');
          files.push(...dbFiles);
          console.log(`[CodeGenerator] Database files: ${dbFiles.length}`);
        }
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 3: BACKEND GENERATION
      // ═══════════════════════════════════════════════════════════

      if (input.projectType === ProjectType.BACKEND || input.projectType === ProjectType.FULLSTACK) {
        // Prefere entidades já detectadas (ex: via IA a partir do prompt original)
        // sobre a extração por palavra-chave em inglês, que não reconhece
        // entidades de outros domínios/idiomas.
        const detectedEntities = (input.entities && input.entities.length > 0)
          ? input.entities
          : this.extractEntitiesFromFeatures(input.requirements.features || []);

        console.log(`[CodeGenerator] Detected entities: ${detectedEntities.join(', ')} (source: ${input.entities?.length ? 'provided' : 'keyword-fallback'})`);

        const backendStage = await this.executeStage(
          'Backend Generation',
          () => backendGenerator.generate({
            projectName: input.projectName,
            requirements: input.requirements,
            entities: detectedEntities, // ← NOVO: Passar explicitamente
            architecture: archStage.output,
            database: stageResults['database']?.output,
            authentication: input.authentication ? { type: 'jwt', providers: ['local'] } : undefined,
            productBlueprint: input.productBlueprint,
          } as any)
        );

        stageResults['backend'] = backendStage;
        if (backendStage.success && backendStage.output) {
          console.log(`✅ [CodeGenerator] Backend generated`);
          const backendFiles = this.extractFiles(backendStage.output, 'backend-generator');
          files.push(...backendFiles);
          console.log(`[CodeGenerator] Backend files: ${backendFiles.length}`);
        }
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 4: API GENERATION
      // ═══════════════════════════════════════════════════════════

      if (input.api_type) {
        const apiStage = await this.executeStage(
          'API Generation',
          () => apiGenerator.generate({
            type: input.api_type,
            resources: (input.entities || []).map(entity => ({
              id: entity,
              name: entity,
              endpoints: [],
              description: `${entity} API`,
            })),
            authentication: input.authentication,
            database: stageResults['database']?.output
          } as any)
        );

        stageResults['api'] = apiStage;
        if (apiStage.success && apiStage.output) {
          console.log(`✅ [CodeGenerator] API generated: ${input.api_type}`);
          const apiFiles = this.extractFiles(apiStage.output, 'api-generator');

          // ✅ FIX #3: Aplicar re-exports aos validators
          const apiFilesWithValidators = this.fixValidatorExports(apiFiles);
          const existingPaths = new Set(files.map(file => `${file.path}/${file.filename}`.replace(/\\/g, '/')));

          const apiFilesFiltered = apiFilesWithValidators.filter(_file => {
            const name = _file.name.toLowerCase();
            const target = `${_file.path}/${_file.filename}`.replace(/\\/g, '/');
            if (existingPaths.has(target)) {
              console.log(`[CodeGenerator] Skipping existing backend file: ${target}`);
              return false;
            }
            if (name.endsWith('.routes.ts') || name.endsWith('.validators.ts')) {
              console.log(`[CodeGenerator] Skipping duplicate: ${_file.name}`);
              return false;
            }
            return true;
          });

          files.push(...apiFilesFiltered);
          console.log(`[CodeGenerator] API files: ${apiFilesFiltered.length}/${apiFiles.length}`);
        }
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 5: UI GENERATION
      // ═══════════════════════════════════════════════════════════

      // ✅ FIX #4: Debug logs for UI Generation
     const isFullstack = input.projectType === ProjectType.FULLSTACK;
const isFrontend = input.projectType === ProjectType.FRONTEND;
const isBackendOnly = input.projectType === ProjectType.BACKEND || input.projectType === ProjectType.API;
const shouldGenerateUI = isFrontend || isFullstack || (!isBackendOnly);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🎨 [CodeGenerator] UI GENERATION CHECK:');
      console.log(` - projectType (input): "${input.projectType}"`);
      console.log(` - projectType (typeof): ${typeof input.projectType}`);
      console.log(` - ProjectType.FULLSTACK: "${ProjectType.FULLSTACK}"`);
      console.log(` - ProjectType.FRONTEND: "${ProjectType.FRONTEND}"`);
      console.log(` - isFullstack: ${isFullstack}`);
      console.log(` - isFrontend: ${isFrontend}`);
      console.log(` - shouldGenerateUI: ${shouldGenerateUI}`);
      console.log('═══════════════════════════════════════════════════════════');

      if (shouldGenerateUI) {
        console.log('✅ [CodeGenerator] Executing stage: UI Generation...');
        const uiStage = await this.executeStage(
          'UI Generation',
          () => uiGenerator.generate({
            framework: input.requirements.tech_stack.frontend?.[0] || 'react',
            requirements: input.requirements,
            architecture: archStage.output,
            api: stageResults['api']?.output,
            entities: input.entities,
            visualIntent: input.visualIntent,
            productBlueprint: input.productBlueprint,
            persistence: hasBackend ? 'api' : 'local'
          } as any)
        );

        stageResults['ui'] = uiStage;
        if (uiStage.success && uiStage.output) {
          const visualAudit = uiStage.output.metadata?.visualAudit;
          if (visualAudit && visualAudit.passed !== true) {
            throw new Error(`Visual quality gate failed (${visualAudit.score}/100): ${visualAudit.diagnostics.join(', ')}`);
          }
          console.log('✅ [CodeGenerator] UI generated');
          const uiFiles = this.extractFiles(uiStage.output, 'ui-generator');

          // 🎯 FIX #5.1: Normalize Vite Entry Point
          const normalizedFiles = this.normalizeViteEntryPoint(uiFiles);
          files.push(...normalizedFiles);
          console.log(`[CodeGenerator] UI files: ${normalizedFiles.length}`);
        } else {
          console.log('❌ [CodeGenerator] UI generation failed or returned no output');
          console.log(` - uiStage.success: ${uiStage.success}`);
          console.log(` - uiStage.output exists: ${!!uiStage.output}`);
        }
      } else {
        console.log('⏭️ [CodeGenerator] SKIPPING UI Generation');
        console.log(` Reason: projectType "${input.projectType}" is not FRONTEND or FULLSTACK`);
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 6: TEST GENERATION
      // ═══════════════════════════════════════════════════════════

      // The current integration-test templates require the generated Prisma
      // database module. Do not emit a test suite with dangling imports for a
      // backend that intentionally has no persistence layer.
      if (input.options?.generateTests !== false && hasBackend && !!input.database) {
        const testStage = await this.executeStage(
          'Test Generation',
          () => testGenerator.generate({
            components: files.map(_f => ({ name: _f.filename, path: _f.path })),
            framework: 'jest'
          } as any)
        );

        stageResults['tests'] = testStage;
        if (testStage.success && testStage.output) {
          console.log(`✅ [CodeGenerator] Tests generated`);
          const testFiles = this.extractFiles(testStage.output, 'test-generator');
          files.push(...testFiles);
          console.log(`[CodeGenerator] Test files: ${testFiles.length}`);
        }
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 7: CODE OPTIMIZATION
      // ═══════════════════════════════════════════════════════════

      if (input.options?.optimizeCode !== false && files.length > 0) {
        const optimizeStage = await this.executeStage(
          'Code Optimization',
          // ✅ FIX #9: Pass real optimization options — was passing {} so no optimization ever ran
          () => codeOptimizer.optimize({
            code: files.map(_f => _f.content).join('\n\n'),
            options: {
              removeUnusedCode: true,
              consolidateDuplicates: true,
              optimizeLoops: false,
              improveReadability: true,
              applyBestPractices: true,
            }
          } as any)
        );

        stageResults['optimization'] = optimizeStage;
        if (optimizeStage.success && optimizeStage.output) {
          console.log(`✅ [CodeGenerator] Code optimized`);

          // Try to apply optimizations if output has optimizedFiles
          if (optimizeStage.output && optimizeStage.output.optimizedFiles && Array.isArray(optimizeStage.output.optimizedFiles)) {
            optimizeStage.output.optimizedFiles.forEach((_opt: any) => {
              const fileIndex = files.findIndex(_f => _f.path === _opt.path);
              if (fileIndex >= 0) {
                if (files[fileIndex]) {
                  files[fileIndex].content = _opt.content;
                }
              }
            });
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 8: QUALITY ANALYSIS
      // ═══════════════════════════════════════════════════════════

      if (input.options?.analyzeQuality !== false && files.length > 0) {
        const qualityStage = await this.executeStage(
          'Quality Analysis',
          () => qualityAnalyzer.analyzeProject(files.map(file => ({
            path: `${file.path}/${file.filename}`.replace(/\/+/g, '/'),
            content: file.content,
            language: file.type,
          })))
        );

        stageResults['quality'] = qualityStage;
        if (qualityStage.success) {
          console.log(`✅ [CodeGenerator] Quality analyzed: score ${qualityStage.output?.overallScore ?? 'N/A'}`);
        }
      }

      // ═══════════════════════════════════════════════════════════
      // STAGE 10: GENERATE CONFIG FILES
      // ═══════════════════════════════════════════════════════════

      console.log('📦 [CodeGenerator] Generating configuration files...');
      const configFiles = this.generatePackageJsonConfigs(
        input.requirements.tech_stack.frontend?.[0] || 'react',
        hasFrontend,
        hasBackend,
        !!input.database,
        input.database?.entities || []
      );

      const tsconfigs = this.generateTsConfigFiles();

      // Add config files
      const configurationFiles: GeneratedFile[] = [
        // FRONTEND package.json
        {
          path: 'frontend',
          filename: 'package.json',
          name: 'package.json',
          content: configFiles.frontend,
          type: FileType.JSON,
          size: configFiles.frontend.length,
          metadata: {
            generator: 'code-generator',
            timestamp: new Date().toISOString()
          }
        },
        // FRONTEND tsconfig.json
        {
          path: 'frontend',
          filename: 'tsconfig.json',
          name: 'tsconfig.json',
          content: tsconfigs.frontend,
          type: FileType.JSON,
          size: tsconfigs.frontend.length,
          metadata: {
            generator: 'code-generator',
            timestamp: new Date().toISOString()
          }
        },
        // BACKEND package.json
        {
          path: 'backend',
          filename: 'package.json',
          name: 'package.json',
          content: configFiles.backend,
          type: FileType.JSON,
          size: configFiles.backend.length,
          metadata: {
            generator: 'code-generator',
            timestamp: new Date().toISOString()
          }
        },
        // BACKEND tsconfig.json
        {
          path: 'backend',
          filename: 'tsconfig.json',
          name: 'tsconfig.json',
          content: tsconfigs.backend,
          type: FileType.JSON,
          size: tsconfigs.backend.length,
          metadata: {
            generator: 'code-generator',
            timestamp: new Date().toISOString()
          }
        },
        // ROOT package.json (RAIZ!)
        {
          path: '', // ← VAZIO = raiz do projeto
          filename: 'package.json',
          name: 'package.json',
          content: configFiles.root,
          type: FileType.JSON,
          size: configFiles.root.length,
          metadata: {
            generator: 'code-generator',
            timestamp: new Date().toISOString(),
            isRoot: true
          }
        }
      ];

      files.push(...configurationFiles.filter(file => {
        if (file.path === 'frontend') return hasFrontend;
        if (file.path === 'backend') return hasBackend;
        return true;
      }));

      console.log(`📦 [CodeGenerator] 3 package.json files added:`);
      console.log(` ├─ frontend/package.json`);
      console.log(` ├─ backend/package.json`);
      console.log(` └─ package.json (ROOT)`);

      // ✅ FIX #14: Validar e garantir root package.json está na raiz
      let rootPackageCount = 0;

      files.forEach((_file, _index) => {
        if (_file.filename === 'package.json' && _file.metadata?.isRoot === true) {
          rootPackageCount++;
          console.log(`[CodeGenerator] 🔧 FIX #14: Validating root package.json`);
          if (_file.path !== '') {
            console.log(`[CodeGenerator] ⚠️ WARNING: Root path was "${_file.path}", correcting to empty`);
            files[_index] = {
              ..._file,
              path: '', // ← FORÇA para vazio
              metadata: {
                ..._file.metadata,
                isRoot: true
              }
            };
          } else {
            console.log(`[CodeGenerator] ✅ Root package.json path confirmed: empty (raiz)`);
          }
        }
      });

      if (rootPackageCount === 0) {
        console.warn(`[CodeGenerator] ⚠️ WARNING: No root package.json found! Check FIX #14`);
      }

      console.log(`✅ [CodeGenerator] Config files validated: ${files.filter(_f => _f.filename === 'package.json').length} package.json files`);

      // ✅ FIX #15: Add Tailwind + PostCSS configs
      const tailwindConfig = this.generateTailwindConfig();
      const postCSSConfig = this.generatePostCSSConfig();

      if (hasFrontend) files.push(
        {
          path: 'frontend',
          filename: 'tailwind.config.js',
          name: 'tailwind.config.js',
          content: tailwindConfig,
          type: FileType.JAVASCRIPT,
          size: tailwindConfig.length,
          metadata: {
            generator: 'code-generator',
            timestamp: new Date().toISOString(),
            isConfig: true
          } as any
        },
        {
          path: 'frontend',
          filename: 'postcss.config.js',
          name: 'postcss.config.js',
          content: postCSSConfig,
          type: FileType.JAVASCRIPT,
          size: postCSSConfig.length,
          metadata: {
            generator: 'code-generator',
            timestamp: new Date().toISOString(),
            isConfig: true
          } as any
        }
      );

      console.log(`✅ [CodeGenerator] Tailwind + PostCSS configs added`);

      // ═══════════════════════════════════════════════════════════
      // STAGE 10.5: DEDUPLICATE FILES
      // ✅ FIX #7: Remove duplicate files (e.g. backend/package.json generated
      // by both backend-generator AND code-generator Stage 10)
      // ═══════════════════════════════════════════════════════════
      console.log('🔧 [CodeGenerator] STAGE 10.5: Deduplicating files...');
      const _beforeDedup = files.length;
      const _seenKeys = new Set<string>();
      const _deduplicatedFiles: GeneratedFile[] = [];
      for (const _df of files) {
        const _key = `${(_df.path || '').replace(/\\/g, '/').replace(/\/$/, '')}/${_df.filename}`;
        if (!_seenKeys.has(_key)) {
          _seenKeys.add(_key);
          _deduplicatedFiles.push(_df);
        } else {
          console.log(`[CodeGenerator] 🗑️ Dedup: removed duplicate "${_key}"`);
        }
      }
      for (const _packageFile of _deduplicatedFiles.filter(file => file.filename === 'package.json')) {
        try {
          const _packageJson = JSON.parse(_packageFile.content);
          _packageJson.name = this.normalizePackageName(String(_packageJson.name || input.projectName));
          _packageFile.content = JSON.stringify(_packageJson, null, 2);
          _packageFile.size = _packageFile.content.length;
        } catch {
          console.warn(`[CodeGenerator] Invalid package.json emitted at ${_packageFile.path || '.'}`);
        }
      }
      files.splice(0, files.length, ..._deduplicatedFiles);
      console.log(`[CodeGenerator] ✅ Dedup: ${_beforeDedup} → ${files.length} files (${_beforeDedup - files.length} removed)`);

      // ═══════════════════════════════════════════════════════════
      // STAGE 11: FIX IMPORT REFERENCES
      // ═══════════════════════════════════════════════════════════

      console.log('🔧 [CodeGenerator] ════════════════════════════════════════');
      console.log('🔧 [CodeGenerator] STAGE 11: Fixing import references...');
      console.log('🔧 [CodeGenerator] ════════════════════════════════════════');

      // Debug: Files count before
      const filesCountBefore = files.length;
      console.log(`[CodeGenerator] 📊 Files before import fix: ${filesCountBefore}`);

      // Create reference map of all files
      const referenceMap = this.createImportReferenceMap(files);
      console.log(`[CodeGenerator] 🗺️ Reference map created: ${referenceMap.size} entries`);

      // Debug: Sample of reference map
      let mapSample = 0;
      referenceMap.forEach((_value, _key) => {
        if (mapSample < 5) {
          console.log(`[CodeGenerator] └─ "${_key}" → "${_value}"`);
          mapSample++;
        }
      });

      if (referenceMap.size > 5) {
        console.log(`[CodeGenerator] └─ ... and ${referenceMap.size - 5} more entries`);
      }

      // Fix imports in all files
      const filesWithFixedImports = this.fixImportReferencesInFiles(files, referenceMap);

      // Debug: Count TypeScript files that were processed
      const tsFilesProcessed = filesWithFixedImports.filter(_f =>
        _f.filename.endsWith('.ts') || _f.filename.endsWith('.tsx')
      ).length;
      console.log(`[CodeGenerator] ✅ Import references fixed in ${tsFilesProcessed} TypeScript files`);

      // Debug: Verify no files were lost
      const filesCountAfter = filesWithFixedImports.length;

      if (filesCountAfter !== filesCountBefore) {
        console.warn(`[CodeGenerator] ⚠️ WARNING: File count changed from ${filesCountBefore} to ${filesCountAfter}`);
      } else {
        console.log(`[CodeGenerator] ✅ All ${filesCountAfter} files preserved`);
      }

      // Debug: Sample of fixed content
      const sampleFile = filesWithFixedImports.find(_f =>
        _f.filename.endsWith('.ts') && _f.content?.includes('from')
      );

      if (sampleFile) {
        const importLines = sampleFile.content
          .split('\n')
          .filter(_line => _line.includes('from'))
          .slice(0, 3);
        console.log(`[CodeGenerator] 📄 Sample imports from "${sampleFile.filename}":`);
        importLines.forEach(_line => {
          console.log(`[CodeGenerator] └─ ${_line.trim()}`);
        });
      }

      console.log('🔧 [CodeGenerator] ════════════════════════════════════════');

      // Validate the final project, after configs, deduplication and import
      // rewriting. Validating a concatenated blob hid cross-file failures.
      const validationFiles = filesWithFixedImports.map(_file => ({
        path: (_file.path || '').replace(/\\/g, '/'),
        name: _file.filename,
        content: _file.content,
        type: _file.type as any
      }));
      const cigStage = await this.executeStage(
        'CIG Validation',
        () => cigValidator.validate({
          code: filesWithFixedImports.map(_file => _file.content).join('\n\n'),
          files: validationFiles,
          language: CodeLanguage.TYPESCRIPT,
          context: { componentName: input.projectName },
          options: { checkDependencies: true, checkContracts: true }
        })
      );
      stageResults['cig'] = cigStage;
      if (!cigStage.success || !cigStage.output?.isValid) {
        const errors = cigStage.output?.errors || [];
        const summary = errors.slice(0, 5).map((error: any) =>
          `${error.file || 'unknown'}: ${error.message?.en || error.message || error.code}`
        ).join('; ');
        throw new Error(`CIG validation failed with ${errors.length} error(s): ${summary}`);
      }
      console.log(`✅ [CodeGenerator] CIG validation complete: ${validationFiles.length} files checked`);

      // ═══════════════════════════════════════════════════════════
      // FINAL METRICS & RESULT
      // ═══════════════════════════════════════════════════════════

      const totalLines = filesWithFixedImports.reduce((_sum: number, _f: GeneratedFile) => _sum + (_f.content?.split('\n').length || 0), 0);
      const generationTime = Date.now() - startTime;

      console.log('═══════════════════════════════════════════════════════════════');
      console.log('✅ [CodeGenerator] PIPELINE COMPLETE');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`[CodeGenerator] 📦 Total files: ${filesWithFixedImports.length}`);
      console.log(`[CodeGenerator] 📝 Total lines: ${totalLines}`);
      console.log(`[CodeGenerator] ⏱️ Generation time: ${generationTime}ms`);

      // Files breakdown
      const tsCount = filesWithFixedImports.filter(_f => _f.filename.endsWith('.ts') || _f.filename.endsWith('.tsx')).length;
      const jsCount = filesWithFixedImports.filter(_f => _f.filename.endsWith('.js') || _f.filename.endsWith('.jsx')).length;
      const jsonCount = filesWithFixedImports.filter(_f => _f.filename.endsWith('.json')).length;
      const otherCount = filesWithFixedImports.length - tsCount - jsCount - jsonCount;

      console.log(`[CodeGenerator] 📊 Breakdown:`);
      console.log(`[CodeGenerator] ├─ TypeScript: ${tsCount}`);
      console.log(`[CodeGenerator] ├─ JavaScript: ${jsCount}`);
      console.log(`[CodeGenerator] ├─ JSON: ${jsonCount}`);
      console.log(`[CodeGenerator] └─ Other: ${otherCount}`);
      console.log('═══════════════════════════════════════════════════════════════');

      return {
        success: true,
        projectName: input.projectName,
        files: filesWithFixedImports,
        structure: this.buildProjectStructure(filesWithFixedImports),
        metrics: {
          totalFiles: filesWithFixedImports.length,
          totalLines: totalLines,
          generationTime: generationTime
        },
        pipeline: {
          stagesExecuted: Object.keys(stageResults).length,
          stageResults: stageResults
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: this.version
        }
      };
    } catch (_error) {
      console.error('═══════════════════════════════════════════════════════════════');
      console.error('❌ [CodeGenerator] PIPELINE FAILED');
      console.error('═══════════════════════════════════════════════════════════════');
      console.error('[CodeGenerator] 💥 Error:', (_error as Error).message);
      console.error('[CodeGenerator] 📍 Stack:', (_error as Error).stack);
      console.error('═══════════════════════════════════════════════════════════════');
      throw _error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FIX #3 - VALIDATOR EXPORTS FIXER
  // ═══════════════════════════════════════════════════════════════

  /**
   * ✅ FIX #3: Adiciona re-exports de validators individuais
   * Procura por validators/index.ts e adiciona exports explícitos
   */
  private fixValidatorExports(_files: GeneratedFile[]): GeneratedFile[] {
    return _files.map(_file => {
      // Procurar validators/index.ts
      if (_file.path.includes('validators') && _file.filename === 'index.ts') {
        let content = _file.content;

        // Detectar que schemas existem
        const schemas = ['comment', 'task', 'post', 'user', 'login'];
        let needsUpdate = false;

        schemas.forEach(_schema => {
          const exportPattern = `export const ${_schema}Schemas`;
          if (content.includes(exportPattern) && !content.includes(`export { ${_schema}Schemas }`)) {
            needsUpdate = true;
            // Já existe, não precisa adicionar (ou está inline)
          }
        });

        // Se é só imports e export validate, adicionar re-exports
        if (!content.includes('export const') && !content.includes('Schemas')) {
          console.log('[fixValidatorExports] Adding explicit exports to validators/index.ts');
          content += `\n\n// ✅ FIX #3: Re-export all validator schemas\n`;
          content += `export { commentSchemas, taskSchemas, postSchemas, userSchemas, loginSchemas } from './schemas';\n`;
        }

        return { ..._file, content };
      }

      return _file;
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FIX #5 - NORMALIZE VITE ENTRY POINT
  // ═══════════════════════════════════════════════════════════════

  /**
   * FIX 5.1 - Normalize Vite Entry Point (index → main)
   */
  // ✅ FIX #8: path field is only the DIRECTORY (e.g. 'frontend/src'), never includes the filename.
  // Must compare _file.filename directly to detect the index.tsx entry point.
  private normalizeViteEntryPoint(_files: GeneratedFile[]): GeneratedFile[] {
    const entryPoint = _files.find(_file =>
      (_file.filename === 'index.tsx' || _file.filename === 'index.ts') &&
      (_file.path?.includes('frontend') || _file.path?.includes('src')) &&
      !_file.path?.includes('backend')
    );

    if (!entryPoint) return _files;

    const extension = entryPoint.filename.split('.').pop() || 'tsx';
    const oldEntry = `index.${extension}`;
    const newEntry = `main.${extension}`;

    return _files.map(_file => {
      const _isEntryPoint =
        (_file.filename === 'index.tsx' || _file.filename === 'index.ts') &&
        (_file.path?.includes('frontend') || _file.path?.includes('src')) &&
        !_file.path?.includes('backend');

      if (_isEntryPoint) {
        console.log(`[normalizeViteEntryPoint] ✅ Renaming ${_file.filename} → ${newEntry}`);
        return {
          ..._file,
          filename: newEntry,
          name: newEntry,
        };
      }

      if (_file.filename === 'index.html') {
        return {
          ..._file,
          content: _file.content.replace(
            new RegExp(`/src/${oldEntry.replace('.', '\\.')}`, 'g'),
            `/src/${newEntry}`
          )
        };
      }

      return _file;
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FIX #5.2 - IMPORT PATH NORMALIZATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * FIX 5.2 - Import Path Normalization
   */
  private normalizeImportPath(_importPath: string): string {
    // Remove múltiplos dots: "..." → "../"
    let normalized = _importPath.replace(/\.\.\./g, '../');

    // Remove dots soltos: "." antes de nome → "./"
    normalized = normalized.replace(/\.(?=[a-zA-Z])/g, './');

    // Remove espaços extras
    normalized = normalized.replace(/\s+/g, '');

    // Garante relative imports começam com "./"
    if (!normalized.startsWith('.') && !normalized.startsWith('/')) {
      normalized = './' + normalized;
    }

    return normalized;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FIX #1, #4, #5 - FIX IMPORTS IN CONTENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * ✅ FIX #1: Corrige paths de import em conteúdo gerado
   * ✅ FIX #4: Aplica normalização de nomes (title vs name)
   * ✅ FIX #5: Remove extensão .ts apenas de imports relativos
   * - Converte backend/src/... e frontend/src/... para relativos
   * - Mantém imports de pacotes npm inalterados
   */
  private fixImportsInContent(_content: string): string {
    if (!_content) return _content;

    let fixed = _content;

    // ✅ FIX #1: Corrigir imports com casing (Comment.service → comment.service)
    fixed = fixed.replace(
      /from\s+['"]\.\.?\/([A-Z][a-zA-Z0-9]*)(\.service|\.controller|\.model|\.repository|\.ts)?['"]/g,
      (_match: string, _name: string, _suffix: string) => {
        const lowercase = _name.toLowerCase();
        const ext = _suffix || '.ts';
        return `from './${lowercase}${ext}'`;
      }
    );

    // backend/src → relativo
    fixed = fixed.replace(
      /from\s+['"]backend\/src\/([^'"]+)['"]/g,
      "from './$1'"
    );

    // frontend/src → relativo
    fixed = fixed.replace(
      /from\s+['"]frontend\/src\/([^'"]+)['"]/g,
      "from './$1'"
    );

    // Normaliza excesso de pontos (../../../../ → ./ se aplicável, opcional)
    fixed = fixed.replace(/from\s+['"]\.{4,}\/([^'"]+)['"]/g, "from './$1'");

    // Remove .ts em imports relativos (não toca pacotes)
    fixed = fixed.replace(
      /from\s+['"](\.{1,2}\/[^'"]*?)\.(ts|tsx)['"]/g,
      "from '$1'"
    );

    // Corrige casos de ".catalog.routes" → "./catalog.routes"
    fixed = fixed.replace(/from\s+['"]\.([a-zA-Z0-9])/g, "from './$1'");

    return fixed;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FIX #6 - CREATE IMPORT REFERENCE MAP (CORRIGIDA)
  // ═══════════════════════════════════════════════════════════════

  /**
   * FIX 5.4 - Create Import Reference Map (CORRIGIDA)
   * Mapeia variações de nomes para o path completo do arquivo
   */
  private createImportReferenceMap(_files: GeneratedFile[]): Map<string, string> {
    const map = new Map<string, string>();

    _files.forEach(_file => {
      // Path completo relativo
      const fullPath = _file.path
        ? `${_file.path}/${_file.filename}`.replace(/\\/g, '/')
        : _file.filename;

      // Remover extensão
      const withoutExt = fullPath.replace(/\.(ts|tsx|js|jsx)$/, '');

      // Basename sem extensão
      const basename = _file.filename
        .replace(/\.(ts|tsx|js|jsx)$/, '')
        .toLowerCase();

      // Variações de nome
      const camelCase = basename;
      const kebabCase = basename.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

      // Mapear variações para path completo (SEM extensão)
      map.set(camelCase, withoutExt);
      map.set(kebabCase, withoutExt);
      map.set(_file.filename, withoutExt);

      console.log(`[ImportMap] ${basename} → ${withoutExt}`);
    });

    return map;
  }

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FIX #6 - FIX IMPORT REFERENCES USING MAP (CORRIGIDA)
  // ═══════════════════════════════════════════════════════════════

  /**
   * FIX 5.5 - Fix Import References Using Map (CORRIGIDA)
   * Usa o mapa para corrigir imports incorretos
   */
  private fixImportReferencesInFiles(
    _files: GeneratedFile[],
    _referenceMap: Map<string, string>
  ): GeneratedFile[] {
    const pathsByLowercase = new Map<string, string>();
    for (const file of _files) {
      const fullPath = path.posix.join((file.path || '').replace(/\\/g, '/'), file.filename);
      const withoutExtension = fullPath.replace(/\.(ts|tsx|js|jsx|json)$/i, '');
      pathsByLowercase.set(withoutExtension.toLowerCase(), withoutExtension);
      if (/\/index$/i.test(withoutExtension)) {
        pathsByLowercase.set(withoutExtension.replace(/\/index$/i, '').toLowerCase(), withoutExtension.replace(/\/index$/i, ''));
      }
    }

    return _files.map(_file => {
      let content = _file.content || '';

      // Primeiro: aplicar fixImportsInContent() (regras gerais)
      content = this.fixImportsInContent(content);

      // Depois: usar mapa para imports específicos
      // Regex para capturar imports incorretos
      const importRegex = /from\s+['"]([^'"]+)['"]/g;

      content = content.replace(importRegex, (_match: string, _importPath: string) => {
        // Resolve relative imports against the generated file set using a
        // case-insensitive lookup, then writes the real on-disk casing. This
        // keeps Windows-generated projects portable to Linux deployments.
        if (_importPath.startsWith('.')) {
          const sourceDir = (_file.path || '').replace(/\\/g, '/');
          const requested = path.posix.normalize(path.posix.join(sourceDir, _importPath));
          const correctTarget = pathsByLowercase.get(requested.toLowerCase());
          if (correctTarget) {
            let relative = path.posix.relative(sourceDir, correctTarget);
            if (!relative.startsWith('.')) relative = `./${relative}`;
            return _match.replace(_importPath, relative);
          }
          return _match;
        }

        // Se é npm package (sem /, sem extension), deixar
        if (!_importPath.includes('/') && !_importPath.includes('\\')) {
          return _match;
        }

        // Se é path absoluto (backend/src/...), já foi corrigido por fixImportsInContent
        if (_importPath.includes('backend/src') || _importPath.includes('frontend/src')) {
          return _match; // fixImportsInContent já lidou com isso
        }

        // Tentar encontrar no mapa
        const basename = _importPath
          .split(/[/\\]/)
          .pop()
          ?.replace(/\.(ts|tsx|js|jsx)$/, '')
          .toLowerCase() || '';

        const correctPath = _referenceMap.get(basename);
        if (correctPath) {
          console.log(`[FixImports] ${_importPath} → ${correctPath}`);
          return `from '${correctPath}'`;
        }

        return _match;
      });

      return { ..._file, content };
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════════════════

  private extractEntitiesFromFeatures(_features: any[]): string[] {
    // ✅ USO DIRETO DA LÓGICA DE architecture-designer
    const stringFeatures = _features.map(_f => {
      if (typeof _f === 'string') return _f;
      if (typeof _f === 'object' && _f?.description) return _f.description;
      if (typeof _f === 'object' && _f?.name) return _f.name;
      return String(_f);
    });

    const fullText = stringFeatures.join(' ').toLowerCase();

    const vocabulary: Array<[RegExp, string]> = [
      [/\b(users?|usuarios?|clientes?|login)\b/, 'User'],
      [/\b(tasks?|todos?|tarefas?)\b/, 'Task'],
      [/\b(projects?|projetos?)\b/, 'Project'],
      [/\b(teams?|equipes?)\b/, 'Team'],
      [/\b(items?|itens?)\b/, 'Item'],
      [/\b(products?|produtos?)\b/, 'Product'],
      [/\b(orders?|pedidos?)\b/, 'Order'],
      [/\b(customers?|consumidores?)\b/, 'Customer'],
      [/\b(posts?|publicacoes?)\b/, 'Post'],
      [/\b(comments?|comentarios?)\b/, 'Comment'],
      [/\b(notes?|notas?)\b/, 'Note'],
      [/\b(appointments?|agendamentos?|consultas?)\b/, 'Appointment'],
      [/\b(patients?|pacientes?)\b/, 'Patient'],
    ];
    const normalized = fullText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const found = vocabulary.filter(([pattern]) => pattern.test(normalized)).map(([, entity]) => entity);

    if (found.length > 0) {
      console.log(`[CodeGenerator] ✅ Extracted entities: ${found.join(', ')}`);
      return found;
    }

    console.warn(`[CodeGenerator] ⚠️ No known entities found, defaulting to ['Item']`);
    return ['Item'];
  }

  /**
   * Check if word is a stopword
   */
  private isStopword(_word: string): boolean {
    if (!_word || typeof _word !== 'string') return true;
    const stopwords = [
      'com', 'para', 'que', 'uma', 'dos', 'das', 'por', 'tipo', 'de', 'e',
      'o', 'a', 'um', 'uma', 'os', 'as', 'uns', 'umas', 'ao', 'aos',
      'é', 'são', 'ser', 'está', 'estão', 'do', 'da', 'dum', 'duma'
    ];
    return stopwords.includes(_word.toLowerCase());
  }

  /**
   * Normalize entity name for consistent naming
   * Converts to PascalCase format
   */
  private normalizeName(_name: string): string {
    if (!_name) return '';

    // Remove special characters and extra spaces
    const cleaned = _name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');

    // Convert to PascalCase
    return cleaned
      .split(/\s+/)
      .map(_word => _word.charAt(0).toUpperCase() + _word.slice(1))
      .join('');
  }

  /**
   * Generate tsconfig.json for frontend and backend
   */
  private generateTsConfigFiles(): { frontend: string; backend: string } {
    // FRONTEND tsconfig.json
    const frontendTsConfig = {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        noImplicitAny: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        moduleResolution: "Bundler",
        resolveJsonModule: true,
        types: ["vite/client"],
        jsx: "react-jsx",
        baseUrl: ".",
        paths: {
          "@/*": ["src/*"],
          "@components/*": ["src/components/*"],
          "@pages/*": ["src/pages/*"],
          "@hooks/*": ["src/hooks/*"],
          "@types/*": ["src/types/*"],
          "@utils/*": ["src/utils/*"]
        }
      },
      include: ["src"],
      references: [{ path: "./tsconfig.node.json" }]
    };

    // BACKEND tsconfig.json
    const backendTsConfig = {
      compilerOptions: {
        target: "ES2020",
        module: "CommonJS",
        lib: ["ES2020"],
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        noImplicitAny: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        moduleResolution: "node",
        baseUrl: ".",
        paths: {
          "@/*": ["src/*"],
          "@routes/*": ["src/routes/*"],
          "@controllers/*": ["src/controllers/*"],
          "@middleware/*": ["src/middleware/*"],
          "@validators/*": ["src/validators/*"],
          "@types/*": ["src/types/*"],
          "@utils/*": ["src/utils/*"]
        }
      },
      include: ["src"],
      exclude: ["node_modules", "dist", "src/tests", "src/**/*.test.ts", "src/**/*.spec.ts"]
    };

    return {
      frontend: JSON.stringify(frontendTsConfig, null, 2),
      backend: JSON.stringify(backendTsConfig, null, 2)
    };
  }

  private async executeStage(
    _name: string,
    _fn: () => Promise<any>
  ): Promise<PipelineStage> {
    const startTime = Date.now();
    console.log(`\n🔧 [CodeGenerator] Executing stage: ${_name}...`);
    try {
      const output = await _fn();
      const duration = Date.now() - startTime;
      console.log(`✅ [CodeGenerator] Stage "${_name}" completed in ${duration}ms`);
      return {
        name: _name,
        success: true,
        output: output,
        duration: duration
      };
    } catch (_error) {
      const duration = Date.now() - startTime;
      console.error(`❌ [CodeGenerator] Stage "${_name}" failed:`, (_error as Error).message);
      return {
        name: _name,
        success: false,
        duration: duration,
        error: (_error as Error).message
      };
    }
  }

  private extractFiles(_output: any, _generatorName: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    console.log(`[CodeGenerator] Extracting files from ${_generatorName}...`);
    console.log(`[CodeGenerator] Output type: ${typeof _output}`);
    console.log(`[CodeGenerator] Output keys:`, Object.keys(_output || {}));

    if (!_output) {
      console.log(`[CodeGenerator] No output from ${_generatorName}`);
      return files;
    }

    // Strategy 1: Direct files array
    if (Array.isArray(_output.files)) {
      console.log(`[CodeGenerator] Found ${_output.files.length} files in output.files`);
      _output.files.forEach((_file: any) => {
        files.push(this.normalizeFile(_file, _generatorName));
      });
    }
    // Strategy 2: Direct array
    else if (Array.isArray(_output)) {
      console.log(`[CodeGenerator] Output is array with ${_output.length} items`);
      _output.forEach((_file: any) => {
        files.push(this.normalizeFile(_file, _generatorName));
      });
    }
    // ✅ FIX #4.2.11: Strategy 3 - Process component.files, NOT component
    else if (Array.isArray(_output.components)) {
      console.log(`[CodeGenerator] Found ${_output.components.length} components`);
      _output.components.forEach((_comp: any) => {
        // ✅ Se component tem files array, processa ELES
        if (_comp.files && Array.isArray(_comp.files)) {
          console.log(`[CodeGenerator] Component ${_comp.name} has ${_comp.files.length} files`);
          _comp.files.forEach((_file: any) => {
            files.push(this.normalizeFile(_file, _generatorName));
          });
        }
        // ❌ NÃO cria arquivo para o component em si!
        // Component é METADATA, não arquivo!
      });
    }
    // Strategy 4: Individual file properties
    else if (_output.server || _output.routes || _output.controllers || _output.schema) {
      console.log(`[CodeGenerator] Found individual file properties`);
      if (_output.server) {
        files.push(this.createFile('backend/src', 'server.ts', _output.server, FileType.TYPESCRIPT, _generatorName));
      }
      if (_output.routes) {
        Object.entries(_output.routes).forEach(([_name, _content]) => {
          files.push(this.createFile('backend/src/routes', `${_name}.routes.ts`, _content as string, FileType.TYPESCRIPT, _generatorName));
        });
      }
      if (_output.controllers) {
        Object.entries(_output.controllers).forEach(([_name, _content]) => {
          files.push(this.createFile('backend/src/controllers', `${_name}.controller.ts`, _content as string, FileType.TYPESCRIPT, _generatorName));
        });
      }
      if (_output.schema) {
        files.push(this.createFile('prisma', 'schema.prisma', _output.schema, FileType.TYPESCRIPT, _generatorName));
      }
    }
    // Strategy 5: Frontend specific
    else if (_output.pages || _output.hooks) {
      console.log(`[CodeGenerator] Found frontend structure`);
      if (_output.pages) {
        Object.entries(_output.pages).forEach(([_name, _content]) => {
          files.push(this.createFile('src/pages', `${_name}.tsx`, _content as string, FileType.TSX, _generatorName));
        });
      }
      if (_output.components) {
        Object.entries(_output.components).forEach(([_name, _content]) => {
          files.push(this.createFile('src/components', `${_name}.tsx`, _content as string, FileType.TSX, _generatorName));
        });
      }
      if (_output.hooks) {
        Object.entries(_output.hooks).forEach(([_name, _content]) => {
          files.push(this.createFile('src/hooks', `${_name}.ts`, _content as string, FileType.TYPESCRIPT, _generatorName));
        });
      }
    }

    console.log(`[CodeGenerator] Extracted ${files.length} files from ${_generatorName}`);
    return files;
  }

  private normalizeFile(_file: any, _generatorName: string): GeneratedFile {
    const extractedFilename = _file.filename || _file.name || _file.file || 'generated.ts';
    let extractedPath = _file.path !== undefined ? _file.path : (_file.directory || 'src');

    // ROOT package.json — early return garantindo raiz
    if (_file.metadata?.isRoot === true && extractedFilename === 'package.json') {
      console.log(`[normalizeFile] 🎯 ROOT FILE: ${extractedFilename}`);
      return {
        path: '', // ← VAZIO para raiz
        filename: 'package.json',
        name: 'package.json',
        content: _file.content || _file.code || '',
        type: FileType.JSON,
        size: (_file.content || _file.code || '').length,
        metadata: {
          generator: _generatorName,
          timestamp: new Date().toISOString(),
          isRoot: true
        }
      };
    }

    // Para arquivos normais, NÃO concatenar path + filename
    // Manter separados conforme interface!
    let fullPath = String(extractedPath).replace(/\\/g, '/');

    // Se path contém extensão (arquivo), extrai apenas diretório
    // Dot-directories such as .orus are directories, not files. The previous
    // `includes('.')` heuristic silently moved their contents to the root.
    if (path.posix.extname(fullPath) !== '' && !extractedFilename.includes('/')) {
      const parts = fullPath.split('/');
      parts.pop(); // Remove último (arquivo)
      fullPath = parts.join('/');
      console.log(`[normalizeFile] Extracted directory: ${fullPath}`);
    }

    // ✅ NÃO concatenar aqui! Manter path e filename separados!
    console.log(`[normalizeFile] ✅ path="${fullPath}", filename="${extractedFilename}"`);
    const rawContent = _file.content || _file.code || '';
    const finalContent =
      extractedFilename.endsWith('.json') ? rawContent : this.fixImportsInContent(rawContent);

    return {
      path: fullPath, // ← Só o diretório
      filename: extractedFilename, // ← Só o arquivo
      name: extractedFilename,
      content: finalContent,
      type: this.detectFileType(extractedFilename),
      size: rawContent.length,
      metadata: {
        generator: _generatorName,
        timestamp: new Date().toISOString(),
        dependencies: _file.dependencies || _file.imports || []
      }
    };
  }

  private createFile(
    _path: string,
    _filename: string,
    _content: string,
    _type: FileType,
    _generator: string
  ): GeneratedFile {
    // ✅ FIX: Remove trailing slash
    let basePath = _path;
    if (basePath.endsWith('/')) {
      basePath = basePath.slice(0, -1);
    }

    // ✅ FIX: Concatena path + filename
    const fullPath = basePath ? `${basePath}/${_filename}` : _filename;
    console.log(`[createFile] ✅ ${fullPath}`);

    return {
      path: fullPath,
      filename: _filename,
      name: _filename,
      content: _content,
      type: _type,
      size: _content.length,
      metadata: {
        generator: _generator,
        timestamp: new Date().toISOString()
      }
    };
  }

  private detectFileType(_filename: string): FileType {
    if (_filename.endsWith('.tsx')) return FileType.TSX;
    if (_filename.endsWith('.jsx')) return FileType.JSX;
    if (_filename.endsWith('.ts')) return FileType.TYPESCRIPT;
    if (_filename.endsWith('.js')) return FileType.JAVASCRIPT;
    if (_filename.endsWith('.css')) return FileType.CSS;
    if (_filename.endsWith('.html')) return FileType.HTML;
    if (_filename.endsWith('.json')) return FileType.JSON;
    if (_filename.endsWith('.md')) return FileType.MARKDOWN;
    return FileType.TYPESCRIPT;
  }

  private buildProjectStructure(_files: GeneratedFile[]): Record<string, any> {
    const structure: Record<string, any> = {};
    _files.forEach(_file => {
      const parts = _file.path.split('/');
      let current = structure;
      parts.forEach((_part, _index) => {
        if (_index === parts.length - 1) {
          // ✅ FIX: Garantir que é array antes de push
          if (!Array.isArray(current[_part])) {
            current[_part] = [];
          }
          current[_part].push(_file.filename);
        } else {
          // ✅ FIX: Garantir que é objeto antes de navegar
          if (typeof current[_part] !== 'object' || Array.isArray(current[_part])) {
            current[_part] = {};
          }
          current = current[_part];
        }
      });
    });
    return structure;
  }

  /**
   * Generate package.json configs for frontend, backend, and root
   * ✅ Inclui Tailwind, PostCSS, Autoprefixer e concurrently
   */
  private generatePackageJsonConfigs(
    _framework: string,
    _hasFrontend: boolean,
    _hasBackend: boolean,
    _hasDatabase: boolean,
    _entities: string[]
  ): { frontend: string; backend: string; root: string } {
    // FRONTEND (Vite + React + Tailwind)
    const frontendPkg = {
      name: 'project-frontend',
      version: '1.0.0',
      private: true,
      type: 'module',
      engines: { node: '>=20.0.0', npm: '>=9.0.0' },
      scripts: {
        dev: 'vite',
        build: 'tsc --noEmit && vite build',
        preview: 'vite preview',
        lint: 'eslint src --ext ts,tsx',
        test: 'vitest run'
      },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router-dom': '^7.18.4',
        axios: '^1.20.0',
        zustand: '^4.5.0'
      },
      devDependencies: {
        '@types/react': '^18.2.56',
        '@types/react-dom': '^18.2.19',
        '@types/node': '^20.11.19',
        typescript: '^5.9.3',
        vite: '^5.4.21',
        '@vitejs/plugin-react': '^4.7.0',
        eslint: '^8.56.0',
        vitest: '^2.1.9',
        // Tailwind + PostCSS + Autoprefixer
        tailwindcss: '^3.4.19',
        postcss: '^8.5.28',
        autoprefixer: '^10.6.1'
      }
    };

    // BACKEND (Express + TS + Jest + Prisma condicional)
    const backendPkg = {
      name: 'project-backend',
      version: '1.0.0',
      private: true,
      type: 'commonjs',
      engines: { node: '>=20.0.0', npm: '>=9.0.0' },
      scripts: {
        dev: 'ts-node-dev --respawn --transpile-only src/server.ts',
        build: 'tsc',
        start: 'node dist/server.js',
        lint: 'eslint src --ext ts',
        test: 'jest'
      },
      dependencies: {
        express: '^4.22.3',
        cors: '^2.8.5',
        dotenv: '^16.6.1',
        ...(_hasDatabase ? { '@prisma/client': '6.12.0' } : {}),
        zod: '^3.25.76',
        jsonwebtoken: '^9.0.2',
        bcryptjs: '^3.0.2'
      },
      devDependencies: {
        '@types/express': '^4.17.21',
        '@types/cors': '^2.8.17',
        '@types/node': '^20.11.19',
        '@types/jsonwebtoken': '^9.0.5',
        typescript: '^5.9.3',
        'ts-node': '^10.9.2',
        'ts-node-dev': '^2.0.0',
        ...(_hasDatabase ? { prisma: '6.12.0' } : {}),
        jest: '^29.7.0',
        '@types/jest': '^29.5.12',
        '@types/supertest': '^6.0.2',
        'ts-jest': '^29.1.2',
        supertest: '^6.3.3'
      }
    };

    // ROOT (workspaces + concurrently)
    const workspaces = [
      ...(_hasFrontend ? ['frontend'] : []),
      ...(_hasBackend ? ['backend'] : [])
    ];
    const rootScripts = {
      'install:all': 'npm install && npm install --workspaces',
      ...(_hasFrontend && _hasBackend ? {
        dev: 'concurrently "npm run dev --workspace=frontend" "npm run dev --workspace=backend"',
        build: 'npm run build --workspace=frontend && npm run build --workspace=backend'
      } : _hasFrontend ? {
        dev: 'npm run dev --workspace=frontend',
        build: 'npm run build --workspace=frontend'
      } : {
        dev: 'npm run dev --workspace=backend',
        build: 'npm run build --workspace=backend'
      }),
      ...(_hasFrontend ? {
        'dev:frontend': 'npm run dev --workspace=frontend',
        'build:frontend': 'npm run build --workspace=frontend'
      } : {}),
      ...(_hasBackend ? {
        'dev:backend': 'npm run dev --workspace=backend',
        'build:backend': 'npm run build --workspace=backend',
        start: 'npm run start --workspace=backend',
        test: 'npm run test --workspace=backend'
      } : _hasFrontend ? {
        test: 'npm run test --workspace=frontend'
      } : {}),
      lint: 'npm run lint --workspaces',
      'audit:prod': 'npm audit --omit=dev --audit-level=moderate'
    };

    const rootPkg = {
      name: 'project',
      version: '1.0.0',
      private: true,
      engines: { node: '>=20.0.0', npm: '>=9.0.0' },
      workspaces,
      scripts: rootScripts,
      allowScripts: {
        ...(_hasFrontend ? { esbuild: true } : {}),
        ...(_hasDatabase ? {
          '@prisma/client': true,
          '@prisma/engines': true,
          prisma: true
        } : {})
      },
      ...(_hasFrontend && _hasBackend ? {
        devDependencies: { concurrently: '^8.2.2' }
      } : {})
    };

    return {
      frontend: JSON.stringify(frontendPkg, null, 2),
      backend: JSON.stringify(backendPkg, null, 2),
      root: JSON.stringify(rootPkg, null, 2)
    };
  }

  /**
   * Normalize entity name to lowercase (for file/route names)
   */
  private normalizeEntityName(_name: string): string {
    return _name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s-]+/g, '')
      .replace(/[^a-z0-9]/g, '');
  }

  private normalizePackageName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/^[._-]+|[._-]+$/g, '')
      .slice(0, 214) || 'orus-project';
  }

  /**
   * Normalize entity name to PascalCase (for class/component names)
   */
  private normalizeToPascalCase(_name: string): string {
    const normalized = _name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s-]+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  }

  /**
   * Generate Tailwind CSS configuration
   */
  private generateTailwindConfig(): string {
    return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
`;
  }

  /**
   * Generate PostCSS configuration
   */
  private generatePostCSSConfig(): string {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const codeGenerator = new CodeGenerator();

export default codeGenerator;
