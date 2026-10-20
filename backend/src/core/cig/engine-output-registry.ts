/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ENGINE OUTPUT REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega TypeScript Supreme | Tulio (ORUS Creator)
 * ⏰ CREATED: 2025-11-16T12:26:00-03:00
 * 🔄 PHASE: PHASE 1 - FOUNDATION
 * 🏷️ COMPONENT_HASH: orus.builder.cig.engine.registry.20251116.v1.ER001
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPONENT PURPOSE & FUNCTIONALITY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * WHAT IT DOES: Central registry onde cada engine registra seus outputs gerados
 * WHY IT EXISTS: Compartilhar contexto entre engines - tipos, services, components
 * HOW IT WORKS: Map<engineName, artifact> + export system + observer pattern
 * COGNITIVE IMPACT: +500% compartilhamento de contexto entre engines
 *
 * 🎯 KEY RESPONSIBILITIES:
 * - Armazenar outputs de cada engine
 * - Exportar availableTypes, availableServices, availableComponents
 * - Notificar dependentes quando novo output registrado
 * - Manter histórico para debugging
 * - Prover contexto enriquecido para próximos engines
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * AGENT/COMPONENT DNA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * AGENT_TYPE: EngineOutputRegistry
 * COGNITIVE_LEVEL: Data Management Layer
 * AUTONOMY_DEGREE: 99 (Auto-management)
 * LEARNING_ENABLED: true
 * COLLABORATION_ENABLED: true
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from '../../utils/logger';
import { AppError, ErrorCategory, ErrorSeverity } from '../../system/error-handler';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Type Definition - Represents a TypeScript type/interface
 */
export interface TypeDefinition {
  name: string;
  kind: 'interface' | 'type' | 'class' | 'enum';
  path: string;
  exports: string[];
  properties?: Map<string, string>;
  timestamp: Date;
}

/**
 * Service Definition - Represents a service class
 */
export interface ServiceDefinition {
  name: string;
  path: string;
  methods: string[];
  dependencies: string[];
  timestamp: Date;
}

/**
 * Component Definition - Represents a React component
 */
export interface ComponentDefinition {
  name: string;
  path: string;
  props?: Map<string, string>;
  exports: string[];
  timestamp: Date;
}

/**
 * Model Definition - Represents a data model
 */
export interface ModelDefinition {
  name: string;
  path: string;
  fields: Map<string, string>;
  timestamp: Date;
}

/**
 * Artifact Exports - All exports from generated artifact
 */
export interface ArtifactExports {
  types: Map<string, TypeDefinition>;
  services: Map<string, ServiceDefinition>;
  components: Map<string, ComponentDefinition>;
  models: Map<string, ModelDefinition>;
}

/**
 * Generated Artifact - Output from an engine
 */
export interface GeneratedArtifact {
  engineName: string;
  engineVersion: string;
  output: {
    code: string;
    files: GeneratedFile[];
    metadata?: Record<string, any>;
  };
  exports: ArtifactExports;
  timestamp: Date;
  status: 'pending' | 'complete' | 'error';
  error?: string;
  context?: {
    prompt: string;
    scope: string;
    dependencies: string[];
  };
}

/**
 * Generated File
 */
export interface GeneratedFile {
  path: string;
  name: string;
  content: string;
  type: 'typescript' | 'javascript' | 'jsx' | 'tsx' | 'json' | 'css';
  size: number;
  timestamp: Date;
}

/**
 * Available Context - What's available for next engines
 */
export interface AvailableContext {
  availableTypes: Map<string, TypeDefinition>;
  availableServices: Map<string, ServiceDefinition>;
  availableComponents: Map<string, ComponentDefinition>;
  availableModels: Map<string, ModelDefinition>;
  generatedFiles: GeneratedFile[];
  engineHistory: string[];
  scope: string;
  generationOrder: string[];
  timestamp: Date;
}

/**
 * Registry Observer - Notified when outputs registered
 */
export interface RegistryObserver {
  onArtifactRegistered(artifact: GeneratedArtifact): Promise<void>;
  onContextUpdated(context: AvailableContext): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENGINE OUTPUT REGISTRY CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Engine Output Registry - Singleton
 *
 * Central registry for all generated outputs
 * Provides context sharing between engines
 */
export class EngineOutputRegistry {
  private artifacts: Map<string, GeneratedArtifact> = new Map();
  private availableContext: AvailableContext;
  private observers: RegistryObserver[] = [];
  private static instance: EngineOutputRegistry;
  private executionId: string;

  private constructor(executionId: string = `exec-${Date.now()}`) {
    this.executionId = executionId;
    this.availableContext = this.createEmptyContext();

    logger.info('EngineOutputRegistry initialized', {
      component: 'EngineOutputRegistry',
      action: 'initialize',
      executionId: this.executionId
    });
  }

