import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

interface RecentItem { id: string; name: string; status?: string; stage?: string; value?: number; scheduledAt?: string; professional?: string; createdAt?: string; }

export default function HomePage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/shipments')
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
    <div className="space-y-7 lg:space-y-9" data-shell="split-workspace" data-action-placement="inline" data-experience-pattern="logistics-control" data-primary-view="timeline">
      <header className="grid gap-7 border-b border-[rgb(var(--orus-border))] pb-8 lg:grid-cols-[1fr_.45fr] lg:items-end"><div className="max-w-3xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[rgb(var(--orus-accent))]">cada movimento acompanhado até o destino</p><h1 className="font-display text-3xl font-bold tracking-tight text-[rgb(var(--orus-text))] sm:text-4xl">Controle de operações</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">Rotas, remessas e exceções acompanhadas do despacho até a entrega.</p></div><div className="flex flex-col items-start gap-4 lg:items-end"><p className="max-w-xs text-sm leading-6 text-[rgb(var(--orus-text-muted))] lg:text-right">rede logística em fluxo</p><Link to="/shipments/new" className="inline-flex items-center justify-center gap-2 rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] px-5 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[rgb(var(--orus-primary-hover))]"><span aria-hidden="true">＋</span>Novo Shipment</Link></div></header>

      <section className="overflow-hidden rounded-[calc(var(--orus-radius)*1.2)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-text))] text-[rgb(var(--orus-page))]"><div className="grid lg:grid-cols-[1.35fr_.65fr]"><div className="relative min-h-72 p-7"><div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgb(var(--orus-border)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--orus-border)) 1px, transparent 1px)', backgroundSize: '36px 36px' }}/><div className="relative"><p className="text-xs font-bold uppercase tracking-[.22em] text-[rgb(var(--orus-accent))]">Rede em movimento</p><div className="mt-10 flex items-center gap-3">{[0,1,2,3].map((point) => <div key={point} className="flex flex-1 items-center gap-3"><span className="h-4 w-4 shrink-0 rounded-full border-4 border-[rgb(var(--orus-primary-soft))] bg-[rgb(var(--orus-primary))]"/>{point < 3 && <span className="h-px flex-1 bg-[rgb(var(--orus-border))]"/>}</div>)}</div><p className="mt-10 max-w-lg font-display text-3xl font-bold">Do despacho à confirmação, cada exceção permanece visível.</p></div></div><aside className="border-t border-white/10 bg-white/5 p-7 lg:border-l lg:border-t-0"><p className="text-xs uppercase tracking-wider opacity-55">Agora</p><p className="mt-5 font-display text-5xl font-bold">{stats.total}</p><p className="mt-1 text-sm opacity-60">operações monitoradas</p><div className="mt-8 space-y-3">{recentItems.slice(0, 3).map(item => <Link key={item.id} to={'/shipments/' + item.id} className="block rounded-[var(--orus-radius)] border border-white/10 p-3 text-sm font-semibold">{item.name}</Link>)}</div></aside></div></section>

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
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">Shipments</p><h2 className="mt-1 text-xl font-bold text-[rgb(var(--orus-text))]">Atividade recente</h2></div>
          <Link to="/shipments" className="text-sm font-semibold text-[rgb(var(--orus-accent))]">Ver todos →</Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] px-6 py-12 text-center">
            <p className="text-sm text-[rgb(var(--orus-text-muted))]">Ainda não há registros.</p>
            <Link to="/shipments/new" className="mt-3 inline-block text-sm font-semibold text-[rgb(var(--orus-accent))]">Criar o primeiro →</Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentItems.map((item, index) => (
              <Link key={item.id} to={'/shipments/' + item.id} className="group rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] p-4 transition hover:border-[rgb(var(--orus-primary))]">
                <div className="flex items-start justify-between gap-4"><span className="grid h-10 w-10 place-items-center rounded-[calc(var(--orus-radius)*.75)] bg-[rgb(var(--orus-primary-soft))] font-bold text-[rgb(var(--orus-accent))]">{(item.name || 'Shipment')[0].toUpperCase()}</span><span className="text-xs text-[rgb(var(--orus-text-muted))]">0{index + 1}</span></div>
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