import {
  assertCertifiedArtifact,
  canonicalizeArtifactFiles,
  createCertifiedArtifactManifest,
} from '../../src/generation/artifact-manifest';

describe('Certified artifact manifest', () => {
  it('creates a stable digest independent of file order', () => {
    const left = createCertifiedArtifactManifest([
      { path: 'src/App.tsx', content: 'export default App' },
      { path: 'package.json', content: '{}' },
    ]);
    const right = createCertifiedArtifactManifest([
      { path: 'package.json', content: '{}' },
      { path: 'src/App.tsx', content: 'export default App' },
    ]);

    expect(left.digest).toBe(right.digest);
    expect(left.totalFiles).toBe(2);
  });

  it('rejects changed content, duplicate paths and path traversal', () => {
    const files = [{ path: 'src/App.tsx', content: 'original' }];
    const manifest = createCertifiedArtifactManifest(files);

    expect(() => assertCertifiedArtifact([{ ...files[0], content: 'changed' }], manifest)).toThrow('no longer matches');
    expect(() => canonicalizeArtifactFiles([...files, ...files])).toThrow('Duplicate');
    expect(() => canonicalizeArtifactFiles([{ path: '../outside.ts', content: '' }])).toThrow('Invalid');
  });
});
