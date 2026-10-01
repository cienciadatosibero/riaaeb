// frontend/src/components/News.jsx
import { useEffect, useRef, useState } from 'react';
import { Calendar, History, Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SectionTitle from './ui/SectionTitle.jsx';
import NewsModal from './ui/NewsModal.jsx';
import { getNoticias } from '../lib/api.js';

function formatoFecha(fecha) {
  try {
    return new Date(fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return fecha; }
}

/* Tarjeta de noticia (solo texto), clicable, que entra con animación. */
function Tarjeta({ n, lado, i, onAbrir }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const izq = lado === 'izq';
  const trans = visible
    ? 'translate-x-0 translate-y-0 opacity-100 rotate-0'
    : `${izq ? '-translate-x-16' : 'translate-x-16'} translate-y-6 opacity-0 ${izq ? '-rotate-2' : 'rotate-2'}`;

  return (
    <button
      ref={ref}
      onClick={onAbrir}
      style={{ transitionDelay: `${i * 0.08}s` }}
      className={`spotlight group relative w-full max-w-md cursor-pointer rounded-2xl border border-line bg-white p-5 text-left shadow-card transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-primary-300 hover:shadow-lift ${trans}`}
    >
      <span className={`absolute top-1/2 hidden h-px w-8 -translate-y-1/2 bg-gradient-to-r from-primary-400 to-transparent md:block ${izq ? 'right-0 translate-x-full' : 'left-0 -translate-x-full scale-x-[-1]'}`} />

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-white">
          <Tag size={11} /> {n.categoria}
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400">
          <Calendar size={12} /> {formatoFecha(n.fecha)}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-700 leading-snug text-ink transition-colors group-hover:text-primary-600">
        {n.titulo}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{n.extracto}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-600 text-primary-500 opacity-0 transition-opacity group-hover:opacity-100">
        Leer más <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

export default function News() {
  const [noticias, setNoticias] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [abierta, setAbierta] = useState(null);

  useEffect(() => {
    getNoticias()
      .then((data) => { setNoticias(data); setEstado('listo'); })
      .catch(() => setEstado('error'));
  }, []);

  // Solo las 5 más recientes
  const recientes = noticias.slice(0, 5);

  return (
    <section id="noticias" className="relative overflow-hidden border-t border-line py-24">
      <div className="glow-bg pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionTitle
            index="04"
            eyebrow="Noticias"
            title="Lo último de la Red"
            subtitle="Recorre nuestras cinco publicaciones más recientes. Haz clic en cualquiera para ver la información completa."
          />
          <Link
            to="/noticias"
            className="btn-shine group inline-flex shrink-0 items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-600 text-ink transition-all hover:border-primary-400 hover:text-primary-600 hover:shadow-card"
          >
            <History size={16} /> Ver historial ({noticias.length})
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* CARRETERA en perspectiva 3D */}
        <div className="relative mt-16" style={{ perspective: '1200px' }}>
          <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-[min(620px,80%)] -translate-x-1/2 md:block"
               style={{ transform: 'translateX(-50%) rotateX(48deg)', transformOrigin: 'top center' }}>
            <div className="absolute inset-0 rounded-[40%] bg-gradient-to-b from-primary-500/12 via-primary-400/5 to-transparent" />
            <div className="absolute inset-0" style={{
              background: 'repeating-linear-gradient(to bottom, transparent 0, transparent 46px, rgba(225,29,58,.35) 46px, rgba(225,29,58,.35) 64px)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,.9), transparent 85%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,.9), transparent 85%)',
              clipPath: 'polygon(48% 0, 52% 0, 70% 100%, 30% 100%)',
            }} />
            <div className="absolute inset-0" style={{ clipPath: 'polygon(48% 0, 48.6% 0, 31% 100%, 29% 100%)', background: 'linear-gradient(to bottom, #e11d3a, transparent)' }} />
            <div className="absolute inset-0" style={{ clipPath: 'polygon(51.4% 0, 52% 0, 71% 100%, 69% 100%)', background: 'linear-gradient(to bottom, #e11d3a, transparent)' }} />
          </div>

          <div className="absolute left-[9px] top-0 h-full w-px bg-gradient-to-b from-primary-400 via-line to-transparent md:hidden" />

          {estado === 'cargando' && (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="ml-8 h-24 animate-pulse rounded-2xl border border-line bg-white md:ml-0" />
              ))}
            </div>
          )}
          {estado === 'error' && (
            <p className="ml-8 rounded-xl border border-primary-200 bg-primary-50 p-6 text-sm text-primary-700 md:ml-0">
              No pudimos cargar las noticias. Verifica que el backend esté en ejecución.
            </p>
          )}
          {estado === 'listo' && (
            <div className="relative space-y-8 md:space-y-12">
              {recientes.map((n, i) => {
                const izq = i % 2 === 0;
                return (
                  <div key={n.id} className="relative flex pl-8 md:pl-0">
                    <span className="absolute left-[9px] top-8 z-20 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full border-2 border-white bg-primary-500 shadow-[0_0_0_4px_rgba(225,29,58,0.15)] md:left-1/2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <div className={`flex w-full md:w-1/2 ${izq ? 'md:justify-end md:pr-12' : 'md:ml-auto md:justify-start md:pl-12'}`}>
                      <Tarjeta n={n} lado={izq ? 'izq' : 'der'} i={i} onAbrir={() => setAbierta(n)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {abierta && <NewsModal noticia={abierta} onClose={() => setAbierta(null)} />}
    </section>
  );
}
