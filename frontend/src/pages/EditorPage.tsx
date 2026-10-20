/**
 * ============================================================================
 * ORUS BUILDER - EDITOR PAGE (FIXED)
 * ============================================================================
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  Save,
  Play,
  Download,
  Menu,
  History,
  MessageSquare,
  X,
  WandSparkles,
} from 'lucide-react';
import { Navigation } from '@components/layout/Navigation';
import { CodeEditor } from '@components/editor/CodeEditor';
import { FileTree } from '@components/editor/FileTree';
import { Terminal } from '@components/editor/Terminal';
import { PreviewPane } from '@components/editor/PreviewPane';
import { Button } from '@components/common/Button';
import { useProjectStore } from '@store/project.store';
import { FileNode } from '@/types/api.types';
import projectService, { type ProjectRevision } from '@services/project.service';
import toast from 'react-hot-toast';
import type { FileAction } from '@components/editor/FileTree';
import generationService from '@services/generation.service';
import collaborationService, { type CollaborationComment } from '@services/collaboration.service';
import { CommentThread, type Comment } from '@components/collaboration/CommentThread';
import { useAuthStore } from '@store/auth.store';

// ============================================================================
// TYPES
// ============================================================================

interface OpenFile extends FileNode {
  content: string;
}

// ============================================================================
// EDITOR PAGE COMPONENT
// ============================================================================

export const EditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Local state for editor
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showFileTree, setShowFileTree] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [collaborationSessionId, setCollaborationSessionId] = useState('');
  const [comments, setComments] = useState<CollaborationComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [revisions, setRevisions] = useState<ProjectRevision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<ProjectRevision | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isRestoringRevision, setIsRestoringRevision] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationProgress, setRegenerationProgress] = useState(0);
  const [showRegenerationDialog, setShowRegenerationDialog] = useState(false);
  const [regenerationRequest, setRegenerationRequest] = useState('');
  const [selectedProtectedPaths, setSelectedProtectedPaths] = useState<string[]>([]);

  const { projects, activeProject, setActiveProject, updateFileContent, deleteFile, renameFile } = useProjectStore();
  const { user } = useAuthStore();

  // Get current project
  const project = activeProject?.id === projectId
    ? activeProject
    : projects.find((item) => item.id === projectId);

  useEffect(() => {
    let active = true;
    if (!projectId) {
      navigate('/projects');
      return () => { active = false; };
    }
    setIsLoadingProject(true);
    void projectService.getProject(projectId)
      .then((loadedProject) => {
        if (!active) return;
        const nodes = (loadedProject.files || []).map((file) => ({
          ...file,
          type: 'file' as const,
          content: file.content || '',
        }));
        setActiveProject({ ...loadedProject, files: nodes });
        setFileTree(nodes);
      })
      .catch(() => {
        if (!active) return;
        toast.error('Project not found');
        navigate('/projects');
      })
      .finally(() => {
        if (active) setIsLoadingProject(false);
      });
    return () => { active = false; };
  }, [navigate, projectId, setActiveProject]);

  const loadHistory = useCallback(async () => {
    if (!projectId) return;
    setIsLoadingHistory(true);
    try {
      const history = await projectService.getProjectHistory(projectId);
      setRevisions(history);
      setSelectedRevision(current => current ? history.find(item => item.id === current.id) || history[0] || null : history[0] || null);
    } catch {
      toast.error('Falha ao carregar o histórico');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (showHistory) void loadHistory();
  }, [showHistory, loadHistory]);

  useEffect(() => {
    let active = true;
    if (!projectId || !user) return () => { active = false; };
    void collaborationService.ensureSession(projectId)
      .then(session => {
        if (active) setCollaborationSessionId(session.sessionId);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [projectId, user]);

  const loadComments = useCallback(async () => {
    const file = openFiles.find(item => item.id === activeFileId);
    if (!collaborationSessionId || !file) {
      setComments([]);
      return;
    }
    setIsLoadingComments(true);
    try {
      setComments(await collaborationService.getComments(collaborationSessionId, file.path));
    } catch {
      toast.error('Falha ao carregar os comentários');
    } finally {
      setIsLoadingComments(false);
    }
  }, [activeFileId, collaborationSessionId, openFiles]);

  useEffect(() => {
    if (showComments) void loadComments();
  }, [showComments, loadComments]);

  const handleAddComment = async (content: string, parentId?: string) => {
    const file = openFiles.find(item => item.id === activeFileId);
    if (!collaborationSessionId || !file) return;
    await collaborationService.createComment(collaborationSessionId, {
      fileId: file.path,
      content,
      ...(parentId ? { parentId } : {}),
    });
    await loadComments();
  };

  const handleEditComment = async (commentId: string, content: string) => {
    if (!collaborationSessionId) return;
    await collaborationService.updateComment(collaborationSessionId, commentId, { content });
    await loadComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!collaborationSessionId) return;
    await collaborationService.deleteComment(collaborationSessionId, commentId);
    await loadComments();
  };

  const handleResolveComments = async () => {
    if (!collaborationSessionId) return;
    await Promise.all(comments.filter(comment => !comment.resolvedAt).map(comment =>
      collaborationService.updateComment(collaborationSessionId, comment.commentId, { resolved: true })
    ));
    await loadComments();
  };

  // Handle file selection
  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file' && file.content) {
      const openFile: OpenFile = {
        ...file,
        content: file.content,
      };

      // Check if file is already open
      const existingFile = openFiles.find((f) => f.id === file.id);
      if (!existingFile) {
        setOpenFiles([...openFiles, openFile]);
      }
      setActiveFileId(file.id);
    }
  };

  // Handle file content change
  const handleFileChange = (content: string) => {
    if (activeFileId) {
      setOpenFiles(
        openFiles.map((f) =>
          f.id === activeFileId ? { ...f, content } : f
        )
      );
      updateFileContent(activeFileId, content);
    }
  };

  // Handle file save
  const handleFileSave = async (content: string) => {
    if (!activeFileId) return;

    setIsSaving(true);
    try {
      if (!projectId) return;
      await projectService.updateFile(projectId, activeFileId, content);
      setOpenFiles(
        openFiles.map((f) =>
          f.id === activeFileId ? { ...f, content } : f
        )
      );
      if (showHistory) await loadHistory();
      toast.success('File saved successfully');
    } catch (error) {
      toast.error('Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file context menu actions
  const handleFileContextMenu = async (file: FileNode, action: FileAction) => {
    if (!projectId || file.type !== 'file') return;
    switch (action) {
      case 'rename': {
        const newName = window.prompt('Novo nome do arquivo', file.name)?.trim();
        if (!newName || newName === file.name) return;
        const renamed = await projectService.renameFile(projectId, file.id, newName);
        renameFile(file.id, renamed.name);
        setFileTree((nodes) => nodes.map((node) => node.id === file.id ? { ...node, name: renamed.name, path: renamed.path } : node));
        setOpenFiles((nodes) => nodes.map((node) => node.id === file.id ? { ...node, name: renamed.name, path: renamed.path } : node));
        if (showHistory) await loadHistory();
        toast.success('Arquivo renomeado');
        break;
      }
      case 'delete': {
        if (!window.confirm(`Excluir ${file.name}?`)) return;
        await projectService.deleteFile(projectId, file.id);
        deleteFile(file.id);
        setFileTree((nodes) => nodes.filter((node) => node.id !== file.id));
        setOpenFiles((nodes) => nodes.filter((node) => node.id !== file.id));
        if (activeFileId === file.id) setActiveFileId(null);
        if (showHistory) await loadHistory();
        toast.success('Arquivo excluído');
        break;
      }
      case 'duplicate': {
        const duplicate = await projectService.duplicateFile(projectId, file.id);
        const node = { ...duplicate, type: 'file' as const };
        setFileTree((nodes) => [...nodes, node]);
        if (showHistory) await loadHistory();
        toast.success('Arquivo duplicado');
        break;
      }
      default:
        break;
    }
  };

  const handleRun = () => {
    if (!project) return;
    sessionStorage.setItem('generated-files', JSON.stringify(fileTree));
    sessionStorage.setItem('generated-code', fileTree.map((file) => file.content || '').join('\n\n'));
    sessionStorage.removeItem('generated-job-id');
    navigate('/preview?workspace=1');
  };

  const handleExport = async () => {
    if (!projectId || !project) return;
    const archive = await projectService.exportProject(projectId, 'zip');
    const url = URL.createObjectURL(archive);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || project.id}.zip`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = async () => {
    if (!projectId || !project) return;
    const prompt = regenerationRequest.trim();
    if (!prompt) return;
    setShowRegenerationDialog(false);
    setIsRegenerating(true);
    setRegenerationProgress(0);
    try {
      const regeneration = await projectService.regenerateProject(projectId, prompt, selectedProtectedPaths);
      for (let attempt = 0; attempt < 360; attempt++) {
        const status = await generationService.getGenerationStatus(regeneration.generationId);
        setRegenerationProgress(status.progress);
        if (status.status === 'failed' || status.status === 'cancelled') throw new Error(status.error || 'Regeneration failed');
        if (status.status === 'ready') {
          const loadedProject = await projectService.getProject(projectId);
          const nodes = (loadedProject.files || []).map(file => ({ ...file, type: 'file' as const, content: file.content || '' }));
          setActiveProject({ ...loadedProject, files: nodes });
          setFileTree(nodes);
          setOpenFiles(current => current.map(open => nodes.find(node => node.id === open.id) as OpenFile || open));
          if (showHistory) await loadHistory();
          setRegenerationRequest('');
          setSelectedProtectedPaths([]);
          toast.success(`Regeneration complete. ${regeneration.protectedFiles} edited paths preserved.`);
          return;
        }
        await new Promise(resolve => window.setTimeout(resolve, 2000));
      }
      throw new Error('Regeneration timeout');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Regeneration failed');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRestoreRevision = async (revision: ProjectRevision) => {
    if (!projectId || revision.type === 'regenerate' || revision.type === 'restore') return;
    if (!window.confirm(`Restore this ${revision.type} revision?`)) return;
    setIsRestoringRevision(true);
    try {
      const result = await projectService.restoreProjectRevision(projectId, revision.id);
      const nodes = (result.project.files || []).map(file => ({ ...file, type: 'file' as const, content: file.content || '' }));
      setActiveProject({ ...result.project, files: nodes });
      setFileTree(nodes);
      setOpenFiles(current => current.flatMap(open => {
        const updated = nodes.find(node => node.id === open.id);
        return updated ? [{ ...updated, content: updated.content || '' } as OpenFile] : [];
      }));
      if (activeFileId && !nodes.some(node => node.id === activeFileId)) setActiveFileId(null);
      await loadHistory();
      toast.success('Revision restored');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to restore revision');
    } finally {
      setIsRestoringRevision(false);
    }
  };

  // Get active file
  const activeFile = openFiles.find((f: OpenFile) => f.id === activeFileId);

  // Get preview content
  const getPreviewContent = () => {
    const htmlFile = openFiles.find((f: OpenFile) => f.name.endsWith('.html'));
    const cssFile = openFiles.find((f: OpenFile) => f.name.endsWith('.css'));
    const jsFile = openFiles.find((f: OpenFile) => f.name.endsWith('.js') || f.name.endsWith('.jsx'));

    return {
      html: htmlFile?.content || activeFile?.content || '',
      css: cssFile?.content || '',
      javascript: jsFile?.content || '',
    };
  };

  const previewContent = getPreviewContent();

  if (isLoadingProject) {
    return (
      <Navigation>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-foreground-muted">Loading editor...</div>
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation showSidebar={false} showFooter={false}>
      <div className="h-screen flex flex-col bg-background">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-background-surface border-b border-primary/20">
          {/* Left - Project Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFileTree(!showFileTree)}
              className="p-2 rounded-lg hover:bg-background-elevated transition-colors"
              aria-label="Toggle file tree"
            >
              <Menu className="w-5 h-5 text-foreground-muted" />
            </button>

            <div>
              <h1 className="text-lg font-bold text-foreground">{project?.name}</h1>
              <p className="text-xs text-foreground-muted">{project?.framework} • {project?.language}</p>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleFileSave(activeFile?.content || '')}
              disabled={isSaving || !activeFile}
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save
            </Button>

            <Button
              onClick={handleRun}
              variant="secondary"
              size="sm"
              leftIcon={<Play className="w-4 h-4" />}
            >
              Run
            </Button>

            <Button
              onClick={() => void handleExport().catch(() => toast.error('Falha ao exportar o projeto'))}
              variant="ghost"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export
            </Button>

            <Button
              onClick={() => {
                setShowHistory(current => !current);
                setShowComments(false);
              }}
              variant={showHistory ? 'primary' : 'ghost'}
              size="sm"
              leftIcon={<History className="w-4 h-4" />}
            >
              History
            </Button>

            <Button
              onClick={() => {
                setShowComments(current => !current);
                setShowHistory(false);
              }}
              variant={showComments ? 'primary' : 'ghost'}
              size="sm"
              disabled={!activeFile}
              leftIcon={<MessageSquare className="w-4 h-4" />}
            >
              Comments
            </Button>

            <Button
              onClick={() => setShowRegenerationDialog(true)}
              variant="secondary"
              size="sm"
              isLoading={isRegenerating}
              leftIcon={<WandSparkles className="w-4 h-4" />}
            >
              {isRegenerating ? `${regenerationProgress}%` : 'Regenerate'}
            </Button>
          </div>

          {showHistory && (
            <aside className="fixed bottom-0 right-0 top-16 z-40 flex w-[30rem] flex-col border-l border-primary/20 bg-background-surface shadow-2xl">
              <div className="flex items-center justify-between border-b border-primary/20 px-4 py-3">
                <div>
                  <h2 className="font-semibold text-foreground">Workspace history</h2>
                  <p className="text-xs text-foreground-muted">{revisions.length} saved changes</p>
                </div>
                <button onClick={() => setShowHistory(false)} className="rounded-lg p-2 text-foreground-muted hover:bg-background-elevated" aria-label="Close history">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid min-h-0 flex-1 grid-cols-[11rem_1fr]">
                <div className="overflow-y-auto border-r border-primary/20 p-2">
                  {isLoadingHistory ? (
                    <p className="p-3 text-xs text-foreground-muted">Loading history...</p>
                  ) : revisions.length === 0 ? (
                    <p className="p-3 text-xs leading-5 text-foreground-muted">Changes saved in the editor will appear here.</p>
                  ) : revisions.map((revision) => (
                    <button
                      key={revision.id}
                      onClick={() => setSelectedRevision(revision)}
                      className={clsx(
                        'mb-1 w-full rounded-lg px-3 py-2 text-left transition-colors',
                        selectedRevision?.id === revision.id ? 'bg-primary/15 text-primary' : 'text-foreground-muted hover:bg-background-elevated hover:text-foreground'
                      )}
                    >
                      <span className="block truncate text-xs font-semibold capitalize">{revision.type}</span>
                      <span className="mt-1 block truncate text-[11px]">{revision.path}</span>
                      <span className="mt-1 block text-[10px] opacity-70">{new Date(revision.createdAt).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
                <div className="min-w-0 overflow-y-auto p-4">
                  {selectedRevision ? (
                    <RevisionDiff
                      revision={selectedRevision}
                      isRestoring={isRestoringRevision}
                      onRestore={handleRestoreRevision}
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-foreground-muted">Select a revision</div>
                  )}
                </div>
              </div>
            </aside>
          )}

          {showComments && activeFile && (
            <aside className="fixed bottom-0 right-0 top-16 z-40 flex w-[26rem] flex-col border-l border-primary/20 bg-background-surface p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground">File discussion</h2>
                  <p className="truncate text-xs text-foreground-muted">{activeFile.path}</p>
                </div>
                <button onClick={() => setShowComments(false)} className="rounded-lg p-2 text-foreground-muted hover:bg-background-elevated" aria-label="Close comments">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {isLoadingComments ? (
                <div className="grid flex-1 place-items-center text-sm text-foreground-muted">Loading comments...</div>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <CommentThread
                    threadId={`${collaborationSessionId}:${activeFile.path}`}
                    comments={comments.map((comment): Comment => ({
                      id: comment.commentId,
                      userId: comment.userId,
                      userName: comment.username,
                      content: comment.content,
                      timestamp: new Date(comment.createdAt),
                      ...(comment.updatedAt !== comment.createdAt ? { editedAt: new Date(comment.updatedAt) } : {}),
                      ...(comment.parentId ? { parentId: comment.parentId } : {}),
                    }))}
                    currentUserId={user?.id || ''}
                    filePath={activeFile.path}
                    isResolved={comments.length > 0 && comments.every(comment => Boolean(comment.resolvedAt))}
                    onAddComment={handleAddComment}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    onResolveThread={handleResolveComments}
                  />
                </div>
              )}
            </aside>
          )}
        </div>

        {showRegenerationDialog && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-6 backdrop-blur-sm">
            <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-primary/25 bg-background-surface shadow-2xl">
              <div className="flex items-start justify-between border-b border-primary/20 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-foreground">Evolve project</h2>
                  <p className="mt-1 text-xs text-foreground-muted">Edited history remains protected. Select any additional files that must stay unchanged.</p>
                </div>
                <button onClick={() => setShowRegenerationDialog(false)} className="rounded-lg p-2 text-foreground-muted hover:bg-background-elevated" aria-label="Close regeneration dialog">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 space-y-5 overflow-y-auto p-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-foreground">Requested change</span>
                  <textarea
                    value={regenerationRequest}
                    onChange={event => setRegenerationRequest(event.target.value)}
                    rows={5}
                    className="w-full resize-y rounded-xl border border-primary/25 bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    placeholder="Describe the feature, behavior or visual change to implement"
                  />
                </label>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Protected files</span>
                    <span className="text-xs text-foreground-muted">{selectedProtectedPaths.length} additional</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto rounded-xl border border-primary/20 bg-background p-2">
                    {fileTree.map(file => {
                      const automatic = project?.protectedPaths?.includes(file.path) || false;
                      const selected = automatic || selectedProtectedPaths.includes(file.path);
                      return (
                        <label key={file.id} className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground-muted hover:bg-background-elevated">
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={automatic}
                            onChange={event => setSelectedProtectedPaths(paths => event.target.checked
                              ? [...paths, file.path]
                              : paths.filter(path => path !== file.path))}
                            className="h-4 w-4 accent-primary"
                          />
                          <span className="min-w-0 flex-1 truncate">{file.path}</span>
                          {automatic && <span className="text-[10px] uppercase tracking-wider text-primary">history</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-primary/20 px-5 py-4">
                <Button variant="ghost" size="sm" onClick={() => setShowRegenerationDialog(false)}>Cancel</Button>
                <Button size="sm" onClick={() => void handleRegenerate()} disabled={regenerationRequest.trim().length < 10}>Evolve and certify</Button>
              </div>
            </div>
          </div>
        )}

        {/* Editor Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* File Tree Pane */}
          {showFileTree && (
            <div className="w-64 h-full border-r border-primary/20 overflow-hidden">
              <FileTree
                files={fileTree}
                selectedFileId={activeFileId ?? undefined} // ✅ CORREÇÃO AQUI
                onFileSelect={handleFileSelect}
                onFileContextMenu={handleFileContextMenu}
              />
            </div>
          )}

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Code Editor */}
            <div className="flex-1 overflow-hidden">
              {activeFile ? (
                <CodeEditor
                  value={activeFile.content}
                  language={
                    activeFile.name.endsWith('.ts') || activeFile.name.endsWith('.tsx')
                      ? 'typescript'
                      : activeFile.name.endsWith('.js') || activeFile.name.endsWith('.jsx')
                      ? 'javascript'
                      : activeFile.name.endsWith('.json')
                      ? 'json'
                      : activeFile.name.endsWith('.css')
                      ? 'css'
                      : activeFile.name.endsWith('.html')
                      ? 'html'
                      : 'plaintext'
                  }
                  onChange={handleFileChange}
                  onSave={handleFileSave}
                  height="100%"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-foreground-muted">
                  Select a file to start editing
                </div>
              )}
            </div>

            {/* Preview or Terminal */}
            {showPreview && (
              <div className="h-80 border-t border-primary/20 overflow-hidden">
                <PreviewPane
                  html={previewContent.html}
                  css={previewContent.css}
                  javascript={previewContent.javascript}
                  hotReload={true}
                />
              </div>
            )}

            {showTerminal && !showPreview && (
              <div className="h-80 border-t border-primary/20 overflow-hidden">
                <Terminal
                  cwd={`/projects/${projectId}`}
                  onClose={() => setShowTerminal(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar - Terminal Toggle */}
        <div className="flex items-center justify-between px-4 py-2 bg-background-surface border-t border-primary/20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowTerminal(!showTerminal);
                if (showTerminal) setShowPreview(true);
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                showTerminal
                  ? 'bg-primary text-background'
                  : 'text-foreground-muted hover:bg-background-elevated'
              )}
            >
              Terminal
            </button>

            <button
              onClick={() => {
                setShowPreview(!showPreview);
                if (showPreview) setShowTerminal(true);
              }}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                showPreview
                  ? 'bg-primary text-background'
                  : 'text-foreground-muted hover:bg-background-elevated'
              )}
            >
              Preview
            </button>
          </div>

          <div className="text-xs text-foreground-muted">
            {activeFile && `${activeFile.path} • ${activeFile.content?.length || 0} characters`}
          </div>
        </div>
      </div>
    </Navigation>
  );
};

