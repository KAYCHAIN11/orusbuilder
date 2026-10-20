/**
 * ============================================================================
 * ORUS BUILDER - PROJECTS PAGE
 * ============================================================================
 *
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2026-10-07T00:00:00-03:00
 * LAST_MODIFIED: 2026-10-07T00:00:00-03:00
 * COMPONENT_HASH: orus.frontend.page.projects.20261007.PRL1
 *
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: ProjectPortfolioAgent
 * - COGNITIVE_LEVEL: Advanced
 * - AUTONOMY_DEGREE: 85
 * - TRINITY_INTEGRATED: Cerebro (Workspace Organization)
 * ============================================================================
 */

import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navigation } from '@components/layout/Navigation';
import { ProjectList } from '@components/project/ProjectList';
import { Button } from '@components/common/Button';
import projectService from '@services/project.service';
import { useProjectStore } from '@store/project.store';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, isLoading, setProjects, setLoading, deleteProject } = useProjectStore();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const result = await projectService.getProjects();
      setProjects(result.projects);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar os projetos.');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProjects]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const removeProject = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      deleteProject(projectId);
      toast.success('Projeto excluído.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível excluir o projeto.');
    }
  };

  return (
    <Navigation>
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="flex flex-col gap-5 rounded-3xl border border-primary/15 bg-background-surface p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/15 p-3 text-primary">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Workspace</p>
              <h1 className="mt-1 text-3xl font-bold text-foreground">Seus projetos</h1>
              <p className="mt-2 text-foreground-muted">Abra, edite, filtre ou remova projetos salvos no ORUS Builder.</p>
            </div>
          </div>
          <Button onClick={() => navigate('/generate')} leftIcon={<Plus className="h-4 w-4" />}>
            Novo projeto
          </Button>
        </header>

        <ProjectList
          projects={projects}
          isLoading={isLoading}
          onProjectSelect={project => navigate(`/projects/${project.id}`)}
          onProjectEdit={project => navigate(`/editor/${project.id}`)}
          onProjectDelete={projectId => void removeProject(projectId)}
        />
      </div>
    </Navigation>
  );
};

export default ProjectsPage;
