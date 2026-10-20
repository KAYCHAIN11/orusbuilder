

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * TYPES
 * ══════════════════════════════════════════════════════════════════════════════
 */

export interface GeneratedFile {
  name: string;
  content: string;
  language: string;
  lines?: number;
  directory?: string;
}

export interface PreviewContextType {
  // CODE STATE
  code: string;
  setCode: (code: string) => void;

  // FILES STATE
  files: GeneratedFile[];
  setFiles: (files: GeneratedFile[]) => void;

  // JOB TRACKING
  jobId: string;
  setJobId: (jobId: string) => void;

  // STATUS TRACKING
  status: 'idle' | 'generating' | 'ready' | 'error';
  setStatus: (status: 'idle' | 'generating' | 'ready' | 'error') => void;

  // ERROR TRACKING
  error: string | null;
  setError: (error: string | null) => void;

  // HELPERS
  clearPreview: () => void;
  updateFile: (filename: string, content: string) => void;
  removeFile: (filename: string) => void;
  getFileByName: (filename: string) => GeneratedFile | undefined;
}

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CONTEXT CREATION
 * ══════════════════════════════════════════════════════════════════════════════
 */

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * PROVIDER COMPONENT
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const PreviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Main States
  const [code, setCodeState] = useState<string>('');
  const [files, setFilesState] = useState<GeneratedFile[]>([]);
  const [jobId, setJobIdState] = useState<string>('');
  const [status, setStatusState] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [error, setErrorState] = useState<string | null>(null);

  /**
   * Setter com logging para debug
   */
  const setCode = useCallback((newCode: string) => {
    console.log('📡 [PreviewContext] setCode() - Atualizando código', {
      length: newCode.length,
      preview: newCode.substring(0, 100),
    });
    setCodeState(newCode);
  }, []);

  /**
   * Setter com logging para debug
   */
  const setFiles = useCallback((newFiles: GeneratedFile[]) => {
    console.log('📁 [PreviewContext] setFiles() - Atualizando arquivos', {
      count: newFiles.length,
      names: newFiles.map((f) => f.name),
    });
    setFilesState(newFiles);
  }, []);

  /**
   * Setter com logging para debug
   */
  const setJobId = useCallback((newJobId: string) => {
    console.log('🔑 [PreviewContext] setJobId() - ID do job:', newJobId);
    setJobIdState(newJobId);
  }, []);

  /**
   * Setter com logging para debug
   */
  const setStatus = useCallback((newStatus: 'idle' | 'generating' | 'ready' | 'error') => {
    console.log(`📊 [PreviewContext] setStatus() - Status: ${newStatus}`);
    setStatusState(newStatus);
  }, []);

  /**
   * Setter com logging para debug
   */
  const setError = useCallback((newError: string | null) => {
    if (newError) {
      console.error('❌ [PreviewContext] setError():', newError);
    } else {
      console.log('✅ [PreviewContext] clearError()');
    }
    setErrorState(newError);
  }, []);

  /**
   * ══════════════════════════════════════════════════════════════════════════════
   * HELPER: Limpa todo o state
   * ══════════════════════════════════════════════════════════════════════════════
   */
  const clearPreview = useCallback(() => {
    console.log('🗑️  [PreviewContext] clearPreview() - Limpando tudo');
    setCodeState('');
    setFilesState([]);
    setJobIdState('');
    setStatusState('idle');
    setErrorState(null);
  }, []);

  /**
   * ══════════════════════════════════════════════════════════════════════════════
   * HELPER: Atualiza um arquivo específico
   * ══════════════════════════════════════════════════════════════════════════════
   */
  const updateFile = useCallback(
    (filename: string, content: string) => {
      console.log(`📝 [PreviewContext] updateFile() - ${filename}`, {
        lines: content.split('\n').length,
      });

      setFilesState((prev) => {
        const exists = prev.some((f) => f.name === filename);

        if (exists) {
          return prev.map((f) => (f.name === filename ? { ...f, content } : f));
        } else {
          return [
            ...prev,
            {
              name: filename,
              content,
              language: filename.endsWith('.tsx') ? 'typescript' : 'typescript',
            },
          ];
        }
      });
    },
    []
  );

  /**
   * ══════════════════════════════════════════════════════════════════════════════
   * HELPER: Remove um arquivo específico
   * ══════════════════════════════════════════════════════════════════════════════
   */
  const removeFile = useCallback((filename: string) => {
    console.log(`🗑️  [PreviewContext] removeFile() - ${filename}`);

    setFilesState((prev) => prev.filter((f) => f.name !== filename));
  }, []);

  /**
   * ══════════════════════════════════════════════════════════════════════════════
   * HELPER: Busca arquivo por nome
   * ══════════════════════════════════════════════════════════════════════════════
   */
  const getFileByName = useCallback(
    (filename: string): GeneratedFile | undefined => {
      return files.find((f) => f.name === filename);
    },
    [files]
  );

  /**
   * Context value
   */
  const value: PreviewContextType = {
    code,
    setCode,
    files,
    setFiles,
    jobId,
    setJobId,
    status,
    setStatus,
    error,
    setError,
    clearPreview,
    updateFile,
    removeFile,
    getFileByName,
  };

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
};

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * HOOK: usePreview - USE ISSO NOS SEUS COMPONENTS!
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * EXEMPLO:
 * ─────────
 * export const MyComponent = () => {
 *   const { code, setCode, files, status } = usePreview();
 *   
 *   return (
 *     <div>
 *       <code>{code}</code>
 *       <PreviewSandbox code={code} />
 *     </div>
 *   );
 * };
 */

export const usePreview = (): PreviewContextType => {
  const context = useContext(PreviewContext);

  if (!context) {
    throw new Error(
      '❌ usePreview must be used within PreviewProvider\n\n' +
        'Solução: Envolver sua app com <PreviewProvider> em App.tsx ou main.tsx:\n' +
        '<PreviewProvider>\n' +
        '  <App />\n' +
        '</PreviewProvider>'
    );
  }

  return context;
};

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * HOOK: usePreviewStatus - Status simplificado
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const usePreviewStatus = () => {
  const { status, error } = usePreview();

  return {
    isLoading: status === 'generating',
    isReady: status === 'ready',
    isError: status === 'error',
    status,
    error,
  };
};

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * HOOK: usePreviewCode - Para components que só usam código
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const usePreviewCode = () => {
  const { code, setCode } = usePreview();

  return { code, setCode };
};

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * HOOK: usePreviewFiles - Para components que só usam files
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const usePreviewFiles = () => {
  const { files, setFiles, updateFile, removeFile } = usePreview();

  return { files, setFiles, updateFile, removeFile };
};