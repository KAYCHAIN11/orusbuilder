/**
 * ============================================================================
 * ORUS BUILDER - ROOT APP COMPONENT (UPDATED WITH GENERATE + THEME + PREVIEW)
 * ============================================================================
 * 
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-09T20:38:00-03:00
 * LAST_MODIFIED: 2025-11-15T09:01:00-03:00
 * COMPONENT_HASH: orus.frontend.app.root.20251115.APP9I0J1.V5
 * 
 * PURPOSE:
 * - Root application component with routing setup
 * - ✅ THEME PROVIDER initialization
 * - ✅ PREVIEW PROVIDER initialization (Babel + PreviewContext)
 * - ✅ /generate route for generation page with preview
 * - All pages accessible for testing
 * - Navigation structure
 * 
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: ApplicationOrchestratorAgent
 * - COGNITIVE_LEVEL: Supreme
 * - AUTONOMY_DEGREE: 99
 * - TRINITY_INTEGRATED: All (Alma, Cerebro, Voz)
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ✅ PROVIDERS
import { ThemeProvider } from './context/ThemeContext';
import { PreviewProvider } from './pages/PreviewContext';

// ✅ COMPONENTS PARA TESTING
import { PromptInput } from '@components/generation/PromptInput';
import { GenerationProgress } from '@components/generation/GenerationProgress';
import { CodePreview } from '@components/generation/CodePreview';
import { BlueprintUploader } from '@/components/blueprint/BlueprintUploader';
import { BlueprintParser } from '@components/blueprint/BlueprintParser';
import { TreeVisualization } from '@components/blueprint/TreeVisualization';
import { useAuthStore } from '@store/auth.store';

const HomePage = React.lazy(() => import('@pages/HomePage').then(module => ({ default: module.HomePage })));
const GeneratePage = React.lazy(() => import('@pages/GeneratePage').then(module => ({ default: module.GeneratePage })));
const DashboardPage = React.lazy(() => import('@pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ProjectPage = React.lazy(() => import('@pages/ProjectPage').then(module => ({ default: module.ProjectPage })));
const ProjectsPage = React.lazy(() => import('@pages/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const EditorPage = React.lazy(() => import('@pages/EditorPage').then(module => ({ default: module.EditorPage })));
const SettingsPage = React.lazy(() => import('@pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const AuthPage = React.lazy(() => import('@pages/AuthPage').then(module => ({ default: module.AuthPage })));
const PreviewPage = React.lazy(() => import('./pages/PreviewPage').then(module => ({ default: module.PreviewPage })));
const BlueprintUploadPage = React.lazy(() => import('@pages/BlueprintUploadPage').then(module => ({ default: module.BlueprintUploadPage })));

// ============================================================================
// TYPES
// ============================================================================

interface PromptOptions {
  framework?: string;
  language?: string;
  includeTests?: boolean;
  style?: string;
}

interface GeneratedFile {
  path: string;
  fileName: string;
  language: string;
  content: string;
  lines: number;
  type: 'component' | 'style' | 'test' | 'config';
}

type Theme = 'dark' | 'light';

const ProtectedRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, sessionExpiry } = useAuthStore();
  if (!isAuthenticated || !sessionExpiry || sessionExpiry <= Date.now()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
};

// ============================================================================
// INNER APP COMPONENT (dentro dos Providers)
// ============================================================================

/**
 * ✅ AppContent: Dentro dos Providers para acessar ThemeContext + PreviewContext
 */
const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-4xl font-heading font-bold gradient-text">ORUS</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
            Initializing Cognitive Builder...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* GLOBAL TOAST NOTIFICATIONS */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MAIN APPLICATION */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <React.Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-gray-500">Carregando...</div>}>
        <Routes>
          {/* ════════════════════════════════════════════════════════════ */}
          {/* MAIN ROUTES */}
          {/* ════════════════════════════════════════════════════════════ */}

          {/* Landing Page */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* ✅ Generation Page with Preview */}
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/blueprints" element={<BlueprintUploadPage />} />
          <Route path="/blueprints/upload" element={<BlueprintUploadPage />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Projects */}
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:projectId" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
          <Route path="/preview" element={<PreviewPage />} />

          {/* Editor */}
          <Route path="/editor/:projectId" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
          <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />

          {/* Settings */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* ════════════════════════════════════════════════════════════ */}
          {/* COMPONENT TESTING ROUTES */}
          {/* ════════════════════════════════════════════════════════════ */}

          {import.meta.env.DEV && (
            <>
              <Route path="/test/prompt" element={<TestPromptInput />} />
              <Route path="/test/progress" element={<TestGenerationProgress />} />
              <Route path="/test/preview" element={<TestCodePreview />} />
              <Route path="/test/blueprint" element={<TestBlueprint />} />
            </>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* FALLBACK */}
          {/* ════════════════════════════════════════════════════════════ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </React.Suspense>
      </div>
    </>
  );
};

// ============================================================================
// ROOT APP COMPONENT - WRAPPED WITH ALL PROVIDERS
// ============================================================================

/**
 * ✅ App: Root component envolvido com:
 * - ThemeProvider (tema dark/light)
 * - PreviewProvider (Babel + preview context)
 */
function App() {
  return (
    <ThemeProvider>
      <PreviewProvider>
        <AppContent />
      </PreviewProvider>
    </ThemeProvider>
  );
}

// ============================================================================
// TEST PAGES PARA COMPONENTES
// ============================================================================

/**
 * Test page for PromptInput component
 */
const TestPromptInput: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">Prompt Input Test</h1>
        <PromptInput
          onSubmit={(prompt: string, options: PromptOptions) => {
            console.log('Prompt:', prompt);
            console.log('Options:', options);
          }}
          isGenerating={false}
        />
      </div>
    </div>
  );
};

