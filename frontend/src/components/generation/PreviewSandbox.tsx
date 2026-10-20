import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
} from 'lucide-react';
import {
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react';
import {
  buildPreviewProject,
  type PreviewSourceFile,
} from './preview-project';

interface CompatibleComponentProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

const PreviewProvider = SandpackProvider as unknown as React.ComponentType<CompatibleComponentProps>;
const ProjectPreview = SandpackPreview as unknown as React.ComponentType<CompatibleComponentProps>;

interface PreviewSandboxProps {
  code?: string;
  files?: PreviewSourceFile[];
  filename?: string;
  previewUrl?: string;
  className?: string;
}

type Viewport = 'desktop' | 'tablet' | 'mobile';

const viewportWidths: Record<Viewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

const PreviewStatus: React.FC<{ sourceCount: number }> = ({ sourceCount }) => {
  const { sandpack } = useSandpack();
  const isLoading = sandpack.status === 'initial' || !sandpack.bundlerState;

  return (
    <div className="flex min-w-0 items-center gap-2">
      {sandpack.error ? (
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
      ) : isLoading ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-violet-400" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
      )}
      <span className="truncate text-xs font-medium text-slate-300">
        {sandpack.error
          ? 'Erro de compilação'
          : isLoading
            ? 'Compilando projeto'
            : `${sourceCount} arquivos carregados`}
      </span>
    </div>
  );
};

