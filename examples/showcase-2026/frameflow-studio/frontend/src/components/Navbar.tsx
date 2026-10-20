import { NavLink, Link } from 'react-router-dom';



export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-4 z-40 px-4" data-navigation="floating-canvas"><div className="mx-auto flex max-w-5xl items-center gap-3 rounded-full border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]/90 p-2 pl-5 shadow-2xl backdrop-blur-xl"><Link to="/" className="mr-auto font-display font-black">FrameFlow Studio</Link><div className="hidden items-center gap-1 md:flex"><NavLink to="/" end className="rounded-full px-4 py-2 text-xs font-semibold">Visão geral</NavLink>          <NavLink to="/projects" className={({ isActive }) => `whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${isActive ? 'bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]'}`}>Projetos</NavLink>
          <NavLink to="/reviews" className={({ isActive }) => `whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${isActive ? 'bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]'}`}>Revisão</NavLink>
          <NavLink to="/customers" className={({ isActive }) => `whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${isActive ? 'bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]'}`}>Clientes</NavLink>
          <NavLink to="/reports" className={({ isActive }) => `whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold ${isActive ? 'bg-[rgb(var(--orus-primary))] text-[rgb(var(--orus-on-primary))]' : 'text-[rgb(var(--orus-text-muted))] hover:bg-[rgb(var(--orus-panel-muted))]'}`}>Relatórios e análises</NavLink></div></div></nav>
  );
}