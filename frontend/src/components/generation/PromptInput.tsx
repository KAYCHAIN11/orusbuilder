import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Command, Send, SlidersHorizontal, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export interface PromptOptions {
  framework?: 'react' | 'vue' | 'angular' | 'nextjs';
  language?: 'typescript' | 'javascript';
  includeTests?: boolean;
  style?: 'modern' | 'minimal' | 'classic';
}

interface PromptInputProps {
  onSubmit: (prompt: string, options: PromptOptions) => void;
  isGenerating?: boolean;
  className?: string;
}

const EXAMPLE_PROMPTS = [
  {
    label: 'Dashboard SaaS',
    prompt: 'Dashboard SaaS premium para gestão de receita, clientes e assinaturas, com gráficos, filtros, tabela responsiva e modo escuro',
  },
  {
    label: 'Landing premium',
    prompt: 'Landing page premium para uma fintech, com hero editorial, benefícios, comparativo de planos, depoimentos e formulário de contato',
  },
  {
    label: 'Sistema de conteúdo',
    prompt: 'Plataforma de conteúdo com posts, categorias, busca, comentários, autenticação e painel administrativo responsivo',
  },
  {
    label: 'E-commerce',
    prompt: 'E-commerce moderno com catálogo, busca, filtros, página de produto, carrinho, checkout e painel administrativo',
  },
];

const fieldClass = clsx(
  'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors',
  'border-slate-200 bg-white text-slate-900 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/15',
  'dark:border-white/10 dark:bg-white/[0.045] dark:text-white dark:focus:border-violet-400/50'
);

export const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isGenerating = false,
  className,
}) => {
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<PromptOptions>({
    framework: 'react',
    language: 'typescript',
    includeTests: true,
    style: 'modern',
  });
  const [showOptions, setShowOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isValid = prompt.trim().length >= 10;

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 420)}px`;
  }, [prompt]);

  const handleSubmit = () => {
    if (isValid && !isGenerating) onSubmit(prompt.trim(), options);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={clsx('w-full', className)}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          'overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl',
          'border-slate-200 bg-white shadow-slate-300/30',
          'dark:border-white/10 dark:bg-[#0d1018]/95 dark:shadow-black/30'
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/[0.07] sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Descreva o produto</h2>
              <p className="text-xs text-slate-500">Escopo, usuários, dados e experiência desejada</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOptions((value) => !value)}
            aria-expanded={showOptions}
            className={clsx(
              'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
              showOptions
                ? 'border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Opções
            <ChevronDown className={clsx('h-3.5 w-3.5 transition-transform', showOptions && 'rotate-180')} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative rounded-xl border border-slate-200 bg-slate-50 transition-colors focus-within:border-violet-400/50 dark:border-white/[0.08] dark:bg-black/15">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex.: Plataforma de agendamentos para clínicas, com login, agenda por profissional, cadastro de pacientes, confirmação e dashboard financeiro..."
              disabled={isGenerating}
              maxLength={5000}
              rows={7}
              autoFocus
              className="min-h-[190px] w-full resize-none bg-transparent px-4 py-4 text-[15px] leading-7 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:placeholder:text-slate-600"
            />
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2.5 text-[11px] text-slate-400 dark:border-white/[0.06] dark:text-slate-600">
              <span className="flex items-center gap-1.5">
                <Command className="h-3 w-3" />
                Ctrl + Enter para gerar
              </span>
              <span className={prompt.length >= 4500 ? 'text-rose-500' : undefined}>{prompt.length} / 5000</span>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {showOptions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid gap-4 border-b border-slate-200 py-5 dark:border-white/[0.07] sm:grid-cols-3">
                  <label className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    Framework
                    <select
                      value={options.framework}
                      onChange={(event) => setOptions({ ...options, framework: event.target.value as PromptOptions['framework'] })}
                      className={fieldClass}
                    >
                      <option value="react">React</option>
                      <option value="vue">Vue</option>
                      <option value="angular">Angular</option>
                      <option value="nextjs">Next.js</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    Linguagem
                    <select
                      value={options.language}
                      onChange={(event) => setOptions({ ...options, language: event.target.value as PromptOptions['language'] })}
                      className={fieldClass}
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    Direção visual
                    <select
                      value={options.style}
                      onChange={(event) => setOptions({ ...options, style: event.target.value as PromptOptions['style'] })}
                      className={fieldClass}
                    >
                      <option value="modern">Moderno</option>
                      <option value="minimal">Minimalista</option>
                      <option value="classic">Clássico</option>
                    </select>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/[0.08] sm:col-span-3">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={options.includeTests}
                      onClick={() => setOptions({ ...options, includeTests: !options.includeTests })}
                      className={clsx(
                        'flex h-5 w-5 items-center justify-center rounded-md border transition-colors',
                        options.includeTests
                          ? 'border-violet-500 bg-violet-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      )}
                    >
                      {options.includeTests && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <span>
                      <span className="block text-sm font-medium text-slate-800 dark:text-slate-200">Gerar e executar testes</span>
                      <span className="block text-xs text-slate-500">O projeto só será liberado após a certificação do pipeline.</span>
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-xs leading-5 text-slate-500">
              Inclua o público, as telas principais e as regras de negócio. O ORUS define a estrutura de arquivos automaticamente.
            </p>
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!isValid || isGenerating}
              whileHover={isValid && !isGenerating ? { scale: 1.015 } : undefined}
              whileTap={isValid && !isGenerating ? { scale: 0.985 } : undefined}
              className="flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:grayscale disabled:opacity-35"
            >
              <Send className="h-4 w-4" />
              {isGenerating ? 'Gerando projeto' : 'Gerar projeto'}
            </motion.button>
          </div>

          {!isValid && prompt.length > 0 && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">Descreva a ideia com pelo menos 10 caracteres.</p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mt-5 grid gap-2 sm:grid-cols-2"
      >
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example.label}
            type="button"
            onClick={() => !isGenerating && setPrompt(example.prompt)}
            disabled={isGenerating}
            className="group rounded-xl border border-slate-200 bg-white/60 p-3 text-left transition-colors hover:border-violet-400/40 hover:bg-violet-50 dark:border-white/[0.07] dark:bg-white/[0.025] dark:hover:bg-violet-400/[0.05]"
          >
            <span className="block text-xs font-semibold text-slate-700 group-hover:text-violet-700 dark:text-slate-300 dark:group-hover:text-violet-300">{example.label}</span>
            <span className="mt-1 block truncate text-[11px] text-slate-400 dark:text-slate-600">{example.prompt}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default PromptInput;
