import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

interface RecentItem { id: string; name: string; status?: string; stage?: string; value?: number; scheduledAt?: string; professional?: string; createdAt?: string; }

export default function HomePage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/courses')
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
    <div className="space-y-7 lg:space-y-9" data-shell="top-navigation" data-action-placement="header" data-experience-pattern="learning-campus" data-primary-view="catalog">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div className="max-w-3xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[rgb(var(--orus-accent))]">aprendizagem visível do primeiro passo à conquista</p><h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--orus-text))] sm:text-4xl">Campus de aprendizagem</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">Conteúdo, progresso e avaliações reunidos em uma jornada clara de aprendizagem.</p></div><Link to="/courses/new" className="inline-flex items-center justify-center gap-2 rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] px-5 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[rgb(var(--orus-primary-hover))]"><span aria-hidden="true">＋</span>Novo Course</Link></header>

      <section className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.4)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-7 sm:p-9"><div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-bl from-[rgb(var(--orus-primary-soft))] to-transparent"/><div className="relative grid gap-9 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.24em] text-[rgb(var(--orus-accent))]">Trilha em andamento</p><h2 className="mt-5 max-w-xl font-display text-4xl font-bold leading-tight">Conhecimento organizado em marcos que convidam a continuar.</h2><div className="mt-8 flex gap-8"><div><strong className="font-display text-3xl">{stats.total}</strong><p className="text-xs text-[rgb(var(--orus-text-muted))]">trilhas</p></div><div><strong className="font-display text-3xl">{stats.recent}</strong><p className="text-xs text-[rgb(var(--orus-text-muted))]">avanços</p></div></div></div><div className="relative space-y-4 border-l-2 border-[rgb(var(--orus-primary-soft))] pl-7">{recentItems.slice(0, 4).map((item, index) => <Link key={item.id} to={'/courses/' + item.id} className="relative block rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-4"><span className="absolute -left-[2.15rem] top-5 grid h-5 w-5 place-items-center rounded-full bg-[rgb(var(--orus-primary))] text-[9px] font-bold text-[rgb(var(--orus-on-primary))]">{index + 1}</span><strong className="text-sm">{item.name}</strong><p className="mt-1 text-xs text-[rgb(var(--orus-text-muted))]">{item.status || 'disponível'}</p></Link>)}</div></div></section>

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
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">Courses</p><h2 className="mt-1 text-xl font-bold text-[rgb(var(--orus-text))]">Atividade recente</h2></div>
          <Link to="/courses" className="text-sm font-semibold text-[rgb(var(--orus-accent))]">Ver todos →</Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] px-6 py-12 text-center">
            <p className="text-sm text-[rgb(var(--orus-text-muted))]">Ainda não há registros.</p>
            <Link to="/courses/new" className="mt-3 inline-block text-sm font-semibold text-[rgb(var(--orus-accent))]">Criar o primeiro →</Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentItems.map((item, index) => (
              <Link key={item.id} to={'/courses/' + item.id} className="group rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] p-4 transition hover:border-[rgb(var(--orus-primary))]">
                <div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-[calc(var(--orus-radius)*.75)] bg-[rgb(var(--orus-primary-soft))] font-bold text-[rgb(var(--orus-accent))]">{(item.name || 'Course')[0].toUpperCase()}</span><span className="text-xs text-[rgb(var(--orus-text-muted))]">0{index + 1}</span></div>
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