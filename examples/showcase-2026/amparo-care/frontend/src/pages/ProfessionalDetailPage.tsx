import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Professional } from '../types/professional.types';

export default function ProfessionalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/professionals/${id}`)
      .then(res => setItem(res.data?.data ?? res.data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Excluir este professional? Esta ação não pode ser desfeita.')) return;
    setDeleting(true);
    try {
      await api.delete(`/api/professionals/${id}`);
      navigate('/professionals');
    } catch {
      alert('Não foi possível excluir.');
      setDeleting(false);
    }
  };

  const statusColor: Record<string, string> = {
    active:   'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending:  'bg-amber-100 text-amber-700 border-amber-200',
    inactive: 'bg-[rgb(var(--orus-panel-muted))] text-[rgb(var(--orus-text-muted))] border-[rgb(var(--orus-border))]',
  };
  const statusLabel: Record<string, string> = { active: 'Ativo', pending: 'Pendente', inactive: 'Inativo', done: 'Concluído' };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-[rgb(var(--orus-border))] rounded w-32 mb-8"></div>
        <div className="bg-[rgb(var(--orus-panel))] rounded-2xl border border-[rgb(var(--orus-border))] p-8 space-y-5">
          <div className="h-7 bg-[rgb(var(--orus-border))] rounded w-1/2"></div>
          <div className="h-4 bg-[rgb(var(--orus-panel-muted))] rounded w-full"></div>
          <div className="h-4 bg-[rgb(var(--orus-panel-muted))] rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[rgb(var(--orus-text))]">Professional não encontrado</h2>
        <p className="text-[rgb(var(--orus-text-muted))] text-sm mt-1">Este registro pode ter sido excluído ou não existe.</p>
        <Link to="/professionals" className="mt-5 inline-flex items-center gap-2 text-[rgb(var(--orus-accent))] hover:underline text-sm font-medium">← Voltar para Professionals</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[rgb(var(--orus-text-muted))]">
        <Link to="/professionals" className="hover:text-[rgb(var(--orus-accent))] transition-colors">Professionals</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-[rgb(var(--orus-text))] font-medium truncate">{item.name}</span>
      </nav>

      {/* Detail card */}
      <div className="bg-[rgb(var(--orus-panel))] rounded-2xl border border-[rgb(var(--orus-border))] shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[rgb(var(--orus-primary-soft))] flex items-center justify-center text-[rgb(var(--orus-accent))] font-bold text-xl flex-shrink-0">
                {(item.name || 'N')[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[rgb(var(--orus-text))]">{item.name}</h1>
                {item.status && (
                  <span className={`inline-flex mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor[item.status] ?? 'bg-[rgb(var(--orus-panel-muted))] text-[rgb(var(--orus-text-muted))] border-[rgb(var(--orus-border))]'}`}>
                    {statusLabel[item.status] ?? item.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          {item.description && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-[rgb(var(--orus-text-muted))] uppercase tracking-wider mb-2">Descrição</h3>
              <p className="text-[rgb(var(--orus-text))] text-sm leading-relaxed">{item.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgb(var(--orus-border))]">
            {item.createdAt && (
              <div>
                <p className="text-xs text-[rgb(var(--orus-text-muted))] uppercase tracking-wider font-semibold mb-1">Criado em</p>
                <p className="text-sm text-[rgb(var(--orus-text))]">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            )}
            {item.updatedAt && (
              <div>
                <p className="text-xs text-[rgb(var(--orus-text-muted))] uppercase tracking-wider font-semibold mb-1">Atualizado em</p>
                <p className="text-sm text-[rgb(var(--orus-text))]">{new Date(item.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-4 bg-[rgb(var(--orus-panel-muted))] border-t border-[rgb(var(--orus-border))] flex items-center gap-3">
          <Link
            to={`/professionals/${id}/edit`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-[rgb(var(--orus-primary))] hover:bg-[rgb(var(--orus-primary-hover))] text-[rgb(var(--orus-on-primary))] text-sm font-semibold rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-5 py-2 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 text-sm font-semibold rounded-xl transition-colors"
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
          <Link to="/professionals" className="ml-auto text-sm text-[rgb(var(--orus-text-muted))] hover:text-[rgb(var(--orus-text))] transition-colors">← Voltar</Link>
        </div>
      </div>
    </div>
  );
}