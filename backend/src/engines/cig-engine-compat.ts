/**
 * Compatibility facade for the canonical CIG implementation.
 *
 * Legacy engines still consume lifecycle types from the engines layer. All
 * validation is delegated to `core/cig/cig-protocol.ts`, so there is one CIG
 * implementation and one source of truth for generation quality gates.
 */
import type { BaseEntity } from '../core/types';
import { SupportedLanguage } from '../core/types';
import { cigCertificationService } from '../core/cig/cig-certification-service';
import {
  FileType,
  type CIGValidationResult as CoreCIGValidationResult,
  type ValidationFile,
} from '../core/cig/cig-protocol';

export { ValidationStatus } from '../core/cig/cig-protocol';
export type CIGValidationResult = CoreCIGValidationResult;

export enum ComponentStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  RUNNING = 'running',
  STOPPED = 'stopped',
  ERROR = 'error',
}

export interface I18nText {
  en: string;
  pt_BR: string;
  es: string;
}

export interface EngineConfig {
  enabled: boolean;
  [key: string]: unknown;
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR',
  TYPE_ERROR = 'TYPE_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
}

export interface EngineResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: I18nText;
    details?: unknown;
  };
  context: {
    engineId: string;
    requestId: string;
    userId?: string;
    language: 'en' | 'pt-BR' | 'es';
    startTime: Date;
  };
}

export interface FileToValidate {
  path: string;
  content: string;
  dependencies?: string[];
  name?: string;
}

export interface ProjectContext {
  tsConfigPath?: string;
  rootDir: string;
  sourceDir: string;
  strictMode?: boolean;
  existingFiles?: string[];
}

export interface ValidationOptions {
  enableDGI?: boolean;
  enablePTI?: boolean;
  enableCET?: boolean;
  enableSPI?: boolean;
  enableCCV?: boolean;
  enableTCM?: boolean;
  enablePCA?: boolean;
  enableCLL?: boolean;
  strictValidation?: boolean;
  failOnWarnings?: boolean;
}

export interface CIGValidationRequest extends Partial<BaseEntity> {
  requestId: string;
  files: FileToValidate[];
  projectContext?: ProjectContext;
  options?: ValidationOptions;
  language: 'en' | 'pt-BR' | 'es';
  code?: string;
}

function languageToCore(language: CIGValidationRequest['language']): SupportedLanguage {
  if (language === 'pt-BR') return SupportedLanguage.PT_BR;
  if (language === 'es') return SupportedLanguage.ES;
  return SupportedLanguage.EN;
}

function fileType(filename: string): FileType {
  if (/\.tsx$/i.test(filename)) return FileType.TSX;
  if (/\.jsx$/i.test(filename)) return FileType.JSX;
  if (/\.json$/i.test(filename)) return FileType.JSON;
  if (/\.md$/i.test(filename)) return FileType.MARKDOWN;
  if (/\.js$/i.test(filename)) return FileType.JAVASCRIPT;
  return FileType.TYPESCRIPT;
}

function normalizeFile(file: FileToValidate, index: number): ValidationFile {
  const normalized = (file.path || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const segments = normalized.split('/').filter(Boolean);
  const lastSegment = segments.at(-1) || '';
  const pathContainsFilename = /\.[a-z0-9]+$/i.test(lastSegment);
  const name = file.name || (pathContainsFilename ? lastSegment : `generated-${index}.ts`);
  const directory = pathContainsFilename ? segments.slice(0, -1).join('/') : normalized;

  return {
    path: directory,
    name,
    content: file.content,
    type: fileType(name),
    dependencies: file.dependencies,
  };
}

export class CIGProtocolEngine {
  readonly engineId = 'cig-protocol-v2.0';
  readonly engineName: I18nText = {
    en: 'CIG Protocol 2.0 Engine',
    pt_BR: 'Engine do Protocolo CIG 2.0',
    es: 'Motor del Protocolo CIG 2.0',
  };
  readonly engineVersion = '2.1.0';
  readonly engineType = 'cig_protocol' as const;

  private status = ComponentStatus.STOPPED;

  async initialize(config: EngineConfig): Promise<unknown> {
    this.status = ComponentStatus.INITIALIZING;
    await cigCertificationService.initialize(config as never);
    this.status = ComponentStatus.READY;
    return {
      success: true,
      engineId: this.engineId,
      implementation: 'core/cig/cig-protocol',
      initializationTime: Date.now(),
    };
  }

  async start(): Promise<unknown> {
    await cigCertificationService.start();
    this.status = ComponentStatus.RUNNING;
    return { success: true, engineId: this.engineId, status: this.status, startTime: Date.now() };
  }

  async stop(): Promise<unknown> {
    await cigCertificationService.stop();
    this.status = ComponentStatus.STOPPED;
    return { success: true, engineId: this.engineId, status: this.status, stopTime: Date.now() };
  }

  getStatus(): ComponentStatus {
    return this.status;
  }

  getMetrics(): unknown {
    return cigCertificationService.getMetrics();
  }

  async validate(request: CIGValidationRequest): Promise<EngineResult<CoreCIGValidationResult>> {
    const startTime = new Date();
    const files = request.files?.length
      ? request.files.map(normalizeFile)
      : [normalizeFile({ path: 'generated.ts', content: request.code || '', dependencies: [] }, 0)];

    const result = await cigCertificationService.certify({
      requestId: request.requestId || `cig-${Date.now()}`,
      files,
      code: request.code || files.map(file => file.content).join('\n'),
      context: {
        projectRoot: request.projectContext?.rootDir || '.',
        tsConfigPath: request.projectContext?.tsConfigPath,
      },
      language: languageToCore(request.language || 'en'),
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: {
            en: result.error?.message.en || 'CIG validation failed',
            pt_BR: result.error?.message.pt_BR || 'Validação CIG falhou',
            es: result.error?.message.es || 'La validación CIG falló',
          },
          details: result.error?.details,
        },
        context: {
          engineId: this.engineId,
          requestId: request.requestId,
          language: request.language || 'en',
          startTime,
        },
      };
    }

    return {
      success: true,
      data: result.data,
      context: {
        engineId: this.engineId,
        requestId: request.requestId,
        language: request.language || 'en',
        startTime,
      },
    };
  }
}

export const cigProtocolEngine = new CIGProtocolEngine();
