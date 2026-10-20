import type { SandpackFiles } from '@codesandbox/sandpack-react';

export interface PreviewSourceFile {
  path?: string;
  fileName?: string;
  name?: string;
  content: string;
  language?: string;
}

export interface PreviewProject {
  files: SandpackFiles;
  entry: string;
  dependencies: Record<string, string>;
  sourceCount: number;
}

const SOURCE_EXTENSIONS = /\.(?:[cm]?[jt]sx?|css|scss|sass|less|json|html)$/i;
const ENTRY_CANDIDATES = [
  '/src/main.tsx',
  '/src/index.tsx',
  '/src/main.jsx',
  '/src/index.jsx',
  '/src/main.ts',
  '/src/index.ts',
  '/src/main.js',
  '/src/index.js',
];
const PREVIEW_COMPONENT_CANDIDATES = [
  '/src/pages/HomePage.tsx',
  '/src/pages/HomePage.jsx',
  '/src/pages/LandingPage.tsx',
  '/src/pages/LandingPage.jsx',
  '/src/pages/DashboardPage.tsx',
  '/src/pages/DashboardPage.jsx',
];
const LOCAL_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss', '.sass', '.less', '.json'];

const getSourcePath = (file: PreviewSourceFile): string =>
  file.path || file.fileName || file.name || '';

const toSegments = (input: string): string[] =>
  input.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').split('/').filter(Boolean);

const isFrontendWorkspacePath = (input: string): boolean =>
  toSegments(input).includes('frontend');

const isRuntimePath = (path: string): boolean =>
  path === '/package.json' || path.startsWith('/src/') || path.startsWith('/public/');

export const normalizePreviewPath = (input: string): string | null => {
  const segments = toSegments(input);
  const frontendIndex = segments.lastIndexOf('frontend');
  const scoped = frontendIndex >= 0 ? segments.slice(frontendIndex + 1) : segments;

  if (scoped[0] === 'backend' || scoped[0] === 'server' || scoped.length === 0) {
    return null;
  }

  const path = scoped.join('/');
  if (!SOURCE_EXTENSIONS.test(path) && path !== 'package.json') {
    return null;
  }

  return `/${path}`;
};

const findPackageName = (specifier: string): string | null => {
  if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('#')) {
    return null;
  }

  if (specifier.startsWith('@')) {
    return specifier.split('/').slice(0, 2).join('/');
  }

  return specifier.split('/')[0];
};

const collectImportedPackages = (files: SandpackFiles): string[] => {
  const packages = new Set<string>();
  const importPattern = /(?:from\s*|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/g;

  Object.values(files).forEach((file) => {
    const code = typeof file === 'string' ? file : file.code;
    let match: RegExpExecArray | null;
    while ((match = importPattern.exec(code)) !== null) {
      const packageName = findPackageName(match[1]);
      if (packageName) packages.add(packageName);
    }
  });

  return Array.from(packages);
};

const parseDependencies = (packageContent?: string): Record<string, string> => {
  if (!packageContent) return {};

  try {
    const packageJson = JSON.parse(packageContent) as {
      dependencies?: Record<string, string>;
    };
    return packageJson.dependencies || {};
  } catch {
    return {};
  }
};

const ensureSingleFileExport = (code: string): string => {
  if (/export\s+default\s+/.test(code)) return code;

  const component = code.match(/(?:function|class|const)\s+([A-Z][A-Za-z0-9_]*)/);
  return component ? `${code}\n\nexport default ${component[1]};` : code;
};

const createEntry = (componentPath: string): string => {
  const importPath = componentPath.replace(/^\/src\//, './').replace(/\.(?:[jt]sx?)$/i, '');
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import Component from '${importPath}';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Component />
  </React.StrictMode>
);`;
};

const createFocusedEntry = (
  componentPath: string,
  layoutPath: string | undefined,
  stylePaths: string[]
): string => {
  const toImportPath = (path: string): string =>
    path.replace(/^\/src\//, './').replace(/\.(?:[jt]sx?)$/i, '');
  const styleImports = stylePaths
    .map((path) => `import '${path.replace(/^\/src\//, './')}';`)
    .join('\n');
  const layoutImport = layoutPath ? `import Layout from '${toImportPath(layoutPath)}';` : '';
  const content = layoutPath ? '<Layout><Page /></Layout>' : '<Page />';

  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Page from '${toImportPath(componentPath)}';
${layoutImport}
${styleImports}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>${content}</BrowserRouter>
  </React.StrictMode>
);`;
};

const getFileCode = (file: SandpackFiles[string]): string =>
  typeof file === 'string' ? file : file.code;

const normalizeAbsolutePath = (input: string): string => {
  const parts: string[] = [];
  input.split('/').forEach((part) => {
    if (!part || part === '.') return;
    if (part === '..') parts.pop();
    else parts.push(part);
  });
  return `/${parts.join('/')}`;
};

const resolveLocalImport = (
  fromPath: string,
  specifier: string,
  availablePaths: Set<string>
): string | undefined => {
  if (!specifier.startsWith('.') && !specifier.startsWith('/')) return undefined;

  const directory = fromPath.slice(0, fromPath.lastIndexOf('/')) || '/';
  const base = normalizeAbsolutePath(specifier.startsWith('/') ? specifier : `${directory}/${specifier}`);
  const candidates = [
    base,
    ...LOCAL_EXTENSIONS.map((extension) => `${base}${extension}`),
    ...LOCAL_EXTENSIONS.map((extension) => `${base}/index${extension}`),
  ];
  return candidates.find((candidate) => availablePaths.has(candidate));
};

const retainReachableFiles = (files: SandpackFiles, entry: string): void => {
  const availablePaths = new Set(Object.keys(files));
  const reachable = new Set<string>(['/package.json']);
  const pending = [entry];
  const importPattern = /(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)['"]([^'"]+)['"]/g;

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || reachable.has(current) || !availablePaths.has(current)) continue;
    reachable.add(current);

    const code = getFileCode(files[current]);
    let match: RegExpExecArray | null;
    while ((match = importPattern.exec(code)) !== null) {
      const resolved = resolveLocalImport(current, match[1], availablePaths);
      if (resolved && !reachable.has(resolved)) pending.push(resolved);
    }
  }

  Object.keys(files).forEach((path) => {
    if (!reachable.has(path)) delete files[path];
  });
};

