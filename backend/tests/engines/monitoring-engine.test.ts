import { ComponentStatus } from '../../src/engines/cig-engine-compat';
import { MonitoringEngine } from '../../src/engines/monitoring-engine';

describe('MonitoringEngine health', () => {
  it('reports only observed components and process uptime', async () => {
    const engine = new MonitoringEngine();
    await engine.initialize({
      enabled: true,
      enableRealTimeMonitoring: false,
      enableAnomalyDetection: true,
      enablePredictiveAnalytics: false,
      enableAlerting: false,
      metricsInterval: 60000,
      retentionDays: 30,
      alertCheckInterval: 60000,
      maxAlertsPerHour: 20,
      enableTimeSeries: true,
      aggregationIntervals: [60],
    });

    const health = await engine.getSystemHealth();
    expect(engine.getStatus()).toBe(ComponentStatus.READY);
    expect(health.overall).toBe('healthy');
    expect(health.uptimeSeconds).toBeGreaterThan(0);
    expect(health.components.map(component => component.componentName)).toEqual([
      'Monitoring Engine',
      'Recorded API Traffic',
    ]);
  });
});
