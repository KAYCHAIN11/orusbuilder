import { describe, expect, it } from 'vitest';
import { buildPreviewProject, normalizePreviewPath } from './preview-project';

describe('preview project', () => {
  it('normalizes frontend workspace paths', () => {
    expect(normalizePreviewPath('frontend\\src\\App.tsx')).toBe('/src/App.tsx');
    expect(normalizePreviewPath('backend/src/index.ts')).toBeNull();
  });

  it('builds a multi-file project with its real entry and dependencies', () => {
    const project = buildPreviewProject([
      {
        path: 'frontend/package.json',
        content: JSON.stringify({ dependencies: { 'lucide-react': '^0.441.0' } }),
      },
      {
        path: 'frontend/src/index.tsx',
        content: "import ReactDOM from 'react-dom/client'; import App from './App'; ReactDOM.createRoot(document.getElementById('root')!).render(<App />);",
      },
      {
        path: 'frontend/src/App.tsx',
        content: 'export default function App() { return <main>ORUS</main>; }',
      },
      {
        path: 'backend/src/server.ts',
        content: 'export const server = true;',
      },
    ]);

    expect(project.entry).toBe('/src/index.tsx');
    expect(project.files).toHaveProperty('/src/App.tsx');
    expect(project.files).not.toHaveProperty('/backend/src/server.ts');
    expect(project.dependencies['lucide-react']).toBe('^0.441.0');
  });

  it('isolates the frontend workspace and keeps its package manifest', () => {
    const project = buildPreviewProject([
      {
        path: 'frontend/package.json',
        content: JSON.stringify({ dependencies: { 'react-router-dom': '^6.22.0' } }),
      },
      {
        path: 'frontend/src/main.tsx',
        content: "import 'react-router-dom';",
      },
      {
        path: 'frontend/vite.config.ts',
        content: "import { defineConfig } from 'vite'; export default defineConfig({});",
      },
      {
        path: 'frontend/tsconfig.json',
        content: '{}',
      },
      {
        path: '.orus/design-system.json',
        content: '{}',
      },
      {
        path: 'package.json',
        content: JSON.stringify({ dependencies: { concurrently: '^8.2.2' } }),
      },
    ]);

    expect(project.files).toHaveProperty('/src/main.tsx');
    expect(project.files).not.toHaveProperty('/vite.config.ts');
    expect(project.files).not.toHaveProperty('/tsconfig.json');
    expect(project.files).not.toHaveProperty('/.orus/design-system.json');
    expect(project.dependencies['react-router-dom']).toBe('^6.22.0');
    expect(project.dependencies).not.toHaveProperty('concurrently');
    expect(project.dependencies).not.toHaveProperty('vite');
    expect(project.sourceCount).toBe(2);
  });

  it('creates an entry for a single component', () => {
    const project = buildPreviewProject([], 'function ProductCard() { return <div>Produto</div>; }', 'ProductCard.tsx');

    expect(project.entry).toBe('/src/index.tsx');
    expect(project.files).toHaveProperty('/src/ProductCard.tsx');
    expect(project.files).toHaveProperty('/src/index.tsx');
  });

  it('creates a focused preview from the primary page and its reachable imports', () => {
    const project = buildPreviewProject([
      {
        path: 'frontend/package.json',
        content: JSON.stringify({ dependencies: { 'react-router-dom': '^6.22.0' } }),
      },
      {
        path: 'frontend/src/main.tsx',
        content: "import App from './App';",
      },
      {
        path: 'frontend/src/App.tsx',
        content: "import OtherPage from './pages/OtherPage'; export default OtherPage;",
      },
      {
        path: 'frontend/src/pages/HomePage.tsx',
        content: "import Card from '../components/Card'; export default function HomePage() { return <Card />; }",
      },
      {
        path: 'frontend/src/pages/OtherPage.tsx',
        content: 'export default function OtherPage() { return <div>Other</div>; }',
      },
      {
        path: 'frontend/src/components/Card.tsx',
        content: 'export default function Card() { return <div>Home</div>; }',
      },
      {
        path: 'frontend/src/index.css',
        content: 'body { margin: 0; }',
      },
    ]);

    expect(project.entry).toBe('/src/index.tsx');
    expect(project.files).toHaveProperty('/src/pages/HomePage.tsx');
    expect(project.files).toHaveProperty('/src/components/Card.tsx');
    expect(project.files).toHaveProperty('/src/index.css');
    expect(project.files).not.toHaveProperty('/src/App.tsx');
    expect(project.files).not.toHaveProperty('/src/pages/OtherPage.tsx');
    expect(project.sourceCount).toBe(4);
  });
});
