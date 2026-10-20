/**
 * ============================================================================
 * ORUS BUILDER - BLUEPRINT WORKSPACE PAGE
 * ============================================================================
 *
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2026-10-07T00:00:00-03:00
 * LAST_MODIFIED: 2026-10-07T00:00:00-03:00
 * COMPONENT_HASH: orus.frontend.page.blueprint.20261007.BPW1
 *
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: BlueprintWorkspaceAgent
 * - COGNITIVE_LEVEL: Advanced
 * - AUTONOMY_DEGREE: 86
 * - TRINITY_INTEGRATED: Full (Blueprint Intelligence)
 * ============================================================================
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Database,
  FileText,
  Layers3,
  Loader2,
  Route,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BlueprintUploader } from '@components/blueprint/BlueprintUploader';
import { Button } from '@components/common/Button';
import { Navigation } from '@components/layout/Navigation';
import blueprintService, {
  type BlueprintResource,
  type BlueprintStatusResponse,
} from '@services/blueprint.service';

export const BlueprintUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [blueprint, setBlueprint] = useState<BlueprintResource | null>(null);
  const [recent, setRecent] = useState<BlueprintResource[]>([]);
  const [status, setStatus] = useState<BlueprintStatusResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecent = useCallback(async () => {
    try {
      const result = await blueprintService.listBlueprints({ limit: 6 });
      setRecent(result.blueprints);
    } catch {
      setRecent([]);
    }
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  const handleUpload = async (file: File) => {
    if (isUploading) return;
    setIsUploading(true);
    setBlueprint(null);
    setError(null);
    try {
      const uploaded = await blueprintService.uploadBlueprint(file);
      setStatus(uploaded);
      const result = await blueprintService.waitUntilReady(uploaded.blueprintId, setStatus);
      setBlueprint(result);
      toast.success('Blueprint extraído e validado.');
      await loadRecent();
    } catch (uploadError) {
      const message = blueprintService.errorMessage(uploadError);
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    const productBlueprint = blueprint?.productBlueprint;
    if (!productBlueprint) return;
    setIsGenerating(true);
    setError(null);
    try {
      const generation = await blueprintService.generateFromBlueprint({
        blueprintId: productBlueprint.blueprintId,
        projectId: productBlueprint.projectId,
      });
      navigate('/generate', {
        state: {
          resumeJobId: generation.jobId,
          accessToken: generation.accessToken,
          blueprintName: productBlueprint.product.name,
        },
      });
    } catch (generationError) {
      const message = blueprintService.errorMessage(generationError);
      setError(message);
      toast.error(message);
      setIsGenerating(false);
    }
  };

  const plan = blueprint?.productBlueprint;

  return (
    <Navigation>
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-primary/20 bg-background-surface p-8"
          >
            <div className="mb-8 flex items-start gap-4">
              <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Documento como fonte primária</p>
                <h1 className="text-3xl font-bold text-foreground">Transforme sua especificação em um Product Blueprint</h1>
                <p className="mt-3 max-w-2xl text-foreground-muted">
                  O ORUS extrai produto, capacidades, jornadas, telas, componentes, dados, identidade visual e critérios de aceite antes de gerar código.
                </p>
              </div>
            </div>

            <BlueprintUploader
              acceptedTypes={['.docx', '.md', '.txt']}
              onUpload={(file) => void handleUpload(file)}
              showPreview
            />

            {isUploading && status && (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Processando {status.name}</p>
                      <p className="text-sm capitalize text-foreground-muted">{status.status}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm text-primary">{status.progress}%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-gradient-cognitive transition-all" style={{ width: `${status.progress}%` }} />
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-error/40 bg-error/10 p-4 text-error">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </motion.div>

          <aside className="rounded-3xl border border-primary/15 bg-background-surface p-7">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-bold text-foreground">O que será definido</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {[
                ['Produto e público', 'Problema, proposta de valor, objetivos e limites.'],
                ['Identidade e experiência', 'Arquétipo, tom, sistema visual e composição.'],
                ['Capacidades e jornadas', 'Atores, regras, fluxos, exceções e resultados.'],
                ['Arquitetura executável', 'Telas, componentes, dados, APIs e testes.'],
              ].map(([title, description], index) => (
                <div key={title} className="flex gap-4 rounded-2xl border border-primary/10 bg-background p-4">
                  <span className="font-mono text-xs text-primary">0{index + 1}</span>
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-sm text-foreground-muted">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {plan && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex flex-col gap-4 rounded-3xl border border-success/30 bg-success/5 p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-success" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-success">Blueprint pronto</p>
                  <h2 className="mt-1 text-2xl font-bold text-foreground">{plan.product.name}</h2>
                  <p className="mt-1 max-w-3xl text-foreground-muted">{plan.product.summary}</p>
                </div>
              </div>
              <Button onClick={handleGenerate} isLoading={isGenerating} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Gerar projeto certificado
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={<Boxes />} label="Capacidades" value={plan.capabilities.length} />
              <Metric icon={<Route />} label="Jornadas" value={plan.journeys.length} />
              <Metric icon={<Layers3 />} label="Telas" value={plan.screens.length} />
              <Metric icon={<Database />} label="Entidades" value={plan.data.length} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <PlanPanel title="Capacidades do produto">
                {plan.capabilities.map(capability => (
                  <div key={capability.id} className="rounded-2xl border border-primary/10 bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{capability.name}</p>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{capability.strategy}</span>
                    </div>
                    <p className="mt-2 text-sm text-foreground-muted">{capability.purpose}</p>
                  </div>
                ))}
              </PlanPanel>
              <PlanPanel title="Mapa de experiência">
                {plan.screens.map(screen => (
                  <div key={screen.id} className="rounded-2xl border border-primary/10 bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-foreground">{screen.name}</p>
                      <code className="text-xs text-accent">{screen.route}</code>
                    </div>
                    <p className="mt-2 text-sm text-foreground-muted">{screen.purpose}</p>
                    <p className="mt-2 text-xs uppercase tracking-wider text-primary">{screen.layout}</p>
                  </div>
                ))}
              </PlanPanel>
            </div>
          </motion.section>
        )}

        {recent.length > 0 && !plan && (
          <section className="rounded-3xl border border-primary/15 bg-background-surface p-7">
            <h2 className="text-xl font-bold text-foreground">Blueprints recentes</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {recent.map(item => (
                <button
                  key={item.blueprintId}
                  onClick={async () => setBlueprint(await blueprintService.getBlueprint(item.blueprintId))}
                  className="rounded-2xl border border-primary/10 bg-background p-4 text-left transition hover:border-primary/40"
                >
                  <p className="truncate font-semibold text-foreground">{item.name}</p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-primary">{item.status}</p>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </Navigation>
  );
};

const Metric: React.FC<{ icon: React.ReactElement; label: string; value: number }> = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-primary/15 bg-background-surface p-5">
    <div className="flex items-center justify-between text-primary">
      {React.cloneElement(icon, { className: 'h-5 w-5' })}
      <span className="text-2xl font-bold text-foreground">{value}</span>
    </div>
    <p className="mt-3 text-sm text-foreground-muted">{label}</p>
  </div>
);

const PlanPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rounded-3xl border border-primary/15 bg-background-surface p-6">
    <h3 className="mb-4 text-lg font-bold text-foreground">{title}</h3>
    <div className="space-y-3">{children}</div>
  </section>
);

export default BlueprintUploadPage;
