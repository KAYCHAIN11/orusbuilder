import { Link } from 'react-router-dom';
import EnrollmentForm from '../components/EnrollmentForm';

export default function EnrollmentEditPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-sm text-[rgb(var(--orus-text-muted))]">
        <Link to="/enrollments" className="hover:text-[rgb(var(--orus-accent))] transition-colors">Enrollments</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="text-[rgb(var(--orus-text))] font-medium">Editar Enrollment</span>
      </nav>
      <div className="bg-[rgb(var(--orus-panel))] rounded-2xl border border-[rgb(var(--orus-border))] shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[rgb(var(--orus-text))]">Editar Enrollment</h1>
          <p className="text-sm text-[rgb(var(--orus-text-muted))] mt-1">Atualize os dados deste enrollment.</p>
        </div>
        <EnrollmentForm />
      </div>
    </div>
  );
}