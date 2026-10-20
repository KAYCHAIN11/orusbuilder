import { useState } from 'react';

const BENEFITS = [
  {
    "number": "01",
    "title": "Cuidado contínuo",
    "description": "Cada contato mantém o contexto e dá sequência à jornada do paciente."
  },
  {
    "number": "02",
    "title": "Equipe coordenada",
    "description": "Agenda, prioridades e informações essenciais no mesmo fluxo."
  },
  {
    "number": "03",
    "title": "Confiança em cada etapa",
    "description": "Comunicação clara e sinais importantes sempre visíveis."
  }
];
const STATS = [
  {
    "value": "1 jornada",
    "label": "do início ao retorno"
  },
  {
    "value": "24h",
    "label": "de continuidade"
  },
  {
    "value": "+ cuidado",
    "label": "menos atrito"
  }
];
const STEPS = [
  {
    "number": "01",
    "title": "Acolha",
    "description": "Organize a entrada do paciente."
  },
  {
    "number": "02",
    "title": "Acompanhe",
    "description": "Mantenha o contexto vivo."
  },
  {
    "number": "03",
    "title": "Cuide",
    "description": "Antecipe o próximo passo."
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div data-landing-variant="product" className="min-h-screen bg-slate-50 text-slate-950 font-body selection:bg-violet-500/30">
      <header className="bg-gradient-to-br from-teal-950 via-teal-800 to-emerald-600 text-white border-b border-teal-100"><div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"><a href="#" className="font-display font-bold text-xl tracking-tight">Serena</a><nav className="hidden md:flex items-center gap-8 text-sm text-white/70"><a href="#work" className="hover:text-white">Diferenciais</a><a href="#method" className="hover:text-white">Como funciona</a></nav><a href="#cta" className="text-sm font-bold px-5 py-2.5 rounded-full bg-teal-50 text-teal-800">Conhecer a experiência</a></div></header>

      <section className="bg-gradient-to-br from-teal-950 via-teal-800 to-emerald-600 px-6 py-20 lg:py-28 overflow-hidden relative">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_15%_20%,rgba(255,255,255,.16),transparent_24%),radial-gradient(circle_at_85%_70%,rgba(45,212,191,.22),transparent_28%)]" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative">
          <div><p className="text-xs font-bold uppercase tracking-[.24em] text-emerald-500">Tecnologia a serviço do cuidado</p><h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl leading-[.98] tracking-[-.045em] text-white">Cuidado que começa antes da consulta e continua depois dela.</h1><p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70">Serena aproxima equipes e pacientes em uma jornada mais humana, coordenada e segura.</p><div className="mt-9 flex flex-wrap gap-3"><a href="#cta" className="px-7 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-xl">Conhecer a experiência</a><a href="#work" className="px-7 py-3.5 border rounded-xl font-semibold border-white/15 text-white hover:bg-white/10">Ver como funciona</a></div></div>
          <div className="bg-white border border-teal-100 rounded-[2rem] p-3 shadow-2xl shadow-black/25 lg:rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="rounded-[1.5rem] bg-teal-50 border border-teal-100 overflow-hidden"><div className="h-12 border-b border-teal-100 flex items-center px-5 gap-2"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"/><span className="w-2.5 h-2.5 rounded-full bg-amber-400"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"/><span className="ml-auto text-[10px] uppercase tracking-widest text-slate-600">Live workspace</span></div><div className="p-6 grid grid-cols-3 gap-3"><div className="col-span-2 h-40 rounded-2xl bg-teal-50 text-teal-800 p-5 flex flex-col justify-between"><span className="text-xs font-bold uppercase tracking-widest">Overview</span><div className="flex items-end gap-2 h-20">{[40,65,50,88,72,96,82].map((height) => <span key={height} style={{height: height + '%'}} className="flex-1 bg-teal-600 rounded-t-md opacity-80" />)}</div></div><div className="h-40 rounded-2xl bg-white border border-teal-100 p-4"><span className="text-3xl font-display font-bold text-slate-950">1 jornada</span><p className="mt-2 text-xs text-slate-600">do início ao retorno</p></div><div className="col-span-3 h-20 rounded-2xl bg-white border border-teal-100 flex items-center px-5 gap-3"><span className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800"/><div className="flex-1"><div className="w-2/3 h-2 rounded-full bg-teal-50 text-teal-800"/><div className="mt-2 w-1/2 h-2 rounded-full bg-teal-50 text-teal-800 opacity-60"/></div><span className="text-xs font-semibold text-emerald-500">On track</span></div></div></div>
          </div>
        </div>
      </section>
      <section className="border-y border-teal-100 bg-slate-50"><div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-3 gap-4">{STATS.map((stat) => <div key={stat.label} className="text-center"><strong className="block font-display text-2xl sm:text-3xl text-slate-950">{stat.value}</strong><span className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-600">{stat.label}</span></div>)}</div></section>
      <section id="work" className="py-24 bg-teal-50"><div className="max-w-7xl mx-auto px-6"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-500">ritmo de cuidado contínuo</p><h2 className="mt-5 font-display text-4xl sm:text-6xl tracking-[-.04em] text-slate-950">Feito para cuidar de pessoas, não de processos.</h2></div><div className="mt-14 grid md:grid-cols-3 gap-5">{BENEFITS.map((benefit, index) => <article key={benefit.title} className={'bg-white border border-teal-100 rounded-[2rem] p-7 min-h-64 flex flex-col ' + (false && index === 0 ? 'md:col-span-2 ' : '') + (false && index === 1 ? 'md:-translate-y-6' : '')}><span className="text-xs font-bold tracking-[.2em] text-emerald-500">{benefit.number}</span><div className="mt-auto"><h3 className="font-display text-2xl text-slate-950">{benefit.title}</h3><p className="mt-3 leading-relaxed text-slate-600">{benefit.description}</p></div></article>)}</div></div></section>
      <section id="method" className="py-24 bg-slate-50"><div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[.85fr_1.15fr] gap-16"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-emerald-500">Nossa abordagem</p><blockquote className="mt-6 font-display text-3xl sm:text-4xl leading-tight text-slate-950">“Nossa equipe ganhou tempo para o que realmente importa: acompanhar cada pessoa com atenção.”</blockquote><p className="mt-5 text-sm text-slate-600">— Equipe de cuidado</p></div><div className="border-t border-teal-100">{STEPS.map((step) => <div key={step.number} className="grid grid-cols-[3rem_1fr] gap-4 py-6 border-b border-teal-100"><span className="text-xs font-bold text-emerald-500">{step.number}</span><div><h3 className="font-display text-xl text-slate-950">{step.title}</h3><p className="mt-1 text-slate-600">{step.description}</p></div></div>)}</div></div></section>
      <section id="cta" className="bg-gradient-to-br from-teal-950 via-teal-800 to-emerald-600 px-6 py-24 border-y border-teal-100"><div className="max-w-4xl mx-auto text-center"><h2 className="font-display text-4xl sm:text-6xl tracking-[-.04em] text-white">Uma jornada de cuidado mais próxima.</h2><p className="mt-5 text-lg text-white/70">Descubra como sua equipe pode coordenar cada etapa sem perder o vínculo humano.</p>{submitted ? <div className="mt-9 inline-flex px-6 py-4 rounded-2xl bg-teal-50 text-teal-800 font-semibold">Recebido. Em breve entraremos em contato.</div> : <form className="mt-9 max-w-xl mx-auto flex flex-col sm:flex-row gap-3" onSubmit={(event) => { event.preventDefault(); if (email) setSubmitted(true); }}><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" aria-label="Email" className="flex-1 px-5 py-4 rounded-2xl bg-white text-gray-950 border-0 outline-none focus:ring-4 focus:ring-white/20"/><button className="px-7 py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl">Quero conversar</button></form>}</div></section>
      <footer className="bg-slate-50"><div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row gap-4 justify-between text-sm text-slate-600"><span className="font-display font-bold text-slate-950">Serena</span><span>© {new Date().getFullYear()} · Criado com intenção.</span></div></footer>
    </div>
  );
}