import { ComponentStatus } from '../../src/engines/cig-engine-compat';
import { EngineRegistry } from '../../src/engines/engine-registry';

describe('EngineRegistry', () => {
  it('keeps disabled optional engines visible without reporting them as operational', async () => {
    const initialize = jest.fn(async () => undefined);
    const registry = new EngineRegistry().register({
      name: 'provider-adapter',
      engine: { initialize, getStatus: () => ComponentStatus.RUNNING },
      config: { enabled: false },
      required: false,
      capabilities: ['provider-required'],
    });
    await registry.initializeAll();
    expect(initialize).not.toHaveBeenCalled();
    expect(registry.status()[0]).toMatchObject({ enabled: false, healthy: false, status: 'running' });
  });

  it('does not start or report healthy an engine whose initialization failed', async () => {
    const start = jest.fn(async () => undefined);
    const registry = new EngineRegistry().register({
      name: 'optional',
      engine: { initialize: async () => ({ success: false }), start, getStatus: () => ComponentStatus.RUNNING },
      config: { enabled: true },
      required: false,
      capabilities: [],
    });
    await registry.initializeAll();
    await registry.startAll();
    expect(start).not.toHaveBeenCalled();
    expect(registry.status()[0]?.healthy).toBe(false);
  });
  it('controls lifecycle and exposes real status', async () => {
    let status = ComponentStatus.STOPPED;
    const engine = {
      engineId: 'test-engine',
      engineVersion: '1.0.0',
      initialize: jest.fn(async () => { status = ComponentStatus.READY; }),
      start: jest.fn(async () => { status = ComponentStatus.RUNNING; }),
      stop: jest.fn(async () => { status = ComponentStatus.STOPPED; }),
      getStatus: () => status,
    };
    const registry = new EngineRegistry().register({
      name: 'test',
      engine,
      config: { enabled: true },
      required: true,
      capabilities: ['test'],
    });

    await registry.initializeAll();
    await registry.startAll();

    expect(engine.initialize).toHaveBeenCalledTimes(1);
    expect(engine.start).toHaveBeenCalledTimes(1);
    expect(registry.status()).toEqual([
      expect.objectContaining({ name: 'test', status: 'running', healthy: true }),
    ]);

    await registry.stopAll();
    expect(engine.stop).toHaveBeenCalledTimes(1);
    expect(registry.status()[0]).toEqual(expect.objectContaining({ status: 'stopped', healthy: false }));
  });

  it('fails initialization when a required engine fails', async () => {
    const registry = new EngineRegistry().register({
      name: 'required',
      engine: { initialize: async () => { throw new Error('offline'); } },
      config: { enabled: true },
      required: true,
      capabilities: [],
    });

    await expect(registry.initializeAll()).rejects.toThrow('required: offline');
  });
});
