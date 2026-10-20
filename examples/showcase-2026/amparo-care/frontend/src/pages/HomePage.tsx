import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

interface RecentItem { id: string; name: string; status?: string; stage?: string; value?: number; scheduledAt?: string; professional?: string; createdAt?: string; }

export default function HomePage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/appointments')
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
    <div className="space-y-7 lg:space-y-9" data-shell="sidebar-workspace" data-action-placement="command-bar" data-experience-pattern="care-hub" data-primary-view="calendar">
      <header><div className="max-w-3xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[rgb(var(--orus-accent))]">cuidado coordenado sem atrito</p><h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--orus-text))] sm:text-4xl">Central de cuidado</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">Prioridades, agenda e continuidade do atendimento sem perder contexto.</p></div></header><section className="flex flex-col gap-3 rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3 px-2"><span className="h-2.5 w-2.5 rounded-full bg-[rgb(var(--orus-accent))]"/><span className="text-xs font-semibold uppercase tracking-[.16em] text-[rgb(var(--orus-text-muted))]">agenda do dia</span></div><Link to="/appointments/new" className="inline-flex items-center justify-center gap-2 rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] px-5 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[rgb(var(--orus-primary-hover))]"><span aria-hidden="true">＋</span>Novo Atendimento</Link></section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]"><div className="rounded-[calc(var(--orus-radius)*1.2)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-accent))]">Agenda de hoje</p><h2 className="mt-1 text-2xl font-bold">Próximos atendimentos</h2></div><span className="rounded-full bg-[rgb(var(--orus-primary-soft))] px-3 py-1 text-xs font-semibold text-[rgb(var(--orus-accent))]">{recentItems.length} na agenda</span></div><div className="space-y-2">{(recentItems.length ? recentItems.slice(0, 3) : [{ id: 'sample', name: 'Agenda disponível', status: 'aguardando' }]).map((item, index) => <div key={item.id} className="grid grid-cols-[52px_1fr_auto] items-center gap-4 rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-3"><span className="text-sm font-bold text-[rgb(var(--orus-accent))]">{String(9 + index).padStart(2, '0')}:00</span><div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-[rgb(var(--orus-text-muted))]">{item.status || 'confirmado'}</p></div><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>)}</div></div><div className="rounded-[calc(var(--orus-radius)*1.2)] bg-[rgb(var(--orus-primary))] p-6 text-[rgb(var(--orus-on-primary))]"><p className="text-xs font-bold uppercase tracking-wider opacity-95">Continuidade</p><p className="mt-5 font-display text-4xl font-bold">{stats.active}</p><p className="mt-2 text-sm opacity-95">acompanhamentos ativos</p><div className="mt-10 space-y-3 text-sm"><div className="flex justify-between"><span className="opacity-95">Em dia</span><strong>{Math.max(stats.total - stats.pending, 0)}</strong></div><div className="h-2 rounded-full bg-black/15"><div className="h-full w-3/4 rounded-full bg-white/80" /></div></div></div></section>

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
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">Atendimentos</p><h2 className="mt-1 text-xl font-bold text-[rgb(var(--orus-text))]">Atividade recente</h2></div>
          <Link to="/appointments" className="text-sm font-semibold text-[rgb(var(--orus-accent))]">Ver todos →</Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] px-6 py-12 text-center">
            <p className="text-sm text-[rgb(var(--orus-text-muted))]">Ainda não há registros.</p>
            <Link to="/appointments/new" className="mt-3 inline-block text-sm font-semibold text-[rgb(var(--orus-accent))]">Criar o primeiro →</Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentItems.map((item, index) => (
              <Link key={item.id} to={'/appointments/' + item.id} className="group rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] p-4 transition hover:border-[rgb(var(--orus-primary))]">
                <div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-[calc(var(--orus-radius)*.75)] bg-[rgb(var(--orus-primary-soft))] font-bold text-[rgb(var(--orus-accent))]">{(item.name || 'Atendimento')[0].toUpperCase()}</span><span className="text-xs text-[rgb(var(--orus-text-muted))]">0{index + 1}</span></div>
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