import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

type WorkspaceRecord = Record<string, any>;
type WorkspaceItem = { id: string; name: string; detail: string; status: string; record: WorkspaceRecord };


const screenTitle = "Pagamentos";
const screenPurpose = "Processar e acompanhar transações financeiras";
const capabilityName = "Pagamentos";
const resourcePath = "payments";
const stateField = "status";

const stateLabels: Record<string, string> = {"pending":"Pendente","authorized":"Autorizado","paid":"Pago","refunded":"Estornado","failed":"Falhou"};


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

export default function PagamentosWorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  
  const visible = items.filter(item => (item.name + ' ' + item.detail).toLowerCase().includes(query.toLowerCase()));
  

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/payments');
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

  

  return (
    <div className="space-y-7" data-blueprint-screen="SCREEN-006" data-layout="payment-operations">
      <header className="mx-auto max-w-4xl border-b border-[rgb(var(--orus-border))] pb-7 text-center"><p className="text-xs font-bold uppercase tracking-[.28em] text-[rgb(var(--orus-accent))]">{capabilityName}</p><h1 className="mt-4 font-display text-4xl font-bold text-[rgb(var(--orus-text))] sm:text-5xl">{screenTitle}</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[rgb(var(--orus-text-muted))]">{screenPurpose}</p><Link to={'/' + resourcePath + '/new'} className="mt-6 inline-flex rounded-full bg-[rgb(var(--orus-primary))] px-6 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))]">Novo registro</Link></header>
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-[var(--orus-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void refresh()} className="font-bold">Tentar novamente</button></div>}
      <div className="flex items-center gap-3"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filtrar este espaço..." className="w-full rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--orus-primary))]"/><span className="whitespace-nowrap text-xs text-[rgb(var(--orus-text-muted))]">{visible.length} itens</span></div>
      {loading ? <div className="grid gap-4 md:grid-cols-3">{[0,1,2].map(item => <div key={item} className="h-40 animate-pulse rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))]" />)}</div> : visible.length === 0 ? <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-6 py-16 text-center"><p className="font-semibold">Nenhum registro encontrado</p><Link to={'/' + resourcePath + '/new'} className="mt-3 inline-block text-sm font-bold text-[rgb(var(--orus-primary))]">Criar o primeiro registro</Link></div> : <section className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]"><aside className="rounded-[var(--orus-radius)] bg-gradient-to-br from-[rgb(var(--orus-primary))] to-[rgb(var(--orus-accent))] p-7 text-[rgb(var(--orus-on-primary))]"><p className="text-xs font-bold uppercase tracking-[.2em] opacity-70">Operação financeira</p><p className="mt-5 font-display text-5xl font-bold">{visible.length}</p><p className="mt-2 text-sm opacity-70">registros acompanhados</p></aside><div className="overflow-hidden rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))]">{visible.map(item => <article key={item.id} className="flex items-center justify-between gap-5 border-b border-[rgb(var(--orus-border))] p-5 last:border-0"><div><Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="font-bold">{item.name}</Link><p className="mt-1 text-xs text-[rgb(var(--orus-text-muted))]">{item.detail}</p></div><span className="rounded-full bg-[rgb(var(--orus-primary-soft))] px-3 py-1 text-xs font-bold text-[rgb(var(--orus-primary))]">{stateLabels[item.status] || item.status}</span></article>)}</div></section>}
    </div>
  );
}