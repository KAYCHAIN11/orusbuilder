import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Code2, Download, Eye, Loader2 } from 'lucide-react';
import { PreviewSandbox } from '@components/generation/PreviewSandbox';
import type { PreviewSourceFile } from '@components/generation/preview-project';
import { usePreview } from './PreviewContext';
import toast from 'react-hot-toast';
import { apiUrl } from '../config/runtime';

export const PreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const preview = usePreview();
  const [storedFiles, setStoredFiles] = useState<PreviewSourceFile[]>([]);
  const [storedCode, setStoredCode] = useState('');
  const [storedGenerationId, setStoredGenerationId] = useState('');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [restoreState, setRestoreState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [restoreError, setRestoreError] = useState('');

  useEffect(() => {
    let active = true;
    const savedFiles = sessionStorage.getItem('generated-files');
    const savedCode = sessionStorage.getItem('generated-code') || '';
    const parameters = new URLSearchParams(window.location.search);
    const localWorkspace = parameters.get('workspace') === '1';
    const queryGenerationId = parameters.get('generationId') || '';
    const savedGenerationId = localWorkspace ? '' : queryGenerationId || preview.jobId ||
      sessionStorage.getItem('generated-job-id') || localStorage.getItem('orus:last-generation-id') || '';
    const accessToken = savedGenerationId
      ? sessionStorage.getItem(`orus:job-token:${savedGenerationId}`) || localStorage.getItem(`orus:job-token:${savedGenerationId}`) || ''
      : '';

    setStoredGenerationId(savedGenerationId);

    if (preview.files.length > 0 || preview.code) {
      setRestoreState('ready');
      return () => {
        active = false;
      };
    }

    try {
      const parsedFiles = savedFiles ? JSON.parse(savedFiles) as PreviewSourceFile[] : [];
      if (parsedFiles.length > 0 || savedCode) {
        setStoredFiles(parsedFiles);
        setStoredCode(savedCode);
        setRestoreState('ready');
        return () => {
          active = false;
        };
      }
    } catch {
      setStoredFiles([]);
    }

    if (!savedGenerationId) {
      toast.error('Nenhum projeto para visualizar');
      navigate('/generate');
      return () => {
        active = false;
      };
    }

    setRestoreState('loading');
    void fetch(apiUrl(`/api/v1/generation/${savedGenerationId}/result`), {
      headers: accessToken ? { 'x-orus-job-token': accessToken } : {},
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Projeto indisponível (${response.status})`);
        const payload = await response.json();
        const restoredFiles = (payload.data?.files || []) as PreviewSourceFile[];
        if (restoredFiles.length === 0) throw new Error('O resultado não contém arquivos para visualizar.');
        if (!active) return;
        const restoredCode = restoredFiles
          .map((file) => `// ${file.path || file.fileName || file.name}\n\n${file.content}`)
          .join('\n\n');
        setStoredFiles(restoredFiles);
        setStoredCode(restoredCode);
        sessionStorage.setItem('generated-job-id', savedGenerationId);
        sessionStorage.setItem('generated-files', JSON.stringify(restoredFiles));
        sessionStorage.setItem('generated-code', restoredCode);
        setRestoreState('ready');
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : 'Não foi possível restaurar o projeto.';
        setRestoreError(message);
        setRestoreState('error');
        toast.error(message);
      });

    return () => {
      active = false;
    };
  }, [navigate, preview.code, preview.files, preview.jobId]);

  const files: PreviewSourceFile[] = preview.files.length > 0 ? preview.files : storedFiles;
  const code = preview.code || storedCode;
  const displayedCode = useMemo(
    () =>
      files.length > 0
        ? files.map((file) => `// ${file.path || file.fileName || file.name}\n\n${file.content}`).join('\n\n')
        : code,
    [code, files]
  );

  const handleDownload = async () => {
    try {
      let blob: Blob;
      if (storedGenerationId) {
        const token = sessionStorage.getItem(`orus:job-token:${storedGenerationId}`) || localStorage.getItem(`orus:job-token:${storedGenerationId}`) || '';
        const response = await fetch(apiUrl(`/api/v1/generation/download/${storedGenerationId}`), {
          headers: token ? { 'x-orus-job-token': token } : {},
        });
        if (!response.ok) throw new Error(`Download indisponível (${response.status})`);
        blob = await response.blob();
      } else {
        const JSZip = (await import('jszip')).default;
        const archive = new JSZip();
        for (const file of files) {
          const path = String(file.path || file.fileName || file.name || 'file.txt').replace(/^[/\\]+/, '').replace(/\\/g, '/');
          archive.file(path, file.content || '');
        }
        blob = await archive.generateAsync({ type: 'blob' });
      }
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = storedGenerationId ? `orus-${storedGenerationId}.zip` : 'orus-workspace.zip';
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Download iniciado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao baixar o projeto');
    }
  };

  return (
    <div className="min-h-screen bg-[#080a10] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080a10]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Builder
          </button>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'preview' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'code' ? 'bg-white text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="h-4 w-4" />
              Código
            </button>
            <button
              onClick={() => void handleDownload()}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Baixar código"
              title="Baixar código"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-3 sm:p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {restoreState === 'loading' ? (
            <div className="flex min-h-[720px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-[#0d1018] text-center">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              <div>
                <p className="text-sm font-semibold text-white">Restaurando o último projeto</p>
                <p className="mt-1 text-xs text-slate-400">Buscando arquivos e certificação no backend.</p>
              </div>
            </div>
          ) : restoreState === 'error' ? (
            <div className="flex min-h-[720px] flex-col items-center justify-center gap-4 rounded-2xl border border-rose-400/20 bg-[#0d1018] px-6 text-center">
              <AlertCircle className="h-8 w-8 text-rose-400" />
              <div>
                <p className="text-sm font-semibold text-white">Projeto não disponível</p>
                <p className="mt-1 text-xs text-slate-400">{restoreError}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/generate')}
                className="rounded-lg bg-violet-500 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-400"
              >
                Voltar ao Builder
              </button>
            </div>
          ) : viewMode === 'preview' ? (
            <PreviewSandbox
              files={files}
              code={code}
              previewUrl={
                storedGenerationId
                  ? apiUrl(`/api/v1/generation/${storedGenerationId}/preview${(() => {
                      const token = sessionStorage.getItem(`orus:job-token:${storedGenerationId}`) || localStorage.getItem(`orus:job-token:${storedGenerationId}`) || '';
                      return token ? `?access_token=${encodeURIComponent(token)}` : '';
                    })()}`)
                  : undefined
              }
              className="min-h-[720px]"
            />
          ) : (
            <pre className="max-h-[calc(100vh-120px)] overflow-auto rounded-2xl border border-white/10 bg-[#0d1018] p-6 font-mono text-sm leading-6 text-slate-300">
              <code>{displayedCode}</code>
            </pre>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default PreviewPage;
