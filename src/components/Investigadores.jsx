// frontend/src/components/Investigadores.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, Users, X, ExternalLink } from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';
import Portal from './ui/Portal.jsx';
import { getInvestigadores } from '../lib/api.js';

/* Tarjeta del carrusel. */
function Card({ p, frente, onAbrir }) {
  return (
    <article
      className={`relative h-[420px] w-[300px] overflow-hidden rounded-[28px] border bg-white shadow-card transition-all duration-500
        ${frente ? 'border-primary-300' : 'border-line'}`}
    >
      <div className="relative h-[62%] overflow-hidden">
        <img
          src={p.foto_url}
          alt={p.nombre}
          className={`h-full w-full object-cover transition-transform duration-700 ${frente ? 'scale-100' : 'scale-105'}`}
        />
        <div className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${frente ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-600/30 via-transparent to-transparent" />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAbrir(); }}
          aria-label={`Ver información de ${p.nombre}`}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-primary-500 shadow-sm backdrop-blur transition-all hover:bg-primary-500 hover:text-white"
        >
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="flex h-[38%] flex-col p-4">
        <h3 className="font-display text-lg font-700 leading-tight text-ink">{p.nombre}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {p.rol}{p.area ? ` · ${p.area}` : ''}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="inline-flex items-center gap-1 truncate pr-2 text-xs text-slate-500">
            <Users size={13} className="shrink-0 text-primary-400" /> {p.institucion || '—'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onAbrir(); }}
            className="btn-shine shrink-0 rounded-full bg-primary-500 px-4 py-1.5 text-xs font-600 text-white transition-all hover:bg-primary-600"
          >
            Ver perfil
          </button>
        </div>
      </div>
    </article>
  );
}

