/**
 * ============================================================================
 * ORUS BUILDER - FOOTER COMPONENT
 * ============================================================================
 * 
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2025-10-09T21:05:00-03:00
 * LAST_MODIFIED: 2025-10-09T21:05:00-03:00
 * COMPONENT_HASH: orus.frontend.component.footer.20251009.FTR9T0U1
 * 
 * PURPOSE:
 * - Application footer with links and branding
 * - Social media links
 * - Copyright and version info
 * - Responsive layout
 * 
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: InformationDisplayAgent
 * - COGNITIVE_LEVEL: Basic
 * - AUTONOMY_DEGREE: 60
 * - TRINITY_INTEGRATED: None (Pure UI)
 * ============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Sparkles } from 'lucide-react';

// ============================================================================
// FOOTER COMPONENT
// ============================================================================

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-surface border-t border-primary/20 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-cognitive">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <span className="text-lg font-bold bg-gradient-cognitive bg-clip-text text-transparent">
                ORUS Builder
              </span>
            </div>
            <p className="text-sm text-foreground-muted">
              Plataforma cognitiva de geração, certificação e manutenção de aplicações.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/generate" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                  New project
                </Link>
              </li>
              <li>
                <Link to="/blueprints" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                  Blueprints
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/OrusMind/Orus-Builder-FullStack/tree/main/docs" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Documentation</a>
              </li>
              <li>
                <a href="https://github.com/OrusMind/Orus-Builder-FullStack" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Source code</a>
              </li>
              <li>
                <a href="https://github.com/OrusMind/Orus-Builder-FullStack/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Issues</a>
              </li>
              <li>
                <a href="https://github.com/OrusMind/Orus-Builder-FullStack/discussions" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Discussions</a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Project</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/OrusMind/Orus-Builder-FullStack#readme" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-muted hover:text-foreground transition-colors">About ORUS</a>
              </li>
              <li>
                <a href="https://github.com/OrusMind/Orus-Builder-FullStack/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Contributing</a>
              </li>
              <li>
                <a href="https://github.com/OrusMind/Orus-Builder-FullStack/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-muted hover:text-foreground transition-colors">Security</a>
              </li>
              <li>
                <a href="https://github.com/OrusMind/Orus-Builder-FullStack/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground-muted hover:text-foreground transition-colors">License</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-foreground-muted">
            © {currentYear} ORUS Builder. Open source under the repository license.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/OrusMind/Orus-Builder-FullStack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground-muted hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

/**
 * EXPORT MANIFEST
 * ============================================================================
 * PRIMARY_EXPORT: Footer (Application footer)
 * NAMED_EXPORTS: None
 * DEFAULT_AVAILABLE: false
 * COMPATIBILITY: internal
 * ============================================================================
 */
