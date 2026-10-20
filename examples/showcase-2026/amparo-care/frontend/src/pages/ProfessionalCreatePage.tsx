import { Link } from 'react-router-dom';
import ProfessionalForm from '../components/ProfessionalForm';

export default function ProfessionalCreatePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[rgb(var(--orus-text-muted))]">
        <Link to="/professionals" className="hover:text-[rgb(var(--orus-accent))] transition-colors">Professionals</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[rgb(var(--orus-text))] font-medium">Novo Professional</span>
      </nav>

      {/* Form card */}
      <div className="bg-[rgb(var(--orus-panel))] rounded-2xl border border-[rgb(var(--orus-border))] shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[rgb(var(--orus-text))]">Criar Professional</h1>
          <p className="text-sm text-[rgb(var(--orus-text-muted))] mt-1">Preencha os dados para criar um novo professional.</p>
        </div>
        <ProfessionalForm />
      </div>
    </div>
  );
}