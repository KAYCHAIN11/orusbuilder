import { Link } from 'react-router-dom';
import MultaForm from '../components/MultaForm';

export default function MultaCreatePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[rgb(var(--orus-text-muted))]">
        <Link to="/multas" className="hover:text-[rgb(var(--orus-accent))] transition-colors">Multas</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[rgb(var(--orus-text))] font-medium">Novo Multa</span>
      </nav>

      {/* Form card */}
      <div className="bg-[rgb(var(--orus-panel))] rounded-2xl border border-[rgb(var(--orus-border))] shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[rgb(var(--orus-text))]">Criar Multa</h1>
          <p className="text-sm text-[rgb(var(--orus-text-muted))] mt-1">Preencha os dados para criar um novo multa.</p>
        </div>
        <MultaForm />
      </div>
    </div>
  );
}