/**
 * ============================================================================
 * ORUS BUILDER - AUTHENTICATION PAGE
 * ============================================================================
 *
 * DEVELOPER: Tulio (ORUS Creator)
 * CREATED: 2026-10-07T00:00:00-03:00
 * COMPONENT_HASH: orus.frontend.page.auth.20261007.AUTH1A2B
 *
 * COGNITIVE AGENT DNA:
 * - AGENT_TYPE: AuthenticationExperienceAgent
 * - COGNITIVE_LEVEL: Advanced
 * - AUTONOMY_DEGREE: 88
 * - TRINITY_INTEGRATED: Cerebro + Voz
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, Sparkles, User } from 'lucide-react';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useAuthStore } from '@store/auth.store';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>(location.pathname === '/register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const destination = typeof (location.state as { from?: unknown } | null)?.from === 'string'
    ? String((location.state as { from: string }).from)
    : '/dashboard';

  useEffect(() => {
    if (isAuthenticated) navigate(destination, { replace: true });
  }, [destination, isAuthenticated, navigate]);

  const switchMode = () => {
    clearError();
    setMode(current => current === 'login' ? 'register' : 'login');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
        return;
      }
      await register({ name: form.name, email: form.email, password: form.password, acceptTerms: true });
    } catch {
      return;
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(139,92,246,0.18),transparent_32%),radial-gradient(circle_at_86%_82%,rgba(34,211,238,0.12),transparent_28%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-12">
        <section className="hidden lg:block">
          <Link to="/" className="mb-14 inline-flex items-center gap-3 text-lg font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-[#07070b]">
              <Sparkles className="h-5 w-5" />
            </span>
            ORUS Builder
          </Link>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Workspace cognitivo</p>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
            Da intenção ao software funcional, no mesmo ambiente.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/58">
            Planeje, gere, certifique e mantenha aplicações completas com o pipeline cognitivo do ORUS.
          </p>
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-3 text-sm text-white/70">
            {['Blueprint real', 'Código editável', 'Certificação CIG'].map(item => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">{item}</div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.055] p-7 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:p-9">
          <Link to="/" className="mb-9 inline-flex items-center gap-3 font-semibold lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-[#07070b]">
              <Sparkles className="h-4 w-4" />
            </span>
            ORUS Builder
          </Link>
          <p className="text-sm font-medium text-cyan-300">{mode === 'login' ? 'Bem-vindo de volta' : 'Crie seu workspace'}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">{mode === 'login' ? 'Acesse sua conta' : 'Comece a construir'}</h2>
          <p className="mt-3 text-sm leading-6 text-white/50">
            {mode === 'login' ? 'Continue seus projetos e gerações certificadas.' : 'Sua conta mantém projetos, arquivos e histórico de geração.'}
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <Input
                label="Nome"
                value={form.name}
                onChange={event => setForm({ ...form, name: event.target.value })}
                leftIcon={<User className="h-4 w-4" />}
                autoComplete="name"
                required
                fullWidth
              />
            )}
            <Input
              label="E-mail"
              type="email"
              value={form.email}
              onChange={event => setForm({ ...form, email: event.target.value })}
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
              fullWidth
            />
            <Input
              label="Senha"
              type="password"
              value={form.password}
              onChange={event => setForm({ ...form, password: event.target.value })}
              leftIcon={<LockKeyhole className="h-4 w-4" />}
              helperText={mode === 'register' ? 'Use 8+ caracteres, maiúscula, minúscula, número e símbolo.' : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              fullWidth
            />
            {error && <div role="alert" className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            <Button type="submit" fullWidth size="lg" isLoading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>
              {mode === 'login' ? 'Entrar no Builder' : 'Criar conta'}
            </Button>
          </form>

          <button type="button" onClick={switchMode} className="mt-6 w-full text-center text-sm text-white/55 transition hover:text-white">
            {mode === 'login' ? 'Ainda não tem conta? Criar agora' : 'Já tem uma conta? Entrar'}
          </button>
        </section>
      </div>
    </main>
  );
};

