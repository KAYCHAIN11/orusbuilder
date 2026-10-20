import { useState } from 'react';

const BENEFITS = [
  {
    "number": "01",
    "title": "Casa Pátio",
    "description": "Volumes baixos, ventilação cruzada e um jardim que organiza a vida cotidiana."
  },
  {
    "number": "02",
    "title": "Refúgio da Serra",
    "description": "Pedra, madeira e sombra desenham uma relação silenciosa com a paisagem."
  },
  {
    "number": "03",
    "title": "Ateliê Urbano",
    "description": "Estrutura existente e novos usos reunidos com precisão e baixo impacto."
  }
];
const STATS = [
  {
    "value": "18",
    "label": "projetos construídos"
  },
  {
    "value": "42%",
    "label": "menos energia"
  },
  {
    "value": "6 biomas",
    "label": "como referência"
  }
];
const STEPS = [
  {
    "number": "01",
    "title": "Escuta e território",
    "description": "Entendemos rotina, clima, terreno e recursos disponíveis."
  },
  {
    "number": "02",
    "title": "Conceito e matéria",
    "description": "Transformamos restrições em uma direção espacial clara."
  },
  {
    "number": "03",
    "title": "Projeto e obra",
    "description": "Detalhamos e acompanhamos cada decisão até o espaço existir."
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div data-landing-variant="editorial" className="min-h-screen bg-stone-100 text-stone-900 font-body selection:bg-violet-500/30">
      <header className="bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100 text-stone-900 border-b border-stone-300"><div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"><a href="#" className="font-display font-bold text-xl tracking-tight">Orus Studio</a><nav className="hidden md:flex items-center gap-8 text-sm text-stone-600"><a href="#work" className="hover:opacity-70">Diferenciais</a><a href="#method" className="hover:opacity-70">Como funciona</a></nav><a href="#cta" className="text-sm font-bold px-5 py-2.5 rounded-full bg-orange-100 text-orange-950">Agendar uma conversa</a></div></header>

      <section className="bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100 px-6 pt-20 pb-24 overflow-hidden relative">
        <div className="absolute -top-32 right-[-10%] w-[34rem] h-[34rem] rounded-full border border-white/10 opacity-50" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.25fr_.75fr] gap-16 items-end relative">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime-900">Arquitetura para viver melhor</p>
            <h1 className="mt-8 font-display text-6xl sm:text-7xl lg:text-[7.4rem] leading-[.88] tracking-[-0.055em] text-stone-900">Espaços que respiram com o lugar e atravessam o tempo.</h1>
            <p className="mt-9 max-w-xl text-lg leading-relaxed text-stone-600">Orus Studio combina matéria, clima e modos de viver para criar uma arquitetura brasileira sensível, durável e essencial.</p>
            <div className="mt-10 flex flex-wrap gap-3"><a href="#cta" className="px-7 py-3.5 bg-orange-800 hover:bg-orange-700 text-white font-semibold rounded-full">Agendar uma conversa</a><a href="#work" className="px-7 py-3.5 border rounded-full font-semibold border-black/10 text-gray-900 hover:bg-black/5">Conhecer projetos</a></div>
          </div>
          <div className="lg:pb-3">
            <div className="border-t border-stone-300 pt-5 flex justify-between text-xs uppercase tracking-[.2em] text-stone-600"><span>Selected work</span><span>№ 01—03</span></div>
            <div className="mt-6 bg-amber-50 border border-stone-300 rounded-[2rem] p-7 min-h-80 flex flex-col justify-between shadow-2xl shadow-black/20 rotate-2 hover:rotate-0 transition-transform duration-500">
              <span className="text-xs font-bold uppercase tracking-[.2em] text-lime-900">composição assimétrica e tipografia protagonista</span>
              <div><p className="font-display text-3xl text-stone-900">Projetos guiados pelo lugar, pela luz e por quem vai habitá-los.</p><p className="mt-4 text-sm text-stone-600">trabalho memorável apresentado com intenção</p></div>
            </div>
          </div>
        </div>
      </section>
      
      <section id="work" className="py-24 bg-stone-200"><div className="max-w-7xl mx-auto px-6"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-lime-900">canvas vivo</p><h2 className="mt-5 font-display text-4xl sm:text-6xl tracking-[-.04em] text-stone-900">Projetos guiados pelo lugar, pela luz e por quem vai habitá-los.</h2></div><div className="mt-14 grid md:grid-cols-3 gap-5">{BENEFITS.map((benefit, index) => <article key={benefit.title} className={'bg-amber-50 border border-stone-300 rounded-[2rem] p-7 min-h-64 flex flex-col ' + (true && index === 0 ? 'md:col-span-2 ' : '') + (false && index === 1 ? 'md:-translate-y-6' : '')}><span className="text-xs font-bold tracking-[.2em] text-lime-900">{benefit.number}</span><div className="mt-auto"><h3 className="font-display text-2xl text-stone-900">{benefit.title}</h3><p className="mt-3 leading-relaxed text-stone-600">{benefit.description}</p></div></article>)}</div></div></section>
      <section id="method" className="py-24 bg-stone-100"><div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[.85fr_1.15fr] gap-16"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-lime-900">Nossa abordagem</p><blockquote className="mt-6 font-display text-3xl sm:text-4xl leading-tight text-stone-900">“A casa nasceu do terreno e da nossa rotina. Cada escolha parece inevitável, simples e profundamente nossa.”</blockquote><p className="mt-5 text-sm text-stone-600">— Família Casa Pátio</p></div><div className="border-t border-stone-300">{STEPS.map((step) => <div key={step.number} className="grid grid-cols-[3rem_1fr] gap-4 py-6 border-b border-stone-300"><span className="text-xs font-bold text-lime-900">{step.number}</span><div><h3 className="font-display text-xl text-stone-900">{step.title}</h3><p className="mt-1 text-stone-600">{step.description}</p></div></div>)}</div></div></section>
      <section id="cta" className="bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100 px-6 py-24 border-y border-stone-300"><div className="max-w-4xl mx-auto text-center"><h2 className="font-display text-4xl sm:text-6xl tracking-[-.04em] text-stone-900">Vamos imaginar o espaço que ainda não existe.</h2><p className="mt-5 text-lg text-stone-600">Conte onde você está e como deseja viver. A primeira conversa começa pelo essencial.</p>{submitted ? <div className="mt-9 inline-flex px-6 py-4 rounded-2xl bg-orange-100 text-orange-950 font-semibold">Recebido. Em breve entraremos em contato.</div> : <form className="mt-9 max-w-xl mx-auto flex flex-col sm:flex-row gap-3" onSubmit={(event) => { event.preventDefault(); if (email) setSubmitted(true); }}><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" aria-label="Email" className="flex-1 px-5 py-4 rounded-2xl bg-white text-gray-950 border-0 outline-none focus:ring-4 focus:ring-white/20"/><button className="px-7 py-4 bg-orange-800 hover:bg-orange-700 text-white font-bold rounded-2xl">Quero conversar</button></form>}</div></section>
      <footer className="bg-stone-100"><div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row gap-4 justify-between text-sm text-stone-600"><span className="font-display font-bold text-stone-900">Orus Studio</span><span>© {new Date().getFullYear()} · Criado com intenção.</span></div></footer>
    </div>
  );
}