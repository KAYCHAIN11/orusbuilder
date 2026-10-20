import {
  ComplianceStandard,
  SecurityEngine,
  SecurityScanType,
  VulnerabilitySeverity,
  type SecurityEngineConfig,
  type SecurityScanRequest,
} from '../../src/engines/security-engine';

const config: SecurityEngineConfig = {
  enabled: true,
  enableVulnerabilityScanning: true,
  enableComplianceChecks: true,
  enableThreatDetection: false,
  enableAutoFixing: false,
  requiredCompliance: [ComplianceStandard.OWASP],
  maxCriticalVulnerabilities: 0,
  minSecurityScore: 80,
  encryption: { algorithm: 'AES-256-GCM', keyRotationDays: 90, enableAtRest: false, enableInTransit: true },
  enableAuditLogging: true,
  auditRetentionDays: 90,
};

const request = (overrides: Partial<SecurityScanRequest> = {}): SecurityScanRequest => ({
  id: 'security-request',
  requestId: 'security-request',
  userId: 'user-1',
  projectId: 'project-1',
  files: [],
  dependencies: [],
  scanTypes: [SecurityScanType.VULNERABILITY, SecurityScanType.CODE_ANALYSIS, SecurityScanType.DEPENDENCY, SecurityScanType.COMPLIANCE],
  complianceStandards: [ComplianceStandard.OWASP],
  deepScan: true,
  autoFix: false,
  generateReport: true,
  version: 1,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('SecurityEngine', () => {
  it('records the exact security coverage for a hardened Express application', async () => {
    const engine = new SecurityEngine();
    await engine.initialize(config);
    const result = await engine.scan(request({
      files: [{
        path: 'backend/src/app.ts',
        language: 'typescript',
        content: "const app = express(); app.use(helmet()); app.use(cors({ origin: ['https://app.orus.dev'] })); app.use(express.json({ limit: '1mb' }));",
      }],
      dependencies: [{ name: 'express', version: '^4.21.0', type: 'runtime' }],
    }));

    expect(result.success).toBe(true);
    expect(result.data?.vulnerabilities).toHaveLength(0);
    expect(result.data?.complianceIssues).toHaveLength(0);
    expect(result.data?.coverage).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: SecurityScanType.VULNERABILITY, status: 'evaluated' }),
      expect.objectContaining({ type: SecurityScanType.DEPENDENCY, scanner: 'orus-dependency-policy' }),
      expect.objectContaining({ type: SecurityScanType.COMPLIANCE, status: 'evaluated' }),
    ]));
  });

  it('blocks unsafe dependency specifications and insecure Express defaults', async () => {
    const engine = new SecurityEngine();
    await engine.initialize(config);
    const result = await engine.scan(request({
      files: [{
        path: 'backend/src/app.ts',
        language: 'typescript',
        content: "const app = express(); app.use(cors({ origin: '*' })); app.use(express.json()); const secret = process.env.JWT_SECRET || 'public-secret';",
      }],
      dependencies: [{ name: 'unsafe-package', version: 'latest', type: 'runtime' }],
    }));

    expect(result.data?.vulnerabilities).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'Unsafe Dependency Specification', severity: VulnerabilitySeverity.HIGH }),
    ]));
    expect(result.data?.complianceIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ requirement: 'A05:2021 Security Misconfiguration', severity: VulnerabilitySeverity.HIGH }),
      expect.objectContaining({ requirement: 'A07:2021 Identification and Authentication Failures', severity: VulnerabilitySeverity.CRITICAL }),
    ]));
    expect(result.data?.securityScore).toBeLessThan(80);
  });

  it('does not certify organizational GDPR controls from source code', async () => {
    const engine = new SecurityEngine();
    await engine.initialize(config);
    const result = await engine.scan(request({
      scanTypes: [SecurityScanType.COMPLIANCE],
      complianceStandards: [ComplianceStandard.GDPR],
    }));

    expect(result.data?.summary.compliant).toBe(false);
    expect(result.data?.complianceIssues[0]).toMatchObject({ standard: ComplianceStandard.GDPR, severity: VulnerabilitySeverity.INFO });
  });

  it('does not classify the guarded preview sentinel as a production secret', async () => {
    const engine = new SecurityEngine();
    await engine.initialize(config);
    const result = await engine.scan(request({
      files: [{
        path: 'frontend/src/contexts/AuthContext.tsx',
        language: 'typescript',
        content: "const previewMode = import.meta.env.VITE_ORUS_PREVIEW_MODE === 'true'; const previewAccessValue = 'orus-preview-token';",
      }],
    }));

    expect(result.success).toBe(true);
    expect(result.data?.vulnerabilities).toHaveLength(0);
  });
});
