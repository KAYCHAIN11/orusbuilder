import { NavLink, Link } from 'react-router-dom';



export default function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-page))]/90 px-5 backdrop-blur-xl"><Link to="/" className="font-display text-lg font-black">Orus Studio</Link><div className="flex items-center gap-3"></div></header>
      <nav className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-2xl items-center justify-around gap-1 overflow-x-auto rounded-[calc(var(--orus-radius)*1.35)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]/95 p-2 shadow-2xl backdrop-blur-xl" data-navigation="bottom-tabs"><NavLink to="/" end className="flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-bold"><span className="text-base">⌂</span>Visão geral</NavLink>        <NavLink to="/events" className={({ isActive }) => `flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-bold ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))]'}`}><span className="text-base">1</span>Programação de eventos</NavLink>
        <NavLink to="/tickets" className={({ isActive }) => `flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-bold ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))]'}`}><span className="text-base">2</span>Ingressos e inscrições</NavLink>
        <NavLink to="/check-in" className={({ isActive }) => `flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-bold ${isActive ? 'bg-[rgb(var(--orus-primary-soft))] text-[rgb(var(--orus-accent))]' : 'text-[rgb(var(--orus-text-muted))]'}`}><span className="text-base">3</span>Credenciamento</NavLink></nav>
    </>
  );
}