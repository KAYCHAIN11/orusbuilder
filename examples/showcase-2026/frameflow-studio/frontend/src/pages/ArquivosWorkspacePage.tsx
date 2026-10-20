import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

type WorkspaceRecord = Record<string, any>;
type WorkspaceItem = { id: string; name: string; detail: string; status: string; record: WorkspaceRecord };


const screenTitle = "Arquivos";
const screenPurpose = "Organizar uploads e documentos associados ao trabalho";
const capabilityName = "Arquivos";
const resourcePath = "file-assets";
const stateField = "status";




const normalizeRecord = (record: WorkspaceRecord, index: number): WorkspaceItem => {
  const status = String(record[stateField] ?? "ready");
  return {
    id: String(record.id),
    name: String(record.name ?? record.title ?? capabilityName + ' ' + (index + 1)),
    detail: String(record.description ?? record.email ?? record.status ?? screenPurpose),
    status,
    record,
  };
};

export default function ArquivosWorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  
  const visible = items.filter(item => (item.name + ' ' + item.detail).toLowerCase().includes(query.toLowerCase()));
  

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/file-assets');
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
    <div className="space-y-7" data-blueprint-screen="SCREEN-006" data-layout="asset-library">
      <header className="relative isolate overflow-hidden rounded-[calc(var(--orus-radius)*1.5)] bg-[rgb(var(--orus-text))] px-6 py-10 text-[rgb(var(--orus-page))] sm:px-10"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[rgb(var(--orus-primary))] opacity-35 blur-3xl"/><div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-[rgb(var(--orus-primary-soft))]">{capabilityName}</p><h1 className="mt-4 max-w-3xl font-display text-4xl font-bold sm:text-6xl">{screenTitle}</h1><p className="mt-4 max-w-2xl text-sm leading-6 opacity-70">{screenPurpose}</p></div><Link to={'/' + resourcePath + '/new'} className="w-fit rounded-full bg-[rgb(var(--orus-primary))] px-6 py-3 text-sm font-semibold text-[rgb(var(--orus-on-primary))]">Novo registro</Link></div></header>
      {error && <div role="alert" className="flex items-center justify-between gap-4 rounded-[var(--orus-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => void refresh()} className="font-bold">Tentar novamente</button></div>}
      <div className="flex items-center gap-3"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filtrar este espaço..." className="w-full rounded-[var(--orus-radius)] border border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--orus-primary))]"/><span className="whitespace-nowrap text-xs text-[rgb(var(--orus-text-muted))]">{visible.length} itens</span></div>
      {loading ? <div className="grid gap-4 md:grid-cols-3">{[0,1,2].map(item => <div key={item} className="h-40 animate-pulse rounded-[var(--orus-radius)] bg-[rgb(var(--orus-panel-muted))]" />)}</div> : visible.length === 0 ? <div className="rounded-[var(--orus-radius)] border border-dashed border-[rgb(var(--orus-border))] bg-[rgb(var(--orus-panel))] px-6 py-16 text-center"><p className="font-semibold">Nenhum registro encontrado</p><Link to={'/' + resourcePath + '/new'} className="mt-3 inline-block text-sm font-bold text-[rgb(var(--orus-primary))]">Criar o primeiro registro</Link></div> : <section className="grid auto-rows-[180px] gap-4 md:grid-cols-3">{visible.map((item, index) => <Link to={'/' + resourcePath + '/' + encodeURIComponent(item.id)} key={item.id} className={'relative overflow-hidden rounded-[var(--orus-radius)] p-6 text-white ' + (index % 3 === 0 ? 'md:col-span-2 bg-gradient-to-br from-slate-950 to-[rgb(var(--orus-primary))]' : 'bg-gradient-to-br from-[rgb(var(--orus-primary))] to-[rgb(var(--orus-accent))]')}><p className="text-xs font-bold uppercase tracking-wider opacity-65">{capabilityName}</p><div className="absolute inset-x-6 bottom-6"><h2 className="text-xl font-bold">{item.name}</h2><p className="mt-1 text-xs opacity-70">{item.detail}</p></div></Link>)}</section>}
    </div>
  );
}