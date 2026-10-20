import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

type WorkspaceRecord = Record<string, any>;
type WorkspaceItem = { id: string; name: string; detail: string; status: string; record: WorkspaceRecord };
type WorkspaceSummary = { total: number; byState: Record<string, number>; numericTotals: Record<string, number> };

const screenTitle = "Cálculo automático de multas";
const screenPurpose = "Executar cálculo automático de multas conforme o fluxo descrito pelo usuário";
const capabilityName = "Cálculo automático de multas";
const resourcePath = "multas";
const stateField = "status";

const stateLabels: Record<string, string> = {"active":"Ativo","pending":"Pendente","inactive":"Inativo"};


const normalizeRecord = (record: WorkspaceRecord, index: number): WorkspaceItem => {
  const status = String(record[stateField] ?? "active");
  return {
    id: String(record.id),
    name: String(record.name ?? record.title ?? capabilityName + ' ' + (index + 1)),
    detail: String(record.description ?? record.email ?? record.status ?? screenPurpose),
    status,
    record,
  };
};

export default function CalculoAutomaticoDeMultasWorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const visible = items.filter(item => (item.name + ' ' + item.detail).toLowerCase().includes(query.toLowerCase()));
  

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [response, summaryResponse] = await Promise.all([api.get('/api/multas'), api.get('/api/multas/insights/summary')]);
      const records = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      if (!Array.isArray(records)) throw new Error("Resposta inválida do servidor.");
      setItems(records.map(normalizeRecord));
      const nextSummary = summaryResponse.data?.data ?? summaryResponse.data;
      if (!nextSummary || !Number.isFinite(nextSummary.total) || !nextSummary.byState || !nextSummary.numericTotals) throw new Error("Resumo inválido do servidor.");
      setSummary(nextSummary);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  

  return (
    <div className="space-y-7" data-blueprint-screen="SCREEN-006" data-layout="analytics">
      <header className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.25)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6 sm:p-8"><div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[rgb(var(--orus-primary-soft))] to-transparent"/><div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[rgb(var(--orus-accent))]">{capabilityName}</p><h1 className="mt-3 font-display text-3xl font-bold text-[rgb(var(--orus-text))] sm:text-4xl">{screenTitle}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">{screenPurpose}</p></div><Link to={'/' + resourcePath + '/new'} className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] px-5 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))]">Novo registro</Link></div></header>
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-[var(--orus-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void refresh()} className="font-bold">Tentar novamente</button></div>}
      <div className="flex items-center gap-3"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filtrar este espaço..." className="w-full rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--orus-primary))]"/><span className="whitespace-nowrap text-xs text-[rgb(var(--orus-text-muted))]">{visible.length} itens</span></div>
      {loading ? <div className="grid gap-4 md:grid-cols-3">{[0,1,2].map(item => <div key={item} className="h-40 animate-pulse rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))]" />)}</div> : visible.length === 0 ? <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-6 py-16 text-center"><p className="font-semibold">Nenhum registro encontrado</p><Link to={'/' + resourcePath + '/new'} className="mt-3 inline-block text-sm font-bold text-[rgb(var(--orus-primary))]">Criar o primeiro registro</Link></div> : <section className="space-y-5"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><article className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><p className="text-xs uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">Registros consolidados</p><p className="mt-4 font-display text-3xl font-bold">{summary?.total ?? 0}</p></article>{Object.entries(summary?.numericTotals ?? {}).map(([field, value]) => <article key={field} className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6"><p className="text-xs uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">{field}</p><p className="mt-4 font-display text-3xl font-bold">{value.toLocaleString()}</p></article>)}</div><div className="grid gap-4 md:grid-cols-2">{Object.entries(summary?.byState ?? {}).map(([status, count]) => <article key={status} className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-5"><div className="flex justify-between"><span>{stateLabels[status] || status}</span><strong>{count}</strong></div><progress aria-label={stateLabels[status] || status} value={count} max={Math.max(summary?.total ?? 0, 1)} className="mt-4 h-3 w-full accent-[rgb(var(--orus-primary))]" /></article>)}</div></section>}
    </div>
  );
}