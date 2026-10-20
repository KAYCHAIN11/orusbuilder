import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const workspaceRoot = path.basename(process.cwd()) === 'frontend'
  ? path.resolve(process.cwd(), '..')
  : process.cwd();
const generatedFiles = [
  "frontend/postcss.config.js",
  "frontend/src/App.tsx",
  "frontend/src/index.tsx",
  "frontend/src/pages/LandingPage.tsx",
  "frontend/tailwind.config.js",
  "frontend/vite.config.ts"
];

describe('ORUS generated project contract', () => {
  it('materializes every generated source file', () => {
    for (const file of generatedFiles) {
      const absolutePath = path.resolve(workspaceRoot, file);
      expect(fs.existsSync(absolutePath)).toBe(true);
      expect(fs.readFileSync(absolutePath, 'utf8').trim().length).toBeGreaterThan(0);
    }
  });

  it('uses unique normalized paths', () => {
    expect(new Set(generatedFiles).size).toBe(generatedFiles.length);
    expect(generatedFiles.every(file => !file.includes('\\'))).toBe(true);
  });
});