/* Modal de perfil: foto a la izquierda, información a la derecha. */
function Modal({ p, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext]);

  return (
    <Portal>
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="animate-overlay-in absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={onClose} />

      {/* Flechas laterales */}
      <button onClick={onPrev} aria-label="Anterior"
        className="absolute left-4 z-10 grid h-12 w-12 place-items-center rounded-full border border-line bg-white/90 text-slate-600 shadow-lg backdrop-blur transition-all hover:border-primary-400 hover:text-primary-600 sm:left-8">
        <ChevronLeft size={20} />
      </button>
      <button onClick={onNext} aria-label="Siguiente"
        className="absolute right-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:bg-primary-600 sm:right-8">
        <ChevronRight size={20} />
      </button>

      <div className="animate-modal-in relative z-[1] flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-lift sm:flex-row">
        {/* Foto (izquierda) */}
        <div className="relative h-56 w-full shrink-0 overflow-hidden sm:h-auto sm:w-2/5">
          <img src={p.foto_url} alt={p.nombre} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-700/50 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-display text-xl font-700 leading-tight text-white drop-shadow">{p.nombre}</h3>
            <p className="mt-0.5 text-sm text-white/85">{p.rol}</p>
          </div>
        </div>

        {/* Información (derecha) */}
        <div className="relative flex max-h-[70vh] flex-1 flex-col overflow-y-auto p-7">
          <button onClick={onClose} aria-label="Cerrar"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg border border-line bg-soft text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-600">
            <X size={18} />
          </button>

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-500">Investigador</p>
          {p.area && <p className="mt-2 inline-flex w-fit rounded-full bg-primary-50 px-3 py-1 text-xs font-600 text-primary-700">{p.area}</p>}

          <p className="mt-4 text-sm leading-relaxed text-slate-600">{p.bio}</p>

          <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm text-slate-500">
            {p.institucion && (
              <p className="flex items-center gap-2"><Users size={15} className="text-primary-400" /> {p.institucion}</p>
            )}
          </div>

          {p.enlace && (
            <a href={p.enlace} target="_blank" rel="noopener noreferrer"
              className="btn-shine mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 px-6 py-3 text-sm font-600 text-white transition-all hover:-translate-y-0.5">
              Ver perfil completo <ExternalLink size={15} />
            </a>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
}

export default function Investigadores() {
  const [personas, setPersonas] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [activo, setActivo] = useState(0);
  const [modal, setModal] = useState(null); // índice abierto o null
  const autoRef = useRef(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    getInvestigadores()
      .then((data) => { setPersonas(data); setEstado('listo'); })
      .catch(() => setEstado('error'));
  }, []);

  const n = personas.length;
  const ir = useCallback((i) => { if (n) setActivo((i % n + n) % n); }, [n]);

  useEffect(() => {
    if (estado !== 'listo' || n <= 1 || reduce.current || modal !== null) return;
    autoRef.current = setInterval(() => setActivo((v) => (v + 1) % n), 3800);
    return () => clearInterval(autoRef.current);
  }, [estado, n, modal]);

  const detener = () => clearInterval(autoRef.current);

  // ── Arrastre con el mouse / dedo ──────────────────────────────
  const drag = useRef({ activo: false, x0: 0, movido: false });
  const onPointerDown = (e) => {
    detener();
    drag.current = { activo: true, x0: e.clientX, movido: false };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.activo) return;
    const dx = e.clientX - d.x0;
    // Umbral: cada ~90px de arrastre avanza una tarjeta
    if (Math.abs(dx) > 90) {
      ir(dx < 0 ? activo + 1 : activo - 1);
      d.x0 = e.clientX;
      d.movido = true;
    }
  };
  const onPointerUp = () => { drag.current.activo = false; };

  // Coverflow desplegado a lo ANCHO: mayor separación horizontal, menos profundidad.
  const estilo = (i) => {
    let off = i - activo;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    const abs = Math.abs(off);
    const visible = abs <= 3;
    return {
      transform: `translateX(${off * 78}%) translateZ(${-abs * 130}px) rotateY(${off * -16}deg) scale(${1 - abs * 0.07})`,
      opacity: visible ? Math.max(0, 1 - abs * 0.26) : 0,
      zIndex: 100 - abs,
      pointerEvents: off === 0 ? 'auto' : 'none',
      filter: off === 0 ? 'none' : `brightness(${0.85 - abs * 0.04})`,
    };
  };

  return (
    <section id="investigadores" className="relative overflow-hidden border-t border-line bg-soft py-24">
      <div className="glow-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionTitle
          index="04"
          eyebrow="Red académica"
          title="Investigadores de la Red"
          subtitle="Un equipo interdisciplinario que combina ingeniería, ciencia de datos, salud y ciencias sociales para construir tecnología con impacto."
        />

        {estado === 'cargando' && (
          <div className="mt-16 flex justify-center">
            <div className="h-[420px] w-[300px] animate-pulse rounded-[28px] border border-line bg-white" />
          </div>
        )}

        {estado === 'error' && (
          <p className="mt-12 rounded-xl border border-primary-200 bg-primary-50 p-6 text-sm text-primary-700">
            No pudimos cargar a los Investigadores de la Red. Verifica que el backend esté en ejecución.
          </p>
        )}

        {estado === 'listo' && n > 0 && (
          <div className="mt-10">
            {/* Escenario 3D, ahora a lo ancho. Arrastrable con el mouse/dedo. */}
            <div
              className="relative mx-auto flex h-[460px] cursor-grab items-center justify-center overflow-hidden touch-pan-y select-none active:cursor-grabbing"
              style={{ perspective: '1600px' }}
              onMouseEnter={detener}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              {personas.map((p, i) => (
                <div
                  key={p.id}
                  className="absolute cursor-pointer transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                  style={estilo(i)}
                  onClick={() => {
                    // Si se acaba de arrastrar, no abrir/cambiar por click
                    if (drag.current.movido) { drag.current.movido = false; return; }
                    i === activo ? setModal(i) : (ir(i), detener());
                  }}
                >
                  <Card p={p} frente={i === activo} onAbrir={() => setModal(i)} />
                </div>
              ))}
            </div>

            <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-wider text-slate-400">
              Arrastra para explorar
            </p>

            {n > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button onClick={() => { ir(activo - 1); detener(); }} aria-label="Anterior"
                  className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-slate-500 shadow-sm transition-all hover:border-primary-400 hover:text-primary-600 hover:shadow-lift">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  {personas.map((_, i) => (
                    <button key={i} onClick={() => { ir(i); detener(); }} aria-label={`Investigador ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === activo ? 'w-8 bg-primary-500' : 'w-2.5 bg-line hover:bg-primary-200'}`} />
                  ))}
                </div>
                <button onClick={() => { ir(activo + 1); detener(); }} aria-label="Siguiente"
                  className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-slate-500 shadow-sm transition-all hover:border-primary-400 hover:text-primary-600 hover:shadow-lift">
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {modal !== null && personas[modal] && (
        <Modal
          p={personas[modal]}
          onClose={() => setModal(null)}
          onPrev={() => setModal((m) => (m - 1 + n) % n)}
          onNext={() => setModal((m) => (m + 1) % n)}
        />
      )}
    </section>
  );
}
