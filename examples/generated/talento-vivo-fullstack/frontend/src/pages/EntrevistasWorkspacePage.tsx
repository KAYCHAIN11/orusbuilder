import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

type WorkspaceRecord = Record<string, any>;
type WorkspaceItem = { id: string; name: string; detail: string; status: string; record: WorkspaceRecord };


const screenTitle = "Entrevistas";
const screenPurpose = "Planejar entrevistas, participantes e avaliações";
const capabilityName = "Entrevistas";
const resourcePath = "interviews";
const stateField = "status";

const stateLabels: Record<string, string> = {"scheduled":"Agendada","completed":"Realizada","cancelled":"Cancelada"};
const transitions: Record<string, string[]> = {"scheduled":["completed","cancelled"],"completed":[],"cancelled":["scheduled"]};

const normalizeRecord = (record: WorkspaceRecord, index: number): WorkspaceItem => {
  const status = String(record[stateField] ?? "scheduled");
  return {
    id: String(record.id),
    name: String(record.name ?? record.title ?? capabilityName + ' ' + (index + 1)),
    detail: String(record.description ?? record.email ?? record.status ?? screenPurpose),
    status,
    record,
  };
};

export default function EntrevistasWorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  
  const visible = items.filter(item => (item.name + ' ' + item.detail).toLowerCase().includes(query.toLowerCase()));
  

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/interviews');
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
      const response = await api.patch('/api/interviews/' + encodeURIComponent(item.id) + '/status', { value: nextStatus });
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
    <div className="space-y-7" data-blueprint-screen="SCREEN-005" data-layout="calendar">
      <header className="relative overflow-hidden rounded-[calc(var(--orus-radius)*1.25)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] p-6 sm:p-8"><div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[rgb(var(--orus-primary-soft))] to-transparent"/><div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[rgb(var(--orus-accent))]">{capabilityName}</p><h1 className="mt-3 font-display text-3xl font-bold text-[rgb(var(--orus-text))] sm:text-4xl">{screenTitle}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">{screenPurpose}</p></div><Link to={'/' + resourcePath + '/new'} className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-primary))] px-5 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))]">Novo registro</Link></div></header>
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-[var(--orus-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void refresh()} className="font-bold">Tentar novamente</button></div>}
      <div className="flex items-center gap-3"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filtrar este espaço..." className="w-full rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--orus-primary))]"/><span className="whitespace-nowrap text-xs text-[rgb(var(--orus-text-muted))]">{visible.length} itens</span></div>
      {loading ? <div className="grid gap-4 md:grid-cols-3">{[0,1,2].map(item => <div key={item} className="h-40 animate-pulse rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))]" />)}</div> : visible.length === 0 ? <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-6 py-16 text-center"><p className="font-semibold">Nenhum registro encontrado</p><Link to={'/' + resourcePath + '/new'} className="mt-3 inline-block text-sm font-bold text-[rgb(var(--orus-primary))]">Criar o primeiro registro</Link></div> : <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,.55fr)]"><div className="overflow-hidden rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]"><div className="grid grid-cols-7 border-b border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel-muted))] text-center text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--orus-text-muted))]">{(["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"]).map(day => <span key={day} className="p-3">{day}</span>)}</div><div className="grid min-h-[420px] grid-cols-1 gap-px bg-[rgb(var(--orus-border))] md:grid-cols-2 xl:grid-cols-3">{visible.map(item => <article key={item.id} className="bg-[rgb(var(--orus-panel))] p-5 transition-colors hover:bg-[rgb(var(--orus-primary-soft))]"><p className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--orus-accent))]">{item.record.scheduledAt ? new Date(item.record.scheduledAt).toLocaleString() : stateLabels[item.status] || item.status}</p><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="mt-3 block font-semibold">{item.name}</Link><p className="mt-2 text-xs leading-5 text-[rgb(var(--orus-text-muted))]">{item.detail}</p><div className="mt-4 flex flex-wrap gap-2">{(transitions[item.status] || []).map(nextStatus => <button key={nextStatus} type="button" disabled={pendingId !== null} onClick={() => void updateState(item, nextStatus)} className="text-xs font-bold text-[rgb(var(--orus-accent))] disabled:opacity-40">{stateLabels[nextStatus] || nextStatus} →</button>)}</div></article>)}</div></div><aside className="rounded-[var(--orus-radius)] bg-[rgb(var(--orus-text))] p-6 text-[rgb(var(--orus-page))]"><p className="text-xs font-bold uppercase tracking-[.2em] opacity-55">Agenda em foco</p><p className="mt-5 font-display text-5xl font-bold">{visible.length}</p><p className="mt-2 text-sm opacity-65">compromissos visíveis</p><div className="mt-8 space-y-3">{Object.entries(visible.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }), {})).map(([status, count]) => <div key={status} className="flex justify-between border-b border-white/10 pb-3 text-sm"><span>{stateLabels[status] || status}</span><strong>{count}</strong></div>)}</div></aside></section>}
    </div>
  );
}