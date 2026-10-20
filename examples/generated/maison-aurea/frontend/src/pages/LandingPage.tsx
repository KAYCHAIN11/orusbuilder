import { useState } from 'react';

const BENEFITS = [
  {
    "number": "01",
    "title": "Curadoria rara",
    "description": "Peças escolhidas por desenho, proporção e caráter, além da tendência."
  },
  {
    "number": "02",
    "title": "Origem transparente",
    "description": "Materiais, lapidação e acabamento apresentados com clareza."
  },
  {
    "number": "03",
    "title": "Atendimento privado",
    "description": "Uma experiência pessoal para escolher com tempo e confiança."
  }
];
const STATS = [
  {
    "value": "18k",
    "label": "ouro certificado"
  },
  {
    "value": "1 de 1",
    "label": "seleção pessoal"
  },
  {
    "value": "para sempre",
    "label": "assistência da maison"
  }
];
const STEPS = [
  {
    "number": "01",
    "title": "Descubra",
    "description": "Conheça peças e histórias."
  },
  {
    "number": "02",
    "title": "Experimente",
    "description": "Agende uma apresentação privada."
  },
  {
    "number": "03",
    "title": "Celebre",
    "description": "Leve uma joia com significado."
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div data-landing-variant="editorial" className="min-h-screen bg-neutral-950 text-amber-50 font-body selection:bg-violet-500/30">
      <header className="bg-gradient-to-br from-black via-neutral-950 to-amber-950 text-white border-b border-amber-400/20"><div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between"><a href="#" className="font-display font-bold text-xl tracking-tight">Maison Aurea</a><nav className="hidden md:flex items-center gap-8 text-sm text-white/70"><a href="#work" className="hover:text-white">Diferenciais</a><a href="#method" className="hover:text-white">Como funciona</a></nav><a href="#cta" className="text-sm font-bold px-5 py-2.5 rounded-full bg-amber-400/10 text-amber-300">Explorar a coleção</a></div></header>

      <section className="bg-gradient-to-br from-black via-neutral-950 to-amber-950 px-6 pt-20 pb-24 overflow-hidden relative">
        <div className="absolute -top-32 right-[-10%] w-[34rem] h-[34rem] rounded-full border border-white/10 opacity-50" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.25fr_.75fr] gap-16 items-end relative">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-400">Joias feitas para permanecer</p>
            <h1 className="mt-8 font-display text-6xl sm:text-7xl lg:text-[7.4rem] leading-[.88] tracking-[-0.055em] text-white">Peças que atravessam o tempo e guardam histórias.</h1>
            <p className="mt-9 max-w-xl text-lg leading-relaxed text-white/70">Maison Aurea reúne design autoral, materiais nobres e uma curadoria criada para celebrar momentos que não se repetem.</p>
            <div className="mt-10 flex flex-wrap gap-3"><a href="#cta" className="px-7 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-full">Explorar a coleção</a><a href="#work" className="px-7 py-3.5 border rounded-full font-semibold border-white/15 text-white hover:bg-white/10">Conhecer o atelier</a></div>
          </div>
          <div className="lg:pb-3">
            <div className="border-t border-amber-400/20 pt-5 flex justify-between text-xs uppercase tracking-[.2em] text-white/70"><span>Selected work</span><span>№ 01—03</span></div>
            <div className="mt-6 bg-neutral-900 border border-amber-400/20 rounded-[2rem] p-7 min-h-80 flex flex-col justify-between shadow-2xl shadow-black/20 rotate-2 hover:rotate-0 transition-transform duration-500">
              <span className="text-xs font-bold uppercase tracking-[.2em] text-amber-400">cards de produto, contrastes quentes e chamadas decisivas</span>
              <div><p className="font-display text-3xl text-amber-50">Raridade, origem e acabamento revelados em cada detalhe.</p><p className="mt-4 text-sm text-neutral-400">descoberta rápida até a conversão</p></div>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-amber-400/20 bg-neutral-950"><div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-3 gap-4">{STATS.map((stat) => <div key={stat.label} className="text-center"><strong className="block font-display text-2xl sm:text-3xl text-amber-50">{stat.value}</strong><span className="text-[11px] sm:text-xs uppercase tracking-wider text-neutral-400">{stat.label}</span></div>)}</div></section>
      <section id="work" className="py-24 bg-neutral-900/70"><div className="max-w-7xl mx-auto px-6"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-amber-400">vitrine em movimento</p><h2 className="mt-5 font-display text-4xl sm:text-6xl tracking-[-.04em] text-amber-50">Raridade, origem e acabamento revelados em cada detalhe.</h2></div><div className="mt-14 grid md:grid-cols-3 gap-5">{BENEFITS.map((benefit, index) => <article key={benefit.title} className={'bg-neutral-900 border border-amber-400/20 rounded-[2rem] p-7 min-h-64 flex flex-col ' + (true && index === 0 ? 'md:col-span-2 ' : '') + (false && index === 1 ? 'md:-translate-y-6' : '')}><span className="text-xs font-bold tracking-[.2em] text-amber-400">{benefit.number}</span><div className="mt-auto"><h3 className="font-display text-2xl text-amber-50">{benefit.title}</h3><p className="mt-3 leading-relaxed text-neutral-400">{benefit.description}</p></div></article>)}</div></div></section>
      <section id="method" className="py-24 bg-neutral-950"><div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[.85fr_1.15fr] gap-16"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-amber-400">Nossa abordagem</p><blockquote className="mt-6 font-display text-3xl sm:text-4xl leading-tight text-amber-50">“Cada peça chegou com a presença de uma joia única e a delicadeza de algo feito especialmente para mim.”</blockquote><p className="mt-5 text-sm text-neutral-400">— Cliente da maison</p></div><div className="border-t border-amber-400/20">{STEPS.map((step) => <div key={step.number} className="grid grid-cols-[3rem_1fr] gap-4 py-6 border-b border-amber-400/20"><span className="text-xs font-bold text-amber-400">{step.number}</span><div><h3 className="font-display text-xl text-amber-50">{step.title}</h3><p className="mt-1 text-neutral-400">{step.description}</p></div></div>)}</div></div></section>
      <section id="cta" className="bg-gradient-to-br from-black via-neutral-950 to-amber-950 px-6 py-24 border-y border-amber-400/20"><div className="max-w-4xl mx-auto text-center"><h2 className="font-display text-4xl sm:text-6xl tracking-[-.04em] text-white">Encontre a joia que contará a sua história.</h2><p className="mt-5 text-lg text-white/70">Agende uma apresentação privada e descubra peças selecionadas para o seu momento.</p>{submitted ? <div className="mt-9 inline-flex px-6 py-4 rounded-2xl bg-amber-400/10 text-amber-300 font-semibold">Recebido. Em breve entraremos em contato.</div> : <form className="mt-9 max-w-xl mx-auto flex flex-col sm:flex-row gap-3" onSubmit={(event) => { event.preventDefault(); if (email) setSubmitted(true); }}><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" aria-label="Email" className="flex-1 px-5 py-4 rounded-2xl bg-white text-gray-950 border-0 outline-none focus:ring-4 focus:ring-white/20"/><button className="px-7 py-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-2xl">Quero conversar</button></form>}</div></section>
      <footer className="bg-neutral-950"><div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row gap-4 justify-between text-sm text-neutral-400"><span className="font-display font-bold text-amber-50">Maison Aurea</span><span>© {new Date().getFullYear()} · Criado com intenção.</span></div></footer>
    </div>
  );
}