import { ComponentStatus, EngineConfig } from './cig-engine-compat';

export interface EngineLifecycle {
  readonly engineId?: string;
  readonly engineVersion?: string;
  initialize?: (config: EngineConfig) => Promise<unknown>;
  start?: () => Promise<unknown>;
  stop?: () => Promise<unknown>;
  getStatus?: () => ComponentStatus | string;
  getMetrics?: () => unknown;
}

export interface EngineRegistration<T extends EngineLifecycle = EngineLifecycle> {
  name: string;
  engine: T;
  config: EngineConfig;
  required: boolean;
  capabilities: string[];
}

export interface EngineRuntimeState {
  name: string;
  engineId: string;
  version: string;
  status: string;
  healthy: boolean;
  required: boolean;
  capabilities: string[];
  enabled: boolean;
  error?: string;
}

export class EngineRegistry {
  private readonly registrations = new Map<string, EngineRegistration>();
  private readonly errors = new Map<string, string>();
  private readonly initialized = new Set<string>();

  register<T extends EngineLifecycle>(registration: EngineRegistration<T>): this {
    this.registrations.set(registration.name, registration);
    return this;
  }

  get<T extends EngineLifecycle = EngineLifecycle>(name: string): T | undefined {
    return this.registrations.get(name)?.engine as T | undefined;
  }

  has(name: string): boolean {
    return this.registrations.has(name);
  }

  get size(): number {
    return this.registrations.size;
  }

  entries(): EngineRegistration[] {
    return Array.from(this.registrations.values());
  }

  async initializeAll(): Promise<void> {
    for (const registration of this.registrations.values()) {
      if (!registration.config.enabled || this.initialized.has(registration.name)) continue;
      if (!registration.engine.initialize) continue;
      try {
        this.assertResult(await registration.engine.initialize(registration.config));
        this.initialized.add(registration.name);
        this.errors.delete(registration.name);
      } catch (error) {
        this.captureFailure(registration, error);
      }
    }
  }

  async startAll(): Promise<void> {
    for (const registration of this.registrations.values()) {
      if (!registration.config.enabled || !this.initialized.has(registration.name) || this.errors.has(registration.name)) continue;
      if (registration.engine.getStatus?.() === ComponentStatus.RUNNING) continue;
      if (!registration.engine.start) continue;
      try {
        this.assertResult(await registration.engine.start());
        this.errors.delete(registration.name);
      } catch (error) {
        this.captureFailure(registration, error);
      }
    }
  }

  async stopAll(): Promise<void> {
    const registrations = Array.from(this.registrations.values()).reverse();
    for (const registration of registrations) {
      if (!registration.engine.stop) continue;
      try {
        await registration.engine.stop();
      } catch (error) {
        this.errors.set(registration.name, this.errorMessage(error));
      }
    }
  }

  status(): EngineRuntimeState[] {
    return this.entries().map(registration => {
      const status = registration.engine.getStatus?.() || ComponentStatus.STOPPED;
      const normalizedStatus = String(status);
      const error = this.errors.get(registration.name);
      return {
        name: registration.name,
        engineId: registration.engine.engineId || registration.name,
        version: registration.engine.engineVersion || 'unknown',
        status: normalizedStatus,
        healthy: registration.config.enabled && !error && [ComponentStatus.READY, ComponentStatus.RUNNING].includes(normalizedStatus as ComponentStatus),
        required: registration.required,
        capabilities: registration.capabilities,
        enabled: registration.config.enabled,
        ...(error ? { error } : {}),
      };
    });
  }

  private captureFailure(registration: EngineRegistration, error: unknown): void {
    const message = this.errorMessage(error);
    this.errors.set(registration.name, message);
    if (registration.required) throw new Error(`${registration.name}: ${message}`);
  }

  private assertResult(result: unknown): void {
    if (result && typeof result === 'object' && 'success' in result && result.success === false) {
      throw new Error('Engine lifecycle operation failed');
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
