/**
 * ============================================================================
 * ORUS BUILDER - PROJECTS PAGE TESTS
 * ============================================================================
 *
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2026-10-07T00:00:00-03:00
 * COMPONENT_HASH: orus.frontend.page.projects.tests.20261007.PRT1
 * ============================================================================
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsPage } from './ProjectsPage';
import projectService from '@services/project.service';
import { useProjectStore } from '@store/project.store';

vi.mock('@components/layout/Navigation', () => ({ Navigation: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('@components/project/ProjectList', () => ({
  ProjectList: ({ projects, isLoading, onProjectSelect, onProjectEdit, onProjectDelete }: any) => (
    <div>
      <span>{isLoading ? 'loading' : 'ready'}</span>
      {projects.map((project: any) => <div key={project.id}>
        <span>{project.name}</span>
        <button onClick={() => onProjectSelect(project)}>open-{project.id}</button>
        <button onClick={() => onProjectEdit(project)}>edit-{project.id}</button>
        <button onClick={() => onProjectDelete(project.id)}>delete-{project.id}</button>
      </div>)}
    </div>
  ),
}));
vi.mock('@services/project.service', () => ({
  default: {
    getProjects: vi.fn(),
    deleteProject: vi.fn(),
  },
}));
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const project = {
  id: 'project-1',
  name: 'Atlas',
  description: 'CRM certificado',
  status: 'ready',
  framework: 'react',
  language: 'typescript',
  files: [],
  createdAt: '2026-10-07T00:00:00.000Z',
  updatedAt: '2026-10-07T00:00:00.000Z',
};

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useProjectStore.setState({ projects: [], activeProject: null, isLoading: false, error: null, selectedFileId: null });
    vi.mocked(projectService.getProjects).mockResolvedValue({ projects: [project] } as any);
    vi.mocked(projectService.deleteProject).mockResolvedValue(undefined as any);
  });

  it('loads the complete portfolio and opens project routes', async () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <Routes>
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<div>project-route</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Atlas')).toBeInTheDocument();
    expect(projectService.getProjects).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('open-project-1'));
    expect(screen.getByText('project-route')).toBeInTheDocument();
  });

  it('deletes a project through the API and updates the workspace state', async () => {
    render(<MemoryRouter><ProjectsPage /></MemoryRouter>);
    expect(await screen.findByText('Atlas')).toBeInTheDocument();
    fireEvent.click(screen.getByText('delete-project-1'));

    await waitFor(() => expect(projectService.deleteProject).toHaveBeenCalledWith('project-1'));
    await waitFor(() => expect(useProjectStore.getState().projects).toEqual([]));
  });
});
