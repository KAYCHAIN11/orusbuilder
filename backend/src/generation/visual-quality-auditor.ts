import { VisualIntent, visualFingerprint } from './visual-intent';

export interface VisualAuditFile {
  path?: string;
  name?: string;
  filename?: string;
  content: string;
}

export interface VisualAuditResult {
  passed: boolean;
  score: number;
  fingerprint: string;
  checks: Record<string, boolean>;
  diagnostics: string[];
}

export function auditGeneratedVisuals(files: VisualAuditFile[], intent: VisualIntent): VisualAuditResult {
  const source = files.map(file => file.content).join('\n');
  const hasApplicationLayout = files.some(file => (file.name || file.filename) === 'Layout.tsx');
  const checks = {
    designTokens: source.includes('--orus-primary') && source.includes('--orus-page'),
    responsive: /(?:sm|md|lg|xl):/.test(source),
    accessibleStates: source.includes('focus:') && source.includes('disabled:'),
    domainComposition: intent.archetype !== 'generic' || source.includes(intent.identity.promise) || source.includes(intent.experience.screenPriorities[0] || ''),
    experiencePattern: source.includes(`data-experience-pattern="${intent.experience.pattern}"`)
      && source.includes(`data-primary-view="${intent.experience.primaryDataView}"`),
    identityManifest: files.some(file => (file.name || file.filename) === 'design-system.json'),
    assetProvenance: files.some(file => (file.name || file.filename) === 'visual-assets.json')
      && !source.includes('https://placehold.co'),
    compositionContract: !hasApplicationLayout || (
      source.includes(`data-shell="${intent.composition.shell}"`)
      && source.includes(`data-action-placement="${intent.composition.actionPlacement}"`)
    ),
  };
  const diagnostics = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);
  return {
    passed: score >= 80,
    score,
    fingerprint: visualFingerprint(intent),
    checks,
    diagnostics,
  };
}
