import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../context/ThemeContext';
import {
  ArrowLeft,
  Download,
  Zap,
  CheckCircle,
  FileCode,
  Copy,
  CheckCheck,
  MessageCircle,
  Eye,
  LayoutDashboard,
  Save,
  Code2,
  Terminal,
  Package,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { PromptInput, PromptOptions } from '../components/generation/PromptInput';
import { usePreview } from '../pages/PreviewContext';
import { PreviewSandbox } from '../components/generation/PreviewSandbox';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { apiUrl } from '../config/runtime';
import projectService from '@services/project.service';
import { clearResumableGeneration, readResumableGeneration } from '@utils/generation-resume';

// ============================================================================
// TYPES
// ============================================================================

interface LocationState {
  prompt?: string;
  autoStart?: boolean;
  resumeJobId?: string;
  accessToken?: string;
  blueprintName?: string;
}

interface GeneratedFile {
  path: string;
  fileName: string;
  name?: string;
  content: string;
  language: string;
  lines: number;
  size?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'trinity';
  content: string;
  timestamp: Date;
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

type Language = 'pt' | 'en' | 'es';

const translations: Record<Language, Record<string, string>> = {
  pt: {
    title: 'Gerando seu projeto',
    subtitle: 'Descreva sua ideia e Trinity AI gerará código real',
    generating: 'Gerando',
    complete: 'Completo',
    ready: 'Pronto',
    files_generated: 'arquivos gerados',
    code: 'Ver Código',
    download: 'Download ZIP',
    save: 'Salvar',
    dashboard: 'Dashboard',
    deploy: 'Deploy',
    new_generation: 'Nova Geração',
    chat_generating: 'Gerando',
    chat_complete: 'Completo',
    chat_ready: 'Pronto',
    copy: 'Copiar',
    copied: 'Copiado!',
    production_ready: 'Pronto para produção',
    next_steps: 'Próximos Passos',
    download_code_desc: 'Download completo em ZIP',
    save_project_desc: 'Adicionar ao dashboard',
    deploy_desc: 'Publicar online',
    files: 'arquivos',
    lines: 'linhas',
    view_dashboard: 'Ver Dashboard',
    coming_soon: 'Em breve',
  },
  en: {
    title: 'Generating your project',
    subtitle: 'Describe your idea and Trinity AI will generate real code',
    generating: 'Generating',
    complete: 'Complete',
    ready: 'Ready',
    files_generated: 'files generated',
    code: 'View Code',
    download: 'Download ZIP',
    save: 'Save',
    dashboard: 'Dashboard',
    deploy: 'Deploy',
    new_generation: 'New Generation',
    chat_generating: 'Generating',
    chat_complete: 'Complete',
    chat_ready: 'Ready',
    copy: 'Copy',
    copied: 'Copied!',
    production_ready: 'Production ready',
    next_steps: 'Next Steps',
    download_code_desc: 'Complete download in ZIP',
    save_project_desc: 'Add to dashboard',
    deploy_desc: 'Publish online',
    files: 'files',
    lines: 'lines',
    view_dashboard: 'View Dashboard',
    coming_soon: 'Coming soon',
  },
  es: {
    title: 'Generando tu proyecto',
    subtitle: 'Describe tu idea y Trinity AI generará código real',
    generating: 'Generando',
    complete: 'Completado',
    ready: 'Listo',
    files_generated: 'archivos generados',
    code: 'Ver Código',
    download: 'Descargar ZIP',
    save: 'Guardar',
    dashboard: 'Dashboard',
    deploy: 'Desplegar',
    new_generation: 'Nueva Generación',
    chat_generating: 'Generando',
    chat_complete: 'Completado',
    chat_ready: 'Listo',
    copy: 'Copiar',
    copied: '¡Copiado!',
    production_ready: 'Listo para producción',
    next_steps: 'Próximos Pasos',
    download_code_desc: 'Descarga completa en ZIP',
    save_project_desc: 'Agregar al panel',
    deploy_desc: 'Publicar en línea',
    files: 'archivos',
    lines: 'líneas',
    view_dashboard: 'Ver Dashboard',
    coming_soon: 'Próximamente',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const GeneratePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const hasInitialPrompt = Boolean(state?.prompt);

  // ✅ USE THEME CONTEXT
  const { theme, setTheme, language, setLanguage } = useThemeContext();

  // ✅ NOVO: PreviewContext
  const { setCode, setFiles: setPreviewFiles, setStatus, setError } = usePreview();

  const t = translations[language];
  const [mounted, setMounted] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [files, setFiles] = useState<GeneratedFile[] | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [generationId, setGenerationId] = useState<string>('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [repairAttempts, setRepairAttempts] = useState(0);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isCertified, setIsCertified] = useState(false);
  
  // ✅ NOVO: Toggle Preview
  const [showPreview, setShowPreview] = useState(false);
  
  const isGeneratingRef = useRef(false);
  const lastGenerationRef = useRef<{ prompt: string; options: PromptOptions } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ NOVO: Sync files com PreviewContext
  useEffect(() => {
    if (files && files.length > 0) {
      try {
        const combinedCode = files
          .map(
            (file) =>
              `// ════════════════════════════════════════════════════════════
// File: ${file.path}
// Lines: ${file.lines}
// Language: ${file.language}
// ════════════════════════════════════════════════════════════

${file.content}`
          )
          .join('\n\n');

        setCode(combinedCode);
        setPreviewFiles(
          files.map((file) => ({
            ...file,
            name: file.name ?? file.fileName ?? file.path ?? 'file.tsx',
          }))
        );
        sessionStorage.setItem('generated-files', JSON.stringify(files));
        sessionStorage.setItem('generated-code', combinedCode);
        setStatus('ready');
      } catch (err: any) {
        console.error('Erro ao atualizar preview:', err);
        setError(err.message);
      }
    }
  }, [files, setCode, setPreviewFiles, setStatus, setError]);

  let messageIdCounter = 0;

  const addMessage = (role: 'user' | 'trinity', content: string) => {
    messageIdCounter++;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `${role}-${Date.now()}-${messageIdCounter}`,
        role,
        content,
        timestamp: new Date(),
      },
    ]);
  };

  const handleGenerate = async (prompt: string, options: PromptOptions) => {
    if (isGeneratingRef.current) {
      console.warn('⚠️ Generation already in progress!');
      return;
    }

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setIsComplete(false);
    setProgress(0);
    setFiles(null);
    setJobId(null);
    setShowPreview(false);
    setGenerationError(null);
    setRepairAttempts(0);
    setDiagnostics([]);
    setIsCertified(false);
    lastGenerationRef.current = { prompt, options };

    addMessage('user', prompt);
    addMessage('trinity', '🔗 Conectando com Trinity AI · DeepSeek...');

    try {
      const response = await fetch(apiUrl('/api/v1/generation/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          options: {
            framework: options.framework || 'react',
            language: options.language || 'typescript',
            includeTests: options.includeTests ?? true,
            style: options.style || 'modern',
            applyStyles: true,
            applyTailwind: true,
            darkMode: true,
            responsive: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedJobId = data.jobId || data.data?.jobId;
      const generatedAccessToken = data.accessToken || data.data?.accessToken;

      if (!generatedJobId) {
        throw new Error('No jobId received from backend');
      }

      setJobId(generatedJobId);
      setGenerationId(generatedJobId);
      sessionStorage.setItem('generated-job-id', generatedJobId);
      localStorage.setItem('orus:last-generation-id', generatedJobId);
      if (generatedAccessToken) {
        sessionStorage.setItem(`orus:job-token:${generatedJobId}`, generatedAccessToken);
        localStorage.setItem(`orus:job-token:${generatedJobId}`, generatedAccessToken);
      }

      addMessage('trinity', `✅ Job criado: ${generatedJobId}. Acompanhando validação real...`);

      let finalResult: any = null;
      for (let pollAttempt = 0; pollAttempt < 600; pollAttempt++) {
        const statusResponse = await fetch(apiUrl(`/api/v1/generation/${generatedJobId}/status`), {
          headers: generatedAccessToken ? { 'x-orus-job-token': generatedAccessToken } : {},
        });
        if (!statusResponse.ok) throw new Error(`Falha ao consultar geração: ${statusResponse.statusText}`);
        const statusPayload = await statusResponse.json();
        const status = statusPayload.data;
        setProgress(status.progress || 0);
        setCurrentStage(status.currentStep || status.status);
        setRepairAttempts(status.repairAttempts || 0);
        setDiagnostics((status.diagnostics || []).slice(0, 3).map((item: any) =>
          item.message || item.output || String(item)
        ));

        if (status.status === 'failed') {
          throw new Error(status.error || status.diagnostics?.[0]?.message || 'O projeto não passou na certificação');
        }
        if (status.status === 'ready') {
          const resultResponse = await fetch(apiUrl(`/api/v1/generation/${generatedJobId}/result`), {
            headers: generatedAccessToken ? { 'x-orus-job-token': generatedAccessToken } : {},
          });
          if (!resultResponse.ok) throw new Error(`Falha ao carregar resultado: ${resultResponse.statusText}`);
          const resultPayload = await resultResponse.json();
          finalResult = resultPayload.data;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!finalResult) throw new Error('A geração excedeu o tempo máximo de acompanhamento');
      const generatedFiles = finalResult.files || [];

      if (generatedFiles.length === 0) {
        throw new Error('No files generated by backend');
      }

      const formattedFiles: GeneratedFile[] = generatedFiles.map((file: any) => ({
        path: file.path || file.fileName || 'unknown',
        fileName: file.fileName || file.name || file.path || 'file.tsx',
        name: (file.name || file.fileName || file.path || 'file.tsx').toString(),
        content: file.content || '// No content',
        language: file.language || 'typescript',
        lines: file.lines || file.content?.split('\n').length || 0,
      }));

      setFiles(formattedFiles);
      setIsComplete(true);
      setProgress(100);
      setCurrentStage('certified');
      setIsCertified(finalResult.certification?.status === 'ready');

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      addMessage('trinity', `🎉 Código REAL gerado! ${formattedFiles.length} ${t.files_generated}!`);
      toast.success(`${formattedFiles.length} ${t.files_generated}!`);
    } catch (error: any) {
      console.error('❌ Generation error:', error);
      setIsComplete(false);
      setGenerationError(error.message);
      addMessage('trinity', `❌ Erro: ${error.message}`);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const handleRetry = () => {
    const previous = lastGenerationRef.current;
    if (previous) handleGenerate(previous.prompt, previous.options);
  };

  const handleDownload = async () => {
    if (!generationId && !jobId) {
      toast.error('Nenhuma geração disponível para download');
      return;
    }

    if (!isCertified) {
      toast.error('O download só é liberado após a certificação');
      return;
    }

    const idToUse = generationId || jobId;
    const accessToken = sessionStorage.getItem(`orus:job-token:${idToUse}`) || localStorage.getItem(`orus:job-token:${idToUse}`) || '';
    try {
      const response = await fetch(apiUrl(`/api/v1/generation/download/${idToUse}`), {
        headers: accessToken ? { 'x-orus-job-token': accessToken } : {},
      });
      if (!response.ok) throw new Error(`Download indisponível (${response.status})`);
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `orus-${idToUse}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Download iniciado!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível baixar o projeto');
    }
  };

  const handleSaveProject = async () => {
    if (!files || files.length === 0) {
      toast.error('Nenhum arquivo para salvar');
      return;
    }

    const projectName = window.prompt('Nome do projeto:', 'Meu Projeto ORUS');
    if (!projectName) return;

    try {
      const idToUse = generationId || jobId;
      if (!idToUse) throw new Error('Geração não encontrada');
      await projectService.createProjectFromGeneration(
        idToUse,
        projectName,
        chatMessages[0]?.content || 'Projeto gerado pelo ORUS Builder'
      );
      toast.success('✅ Projeto salvo no dashboard!');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (error: unknown) {
      console.error('Save error:', error);
      toast.error(`Erro: ${error instanceof Error ? error.message : 'Não foi possível salvar'}`);
    }
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleNewGeneration = () => {
    clearResumableGeneration(localStorage, generationId || jobId || undefined);
    sessionStorage.removeItem('generated-job-id');
    setFiles(null);
    setIsComplete(false);
    setIsGenerating(false);
    setProgress(0);
    setChatMessages([]);
    navigate('/generate', { replace: true, state: {} });
  };

  const handleCopyFile = async (content: string, filename: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(filename);
      toast.success(`${filename} ${t.copied.toLowerCase()}!`);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const resumeGeneration = async (resumeJobId: string, accessToken?: string) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setIsGenerating(true);
    setIsComplete(false);
    setFiles(null);
    setJobId(resumeJobId);
    setGenerationId(resumeJobId);
    setGenerationError(null);
    setRepairAttempts(0);
    setDiagnostics([]);
    setIsCertified(false);
    sessionStorage.setItem('generated-job-id', resumeJobId);
    localStorage.setItem('orus:last-generation-id', resumeJobId);
    if (accessToken) {
      sessionStorage.setItem(`orus:job-token:${resumeJobId}`, accessToken);
      localStorage.setItem(`orus:job-token:${resumeJobId}`, accessToken);
    }
    addMessage('trinity', `Blueprint aprovado. Acompanhando a geração de ${state?.blueprintName || 'seu produto'}...`);

    try {
      let finalResult: any = null;
      for (let pollAttempt = 0; pollAttempt < 600; pollAttempt++) {
        const token = accessToken || sessionStorage.getItem(`orus:job-token:${resumeJobId}`) || '';
        const statusResponse = await fetch(apiUrl(`/api/v1/generation/${resumeJobId}/status`), {
          headers: token ? { 'x-orus-job-token': token } : {},
        });
        if (!statusResponse.ok) throw new Error(`Falha ao consultar geração: ${statusResponse.statusText}`);
        const statusPayload = await statusResponse.json();
        const current = statusPayload.data;
        setProgress(current.progress || 0);
        setCurrentStage(current.currentStep || current.status);
        setRepairAttempts(current.repairAttempts || 0);
        setDiagnostics((current.diagnostics || []).slice(0, 3).map((item: any) => item.message || item.output || String(item)));
        if (current.status === 'failed') throw new Error(current.error || current.diagnostics?.[0]?.message || 'O projeto não passou na certificação');
        if (current.status === 'ready') {
          const resultResponse = await fetch(apiUrl(`/api/v1/generation/${resumeJobId}/result`), {
            headers: token ? { 'x-orus-job-token': token } : {},
          });
          if (!resultResponse.ok) throw new Error(`Falha ao carregar resultado: ${resultResponse.statusText}`);
          finalResult = (await resultResponse.json()).data;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      if (!finalResult) throw new Error('A geração excedeu o tempo máximo de acompanhamento');
      const generatedFiles = finalResult.files || [];
      if (generatedFiles.length === 0) throw new Error('Nenhum arquivo foi produzido pelo pipeline');
      const formattedFiles: GeneratedFile[] = generatedFiles.map((file: any) => ({
        path: file.path || file.fileName || 'unknown',
        fileName: file.fileName || file.name || file.path || 'file.tsx',
        name: String(file.name || file.fileName || file.path || 'file.tsx'),
        content: file.content || '// No content',
        language: file.language || 'typescript',
        lines: file.lines || file.content?.split('\n').length || 0,
      }));
      setFiles(formattedFiles);
      setIsComplete(true);
      setProgress(100);
      setCurrentStage('certified');
      setIsCertified(finalResult.certification?.status === 'ready');
      addMessage('trinity', `Projeto certificado com ${formattedFiles.length} arquivos.`);
      toast.success(`${formattedFiles.length} ${t.files_generated}!`);
    } catch (resumeError) {
      const message = resumeError instanceof Error ? resumeError.message : 'Falha ao acompanhar a geração';
      setGenerationError(message);
      addMessage('trinity', `❌ Erro: ${message}`);
      toast.error(message);
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  const hasGeneratedRef = useRef(false);

  useEffect(() => {
    if (hasGeneratedRef.current) return;

    if (state?.resumeJobId && !isGenerating) {
      hasGeneratedRef.current = true;
      void resumeGeneration(state.resumeJobId, state.accessToken);
      return;
    }

    const persistedGeneration = readResumableGeneration(localStorage);
    if (!hasInitialPrompt && persistedGeneration && !isGenerating) {
      hasGeneratedRef.current = true;
      void resumeGeneration(persistedGeneration.generationId, persistedGeneration.accessToken);
      return;
    }

    if (hasInitialPrompt && state.prompt && !isGenerating) {
      hasGeneratedRef.current = true;
      handleGenerate(state.prompt, {
        framework: 'react',
        language: 'typescript',
        style: 'modern',
        includeTests: true,
      });
    }
  // Initial route work must run once; hasGeneratedRef prevents duplicate StrictMode runs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showPromptInput = !hasInitialPrompt && !state?.resumeJobId && !isGenerating && !isComplete;

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`relative min-h-screen flex flex-col overflow-hidden ${
        theme === 'dark'
          ? 'bg-[#07080d] text-white'
          : 'bg-[#f5f7fb] text-slate-950'
      }`}
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-48 -top-40 h-[34rem] w-[34rem] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute -right-48 top-1/3 h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/[0.07] blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,119,198,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(120,119,198,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-2xl ${
          theme === 'dark' ? 'border-white/[0.07] bg-[#07080d]/85' : 'border-slate-200 bg-white/85'
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                aria-label="Voltar para a página inicial"
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-500/10 hover:text-current"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-600 shadow-glow" />
              <div>
                <h1 className="font-heading text-[15px] font-bold tracking-tight">ORUS Builder</h1>
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">Generation workspace</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(isGenerating || isComplete) && (
                <div className="mr-1 hidden items-center gap-2 rounded-full border border-slate-400/15 px-3 py-1.5 text-[11px] text-slate-500 sm:flex">
                  <span className={`h-1.5 w-1.5 rounded-full ${isComplete ? 'bg-emerald-400' : 'animate-pulse bg-violet-400'}`} />
                  {isComplete ? 'Projeto certificado' : currentStage || 'Pipeline ativo'}
                </div>
              )}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label="Idioma"
                className={`rounded-lg border px-2.5 py-2 text-xs font-medium outline-none transition-colors ${
                  theme === 'dark'
                    ? 'border-white/10 bg-white/[0.04] text-slate-300'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <option className="bg-slate-900" value="pt">PT</option>
                <option className="bg-slate-900" value="en">EN</option>
                <option className="bg-slate-900" value="es">ES</option>
              </select>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-500/10"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>

              {isComplete && files && (
                <button
                  onClick={handleNewGeneration}
                  className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-950 transition-transform hover:scale-[1.02]"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t.new_generation}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <AnimatePresence mode="wait">
            {showPromptInput && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid items-start gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16"
              >
                <div className="pt-3 lg:sticky lg:top-28 lg:pt-8">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    Novo projeto
                  </div>
                  <h1 className="max-w-xl text-4xl font-heading font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                    O que vamos <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent">construir</span> hoje?
                  </h1>
                  <p className="mt-6 max-w-lg text-base leading-7 text-slate-500 sm:text-lg">
                    {t.subtitle}
                  </p>
                  <div className="mt-9 hidden space-y-3 lg:block">
                    {[
                      ['01', 'Planejamento', 'Trinity interpreta escopo, domínio e intenção visual.'],
                      ['02', 'Construção', 'As engines geram interface, backend, dados e testes.'],
                      ['03', 'Certificação', 'Build, testes, segurança e CIG bloqueiam entregas inválidas.'],
                    ].map(([number, title, description]) => (
                      <div key={number} className="flex gap-4 rounded-xl border border-slate-300/50 bg-white/40 p-4 dark:border-white/[0.07] dark:bg-white/[0.02]">
                        <span className="font-mono text-xs font-semibold text-violet-500">{number}</span>
                        <div>
                          <h2 className="text-sm font-semibold">{title}</h2>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <PromptInput
                    onSubmit={(prompt: string, options: PromptOptions) => {
                      handleGenerate(prompt, options);
                    }}
                    isGenerating={isGenerating}
                  />
                </div>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30 dark:border-white/10 dark:bg-[#0d1018] dark:shadow-black/30"
              >
                <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="border-b border-slate-200 p-7 dark:border-white/[0.07] sm:p-10 lg:border-b-0 lg:border-r">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.07]">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                          className="absolute inset-[-1px] rounded-2xl border border-transparent border-t-violet-400"
                        />
                        <img src="/trinity-ai-icon.png" alt="Trinity AI" className="h-9 w-9 object-contain" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-500">Trinity orchestration</span>
                        <h2 className="mt-1 text-xl font-heading font-bold sm:text-2xl">Construindo seu projeto</h2>
                      </div>
                    </div>

                    <p className="mt-8 min-h-[24px] text-sm text-slate-500">{currentStage || 'Preparando o pipeline...'}</p>
                    <div className="mt-4 overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.07]">
                      <motion.div
                        animate={{ width: `${Math.max(progress, 2)}%` }}
                        className="h-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400"
                        transition={{ duration: 0.45 }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span>Job {jobId ? jobId.slice(0, 8) : 'iniciando'}</span>
                      <span className="font-mono text-lg font-semibold text-current">{Math.round(progress)}%</span>
                    </div>

                    <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-500 dark:border-white/[0.07] dark:bg-black/15">
                      Você pode manter esta página aberta. O projeto só será liberado depois que instalação, testes, build, segurança e CIG forem aprovados.
                    </div>
                  </div>

                  <div className="p-7 sm:p-10">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Pipeline de entrega</h3>
                    <div className="mt-5 space-y-2">
                      {[
                        ['Interpretar produto e arquitetura', 5],
                        ['Gerar interface, serviços e dados', 25],
                        ['Materializar dependências', 55],
                        ['Executar testes e build', 72],
                        ['Validar segurança e CIG', 90],
                        ['Certificar artefato', 100],
                      ].map(([label, threshold], index) => {
                        const completed = progress >= Number(threshold);
                        const active = !completed && progress >= Number(threshold) - 20;
                        return (
                          <div key={String(label)} className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-bold ${completed ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-500' : active ? 'border-violet-400/30 bg-violet-400/10 text-violet-500' : 'border-slate-300 text-slate-400 dark:border-white/10 dark:text-slate-700'}`}>
                              {completed ? <CheckCircle className="h-3.5 w-3.5" /> : index + 1}
                            </div>
                            <span className={`text-sm ${completed || active ? 'text-current' : 'text-slate-400 dark:text-slate-700'}`}>{label}</span>
                            {active && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-violet-500" />}
                          </div>
                        );
                      })}
                    </div>

                    {repairAttempts > 0 && (
                      <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-500/[0.07] p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-amber-500">
                          <RefreshCw className="h-4 w-4" />
                          Correção automática · tentativa {repairAttempts}
                        </div>
                        {diagnostics.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-amber-700/70 dark:text-amber-200/60">
                            {diagnostics.map((diagnostic, index) => (
                              <li key={`${diagnostic}-${index}`} className="truncate">{diagnostic}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {generationError && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-6 w-6 text-red-500" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-500">A geração não passou na certificação</h3>
                    <p className="mt-1 text-sm opacity-80">{generationError}</p>
                    {diagnostics.length > 0 && (
                      <ul className="mt-3 space-y-1 text-xs opacity-70">
                        {diagnostics.map((diagnostic, index) => (
                          <li key={`${diagnostic}-${index}`}>{diagnostic}</li>
                        ))}
                      </ul>
                    )}
                    <button
                      onClick={handleRetry}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Tentar novamente
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {isComplete && files && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Success Card */}
                <div
                  className={`rounded-2xl border p-6 ${
                    theme === 'dark' ? 'border-white/10 bg-[#0d1018]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h2
                        className={`text-2xl font-heading font-bold mb-1 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Projeto pronto para uso
                      </h2>
                      <p
                        className={`text-lg ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {files.length} {t.files_generated} • 100% {t.production_ready}
                      </p>
                      {isCertified && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500">
                          <ShieldCheck className="h-4 w-4" />
                          Build, testes, segurança e CIG aprovados
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Toggle Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
                    theme === 'dark' ? 'border-white/10 bg-[#0d1018]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-semibold">{showPreview ? 'Preview do projeto compilado' : 'Arquivos do projeto'}</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/[0.05]">
                    <motion.button
                      onClick={() => setShowPreview(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-md transition-all font-medium text-sm flex items-center gap-2 ${
                        !showPreview
                          ? 'bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Code2 className="w-4 h-4" />
                      Código
                    </motion.button>

                    <motion.button
                      onClick={() => setShowPreview(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-md transition-all font-medium text-sm flex items-center gap-2 ${
                        showPreview
                          ? 'bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      Preview
                    </motion.button>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div
                  className={`rounded-2xl border p-4 ${
                    theme === 'dark' ? 'border-white/10 bg-[#0d1018]' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                        <FileCode className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3
                          className={`font-semibold text-sm ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          Arquivos Gerados
                        </h3>
                        <p
                          className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {files.length} {t.files} • {files.reduce((acc, f) => acc + f.lines, 0)}{' '}
                          {t.lines}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-white transition-colors hover:bg-violet-500"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">{t.download}</span>
                      </button>

                      <button
                        onClick={handleSaveProject}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                      >
                        <Save className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">{t.save}</span>
                      </button>

                      <button
                        onClick={handleDashboard}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-sm font-medium hidden sm:inline">
                          {t.view_dashboard}
                        </span>
                      </button>

                    </div>
                  </div>
                </div>

                {/* PREVIEW OU CÓDIGO */}
                <AnimatePresence mode="wait">
                  {!showPreview ? (
                    // CODE SECTION
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      id="code-section"
                      className="space-y-4"
                    >
                      {files.length > 1 && (
                        <div
                          className={`glass-card p-2 flex items-center gap-2 overflow-x-auto rounded-2xl ${
                            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                          }`}
                        >
                          {files.map((file, index) => (
                            <button
                              key={index}
                              onClick={() => setActiveFileIndex(index)}
                              className={`px-4 py-2 rounded-lg font-mono text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                                activeFileIndex === index
                                  ? 'bg-primary-600 text-white shadow-md'
                                  : theme === 'dark'
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <FileCode className="w-4 h-4 inline mr-2" />
                              {file.fileName}
                            </button>
                          ))}
                        </div>
                      )}

                      {files.map(
                        (file, index) =>
                          index === activeFileIndex && (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`glass-card overflow-hidden shadow-2xl rounded-2xl ${
                                theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                              }`}
                            >
                              {/* Header */}
                              <div
                                className={`flex items-center justify-between p-4 border-b ${
                                  theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-gray-100 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                                    <FileCode className="w-6 h-6 text-white" />
                                  </div>
                                  <div>
                                    <h3
                                      className={`font-mono text-sm font-semibold ${
                                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                                      }`}
                                    >
                                      {file.path}
                                    </h3>
                                    <p
                                      className={`text-xs ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                      }`}
                                    >
                                      {file.lines} {t.lines} • {file.language}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleCopyFile(file.content, file.path)}
                                  className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-all ${
                                    theme === 'dark'
                                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                                  }`}
                                >
                                  {copiedFile === file.path ? (
                                    <>
                                      <CheckCheck className="w-5 h-5 text-success-400" />
                                      <span className="text-sm font-medium">{t.copied}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-5 h-5" />
                                      <span className="text-sm font-medium">{t.copy}</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Code Content */}
                              <pre
                                className={`overflow-x-auto p-6 text-sm font-mono leading-relaxed max-h-[600px] overflow-y-auto ${
                                  theme === 'dark'
                                    ? 'bg-gray-950 text-gray-100'
                                    : 'bg-white text-gray-900'
                                }`}
                              >
                                <code>{file.content}</code>
                              </pre>

                              {/* Footer */}
                              <div
                                className={`p-4 border-t flex items-center justify-between ${
                                  theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div
                                  className={`flex items-center gap-4 text-xs ${
                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    <Terminal className="w-3 h-3" />
                                    {file.language}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FileCode className="w-3 h-3" />
                                    {file.lines} {t.lines}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Package className="w-3 h-3" />
                                    {(file.content.length / 1024).toFixed(2)} KB
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse"></div>
                                  <span className="text-xs text-success-400 font-medium">
                                    {t.production_ready}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )
                      )}
                    </motion.div>
                  ) : (
                    // PREVIEW SECTION
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`glass-card rounded-2xl overflow-hidden shadow-2xl ${
                        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                      }`}
                    >
                      <PreviewSandbox
                        files={files}
                        code={files[activeFileIndex]?.content || ''}
                        filename={files[activeFileIndex]?.fileName || 'Component.tsx'}
                        previewUrl={
                          isCertified && (generationId || jobId)
                            ? apiUrl(`/api/v1/generation/${generationId || jobId}/preview${(() => {
                                const id = generationId || jobId || '';
                                const token = sessionStorage.getItem(`orus:job-token:${id}`) || localStorage.getItem(`orus:job-token:${id}`) || '';
                                return token ? `?access_token=${encodeURIComponent(token)}` : '';
                              })()}`)
                            : undefined
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CHAT FOOTER */}
      <motion.div
        animate={{ height: isChatExpanded ? '300px' : '60px' }}
        className={`border-t flex flex-col shadow-2xl ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-colors ${
            theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
          }`}
          onClick={() => setIsChatExpanded(!isChatExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-md">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3
                className={`font-heading font-bold text-sm ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Trinity AI Chat
              </h3>
              <p
                className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {isGenerating
                  ? `⚡ ${t.chat_generating}...`
                  : isComplete
                  ? `✅ ${t.chat_complete}!`
                  : `💬 ${t.chat_ready}`}
              </p>
            </div>
          </div>
          <div>
            {isChatExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </div>

        {isChatExpanded && (
          <div
            className={`flex-1 overflow-y-auto p-6 space-y-3 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}
          >
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 shadow-md ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-800 text-gray-100'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GeneratePage;
