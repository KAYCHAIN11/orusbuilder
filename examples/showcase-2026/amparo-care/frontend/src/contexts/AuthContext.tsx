import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

interface User { id: string; email: string; name: string; role: 'admin' | 'editor' | 'member' | 'viewer'; }

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const previewMode = import.meta.env.VITE_ORUS_PREVIEW_MODE === 'true';
const previewAccessValue = 'orus-preview-token';
const previewUser: User = {
  id: 'orus-preview-user',
  email: 'preview@orus.local',
  name: 'Visitante',
  role: 'admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(previewMode ? previewUser : null);
  const [token, setToken] = useState<string | null>(previewMode ? previewAccessValue : localStorage.getItem('token'));
  const [loading, setLoading] = useState(!previewMode);

  useEffect(() => {
    if (previewMode) {
      api.defaults.headers.common['Authorization'] = `Bearer ${previewAccessValue}`;
      return;
    }
    if (token) {
      api.get('/api/auth/me')
        .then(res => setUser(res.data?.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await api.post('/api/auth/register', { email, password, name });
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('token', t);
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    if (previewMode) return;
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}