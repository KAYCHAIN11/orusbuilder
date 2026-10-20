import { Link } from 'react-router-dom';
import { Role } from '../types/role.types';

interface RoleCardProps { role: Role; onDelete?: (id: string) => void; }

export default function RoleCard({ role, onDelete }: RoleCardProps) {
  const statusColors: Record<string, string> = {
    active:   'bg-emerald-100 text-emerald-700',
    inactive: 'bg-[rgb(var(--orus-panel-muted))] text-[rgb(var(--orus-text-muted))]',
    pending:  'bg-amber-100 text-amber-700',
    done:     'bg-blue-100 text-blue-700',
    lead:     'bg-amber-100 text-amber-800',
    prospect: 'bg-blue-100 text-blue-700',
    scheduled:'bg-sky-100 text-sky-700',
    confirmed:'bg-emerald-100 text-emerald-700',
    completed:'bg-violet-100 text-violet-700',
    cancelled:'bg-rose-100 text-rose-700',
  };
  const statusLabels: Record<string, string> = {"active":"Ativo","inactive":"Inativo"};
  return (
    <div className="bg-[rgb(var(--orus-panel))] rounded-2xl border border-[rgb(var(--orus-border))] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="p-5 pb-4 border-b border-[rgb(var(--orus-border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--orus-primary-soft))] flex items-center justify-center flex-shrink-0 text-[rgb(var(--orus-primary))] font-bold text-sm">
            {(role.name || 'N')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[rgb(var(--orus-text))] truncate">{role.name}</h3>
            {role.status && (
              <span className={`inline-flex mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[role.status] ?? 'bg-[rgb(var(--orus-panel-muted))] text-[rgb(var(--orus-text-muted))]'}`}>
                {statusLabels[role.status] ?? role.status}
              </span>
            )}
          </div>
        </div>
      </div>
      {role.description && (
        <div className="px-5 py-3">
          <p className="text-sm text-[rgb(var(--orus-text-muted))] line-clamp-2">{role.description}</p>
        </div>
      )}
      <div className="space-y-2 px-5 py-3">
        {role.scope !== undefined && role.scope !== null && <div className="flex items-center justify-between gap-3 text-xs"><span className="text-[rgb(var(--orus-text-muted))]">Escopo</span><strong className="max-w-[60%] truncate text-right">{String(role.scope)}</strong></div>}
      </div>
      <div className="px-5 py-3 bg-[rgb(var(--orus-panel-muted))] flex items-center justify-between gap-2">
        <Link to={`/roles/${role.id}`} className="text-sm font-medium text-[rgb(var(--orus-primary))] transition-colors">
          Ver detalhes →
        </Link>
        {onDelete && (
          <button onClick={() => onDelete(role.id)} className="text-sm text-red-500 hover:text-red-700 transition-colors">
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}