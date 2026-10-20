import {
  cigProtocol,
  FileType,
  ValidationStatus,
  type ValidationFile
} from '../../src/core/cig/cig-protocol';
import { SupportedLanguage } from '../../src/core/types';

function file(path: string, name: string, content: string, type = FileType.TYPESCRIPT): ValidationFile {
  return { path, name, content, type };
}

async function validate(files: ValidationFile[]) {
  const result = await cigProtocol.validate({
    requestId: `test-${Date.now()}`,
    files,
    code: files.map(candidate => candidate.content).join('\n'),
    context: { projectRoot: '.' },
    language: SupportedLanguage.EN
  });

  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  return result.data!;
}

describe('CIG protocol project validation', () => {
  it('accepts resolvable imports while preserving project-relative paths', async () => {
    const result = await validate([
      file('src', 'main.ts', "import { value } from './Value';\nconsole.log(value);"),
      file('src', 'Value.ts', 'export const value = 42;')
    ]);

    expect(result.isValid).toBe(true);
    expect(result.status).toBe(ValidationStatus.PASSED);
  });

  it('rejects missing relative imports', async () => {
    const result = await validate([
      file('src', 'main.ts', "import { value } from './missing';\nconsole.log(value);")
    ]);

    expect(result.isValid).toBe(false);
    expect(result.status).toBe(ValidationStatus.FAILED);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'CIG_MISSING_RELATIVE_IMPORT' })
    ]));
  });

  it('rejects TypeScript syntax errors and invalid JSON', async () => {
    const result = await validate([
      file('src', 'broken.ts', 'export const broken = ;'),
      file('', 'package.json', '{"name":', FileType.JSON)
    ]);

    expect(result.isValid).toBe(false);
    expect(result.status).toBe(ValidationStatus.FAILED);
    expect(result.errors.some(error => error.code.startsWith('TS'))).toBe(true);
    expect(result.errors.some(error => error.code === 'INVALID_JSON')).toBe(true);
  });

  it('rejects an incompatible package and TypeScript module format', async () => {
    const result = await validate([
      file('backend', 'package.json', '{"type":"commonjs"}', FileType.JSON),
      file('backend', 'tsconfig.json', '{"compilerOptions":{"module":"ESNext"}}', FileType.JSON)
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'CIG_MODULE_FORMAT_MISMATCH' })
    ]));
  });

  it('rejects invalid npm package names before installation', async () => {
    const result = await validate([
      file('frontend', 'package.json', '{"name":"project - frontend"}', FileType.JSON)
    ]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'CIG_INVALID_PACKAGE_NAME', file: 'frontend/package.json' })
    ]));
  });

  it('keeps type coverage within percentage bounds', async () => {
    const result = await validate([
      file('src', 'typed.ts', 'export function sum(left: number, right: number): number { const total: number = left + right; return total; }')
    ]);

    expect(result.types.coverage).toBeGreaterThanOrEqual(0);
    expect(result.types.coverage).toBeLessThanOrEqual(100);
  });
});
