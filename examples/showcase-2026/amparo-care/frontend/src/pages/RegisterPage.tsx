import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password, name);
      navigate('/');
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--orus-page))] text-[rgb(var(--orus-text))] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-[rgb(var(--orus-primary))] rounded-2xl items-center justify-center mb-4 shadow-lg shadow-black/10">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-sm text-[rgb(var(--orus-muted))] mt-1">Preencha seus dados para começar</p>
        </div>

        <div className="bg-[rgb(var(--orus-panel))] rounded-2xl shadow-xl shadow-black/10 border border-[rgb(var(--orus-border))] p-8 space-y-5">
          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required minLength={2} className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-2.5 bg-[rgb(var(--orus-panel))] text-[rgb(var(--orus-text))] border border-[rgb(var(--orus-border))] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--orus-primary))]" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-[rgb(var(--orus-primary))] hover:opacity-90 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition">
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
          <p className="text-center text-sm text-[rgb(var(--orus-muted))]">
            Já tem uma conta? <Link to="/login" className="text-[rgb(var(--orus-primary))] hover:underline font-medium">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}