const RevisionDiff: React.FC<{
  revision: ProjectRevision;
  isRestoring: boolean;
  onRestore: (revision: ProjectRevision) => Promise<void>;
}> = ({ revision, isRestoring, onRestore }) => {
  const before = revision.contentBefore?.split('\n') || [];
  const after = revision.contentAfter?.split('\n') || [];
  const lineCount = Math.max(before.length, after.length);
  const restorable = revision.type !== 'regenerate' && revision.type !== 'restore';

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{revision.type}</p>
        <h3 className="mt-1 text-sm font-semibold text-foreground">{revision.summary}</h3>
        {revision.previousPath && <p className="mt-2 break-all text-xs text-foreground-muted">{revision.previousPath} → {revision.path}</p>}
        <Button
          onClick={() => void onRestore(revision)}
          disabled={!restorable || isRestoring}
          isLoading={isRestoring}
          size="sm"
          variant="secondary"
          className="mt-3"
        >
          {restorable ? 'Restore revision' : 'Restore unavailable'}
        </Button>
      </div>
      {(revision.contentBefore !== undefined || revision.contentAfter !== undefined) && (
        <div className="overflow-hidden rounded-lg border border-primary/20 bg-background font-mono text-[11px]">
          {Array.from({ length: lineCount }, (_, index) => {
            const previous = before[index];
            const next = after[index];
            const changed = previous !== next;
            return (
              <div key={index} className="grid grid-cols-2 border-b border-primary/10 last:border-b-0">
                <div className={clsx('min-h-7 whitespace-pre-wrap break-all px-2 py-1 text-foreground-muted', changed && 'bg-error/10 text-error')}>{previous ?? ''}</div>
                <div className={clsx('min-h-7 whitespace-pre-wrap break-all border-l border-primary/10 px-2 py-1 text-foreground-muted', changed && 'bg-success/10 text-success')}>{next ?? ''}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * EXPORT MANIFEST
 * ============================================================================
 * PRIMARY_EXPORT: EditorPage (Full editor page)
 * NAMED_EXPORTS: None
 * DEFAULT_AVAILABLE: false
 * COMPATIBILITY: internal
 * ============================================================================
 */
