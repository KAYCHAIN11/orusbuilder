import { NavLink, Link } from 'react-router-dom';



export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]/95 backdrop-blur-xl" data-navigation="top-navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-[rgb(var(--orus-text))]">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))]">
              <svg className="h-5 w-5 text-[rgb(var(--orus-on-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Orus Studio
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>
              Visão geral
            </NavLink>
      <NavLink to="/obras" className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Catálogo de obras</NavLink>
      <NavLink to="/emprestimos" className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Empréstimos com prazo</NavLink>
      <NavLink to="/devolucao" className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Devolução</NavLink>
      <NavLink to="/reservas" className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Reservas</NavLink>
      <NavLink to="/multas" className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Cálculo automático de multas</NavLink>
            <Link to="/obras/new" className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--orus-primary))] px-4 py-2 text-sm font-bold text-[rgb(var(--orus-on-primary))]">＋ Novo</Link>

          </div>
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] p-2.5 text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]" aria-label="Open navigation">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </summary>
            <div className="absolute right-0 top-12 max-h-[70vh] w-64 overflow-y-auto rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-2 shadow-2xl">
              <NavLink to="/" end className={({ isActive }) => `block rounded-[var(--orus-radius)] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]'}`}>Visão geral</NavLink>
            <NavLink to="/obras" className={({ isActive }) => `block rounded-[var(--orus-radius)] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Catálogo de obras</NavLink>
            <NavLink to="/emprestimos" className={({ isActive }) => `block rounded-[var(--orus-radius)] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Empréstimos com prazo</NavLink>
            <NavLink to="/devolucao" className={({ isActive }) => `block rounded-[var(--orus-radius)] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Devolução</NavLink>
            <NavLink to="/reservas" className={({ isActive }) => `block rounded-[var(--orus-radius)] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Reservas</NavLink>
            <NavLink to="/multas" className={({ isActive }) => `block rounded-[var(--orus-radius)] px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))] hover:text-[rgb(var(--orus-text))]'}`}>Cálculo automático de multas</NavLink>
              <Link to="/obras/new" className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--orus-primary))] px-4 py-2 text-sm font-bold text-[rgb(var(--orus-on-primary))]">＋ Novo</Link>

            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}