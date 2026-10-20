import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

interface RecentItem { id: string; name: string; status?: string; stage?: string; value?: number; scheduledAt?: string; professional?: string; createdAt?: string; }

export default function HomePage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/transactions')
      .then((response) => setItems(Array.isArray(response.data) ? response.data : (response.data?.data || [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: items.length,
    active: items.filter((item) => item.status === 'active').length,
    pending: items.filter((item) => item.status === 'pending').length,
    recent: items.slice(-7).length,
  };
  const recentItems = items.slice(0, 6);

  if (loading) {
    return <div className="grid min-h-[45vh] place-items-center"><div className="h-11 w-11 animate-spin rounded-full border-2 border-[rgb(var(--orus-primary))] border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-7 lg:space-y-9" data-shell="top-navigation" data-action-placement="command-bar" data-experience-pattern="wealth-overview" data-primary-view="ledger">
      <header><div className="max-w-3xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[rgb(var(--orus-accent))]">clareza para decidir com confiança</p><h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--orus-text))] sm:text-4xl">Visão financeira</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">Patrimônio, movimentações e sinais importantes em uma única leitura.</p></div></header><section className="flex flex-col gap-3 rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3 px-2"><span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--orus-accent))]"/><span className="text-xs font-semibold uppercase tracking-[.16em] text-[rgb(var(--orus-text-muted))]">saldo e tendência</span></div><Link to="/transactions/new" className="inline-flex items-center justify-center gap-2 rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] px-5 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[rgb(var(--orus-primary-hover))]"><span aria-hidden="true">＋</span>Novo Transação</Link></section>

      <section className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.35)] bg-gradient-to-br from-slate-950 via-slate-900 to-[rgb(var(--orus-primary))] p-6 text-white shadow-2xl sm:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[rgb(var(--orus-accent))] opacity-20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-white/60">Posição consolidada</p><p className="mt-4 font-display text-5xl font-semibold tracking-tight">{stats.total.toLocaleString()}</p><p className="mt-2 text-sm text-white/65">Transaçõess monitorados em tempo real</p></div><div><svg viewBox="0 0 520 150" className="h-36 w-full" aria-label="Tendência financeira"><defs><linearGradient id="trend" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="white" stopOpacity=".32"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient></defs><path d="M0 130 C70 125 78 74 146 92 S245 118 303 60 S418 84 520 18 V150 H0Z" fill="url(#trend)"/><path d="M0 130 C70 125 78 74 146 92 S245 118 303 60 S418 84 520 18" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/></svg><div className="flex justify-between text-[11px] uppercase tracking-wider text-white/45"><span>Jan</span><span>Mar</span><span>Mai</span><span>Hoje</span></div></div></div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Total', stats.total], ['Em andamento', stats.active],
          ['Exigem atenção', stats.pending], ['Nesta semana', stats.recent],
        ].map(([label, value], index) => (
          <article key={String(label)} className="group rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5 transition hover:-translate-y-0.5 hover:border-[rgb(var(--orus-primary))]">
            <div className="mb-7 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">{label}</span><span className="h-2 w-2 rounded-full bg-[rgb(var(--orus-primary))] opacity-40 group-hover:opacity-100" /></div>
            <p className="font-display text-3xl font-bold text-[rgb(var(--orus-text))]">{value}</p>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[rgb(var(--orus-panel-muted))]"><div className="h-full rounded-full bg-[rgb(var(--orus-primary))]" style={{ width: (30 + index * 17) + '%' }} /></div>
          </article>
        ))}
      </section>

      <section className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">Transações</p><h2 className="mt-1 text-xl font-bold text-[rgb(var(--orus-text))]">Atividade recente</h2></div>
          <Link to="/transactions" className="text-sm font-semibold text-[rgb(var(--orus-accent))]">Ver todos →</Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] px-6 py-12 text-center">
            <p className="text-sm text-[rgb(var(--orus-text-muted))]">Ainda não há registros.</p>
            <Link to="/transactions/new" className="mt-3 inline-block text-sm font-semibold text-[rgb(var(--orus-accent))]">Criar o primeiro →</Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentItems.map((item, index) => (
              <Link key={item.id} to={'/transactions/' + item.id} className="group rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] p-4 transition hover:border-[rgb(var(--orus-primary))]">
                <div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-[calc(var(--orus-radius)*.75)] bg-[rgb(var(--orus-primary-soft))] font-bold text-[rgb(var(--orus-accent))]">{(item.name || 'Transação')[0].toUpperCase()}</span><span className="text-xs text-[rgb(var(--orus-text-muted))]">0{index + 1}</span></div>
                <p className="mt-5 font-semibold text-[rgb(var(--orus-text))] group-hover:text-[rgb(var(--orus-accent))]">{item.name}</p>
                <p className="mt-1 text-xs capitalize text-[rgb(var(--orus-text-muted))]">{item.status || 'pronto para começar'}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
}