/*
 * ═══════════════════════════════════════════════════════════════
 * 🧬 COGNITIVE AGENT CODE DNA - ORUS CERTIFIED ARTIFACT MANIFEST
 * ═══════════════════════════════════════════════════════════════
 *
 * 👨‍💻 DEVELOPERS: Minerva Omega Master Supreme + Tulio (ORUS Creator)
 * ⏰ CREATED: 2026-10-07T00:00:00-03:00
 * 🏷️ COMPONENT_HASH: orus.builder.generation.artifact-manifest.20261007.v1
 *
 * ═══════════════════════════════════════════════════════════════
 */

import { createHash } from 'crypto';

export interface CertifiedArtifactFile {
  path: string;
  content: string;
  sha256: string;
  size: number;
}

export interface CertifiedArtifactManifest {
  version: 1;
  algorithm: 'sha256';
  digest: string;
  totalFiles: number;
  totalBytes: number;
  files: Array<Omit<CertifiedArtifactFile, 'content'>>;
}

export function canonicalizeArtifactFiles(files: unknown[]): CertifiedArtifactFile[] {
  const normalized = files.map((value, index) => {
    const file = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    const candidate = String(file['path'] || file['name'] || file['filename'] || '').replace(/\\/g, '/').replace(/^\/+/, '');
    const segments = candidate.split('/').filter(Boolean);
    if (!candidate || segments.some(segment => segment === '..' || segment === '.')) {
      throw new Error(`Invalid generated artifact path at index ${index}`);
    }
    const content = String(file['content'] ?? file['code'] ?? '');
    return {
      path: segments.join('/'),
      content,
      sha256: createHash('sha256').update(content).digest('hex'),
      size: Buffer.byteLength(content),
    };
  }).sort((left, right) => left.path.localeCompare(right.path));

  const paths = new Set<string>();
  for (const file of normalized) {
    if (paths.has(file.path)) throw new Error(`Duplicate generated artifact path: ${file.path}`);
    paths.add(file.path);
  }
  return normalized;
}

export function createCertifiedArtifactManifest(files: unknown[]): CertifiedArtifactManifest {
  const canonical = canonicalizeArtifactFiles(files);
  const digest = createHash('sha256');
  for (const file of canonical) {
    digest.update(file.path);
    digest.update('\0');
    digest.update(file.sha256);
    digest.update('\0');
  }
  return {
    version: 1,
    algorithm: 'sha256',
    digest: digest.digest('hex'),
    totalFiles: canonical.length,
    totalBytes: canonical.reduce((total, file) => total + file.size, 0),
    files: canonical.map(({ content: _content, ...file }) => file),
  };
}

export function assertCertifiedArtifact(files: unknown[], manifest: CertifiedArtifactManifest | undefined): CertifiedArtifactManifest {
  if (!manifest) throw new Error('Certified artifact manifest is missing');
  const current = createCertifiedArtifactManifest(files);
  if (current.digest !== manifest.digest || current.totalFiles !== manifest.totalFiles) {
    throw new Error('Generated artifact no longer matches its certified manifest');
  }
  return current;
}
