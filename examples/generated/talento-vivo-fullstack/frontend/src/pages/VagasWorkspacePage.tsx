import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

type WorkspaceRecord = Record<string, any>;
type WorkspaceItem = { id: string; name: string; detail: string; status: string; record: WorkspaceRecord };


const screenTitle = "Vagas";
const screenPurpose = "Publicar e acompanhar oportunidades com requisitos e responsáveis";
const capabilityName = "Vagas";
const resourcePath = "job-openings";
const stateField = "status";

const stateLabels: Record<string, string> = {"draft":"Rascunho","open":"Aberta","paused":"Pausada","closed":"Encerrada"};


const normalizeRecord = (record: WorkspaceRecord, index: number): WorkspaceItem => {
  const status = String(record[stateField] ?? "draft");
  return {
    id: String(record.id),
    name: String(record.name ?? record.title ?? capabilityName + ' ' + (index + 1)),
    detail: String(record.description ?? record.email ?? record.status ?? screenPurpose),
    status,
    record,
  };
};

export default function VagasWorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  
  const visible = items.filter(item => (item.name + ' ' + item.detail).toLowerCase().includes(query.toLowerCase()));
  

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/job-openings');
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
    <div className="space-y-7" data-blueprint-screen="SCREEN-002" data-layout="catalog">
      <header className="relative isolate overflow-hidden rounded-[calc(var(--orus-radius)*1.5)] bg-[rgb(var(--orus-text))] px-6 py-10 text-[rgb(var(--orus-page))] sm:px-10"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[rgb(var(--orus-primary))] opacity-35 blur-3xl"/><div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-[rgb(var(--orus-primary-soft))]">{capabilityName}</p><h1 className="mt-4 max-w-3xl font-display text-4xl font-bold sm:text-6xl">{screenTitle}</h1><p className="mt-4 max-w-2xl text-sm leading-6 opacity-70">{screenPurpose}</p></div><Link to={'/' + resourcePath + '/new'} className="w-fit rounded-full bg-[rgb(var(--orus-primary))] px-6 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))]">Novo registro</Link></div></header>
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-[var(--orus-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void refresh()} className="font-bold">Tentar novamente</button></div>}
      <div className="flex items-center gap-3"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filtrar este espaço..." className="w-full rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--orus-primary))]"/><span className="whitespace-nowrap text-xs text-[rgb(var(--orus-text-muted))]">{visible.length} itens</span></div>
      {loading ? <div className="grid gap-4 md:grid-cols-3">{[0,1,2].map(item => <div key={item} className="h-40 animate-pulse rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))]" />)}</div> : visible.length === 0 ? <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-6 py-16 text-center"><p className="font-semibold">Nenhum registro encontrado</p><Link to={'/' + resourcePath + '/new'} className="mt-3 inline-block text-sm font-bold text-[rgb(var(--orus-primary))]">Criar o primeiro registro</Link></div> : <section className="grid gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">{visible.map((item, index) => <Link key={item.id} to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} className="group"><div className={'aspect-[4/3] rounded-[var(--orus-radius)] bg-gradient-to-br p-6 ' + (index % 3 === 0 ? 'from-[rgb(var(--orus-primary-soft))] to-[rgb(var(--orus-panel-muted))]' : index % 3 === 1 ? 'from-[rgb(var(--orus-panel-muted))] to-[rgb(var(--orus-primary-soft))]' : 'from-[rgb(var(--orus-primary))] to-[rgb(var(--orus-accent))]')}><span className="rounded-full bg-[rgb(var(--orus-panel))]/80 px-3 py-1 text-xs font-bold">{stateLabels[item.status] || item.status}</span></div><div className="mt-4 flex items-start justify-between gap-4"><div><h2 className="font-display text-lg font-bold group-hover:text-[rgb(var(--orus-primary))]">{item.name}</h2><p className="mt-1 text-sm text-[rgb(var(--orus-text-muted))]">{item.detail}</p></div>{typeof item.record.price === 'number' && <strong>{item.record.price.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}</strong>}</div></Link>)}</section>}
    </div>
  );
}