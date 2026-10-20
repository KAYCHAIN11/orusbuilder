/**
 * ============================================================================
 * ORUS BUILDER - PROJECT PAGE (WORKSPACE) - FIXED
 * ============================================================================
 * 
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-10T09:56:00-03:00
 * LAST_MODIFIED: 2025-10-10T10:13:00-03:00
 * COMPONENT_HASH: orus.frontend.page.project.20251010.PRJ8Y9Z0.FIXED
 * 
 * PURPOSE:
 * - Project workspace page
 * - Combine editor + chat + activity
 * - Real-time collaboration
 * - Project management interface
 * 
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: ProjectWorkspaceAgent
 * - COGNITIVE_LEVEL: Advanced
 * - AUTONOMY_DEGREE: 80
 * - TRINITY_INTEGRATED: Full (Collaborative workspace)
 * 
 * FIXES APPLIED:
 * ✅ Changed all toast.info() to toast.success()
 * ✅ Removed duplicate Split import
 * ✅ Fixed Split component usage (using default Split)
 * ✅ Removed unused setShowSidebar and setOnlineUsers
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Split from 'react-split';
import {
  Code,
  MessageSquare,
  Activity,
  Users,
  Settings,
  Play,
  Download,
} from 'lucide-react';
import { Navigation } from '@components/layout/Navigation';
import { Chat } from '@components/collaboration/Chat';
import { ActivityFeed, type ActivityItem } from '@components/collaboration/ActivityFeed';
import { Button } from '@components/common/Button';
import { Avatar } from '@components/common/Avatar';
import { useProjectStore } from '@store/project.store';
import projectService, { type ProjectRevision } from '@services/project.service';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/auth.store';
import collaborationService, { type CollaborationParticipant } from '@services/collaboration.service';

// ============================================================================
// PROJECT PAGE COMPONENT
// ============================================================================

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, activeProject, setActiveProject } = useProjectStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [revisions, setRevisions] = useState<ProjectRevision[]>([]);
  const [participants, setParticipants] = useState<CollaborationParticipant[]>([]);

  const [activeTab, setActiveTab] = useState<'chat' | 'activity'>('chat');
  const [showSidebar] = useState(true); // ✅ FIXED: Removed setShowSidebar (unused)
  const onlineUsers = participants.map(participant => ({
    id: participant.userId,
    name: participant.username,
    avatar: participant.userId === user?.id ? user.avatar || '' : '',
    status: participant.status === 'active' ? 'online' as const : 'away' as const,
  }));

  const project = activeProject?.id === projectId
    ? activeProject
    : projects.find((item) => item.id === projectId);

  const activities: ActivityItem[] = revisions.map(revision => ({
    id: revision.id,
    type: revision.type === 'delete'
      ? 'file_deleted'
      : revision.type === 'duplicate'
        ? 'file_created'
        : revision.type === 'regenerate'
          ? 'generation_completed'
          : 'file_updated',
    userId: revision.userId,
    userName: revision.userId === user?.id ? user.name : revision.userId,
    action: revision.summary,
    targetName: revision.path,
    timestamp: new Date(revision.createdAt),
  }));

  useEffect(() => {
    let active = true;
    if (!projectId) {
      navigate('/projects');
      return () => { active = false; };
    }
    setIsLoading(true);
    void Promise.all([projectService.getProject(projectId), projectService.getProjectHistory(projectId)])
      .then(([loadedProject, history]) => {
        if (active) setActiveProject(loadedProject);
        if (active) setRevisions(history);
      })
      .catch(() => {
        if (!active) return;
        toast.error('Project not found');
        navigate('/projects');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [navigate, projectId, setActiveProject]);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;
    let sessionId = '';
    if (!projectId || !user) return () => { active = false; };
    const refresh = async () => {
      const session = await collaborationService.ensureSession(projectId);
      sessionId = session.sessionId;
      await collaborationService.updatePresence(sessionId, 'active');
      const next = await collaborationService.getParticipants(sessionId);
      if (active) setParticipants(next);
    };
    void refresh()
      .then(() => {
        if (active) timer = window.setInterval(() => void refresh().catch(() => undefined), 5000);
      })
      .catch(() => undefined);
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
      if (sessionId) void collaborationService.updatePresence(sessionId, 'away').catch(() => undefined);
    };
  }, [projectId, user]);

  const handleRun = () => {
    if (!project) return;
    sessionStorage.setItem('generated-files', JSON.stringify(project.files || []));
    sessionStorage.setItem('generated-code', (project.files || []).map((file) => file.content || '').join('\n\n'));
    const certified = String(project.status) === 'ready' && project.generationId;
    if (certified) sessionStorage.setItem('generated-job-id', project.generationId!);
    else sessionStorage.removeItem('generated-job-id');
    navigate(certified ? `/preview?generationId=${project.generationId}` : '/preview?workspace=1');
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

  if (isLoading) {
    return (
      <Navigation>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-foreground-muted">Loading project...</div>
        </div>
      </Navigation>
    );
  }

  if (!project) {
    return null;
  }

   return (
    <Navigation showSidebar={false} showFooter={false}>
      <div className="h-screen flex flex-col bg-background">
        {/* Project Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/20 bg-background-surface">
          {/* Left - Project Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              ← Back
            </button>

            <div>
              <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-foreground-muted">
                {project.framework} • {project.language}
              </p>
            </div>
          </div>

          {/* Center - Online Users */}
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-foreground-muted" />
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 3).map((user) => (
                <Avatar
                  key={user.id}
                  src={user.avatar}
                  name={user.name}
                  size="sm"
                  status={user.status}
                  className="ring-2 ring-background"
                />
              ))}
            </div>
            {onlineUsers.length > 3 && (
              <span className="text-sm text-foreground-muted">
                +{onlineUsers.length - 3} more
              </span>
            )}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate(`/editor/${projectId}`)}
              variant="secondary"
              size="sm"
              leftIcon={<Code className="w-4 h-4" />}
            >
              Open Editor
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

            <button
              onClick={() => navigate(`/settings?projectId=${projectId}`)}
              className="p-2 rounded-lg hover:bg-background-elevated transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-foreground-muted" />
            </button>
          </div>
        </div> {/* ✅ FECHAMENTO: Project Header */}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Main Area - Project Overview */}
            <div 
              className="flex flex-col p-6 overflow-y-auto"
              style={{ 
                width: showSidebar ? '70%' : '100%',
                transition: 'width 0.3s ease'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Project Description */}
                <div className="p-6 rounded-lg bg-background-surface border border-primary/20">
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    About This Project
                  </h2>
                  <p className="text-foreground-muted">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <StatCard
                    label="Files"
                    value={project.files?.length || 0}
                    icon={<Code className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Revisions"
                    value={revisions.length}
                    icon={<Activity className="w-5 h-5" />}
                  />
                  <StatCard
                    label="Certified"
                    value={String(project.status) === 'ready' ? 1 : 0}
                    icon={<Play className="w-5 h-5" />}
                  />
                </div>

                {/* Quick Actions */}
                <div className="p-6 rounded-lg bg-background-surface border border-primary/20">
                  <h2 className="text-lg font-semibold text-foreground mb-4">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => navigate(`/editor/${projectId}`)}
                      variant="secondary"
                      fullWidth
                      leftIcon={<Code className="w-4 h-4" />}
                    >
                      Open in Editor
                    </Button>
                    <Button
                      onClick={handleRun}
                      variant="secondary"
                      fullWidth
                      leftIcon={<Play className="w-4 h-4" />}
                    >
                      Run Project
                    </Button>
                    <Button
                      onClick={() => void handleExport().catch(() => toast.error('Falha ao exportar o projeto'))}
                      variant="secondary"
                      fullWidth
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() => navigate(`/settings?projectId=${projectId}`)}
                      variant="secondary"
                      fullWidth
                      leftIcon={<Settings className="w-4 h-4" />}
                    >
                      Settings
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div> {/* ✅ FECHAMENTO: Main Area */}

            {/* Sidebar - Chat/Activity */}
            {showSidebar && (
              <div 
                className="flex flex-col bg-background-surface border-l border-primary/20"
                style={{ width: '30%' }}
              >
                {/* Tabs */}
                <div className="flex border-b border-primary/20">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'chat'
                        ? 'text-foreground border-b-2 border-primary'
                        : 'text-foreground-muted hover:text-foreground'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'activity'
                        ? 'text-foreground border-b-2 border-primary'
                        : 'text-foreground-muted hover:text-foreground'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                    Activity
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'chat' ? (
                    <Chat
                      channelId={`project-${projectId}`}
                      userId={user?.id || 'anonymous'}
                      userName={user?.name || 'User'}
                      projectId={projectId}
                      maxHeight="100%"
                    />
                  ) : (
                    <ActivityFeed activities={activities} />
                  )}
                </div>
              </div>
            )}
          </div> {/* ✅ FECHAMENTO: flex h-full */}
        </div> {/* ✅ FECHAMENTO: Main Content */}
      </div> {/* ✅ FECHAMENTO: h-screen */}
    </Navigation>
  );

};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <div className="p-4 rounded-lg bg-background-surface border border-primary/20">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-foreground-muted">{label}</span>
      <div className="text-primary">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-foreground">{value}</div>
  </div>
);

/**
 * EXPORT MANIFEST
 * ============================================================================
 * PRIMARY_EXPORT: ProjectPage (Project workspace page)
 * NAMED_EXPORTS: None
 * DEFAULT_AVAILABLE: false
 * COMPATIBILITY: internal
 * ============================================================================
 */
