import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps { children: React.ReactNode; }
interface ScreenLayoutEntry { route: string; layout: string; }

const SCREEN_LAYOUTS: readonly ScreenLayoutEntry[] = [
  {
    "route": "/",
    "layout": "editorial-overview"
  },
  {
    "route": "/obras",
    "layout": "catalog"
  },
  {
    "route": "/emprestimos",
    "layout": "kanban"
  },
  {
    "route": "/devolucao",
    "layout": "timeline"
  },
  {
    "route": "/reservas",
    "layout": "kanban"
  },
  {
    "route": "/multas",
    "layout": "analytics"
  }
];
const WIDE_LAYOUTS = new Set(['kanban', 'calendar', 'analytics', 'conversation', 'asset-library', 'gallery', 'immersive-canvas', 'command-center', 'revenue-overview', 'wealth-overview', 'care-hub', 'commerce-pulse', 'automation-studio', 'permission-matrix']);
const FOCUSED_LAYOUTS = new Set(['checkout', 'stepper', 'split-focus', 'billing', 'payment-operations', 'editorial-overview']);

function resolveScreenLayout(pathname: string) {
  const exact = SCREEN_LAYOUTS.find(screen => screen.route === pathname);
  if (exact) return exact.layout;
  const nested = SCREEN_LAYOUTS
    .filter(screen => screen.route !== '/' && !screen.route.includes(':'))
    .sort((left, right) => right.route.length - left.route.length)
    .find(screen => pathname.startsWith(screen.route + '/'));
  return nested?.layout || 'default';
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const screenLayout = resolveScreenLayout(pathname);
  const frameClassName = WIDE_LAYOUTS.has(screenLayout)
    ? 'w-full max-w-none'
    : FOCUSED_LAYOUTS.has(screenLayout)
      ? 'mx-auto max-w-5xl'
      : 'mx-auto max-w-5xl';

  return (
    <div className="min-h-screen bg-[rgb(var(--orus-page))]" data-shell="top-navigation" data-action-placement="navigation">
      <Navbar />
      <main className={
        frameClassName +
        ' px-4 py-7 sm:px-6 lg:px-10 lg:py-10'
      } data-screen-layout={screenLayout}>
        {children}
      </main>
    </div>
  );
}