export const buildPreviewProject = (
  sourceFiles: PreviewSourceFile[] = [],
  fallbackCode = '',
  fallbackFilename = 'App.tsx'
): PreviewProject => {
  const files: SandpackFiles = {};
  let packageContent: string | undefined;
  const hasFrontendWorkspace = sourceFiles.some((file) =>
    isFrontendWorkspacePath(getSourcePath(file))
  );

  sourceFiles.forEach((file) => {
    const sourcePath = getSourcePath(file);
    if (hasFrontendWorkspace && !isFrontendWorkspacePath(sourcePath)) return;

    const path = normalizePreviewPath(sourcePath);
    if (!path || !isRuntimePath(path)) return;
    if (path === '/package.json') {
      packageContent = file.content;
      return;
    }
    files[path] = file.content;
  });

  const sourcePaths = Object.keys(files).filter((path) => path !== '/package.json');

  if (sourcePaths.length === 0 && fallbackCode.trim()) {
    const normalizedFallback = normalizePreviewPath(fallbackFilename) || '/src/App.tsx';
    const componentPath = normalizedFallback.startsWith('/src/')
      ? normalizedFallback
      : `/src/${normalizedFallback.split('/').pop() || 'App.tsx'}`;
    files[componentPath] = ensureSingleFileExport(fallbackCode);
  }

  let entry = ENTRY_CANDIDATES.find((candidate) => candidate in files);
  const previewComponent = PREVIEW_COMPONENT_CANDIDATES.find((candidate) => candidate in files);
  if (previewComponent) {
    const focusedEntry = '/src/index.tsx';
    const layoutPath = ['/src/components/Layout.tsx', '/src/components/Layout.jsx'].find(
      (candidate) => candidate in files
    );
    const stylePaths = ['/src/design-system/theme.css', '/src/index.css'].filter(
      (candidate) => candidate in files
    );
    files[focusedEntry] = createFocusedEntry(previewComponent, layoutPath, stylePaths);
    entry = focusedEntry;
    retainReachableFiles(files, entry);
  }

  if (!entry) {
    const componentPath = Object.keys(files).find((path) => /\/src\/(?:App|app)\.[jt]sx?$/.test(path));
    if (componentPath) {
      entry = '/src/index.tsx';
      files[entry] = createEntry(componentPath);
    }
  }

  if (entry && entry !== '/src/index.tsx') {
    const originalEntry = entry;
    const importPath = `./${originalEntry.replace(/^\/src\//, '').replace(/\.(?:[jt]sx?)$/i, '')}`;
    entry = '/src/index.tsx';
    files[entry] = `import '${importPath}';`;
  }

  entry ||= '/src/index.tsx';
  if (!(entry in files)) {
    files[entry] = `import React from 'react';
import ReactDOM from 'react-dom/client';

const EmptyPreview = () => <main style={{ padding: 32, fontFamily: 'sans-serif' }}>Preview indisponível</main>;
ReactDOM.createRoot(document.getElementById('root')!).render(<EmptyPreview />);`;
  }

  const dependencies: Record<string, string> = {
    react: '^18.3.1',
    'react-dom': '^18.3.1',
    ...parseDependencies(packageContent),
  };

  collectImportedPackages(files).forEach((packageName) => {
    if (!(packageName in dependencies)) dependencies[packageName] = 'latest';
  });

  return {
    files,
    entry,
    dependencies,
    sourceCount: Object.keys(files).filter((path) => path !== '/package.json').length,
  };
};
