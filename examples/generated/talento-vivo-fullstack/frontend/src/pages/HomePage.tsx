import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

interface RecentItem { id: string; name: string; status?: string; stage?: string; value?: number; scheduledAt?: string; professional?: string; createdAt?: string; }

export default function HomePage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/job-openings')
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
    <div className="space-y-7 lg:space-y-9" data-shell="sidebar-workspace" data-action-placement="floating" data-experience-pattern="talent-hub" data-primary-view="kanban">
      <header><div className="max-w-3xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[rgb(var(--orus-accent))]">talentos e oportunidades avançam com contexto</p><h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--orus-text))] sm:text-4xl">Central de talentos</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">Vagas, candidatos e entrevistas conectados à próxima decisão de contratação.</p></div></header>

      <section className="grid gap-4 xl:grid-cols-[.7fr_1.3fr]"><aside className="rounded-[calc(var(--orus-radius)*1.25)] bg-[rgb(var(--orus-text))] p-7 text-[rgb(var(--orus-page))]"><p className="text-xs font-bold uppercase tracking-[.22em] opacity-55">Pulso de talentos</p><p className="mt-6 font-display text-5xl font-bold">{stats.total}</p><p className="mt-2 text-sm opacity-65">perfis no radar</p><div className="mt-10 flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-[rgb(var(--orus-accent))]"/><span className="text-sm">{stats.recent} movimentos recentes</span></div></aside><div className="rounded-[calc(var(--orus-radius)*1.25)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><div className="grid gap-3 md:grid-cols-3">{[['Descoberta', stats.total], ['Em conversa', stats.active], ['Decisão', stats.pending]].map(([label, value], index) => <article key={String(label)} className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-4"><span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">{label}</span><p className="mt-5 font-display text-3xl font-bold">{value}</p><div className="mt-4 h-1 rounded-full bg-[rgb(var(--orus-border))]"><div className="h-full rounded-full bg-[rgb(var(--orus-primary))]" style={{ width: (45 + index * 20) + '%' }}/></div></article>)}</div><div className="mt-4 flex flex-wrap gap-2">{recentItems.slice(0, 4).map(item => <Link key={item.id} to={'/job-openings/' + item.id} className="rounded-full border border-[rgb(var(--orus-border))] px-4 py-2 text-xs font-semibold">{item.name}</Link>)}</div></div></section>

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
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">JobOpenings</p><h2 className="mt-1 text-xl font-bold text-[rgb(var(--orus-text))]">Atividade recente</h2></div>
          <Link to="/job-openings" className="text-sm font-semibold text-[rgb(var(--orus-accent))]">Ver todos →</Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] px-6 py-12 text-center">
            <p className="text-sm text-[rgb(var(--orus-text-muted))]">Ainda não há registros.</p>
            <Link to="/job-openings/new" className="mt-3 inline-block text-sm font-semibold text-[rgb(var(--orus-accent))]">Criar o primeiro →</Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentItems.map((item, index) => (
              <Link key={item.id} to={'/job-openings/' + item.id} className="group rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] p-4 transition hover:border-[rgb(var(--orus-primary))]">
                <div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-[calc(var(--orus-radius)*.75)] bg-[rgb(var(--orus-primary-soft))] font-bold text-[rgb(var(--orus-accent))]">{(item.name || 'JobOpening')[0].toUpperCase()}</span><span className="text-xs text-[rgb(var(--orus-text-muted))]">0{index + 1}</span></div>
                <p className="mt-5 font-semibold text-[rgb(var(--orus-text))] group-hover:text-[rgb(var(--orus-accent))]">{item.name}</p>
                <p className="mt-1 text-xs capitalize text-[rgb(var(--orus-text-muted))]">{item.status || 'pronto para começar'}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
      <Link to="/job-openings/new" className="inline-flex items-center justify-center gap-2 rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] px-5 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[rgb(var(--orus-primary-hover))] fixed bottom-6 right-6 z-40 rounded-full px-6 shadow-2xl"><span aria-hidden="true">＋</span>Novo JobOpening</Link>
    </div>
  );
}