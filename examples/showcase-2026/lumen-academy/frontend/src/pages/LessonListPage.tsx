import { Link } from 'react-router-dom';
import LessonList from '../components/LessonList';

export default function LessonListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--orus-text))]">Lessons</h1>
          <p className="text-sm text-[rgb(var(--orus-text-muted))] mt-0.5">Organizar cursos, trilhas e conteúdos de aprendizagem</p>
        </div>
        <Link
          to="/lessons/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--orus-primary))] hover:bg-[rgb(var(--orus-primary-hover))] text-[rgb(var(--orus-on-primary))] text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Lesson
        </Link>
      </div>
      <LessonList />
    </div>
  );
}