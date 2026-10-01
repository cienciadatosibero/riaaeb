import { useEffect, useMemo, useState } from 'react';
import { Cpu, Scale, HeartPulse, ArrowDown } from 'lucide-react';
import Button from './ui/Button.jsx';
import AICore from './ui/AICore.jsx';
import useTypewriter from '../hooks/useTypewriter.js';
import { useContactModal } from '../context/ContactModalContext.jsx';
import { getPortada } from '../lib/api.js';

const DEFAULTS={
  hero_eyebrow:'Red de investigación abierta',
  hero_titulo:'Tecnología que impulsa',
  hero_palabras:'la equidad\nel bienestar\nla salud\nla robótica\nlos datos\nla sociedad\nel futuro',
  hero_descripcion:'Investigamos y difundimos el avance tecnológico en múltiples campos, con datos abiertos y métodos reproducibles, para que beneficie a todas las personas.',
  hero_boton_principal:'Explora nuestras investigaciones',
  hero_boton_secundario:'Súmate a la Red',
  valor1_titulo:'Equidad',valor1_texto:'Tecnología auditada y sin sesgos.',
  valor2_titulo:'Bienestar',valor2_texto:'Innovación centrada en las personas.',
  valor3_titulo:'Avance abierto',valor3_texto:'Datos y código para la comunidad.',
};

export default function Hero() {
  const [cfg,setCfg]=useState(DEFAULTS);
  useEffect(()=>{getPortada().then((d)=>d&&setCfg({...DEFAULTS,...d})).catch(()=>{});},[]);
  const palabras=useMemo(()=>String(cfg.hero_palabras||'').split(/\r?\n|\|/).map((x)=>x.trim()).filter(Boolean),[cfg.hero_palabras]);
  const palabra=useTypewriter(palabras.length?palabras:['la equidad'],{typeSpeed:75,deleteSpeed:40,pause:1500});
  const {open}=useContactModal();
  const VALORES=[
    {icon:Scale,titulo:cfg.valor1_titulo,frase:cfg.valor1_texto},
    {icon:HeartPulse,titulo:cfg.valor2_titulo,frase:cfg.valor2_texto},
    {icon:Cpu,titulo:cfg.valor3_titulo,frase:cfg.valor3_texto},
  ];

  return <section id="inicio" className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
    <div className="pointer-events-none absolute inset-0 -z-[1] bg-gradient-to-r from-white via-white/70 to-transparent"/>
    <div className="relative mx-auto max-w-7xl px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-primary-600"><span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-primary-400"/>{cfg.hero_eyebrow}</span>
          <h1 className="font-display text-4xl font-700 leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">{cfg.hero_titulo}<br/><span className="text-gradient">{palabra}<span className="ml-1 inline-block w-[3px] -translate-y-1 animate-pulse bg-primary-400 align-middle" style={{height:'0.9em'}}/></span></h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-500">{cfg.hero_descripcion}</p>
          <div className="mt-8 flex flex-wrap gap-4"><Button href="#investigaciones">{cfg.hero_boton_principal}</Button><Button as="button" onClick={open} variant="outline" icon={false}>{cfg.hero_boton_secundario}</Button></div>
        </div>
        <div className="relative hidden lg:block"><AICore/></div>
      </div>
      <div className="mt-16 grid gap-4 border-t border-line pt-10 sm:grid-cols-3">{VALORES.map((v,i)=><div key={`${v.titulo}-${i}`} className="spotlight group flex animate-fade-up items-start gap-3 rounded-xl border border-transparent p-3 transition-all duration-300 hover:border-line hover:bg-white hover:shadow-card" style={{animationDelay:`${0.2+i*0.12}s`}}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-500 transition-all duration-300 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-[0_0_18px_rgba(225,29,58,.4)]"><v.icon size={18}/></span><div><p className="font-600 text-ink">{v.titulo}</p><p className="text-sm text-slate-500">{v.frase}</p></div></div>)}</div>
      <p className="mt-10 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest text-slate-400"><ArrowDown size={14} className="animate-bounce"/>Desplázate para descubrir</p>
    </div>
  </section>;
}
