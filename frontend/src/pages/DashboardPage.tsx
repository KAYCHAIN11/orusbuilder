/**
 * ============================================================================
 * ORUS BUILDER - DASHBOARD PAGE
 * ============================================================================
 * 
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-09T21:19:00-03:00
 * LAST_MODIFIED: 2025-10-09T21:19:00-03:00
 * COMPONENT_HASH: orus.frontend.page.dashboard.20251009.DSH7C8D9
 * 
 * PURPOSE:
 * - Main dashboard page with project overview
 * - Quick actions and statistics
 * - Recent activity and generation history
 * - Trinity AI status display
 * 
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: DashboardOrchestratorAgent
 * - COGNITIVE_LEVEL: Intermediate
 * - AUTONOMY_DEGREE: 75
 * - TRINITY_INTEGRATED: Full (Status Display)
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Sparkles,
  TrendingUp,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Navigation } from '@components/layout/Navigation';
import { Button } from '@components/common/Button';
import { Loading } from '@components/common/Loading';
import { ProjectCard } from '@components/project/ProjectCard'; 
import { useProjectStore } from '@store/project.store';
import { useAuthStore } from '@store/auth.store';
import generationService from '@services/generation.service';
import projectService from '@services/project.service';
import toast from 'react-hot-toast';
import type { Project } from '@/types/api.types';
// ============================================================================
// TYPES
// ============================================================================
interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  certifiedProjects: number;
  successRate: number;
}

interface TrinityHealth {
  status: 'online' | 'offline';
  latency: number;
}

// ============================================================================
// DASHBOARD PAGE COMPONENT
// ============================================================================

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { projects, setProjects, setLoading, isLoading } = useProjectStore();

  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    certifiedProjects: 0,
    successRate: 0,
  });

  const [trinityHealth, setTrinityHealth] = useState<TrinityHealth | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  // Dashboard data is loaded once when the page is mounted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const loadDashboardData = async () => {
  setLoading(true);

  try {
  const projectList = await projectService.getProjects();
  const realProjects = projectList.projects;

  setProjects(realProjects);
  const readyProjects = realProjects.filter((project) => String(project.status) === 'ready').length;
  setStats({
    totalProjects: projectList.total,
    activeProjects: realProjects.filter((project) => !['error', 'archived'].includes(String(project.status))).length,
    certifiedProjects: readyProjects,
    successRate: realProjects.length > 0 ? Math.round((readyProjects / realProjects.length) * 100) : 0,
  });

  try {
    const health = await generationService.checkTrinityHealth();
    setTrinityHealth(health);
  } catch {
    setTrinityHealth(null);
  }

  setRecentActivity(
    realProjects.slice(0, 3).map((p: Project) => ({
      id: p.id,
      type: 'generation',
      message: `Saved ${p.name}`,
      timestamp: new Date(p.createdAt),
    }))
  );

  } catch (error) {
    console.error('Failed to load dashboard:', error);
    toast.error('Failed to load dashboard data');
    setProjects([]);
    setStats({
      totalProjects: 0,
      activeProjects: 0,
      certifiedProjects: 0,
      successRate: 0,
    });
  } finally {
    setLoading(false);
  }
};

  const handleNewProject = () => {
    navigate('/generate');
  };

  if (isLoading) {
    return (
      <Navigation>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading variant="neural" size="lg" message="Loading dashboard..." />
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <div className="space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-foreground-muted">
            Let's build something amazing with Trinity AI
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4"
        >
          <Button
            onClick={handleNewProject}
            size="lg"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            New Project
          </Button>

          <Button
            onClick={() => navigate('/blueprints')}
            variant="secondary"
            size="lg"
          >
            Open Blueprints
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <StatCard
            icon={<Sparkles className="w-6 h-6" />}
            label="Total Projects"
            value={stats.totalProjects}
            color="text-primary"
          />

          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Active Projects"
            value={stats.activeProjects}
            color="text-accent"
          />

          <StatCard
            icon={<Zap className="w-6 h-6" />}
            label="Certified Projects"
            value={stats.certifiedProjects}
            color="text-secondary"
          />

          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Ready Now"
            value={`${stats.successRate}%`}
            color="text-accent"
          />
        </motion.div>

        {/* Trinity Health Status */}
        {trinityHealth && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-lg bg-background-surface border border-primary/20"
          >
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Trinity AI Status
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <TrinityStatusCard
                name="Trinity Engine"
                status={trinityHealth.status}
                latency={trinityHealth.latency}
              />
              <div className="rounded-lg border border-primary/20 bg-background p-4 text-sm leading-6 text-foreground-muted">
                ALMA, CÉREBRO e VOZ representam responsabilidades cognitivas coordenadas pela engine Trinity. O indicador reflete a saúde da engine conectada, sem simular estados independentes.
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Recent Projects</h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/projects')}
            >
              View All
            </Button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 bg-background-surface rounded-lg border border-primary/20">
              <Sparkles className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No projects yet
              </h3>
              <p className="text-foreground-muted mb-6">
                Start building your first project with Trinity AI
              </p>
              <Button onClick={handleNewProject} leftIcon={<Plus className="w-5 h-5" />}>
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => navigate(`/projects/${project.id}`)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-lg bg-background-surface border border-primary/20"
        >
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Activity
          </h2>

          {recentActivity.length === 0 ? (
            <p className="text-foreground-muted">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-background-elevated transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                    {activity.type === 'generation' ? (
                      <Sparkles className="w-5 h-5 text-primary" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-accent" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.message}
                    </p>
                    <p className="text-xs text-foreground-muted mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Navigation>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="p-6 rounded-lg bg-background-surface border border-primary/20">
    <div className={`mb-3 ${color}`}>{icon}</div>
    <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
    <div className="text-sm text-foreground-muted">{label}</div>
  </div>
);

interface TrinityStatusCardProps {
  name: string;
  status: 'online' | 'offline';
  latency: number;
}

const TrinityStatusCard: React.FC<TrinityStatusCardProps> = ({ name, status, latency }) => (
  <div className="p-4 rounded-lg bg-background border border-primary/20">
    <div className="flex items-center justify-between mb-2">
      <span className="font-semibold text-foreground">{name}</span>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'online' ? 'bg-accent animate-pulse' : 'bg-error'
          }`}
        />
        <span className="text-sm text-foreground-muted capitalize">{status}</span>
      </div>
    </div>
    <div className="text-xs text-foreground-muted">
      Latency: <span className="text-foreground font-medium">{latency}ms</span>
    </div>
  </div>
);

/**
 * EXPORT MANIFEST
 * ============================================================================
 * PRIMARY_EXPORT: DashboardPage (Main dashboard page)
 * NAMED_EXPORTS: None
 * DEFAULT_AVAILABLE: false
 * COMPATIBILITY: internal
 * ============================================================================
 */