/**
 * Test page for GenerationProgress component
 */
const TestGenerationProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 10));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">Generation Progress Test</h1>
        <GenerationProgress
          currentStage="components"
          stages={[
            { stage: 'analyzing', status: 'complete' },
            { stage: 'architecture', status: 'complete' },
            {
              stage: 'components',
              status: 'processing',
              message: 'Generating React components...',
            },
            { stage: 'styling', status: 'pending' },
            { stage: 'tests', status: 'pending' },
            { stage: 'optimization', status: 'pending' },
            { stage: 'validation', status: 'pending' },
          ]}
          progress={progress}
          estimatedTimeRemaining={30}
          metadata={{
            totalFiles: 25,
            totalLines: 1523,
            filesGenerated: 15,
            componentsCreated: 8,
            testsGenerated: 4,
          }}
          trinityStatus={{
            status: 'online',
            latency: 0,
          }}
        />
      </div>
    </div>
  );
};

/**
 * Test page for CodePreview component
 */
const TestCodePreview: React.FC = () => {
  const sampleCode = `function App() {
  return (
    <main className="preview-shell">
      <span className="preview-badge">ORUS preview runtime</span>
      <h1>Projeto multifile compilado.</h1>
      <p>React, imports e CSS funcionando no mesmo sandbox.</p>
      <button>Continuar construindo</button>
    </main>
  );
}

export default App;`;

  const testFiles: GeneratedFile[] = [
    {
      path: '/src/main.tsx',
      fileName: 'main.tsx',
      language: 'typescript',
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);`,
      lines: 8,
      type: 'component',
    },
    {
      path: '/src/App.tsx',
      fileName: 'App.tsx',
      language: 'typescript',
      content: sampleCode,
      lines: 10,
      type: 'component',
    },
    {
      path: '/src/styles.css',
      fileName: 'styles.css',
      language: 'css',
      content: `* { box-sizing: border-box; }
body { margin: 0; background: #090b12; color: white; font-family: Inter, system-ui, sans-serif; }
.preview-shell { min-height: 100vh; display: grid; place-content: center; justify-items: start; padding: 48px; background: radial-gradient(circle at top right, #6d28d933, transparent 45%); }
.preview-badge { border: 1px solid #8b5cf655; border-radius: 999px; padding: 6px 10px; color: #c4b5fd; font-size: 12px; }
h1 { max-width: 560px; margin: 24px 0 12px; font-size: clamp(36px, 7vw, 72px); line-height: .95; letter-spacing: -.05em; }
p { color: #94a3b8; font-size: 18px; }
button { margin-top: 20px; border: 0; border-radius: 12px; padding: 12px 18px; background: white; color: #090b12; font-weight: 700; }`,
      lines: 7,
      type: 'style',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">Code Preview Test</h1>
        <div className="h-[600px]">
          <CodePreview files={testFiles} />
        </div>
      </div>
    </div>
  );
};

/**
 * Test page for Blueprint components
 */
const TestBlueprint: React.FC = () => {
  const [content, setContent] = useState('');
  const [showParser, setShowParser] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">Blueprint Test</h1>

        {!showParser ? (
          <BlueprintUploader
            onUpload={(file, fileContent) => {
              setContent(fileContent);
              setShowParser(true);
            }}
          />
        ) : (
          <>
            <button
              onClick={() => setShowParser(false)}
              className="mb-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Back to Upload
            </button>
            <BlueprintParser
              content={content}
              fileName="test-blueprint.md"
              onParseComplete={(result) => console.log('Parse complete:', result)}
            />
            <div className="mt-8">
              <TreeVisualization
                structure={[
                  {
                    name: 'src',
                    path: '/src',
                    type: 'folder',
                    children: [
                      { name: 'App.tsx', path: '/src/App.tsx', type: 'file' },
                      { name: 'index.tsx', path: '/src/index.tsx', type: 'file' },
                    ],
                  },
                ]}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;

/**
 * ============================================================================
 * EXPORT MANIFEST
 * ============================================================================
 * 
 * PRIMARY_EXPORT: App (Root component with ThemeProvider + PreviewProvider)
 * NAMED_EXPORTS: None
 * DEFAULT_AVAILABLE: true
 * 
 * PROVIDERS STACK:
 * - ThemeProvider (contexto de tema dark/light)
 * - PreviewProvider (contexto de preview com Babel)
 * 
 * STATUS: ✅ PROVIDERS INTEGRATED - READY FOR PRODUCTION
 * VERSION: v5 (THEME + PREVIEW COMPLETE)
 * 
 * ============================================================================
 */
