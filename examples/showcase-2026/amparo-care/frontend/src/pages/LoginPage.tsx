import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('E-mail ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--orus-page))] text-[rgb(var(--orus-text))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-[rgb(var(--orus-primary))] rounded-2xl items-center justify-center mb-4 shadow-lg shadow-black/10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="text-sm text-[rgb(var(--orus-muted))] mt-1">Entre na sua conta para continuar</p>
        </div>

        {/* Card */}
        <div className="bg-[rgb(var(--orus-panel))] rounded-2xl shadow-xl shadow-black/10 border border-[rgb(var(--orus-border))] p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-sm font-medium mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                 placeholder="voce@empresa.com"
                 className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] focus:border-transparent transition"
              />
            </div>
            <div>
               <label className="block text-sm font-medium mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                 className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))] focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
               className="w-full py-2.5 bg-[rgb(var(--orus-primary))] hover:opacity-90 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
               {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-[rgb(var(--orus-muted))]">
            Ainda não tem uma conta?{' '}
            <Link to="/register" className="text-[rgb(var(--orus-primary))] hover:underline font-medium">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}