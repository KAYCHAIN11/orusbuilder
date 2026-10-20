import { useState } from 'react';

const BENEFITS = [
  {
    "number": "01",
    "title": "Ativos que fazem sentido",
    "description": "Ingredientes explicados sem mistério e combinados com intenção."
  },
  {
    "number": "02",
    "title": "Rotina descomplicada",
    "description": "Poucos passos, texturas prazerosas e constância possível."
  },
  {
    "number": "03",
    "title": "Escolha mais segura",
    "description": "Orientação clara para encontrar o cuidado certo para sua pele."
  }
];
const STATS = [
  {
    "value": "95%",
    "label": "amou a textura"
  },
  {
    "value": "3 passos",
    "label": "para cuidar"
  },
  {
    "value": "30 dias",
    "label": "para experimentar"
  }
];
const STEPS = [
  {
    "number": "01",
    "title": "Descubra",
    "description": "Conte o momento da sua pele."
  },
  {
    "number": "02",
    "title": "Combine",
    "description": "Monte um ritual possível."
  },
  {
    "number": "03",
    "title": "Sinta",
    "description": "Acompanhe sua evolução."
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div data-landing-variant="showcase" className="min-h-screen bg-stone-50 text-stone-950 font-body selection:bg-violet-500/30">
      <header className="bg-gradient-to-br from-stone-950 via-orange-950 to-rose-900 text-white border-b border-orange-100"><div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"><a href="#" className="font-display font-bold text-xl tracking-tight">VIVA</a><nav className="hidden md:flex items-center gap-8 text-sm text-white/70"><a href="#work" className="hover:text-white">Diferenciais</a><a href="#method" className="hover:text-white">Como funciona</a></nav><a href="#cta" className="text-sm font-bold px-5 py-2.5 rounded-full bg-orange-50 text-orange-800">Montar meu ritual</a></div></header>

      <section className="bg-gradient-to-br from-stone-950 via-orange-950 to-rose-900 px-6 pt-16 pb-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto text-center relative">
          <p className="inline-flex px-4 py-2 rounded-full bg-orange-50 text-orange-800 text-xs font-bold uppercase tracking-[.2em]">Sua pele, seu ritual, sua luz</p>
          <h1 className="mt-7 max-w-5xl mx-auto font-display text-5xl sm:text-7xl lg:text-8xl leading-[.95] tracking-[-.05em] text-white">Cuidado gostoso de usar. Resultado fácil de sentir.</h1>
          <p className="mt-7 max-w-2xl mx-auto text-lg text-white/70">VIVA transforma ativos eficazes em uma rotina leve, vibrante e simples de manter todos os dias.</p>
          <div className="mt-9 flex justify-center flex-wrap gap-3"><a href="#cta" className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl shadow-xl">Montar meu ritual</a><a href="#work" className="px-8 py-4 border rounded-2xl font-bold border-white/15 text-white hover:bg-white/10">Conhecer os ativos</a></div>
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 items-end max-w-5xl mx-auto">
            {[0,1,2,3].map((item) => <div key={item} className={'bg-white border border-orange-100 rounded-[2rem] p-4 shadow-2xl flex items-end ' + (item % 2 === 0 ? 'h-64 ' : 'h-80 ') + (item === 1 ? '-rotate-3' : item === 2 ? 'rotate-3' : '')}><div className="w-full rounded-2xl h-24 bg-gradient-to-br from-white/30 to-transparent border border-orange-100" /></div>)}
          </div>
        </div>
      </section>
      <section className="border-y border-orange-100 bg-stone-50"><div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-3 gap-4">{STATS.map((stat) => <div key={stat.label} className="text-center"><strong className="block font-display text-2xl sm:text-3xl text-stone-950">{stat.value}</strong><span className="text-[11px] sm:text-xs uppercase tracking-wider text-stone-600">{stat.label}</span></div>)}</div></section>
      <section id="work" className="py-24 bg-orange-50"><div className="max-w-7xl mx-auto px-6"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-rose-500">vitrine em movimento</p><h2 className="mt-5 font-display text-4xl sm:text-6xl tracking-[-.04em] text-stone-950">Fórmulas inteligentes para uma rotina que cabe na vida real.</h2></div><div className="mt-14 grid md:grid-cols-3 gap-5">{BENEFITS.map((benefit, index) => <article key={benefit.title} className={'bg-white border border-orange-100 rounded-[2rem] p-7 min-h-64 flex flex-col ' + (false && index === 0 ? 'md:col-span-2 ' : '') + (true && index === 1 ? 'md:-translate-y-6' : '')}><span className="text-xs font-bold tracking-[.2em] text-rose-500">{benefit.number}</span><div className="mt-auto"><h3 className="font-display text-2xl text-stone-950">{benefit.title}</h3><p className="mt-3 leading-relaxed text-stone-600">{benefit.description}</p></div></article>)}</div></div></section>
      <section id="method" className="py-24 bg-stone-50"><div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[.85fr_1.15fr] gap-16"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-rose-500">Nossa abordagem</p><blockquote className="mt-6 font-display text-3xl sm:text-4xl leading-tight text-stone-950">“Minha rotina ficou mais simples, minha pele mais confortável e eu finalmente entendi o que estava usando.”</blockquote><p className="mt-5 text-sm text-stone-600">— Comunidade VIVA</p></div><div className="border-t border-orange-100">{STEPS.map((step) => <div key={step.number} className="grid grid-cols-[3rem_1fr] gap-4 py-6 border-b border-orange-100"><span className="text-xs font-bold text-rose-500">{step.number}</span><div><h3 className="font-display text-xl text-stone-950">{step.title}</h3><p className="mt-1 text-stone-600">{step.description}</p></div></div>)}</div></div></section>
      <section id="cta" className="bg-gradient-to-br from-stone-950 via-orange-950 to-rose-900 px-6 py-24 border-y border-orange-100"><div className="max-w-4xl mx-auto text-center"><h2 className="font-display text-4xl sm:text-6xl tracking-[-.04em] text-white">Sua próxima descoberta começa na pele.</h2><p className="mt-5 text-lg text-white/70">Receba lançamentos, rituais e escolhas feitas para o seu momento.</p>{submitted ? <div className="mt-9 inline-flex px-6 py-4 rounded-2xl bg-orange-50 text-orange-800 font-semibold">Recebido. Em breve entraremos em contato.</div> : <form className="mt-9 max-w-xl mx-auto flex flex-col sm:flex-row gap-3" onSubmit={(event) => { event.preventDefault(); if (email) setSubmitted(true); }}><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" aria-label="Email" className="flex-1 px-5 py-4 rounded-2xl bg-white text-gray-950 border-0 outline-none focus:ring-4 focus:ring-white/20"/><button className="px-7 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl">Quero conversar</button></form>}</div></section>
      <footer className="bg-stone-50"><div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row gap-4 justify-between text-sm text-stone-600"><span className="font-display font-bold text-stone-950">VIVA</span><span>© {new Date().getFullYear()} · Criado com intenção.</span></div></footer>
    </div>
  );
}