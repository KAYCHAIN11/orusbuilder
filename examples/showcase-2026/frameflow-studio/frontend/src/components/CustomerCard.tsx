import { Link } from 'react-router-dom';
import { Customer } from '../types/customer.types';

interface CustomerCardProps { customer: Customer; onDelete?: (id: string) => void; }

export default function CustomerCard({ customer, onDelete }: CustomerCardProps) {
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
  const statusLabels: Record<string, string> = {"active":"Ativo","vip":"VIP","inactive":"Inativo"};
  return (
    <div className="bg-[rgb(var(--orus-panel))] rounded-2xl border border-[rgb(var(--orus-border))] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="p-5 pb-4 border-b border-[rgb(var(--orus-border))]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--orus-primary-soft))] flex items-center justify-center flex-shrink-0 text-[rgb(var(--orus-primary))] font-bold text-sm">
            {(customer.name || 'N')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[rgb(var(--orus-text))] truncate">{customer.name}</h3>
            {customer.status && (
              <span className={`inline-flex mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[customer.status] ?? 'bg-[rgb(var(--orus-panel-muted))] text-[rgb(var(--orus-text-muted))]'}`}>
                {statusLabels[customer.status] ?? customer.status}
              </span>
            )}
          </div>
        </div>
      </div>
      {customer.description && (
        <div className="px-5 py-3">
          <p className="text-sm text-[rgb(var(--orus-text-muted))] line-clamp-2">{customer.description}</p>
        </div>
      )}
      <div className="space-y-2 px-5 py-3">
        {customer.email !== undefined && customer.email !== null && <div className="flex items-center justify-between gap-3 text-xs"><span className="text-[rgb(var(--orus-text-muted))]">E-mail</span><strong className="max-w-[60%] truncate text-right">{String(customer.email)}</strong></div>}
        {customer.lifetimeValue !== undefined && customer.lifetimeValue !== null && <div className="flex items-center justify-between gap-3 text-xs"><span className="text-[rgb(var(--orus-text-muted))]">Valor acumulado</span><strong className="max-w-[60%] truncate text-right">{String(customer.lifetimeValue)}</strong></div>}
      </div>
      <div className="px-5 py-3 bg-[rgb(var(--orus-panel-muted))] flex items-center justify-between gap-2">
        <Link to={`/customers/${customer.id}`} className="text-sm font-medium text-[rgb(var(--orus-primary))] transition-colors">
          Ver detalhes →
        </Link>
        {onDelete && (
          <button onClick={() => onDelete(customer.id)} className="text-sm text-red-500 hover:text-red-700 transition-colors">
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}