const PreviewControls: React.FC<{
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
}> = ({ viewport, setViewport }) => {
  const { sandpack } = useSandpack();
  const controls: Array<{ value: Viewport; label: string; icon: React.ElementType }> = [
    { value: 'desktop', label: 'Desktop', icon: Monitor },
    { value: 'tablet', label: 'Tablet', icon: Tablet },
    { value: 'mobile', label: 'Celular', icon: Smartphone },
  ];

  return (
    <div className="flex items-center gap-1">
      {controls.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setViewport(value)}
          aria-label={label}
          title={label}
          className={`rounded-md p-2 transition-colors ${
            viewport === value
              ? 'bg-white/10 text-white'
              : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-white/10" />
      <button
        type="button"
        onClick={() => void sandpack.runSandpack()}
        aria-label="Reiniciar preview"
        title="Reiniciar preview"
        className="rounded-md p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  );
};

const CompiledPreview: React.FC<{
  previewUrl: string;
  className: string;
}> = ({ previewUrl, className }) => {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [version, setVersion] = useState(0);
  const [loadState, setLoadState] = useState<'preparing' | 'loading' | 'ready' | 'error'>('preparing');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoadState('preparing');
    setElapsedSeconds(0);
    setErrorMessage('');

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);
    const timeout = window.setTimeout(() => controller.abort(), 300000);

    void fetch(previewUrl, { cache: 'no-store', credentials: 'include', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const details = await response.text();
          throw new Error(details || `Preview indisponível (${response.status})`);
        }
        if (active) setLoadState('loading');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(
          error instanceof DOMException && error.name === 'AbortError'
            ? 'A preparação excedeu cinco minutos.'
            : error instanceof Error
              ? error.message
              : 'Não foi possível preparar o preview.'
        );
        setLoadState('error');
      })
      .finally(() => {
        window.clearInterval(interval);
        window.clearTimeout(timeout);
      });

    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [previewUrl, version]);

  const isLoading = loadState === 'preparing' || loadState === 'loading';
  const statusLabel = loadState === 'preparing'
    ? `Preparando build certificado · ${elapsedSeconds}s`
    : loadState === 'loading'
      ? 'Abrindo aplicação compilada'
      : loadState === 'ready'
        ? 'Build certificado carregado'
        : 'Falha ao carregar o preview';

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#090b12] shadow-2xl shadow-black/20 ${className}`}
    >
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-violet-400" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          )}
          <span className="truncate text-xs font-medium text-slate-300">
            {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {([
            ['desktop', 'Desktop', Monitor],
            ['tablet', 'Tablet', Tablet],
            ['mobile', 'Celular', Smartphone],
          ] as Array<[Viewport, string, React.ElementType]>).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setViewport(value)}
              aria-label={label}
              title={label}
              className={`rounded-md p-2 transition-colors ${
                viewport === value ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-white/10" />
          <button
            type="button"
            onClick={() => {
              setVersion((current) => current + 1);
            }}
            aria-label="Reiniciar preview"
            title="Reiniciar preview"
            className="rounded-md p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="overflow-auto bg-[#11131b] p-2 sm:p-4">
        <div
          className="relative mx-auto min-h-[640px] overflow-hidden rounded-xl bg-white shadow-2xl transition-[width] duration-300"
          style={{ width: viewportWidths[viewport], minWidth: viewport === 'mobile' ? '390px' : undefined }}
        >
          {loadState === 'preparing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d1018] px-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              <div>
                <p className="text-sm font-semibold text-white">Compilando o preview pela primeira vez</p>
                <p className="mt-1 max-w-md text-xs leading-5 text-slate-400">
                  O ORUS está instalando as dependências e criando o bundle isolado. Projetos full-stack podem levar alguns minutos.
                </p>
              </div>
            </div>
          )}
          {loadState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0d1018] px-6 text-center">
              <AlertCircle className="h-8 w-8 text-rose-400" />
              <div>
                <p className="text-sm font-semibold text-white">O preview não pôde ser preparado</p>
                <p className="mt-1 max-w-lg text-xs leading-5 text-slate-400">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setVersion((current) => current + 1)}
                className="rounded-lg bg-violet-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-400"
              >
                Tentar novamente
              </button>
            </div>
          )}
          {(loadState === 'loading' || loadState === 'ready') && (
            <iframe
              key={version}
              src={previewUrl}
              title="Preview do projeto compilado"
              onLoad={() => setLoadState('ready')}
              onError={() => {
                setErrorMessage('O bundle foi criado, mas o navegador não conseguiu abrir a aplicação.');
                setLoadState('error');
              }}
              className="h-[640px] w-full border-0 bg-white"
            />
          )}
        </div>
      </div>
    </motion.section>
  );
};

export const PreviewSandbox: React.FC<PreviewSandboxProps> = ({
  code = '',
  files = [],
  filename = 'App.tsx',
  previewUrl,
  className = '',
}) => {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const project = useMemo(
    () => buildPreviewProject(files, code, filename),
    [code, filename, files]
  );
  const projectKey = useMemo(
    () => `${project.entry}:${Object.keys(project.files).join('|')}:${code.length}`,
    [code.length, project.entry, project.files]
  );

  if (previewUrl) {
    return <CompiledPreview previewUrl={previewUrl} className={className} />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#090b12] shadow-2xl shadow-black/20 ${className}`}
    >
      <PreviewProvider
        key={projectKey}
        template="react-ts"
        theme="dark"
        files={project.files}
        customSetup={{
          entry: project.entry,
          dependencies: project.dependencies,
        }}
        options={{
          autorun: true,
          autoReload: true,
          bundlerTimeOut: 120000,
          recompileMode: 'delayed',
          recompileDelay: 300,
          externalResources: ['https://cdn.tailwindcss.com'],
        }}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden items-center gap-1.5 sm:flex" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="hidden h-5 w-px bg-white/10 sm:block" />
            <PreviewStatus sourceCount={project.sourceCount} />
          </div>
          <PreviewControls viewport={viewport} setViewport={setViewport} />
        </div>

        <div className="overflow-auto bg-[#11131b] p-2 sm:p-4">
          <div
            className="mx-auto overflow-hidden rounded-xl bg-white shadow-2xl transition-[width] duration-300"
            style={{ width: viewportWidths[viewport], minWidth: viewport === 'mobile' ? '390px' : undefined }}
          >
            <ProjectPreview
              showNavigator
              showRefreshButton={false}
              showOpenInCodeSandbox={false}
              showOpenNewtab={false}
              showRestartButton={false}
              showSandpackErrorOverlay
              style={{ height: '640px' }}
            />
          </div>
        </div>
      </PreviewProvider>
    </motion.section>
  );
};

export default PreviewSandbox;
