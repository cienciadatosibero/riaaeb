// frontend/src/components/About.jsx
import { useEffect, useState } from 'react';
import { Target, Eye, Heart, Cpu, Stethoscope, Bot, Database } from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';
import Spotlight from './ui/Spotlight.jsx';
import { getAbout, getAreasInvestigacion } from '../lib/api.js';

const POR_DEFECTO = {
  titulo: 'Una red que investiga tecnología con propósito',
  subtitulo: 'Reunimos perfiles de distintas disciplinas para llevar el avance tecnológico a problemas reales de equidad y bienestar.',
  mision: 'Desarrollar y difundir avances tecnológicos que reduzcan desigualdades y mejoren el bienestar de las personas.',
  vision: 'Ser una red de referencia en tecnología responsable, donde la investigación se hace en abierto y en colaboración.',
  valores: 'Equidad, transparencia, rigor científico y compromiso con el impacto social positivo.',
  imagen_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80',
};

const ICONOS=[Cpu,Stethoscope,Bot,Database];
const CAMPOS_DEFAULT=['Inteligencia artificial','Salud y bienestar','Robótica','Ciencia de datos'];

export default function About() {
  const [a, setA] = useState(POR_DEFECTO);
  const [areasInvestigacion,setAreasInvestigacion]=useState(CAMPOS_DEFAULT.map((nombre,i)=>({id:`d${i}`,nombre})));

  useEffect(() => {
    getAbout().then((d) => { if (d) setA({ ...POR_DEFECTO, ...d }); }).catch(() => {});
    getAreasInvestigacion().then((d)=>{ if((d||[]).length) setAreasInvestigacion(d); }).catch(()=>{});
  }, []);

  const PILARES = [
    { icon: Target, titulo: 'Misión', texto: a.mision },
    { icon: Eye, titulo: 'Visión', texto: a.vision },
    { icon: Heart, titulo: 'Valores', texto: a.valores },
  ];

  return (
    <section id="nosotros" className="relative overflow-hidden py-24">
      <div className="glow-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <Spotlight className="group relative overflow-hidden rounded-2xl border border-line shadow-card">
          <img
            src={a.imagen_url}
            alt="Equipo de investigación de la Red"
            className="h-[460px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary-400/20" />
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {areasInvestigacion.slice(0,6).map((c,i) => {
              const Icon=ICONOS[i%ICONOS.length];
              return <span key={c.id||c.nombre} className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs text-ink shadow-sm backdrop-blur">
                <Icon size={12} className="text-primary-500" /> {c.nombre}
              </span>;
            })}
          </div>
        </Spotlight>

        <div>
          <SectionTitle index="01" eyebrow="Quiénes somos" title={a.titulo} subtitle={a.subtitulo} />
          <div className="mt-8 space-y-4">
            {PILARES.map((p) => (
              <Spotlight
                key={p.titulo}
                className="group flex gap-4 rounded-xl border border-line bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lift"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-500 transition-all duration-300 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-[0_0_18px_rgba(225,29,58,.4)]">
                  <p.icon size={20} />
                </span>
                <div>
                  <p className="font-display font-700 text-ink">{p.titulo}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{p.texto}</p>
                </div>
              </Spotlight>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
