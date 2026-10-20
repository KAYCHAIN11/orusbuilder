import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

type WorkspaceRecord = Record<string, any>;
type WorkspaceItem = { id: string; name: string; detail: string; status: string; record: WorkspaceRecord };


const screenTitle = "Revisão";
const screenPurpose = "Conduzir aprovações";
const capabilityName = "Revisão";
const resourcePath = "reviews";
const stateField = "status";
const workflowStates: string[] = ["pending","changes_requested","approved"];
const stateLabels: Record<string, string> = {"pending":"Pendente","changes_requested":"Ajustes solicitados","approved":"Aprovada"};
const transitions: Record<string, string[]> = {"pending":["changes_requested","approved"],"changes_requested":["pending","approved"],"approved":[]};

const normalizeRecord = (record: WorkspaceRecord, index: number): WorkspaceItem => {
  const status = String(record[stateField] ?? "pending");
  return {
    id: String(record.id),
    name: String(record.name ?? record.title ?? capabilityName + ' ' + (index + 1)),
    detail: String(record.description ?? record.email ?? record.status ?? screenPurpose),
    status,
    record,
  };
};

export default function RevisaoWorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  
  const visible = items.filter(item => (item.name + ' ' + item.detail).toLowerCase().includes(query.toLowerCase()));
  const columns = [...new Set([...workflowStates, ...visible.map(item => item.status)])];

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/reviews');
      const records = Array.isArray(response.data) ? response.data : (response.data?.data ?? []);
      if (!Array.isArray(records)) throw new Error("Resposta inválida do servidor.");
      setItems(records.map(normalizeRecord));
      
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const updateState = async (item: WorkspaceItem, nextStatus: string) => {
    if (pendingId !== null || !(transitions[item.status] || []).includes(nextStatus)) return;
    setPendingId(item.id);
    setError('');
    try {
      const response = await api.patch('/api/reviews/' + encodeURIComponent(item.id) + '/status', { value: nextStatus });
      const record = response.data?.data ?? response.data;
      if (!record || typeof record !== 'object' || String(record.id) !== item.id) throw new Error("Resposta inválida do servidor.");
      setItems(current => current.map(candidate => candidate.id === item.id
        ? normalizeRecord(record, current.indexOf(candidate))
        : candidate));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o registro.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-7" data-blueprint-screen="SCREEN-003" data-layout="split-focus">
      <header className="mx-auto max-w-4xl border-b border-[rgb(var(--orus-border))] pb-7 text-center"><p className="text-xs font-bold uppercase tracking-[.28em] text-[rgb(var(--orus-accent))]">{capabilityName}</p><h1 className="mt-4 font-display text-4xl font-bold text-[rgb(var(--orus-text))] sm:text-5xl">{screenTitle}</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">{screenPurpose}</p><Link to={'/' + resourcePath + '/new'} className="mt-6 inline-flex rounded-full bg-[rgb(var(--orus-primary))] px-6 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))]">Novo registro</Link></header>
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-[var(--orus-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void refresh()} className="font-bold">Tentar novamente</button></div>}
      <div className="flex items-center gap-3"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filtrar este espaço..." className="w-full rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--orus-primary))]"/><span className="whitespace-nowrap text-xs text-[rgb(var(--orus-text-muted))]">{visible.length} itens</span></div>
      {loading ? <div className="grid gap-4 md:grid-cols-3">{[0,1,2].map(item => <div key={item} className="h-40 animate-pulse rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))]" />)}</div> : visible.length === 0 ? <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-6 py-16 text-center"><p className="font-semibold">Nenhum registro encontrado</p><Link to={'/' + resourcePath + '/new'} className="mt-3 inline-block text-sm font-bold text-[rgb(var(--orus-primary))]">Criar o primeiro registro</Link></div> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{columns.map(status => <article key={status} className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))] p-4"><div className="mb-4 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wider">{stateLabels[status] || status}</h2><span className="rounded-full bg-[rgb(var(--orus-panel))] px-2 py-1 text-xs">{visible.filter(item => item.status === status).length}</span></div><div className="space-y-3">{visible.filter(item => item.status === status).map(item => <div key={item.id} className="rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-4"><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="font-semibold">{item.name}</Link><p className="mt-2 text-xs leading-5 text-[rgb(var(--orus-text-muted))]">{item.detail}</p><div className="mt-4 flex flex-wrap gap-3">{(transitions[item.status] || []).map(nextStatus => <button key={nextStatus} type="button" disabled={pendingId !== null} onClick={() => void updateState(item, nextStatus)} className="text-xs font-bold text-[rgb(var(--orus-accent))] disabled:opacity-40">{stateLabels[nextStatus] || nextStatus} →</button>)}<Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id) + '/edit'} className="text-xs font-semibold">Editar</Link></div></div>)}</div></article>)}</section>}
    </div>
  );
}