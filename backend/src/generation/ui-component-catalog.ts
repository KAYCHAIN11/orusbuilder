import type { VisualIntent } from './visual-intent';

export type UIComponentCategory =
  | 'navigation'
  | 'layout'
  | 'input'
  | 'data-display'
  | 'feedback'
  | 'marketing';

export interface UIComponentRecipe {
  id: string;
  category: UIComponentCategory;
  variants: string[];
  states: string[];
  purpose: string;
}

/**
 * Active UI vocabulary used by the generator.
 * Unlike templates/component-library.ts, this catalog is imported by the
 * current pipeline and describes complete UI states, not placeholder markup.
 */
export const UI_COMPONENT_CATALOG: UIComponentRecipe[] = [
  { id: 'app-shell', category: 'layout', variants: ['topbar', 'sidebar'], states: ['desktop', 'mobile'], purpose: 'Application frame and responsive navigation' },
  { id: 'hero', category: 'marketing', variants: ['centered', 'split', 'editorial'], states: ['default'], purpose: 'Primary value proposition and actions' },
  { id: 'button', category: 'input', variants: ['primary', 'secondary', 'ghost', 'danger'], states: ['default', 'hover', 'focus', 'disabled', 'loading'], purpose: 'Actions with a clear hierarchy' },
  { id: 'text-field', category: 'input', variants: ['default', 'search', 'with-icon'], states: ['default', 'focus', 'invalid', 'disabled'], purpose: 'Accessible text input' },
  { id: 'select', category: 'input', variants: ['default', 'combobox'], states: ['default', 'open', 'invalid', 'disabled'], purpose: 'Single or searchable selection' },
  { id: 'card', category: 'data-display', variants: ['standard', 'interactive', 'media', 'metric'], states: ['default', 'hover', 'selected', 'loading'], purpose: 'Grouped information and actions' },
  { id: 'data-table', category: 'data-display', variants: ['comfortable', 'compact'], states: ['loading', 'empty', 'populated', 'error'], purpose: 'Scannable structured records' },
  { id: 'kanban', category: 'data-display', variants: ['workflow', 'priority'], states: ['loading', 'empty', 'populated', 'dragging'], purpose: 'Work organized by stage and status' },
  { id: 'calendar', category: 'data-display', variants: ['agenda', 'week'], states: ['loading', 'empty', 'populated', 'selected'], purpose: 'Time-based work and appointments' },
  { id: 'timeline', category: 'data-display', variants: ['activity', 'milestone'], states: ['loading', 'empty', 'populated'], purpose: 'Chronological progress and history' },
  { id: 'catalog', category: 'data-display', variants: ['product-grid', 'collection'], states: ['loading', 'empty', 'populated', 'filtered'], purpose: 'Visual product discovery' },
  { id: 'ledger', category: 'data-display', variants: ['transactions', 'portfolio'], states: ['loading', 'empty', 'populated', 'filtered'], purpose: 'Financial movement and balances' },
  { id: 'gallery', category: 'data-display', variants: ['masonry', 'case-study'], states: ['loading', 'empty', 'populated', 'selected'], purpose: 'Visual work and media presentation' },
  { id: 'chart', category: 'data-display', variants: ['trend', 'distribution', 'comparison'], states: ['loading', 'empty', 'populated'], purpose: 'Visual performance and change' },
  { id: 'stat', category: 'data-display', variants: ['plain', 'trend', 'progress'], states: ['loading', 'populated'], purpose: 'Key performance indicators' },
  { id: 'badge', category: 'data-display', variants: ['neutral', 'success', 'warning', 'danger'], states: ['default'], purpose: 'Status and compact metadata' },
  { id: 'empty-state', category: 'feedback', variants: ['first-use', 'no-results', 'error'], states: ['default'], purpose: 'Actionable absence of data' },
  { id: 'toast', category: 'feedback', variants: ['success', 'info', 'warning', 'error'], states: ['enter', 'visible', 'exit'], purpose: 'Non-blocking operation feedback' },
  { id: 'dialog', category: 'feedback', variants: ['confirmation', 'form', 'detail'], states: ['open', 'closing'], purpose: 'Focused decisions and workflows' },
  { id: 'skeleton', category: 'feedback', variants: ['text', 'card', 'table'], states: ['loading'], purpose: 'Layout-stable loading feedback' },
  { id: 'feature-grid', category: 'marketing', variants: ['three-column', 'bento'], states: ['default'], purpose: 'Product capability storytelling' },
  { id: 'testimonial', category: 'marketing', variants: ['quote', 'logo-wall'], states: ['default'], purpose: 'Trust and social proof' },
  { id: 'cta', category: 'marketing', variants: ['banner', 'contained'], states: ['default', 'submitted'], purpose: 'Conversion-focused final action' },
];

export function planUIComponents(
  intent: VisualIntent,
  generationType?: 'LANDING_PAGE' | 'COMPONENT'
): string[] {
  if (generationType === 'LANDING_PAGE') {
    return ['hero', 'feature-grid', 'testimonial', 'cta', 'button', 'text-field'];
  }

  if (generationType === 'COMPONENT') {
    return ['card', 'button', 'badge', 'skeleton'];
  }

  const application = [
    'app-shell', 'button', 'text-field', 'select', 'card', 'data-table',
    'stat', 'badge', 'empty-state', 'toast', 'dialog', 'skeleton',
  ];

  application.push(intent.experience.primaryDataView);
  if (intent.experience.hierarchy === 'metric-first') application.push('chart');

  if (intent.archetype === 'commerce') application.push('feature-grid');
  return [...new Set(application)];
}