  /**
   * Get Singleton Instance
   */
  public static getInstance(executionId?: string): EngineOutputRegistry {
    if (!EngineOutputRegistry.instance) {
      EngineOutputRegistry.instance = new EngineOutputRegistry(executionId);
    }
    return EngineOutputRegistry.instance;
  }

  /**
   * Reset for new execution
   */
  public static reset(): void {
    EngineOutputRegistry.instance = null as any;
  }

  /**
   * Register artifact from engine
   */
  public async register(artifact: GeneratedArtifact): Promise<void> {
    try {
      // Validate artifact
      if (!artifact.engineName) {
        throw new AppError(
          'Artifact missing engineName',
          'INVALID_ARTIFACT',
          400,
          ErrorCategory.VALIDATION,
          ErrorSeverity.HIGH,
          {},
          true
        );
      }

      // Register
      this.artifacts.set(artifact.engineName, artifact);

      // Update context
      await this.updateContext(artifact);

      // Notify observers
      await this.notifyObservers(artifact);

      logger.info('Artifact registered', {
        component: 'EngineOutputRegistry',
        action: 'register',
        engineName: artifact.engineName,
        fileCount: artifact.output.files.length,
        typeCount: artifact.exports.types.size,
        serviceCount: artifact.exports.services.size,
        componentCount: artifact.exports.components.size
      });
    } catch (error) {
      logger.error('Failed to register artifact', error as Error, {
        component: 'EngineOutputRegistry',
        action: 'register'
      });
      throw error;
    }
  }

  /**
   * Get available context for next engine
   */
  public async getAvailable(): Promise<AvailableContext> {
    return {
      ...this.availableContext,
      timestamp: new Date()
    };
  }

  /**
   * Get specific artifact
   */
  public async getArtifact(engineName: string): Promise<GeneratedArtifact | undefined> {
    return this.artifacts.get(engineName);
  }

  /**
   * Get all artifacts
   */
  public async getAllArtifacts(): Promise<GeneratedArtifact[]> {
    return Array.from(this.artifacts.values());
  }

  /**
   * Subscribe to changes
   */
  public subscribe(observer: RegistryObserver): void {
    this.observers.push(observer);
    logger.debug('Observer subscribed', {
      component: 'EngineOutputRegistry',
      action: 'subscribe',
      observerCount: this.observers.length
    });
  }

  /**
   * Unsubscribe
   */
  public unsubscribe(observer: RegistryObserver): void {
    this.observers = this.observers.filter(o => o !== observer);
  }

  /**
   * Get registry stats
   */
  public getStats() {
    return {
      executionId: this.executionId,
      totalArtifacts: this.artifacts.size,
      totalTypes: this.availableContext.availableTypes.size,
      totalServices: this.availableContext.availableServices.size,
      totalComponents: this.availableContext.availableComponents.size,
      totalModels: this.availableContext.availableModels.size,
      totalFiles: this.availableContext.generatedFiles.length,
      engineHistory: this.availableContext.engineHistory,
      timestamp: new Date()
    };
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Update context with new artifact
   */
  private async updateContext(artifact: GeneratedArtifact): Promise<void> {
    // Merge types
    for (const [name, type] of artifact.exports.types) {
      this.availableContext.availableTypes.set(name, type);
    }

    // Merge services
    for (const [name, service] of artifact.exports.services) {
      this.availableContext.availableServices.set(name, service);
    }

    // Merge components
    for (const [name, component] of artifact.exports.components) {
      this.availableContext.availableComponents.set(name, component);
    }

    // Merge models
    for (const [name, model] of artifact.exports.models) {
      this.availableContext.availableModels.set(name, model);
    }

    // Add files
    this.availableContext.generatedFiles.push(...artifact.output.files);

    // Update history
    this.availableContext.engineHistory.push(artifact.engineName);

    // Update scope if in context
    if (artifact.context?.scope) {
      this.availableContext.scope = artifact.context.scope;
    }
  }

  /**
   * Notify observers
   */
  private async notifyObservers(artifact: GeneratedArtifact): Promise<void> {
    for (const observer of this.observers) {
      try {
        await observer.onArtifactRegistered(artifact);
        await observer.onContextUpdated(this.availableContext);
      } catch (error) {
        logger.error('Observer notification failed', error as Error, {
          component: 'EngineOutputRegistry',
          action: 'notifyObservers'
        });
      }
    }
  }

  /**
   * Create empty context
   */
  private createEmptyContext(): AvailableContext {
    return {
      availableTypes: new Map(),
      availableServices: new Map(),
      availableComponents: new Map(),
      availableModels: new Map(),
      generatedFiles: [],
      engineHistory: [],
      scope: 'FULLSTACK',
      generationOrder: [],
      timestamp: new Date()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export const engineRegistry = EngineOutputRegistry.getInstance();