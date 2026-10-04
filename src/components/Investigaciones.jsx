import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpenCheck,
  ExternalLink,
  Calendar,
  CircleDot,
  FlaskConical,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Star,
  Users,
  X,
} from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';
import Portal from './ui/Portal.jsx';
import PersonaModal from './ui/PersonaModal.jsx';
import { getInvestigaciones } from '../lib/api.js';

function screenshotURL(url, w = 1280, h = 1000) {
  if (!url) return '';
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url.trim())}?w=${w}&h=${h}`;
}

function hostDe(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url || '';
  }
}

function Preview({ proyecto }) {
  const normalizarEnlace = (valor) => {
  const v = String(valor ?? '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
};

const src = useMemo(() => screenshotURL(proyecto.enlace), [proyecto.enlace]);
  const [estado, setEstado] = useState(src ? 'cargando' : 'sin-imagen');
  const [intentos, setIntentos] = useState(0);
  const imgRef = useRef(null);

  useEffect(() => {
    setEstado(src ? 'cargando' : 'sin-imagen');
    setIntentos(0);
  }, [src]);

  if (!src) {
    return (
      <div className="relative h-[56%] shrink-0 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-slate-100">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary-100/80 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-primary-50 blur-2xl" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl border border-primary-100 bg-white/90 text-primary-500 shadow-card backdrop-blur">
            <FlaskConical size={34} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[56%] shrink-0 overflow-hidden bg-slate-100">
      {estado !== 'listo' && (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <ImageIcon size={26} className={estado === 'error' ? '' : 'animate-pulse'} />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              {estado === 'error' ? 'Vista previa no disponible' : 'Generando vista previa…'}
            </span>
          </div>
        </div>
      )}
      <img
        ref={imgRef}
        key={intentos}
        src={intentos === 0 ? src : `${src}&retry=${intentos}`}
        alt={`Vista previa de ${hostDe(proyecto.enlace)}`}
        loading="lazy"
        onLoad={() => setEstado('listo')}
        onError={() => {
          if (intentos < 1) setIntentos((n) => n + 1);
          else setEstado('error');
        }}
        className={`h-full w-full object-cover object-top transition-all duration-[1200ms] ease-out ${
          estado === 'listo' ? 'scale-100 opacity-100 group-hover:scale-105' : 'scale-100 opacity-0'
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
    </div>
  );
}

function DetailBlock({ title, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-line bg-soft p-4 ${className}`}>
      <p className="font-mono text-[11px] uppercase tracking-[.16em] text-primary-500">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

function Detail({ proyecto, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const referencias = Array.isArray(proyecto.referencias)
    ? proyecto.referencias
    : typeof proyecto.referencias === 'string'
      ? proyecto.referencias.split(/\r?\n|\|/).map((x) => x.trim()).filter(Boolean)
      : [];

  const [personaActiva, setPersonaActiva] = useState(null);

  return (
    <Portal>
      <div className="fixed inset-0 z-[135] flex items-center justify-center p-3 sm:p-6">
        <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
        <div className="animate-modal-in relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-lift sm:p-8">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-slate-500 transition hover:border-primary-200 hover:text-primary-600"
            aria-label="Cerrar detalle"
          >
            <X size={18} />
          </button>

          <div className="pr-12">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-700 text-primary-700">
                {proyecto.area_nombre || proyecto.area || 'Sin área'}
              </span>
              <span className="rounded-full bg-soft px-3 py-1 text-xs font-600 text-slate-600">
                {proyecto.estatus === 'terminado' ? 'Terminado' : 'En proceso'}
              </span>
              {(proyecto.tipo_nombre || proyecto.tipo) && (
                <span className="rounded-full bg-soft px-3 py-1 text-xs font-600 text-slate-600">
                  {proyecto.tipo_nombre || proyecto.tipo}
                </span>
              )}
            </div>
            <h3 className="mt-4 font-display text-2xl font-700 leading-tight text-ink sm:text-3xl">
              {proyecto.titulo}
            </h3>
            {proyecto.enlace && (
              <a
                href={normalizarEnlace(proyecto.enlace)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-600 text-white hover:bg-primary-600"
              >
                Abrir proyecto
                <ExternalLink size={15} />
              </a>
            )}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <DetailBlock title="Resumen" className="md:col-span-2">
              <p>{proyecto.resumen || 'No especificado.'}</p>
            </DetailBlock>
            <DetailBlock title="Impacto científico">
              <p>{proyecto.impacto_cientifico || 'No especificado.'}</p>
            </DetailBlock>
            <DetailBlock title="Impacto social">
              <p>{proyecto.impacto_social || 'No especificado.'}</p>
            </DetailBlock>
            <DetailBlock title="Aportaciones a la solución">
              <p>{proyecto.aportaciones_solucion || 'No especificado.'}</p>
            </DetailBlock>
            <DetailBlock title="Acceso universal al conocimiento">
              <p>{proyecto.acceso_universal || 'No especificado.'}</p>
            </DetailBlock>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailBlock title="Profesores asociados">
              <ul className="space-y-2">
                {(proyecto.profesores || []).length ? (
                  proyecto.profesores.map((persona, i) => (
                    <li key={persona.usuario_id || persona.id || i}>
                      <PersonaChip persona={persona} icon={Users} onClick={() => setPersonaActiva(persona)} />
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2">
                    <Users size={15} className="mt-0.5 shrink-0 text-primary-500" />
                    <span>{proyecto.autores || 'Sin profesores asociados.'}</span>
                  </li>
                )}
              </ul>
            </DetailBlock>

            <DetailBlock title="Estudiantes asociados">
              <ul className="space-y-2">
                {(proyecto.estudiantes || []).length ? (
                  proyecto.estudiantes.map((persona, i) => (
                    <li key={persona.usuario_id || persona.id || i}>
                      <PersonaChip persona={persona} icon={GraduationCap} onClick={() => setPersonaActiva(persona)} />
                    </li>
                  ))
                ) : (
                  <li>Sin estudiantes asociados.</li>
                )}
              </ul>
            </DetailBlock>
          </div>

          <div className="mt-4">
            <DetailBlock title="Referencias más relevantes">
              {referencias.length ? (
                <ol className="list-decimal space-y-2 pl-5">
                  {referencias.map((ref, i) => <li key={`${ref}-${i}`}>{ref}</li>)}
                </ol>
              ) : (
                <p>No se registraron referencias.</p>
              )}
            </DetailBlock>
          </div>
        </div>
        {personaActiva && <PersonaModal persona={personaActiva} onClose={() => setPersonaActiva(null)} />}
      </div>
    </Portal>
  );
}

function PersonaChip({ persona, icon: Icon, onClick }) {
  const iniciales = String(persona?.nombre || '?').trim().split(/\s+/).slice(0,2).map((x)=>x[0]).join('').toUpperCase();
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/person flex w-full items-center gap-3 rounded-xl border border-transparent bg-white px-3 py-2 text-left shadow-sm transition hover:border-primary-200 hover:bg-primary-50/50"
      title={`Ver perfil de ${persona?.nombre || 'persona'}`}
    >
      {persona?.foto_url ? (
        <img src={persona.foto_url} alt="" className="h-10 w-10 shrink-0 rounded-full border border-line object-cover" />
      ) : (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-700 text-primary-700">{iniciales}</span>
      )}
      <span className="min-w-0 flex-1">
        <b className="block truncate font-600 text-ink group-hover/person:text-primary-700">{persona?.nombre}</b>
        <span className="block truncate text-[11px] text-slate-400">{persona?.institucion || (persona?.tipo_perfil === 'estudiante' ? 'Estudiante de la Red' : 'Investigador de la Red')}</span>
      </span>
      <Icon size={15} className="shrink-0 text-primary-500" />
    </button>
  );
}

function Tarjeta({ proyecto, index, onDetail }) {
  const area = proyecto.area_nombre || proyecto.area || 'Sin área';
  const tipo = proyecto.tipo_nombre || proyecto.tipo || 'Investigación';
  const terminado = proyecto.estatus === 'terminado';

  return (
    <article
      style={{ animationDelay: `${0.05 * index}s` }}
      className="group relative flex aspect-[3/4] animate-fade-up flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-all duration-500 hover:-translate-y-2 hover:border-primary-300 hover:shadow-lift"
    >
      <Preview proyecto={proyecto} />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[56%] bg-primary-500/0 transition-colors duration-500 group-hover:bg-primary-500/10" />

      <div className="absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-3">
        <span className="inline-flex max-w-[65%] items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
          <Globe size={12} className="shrink-0" />
          <span className="truncate">{tipo}</span>
        </span>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] font-600 shadow-sm ${
            terminado ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-950'
          }`}
        >
          <CircleDot size={11} />
          {terminado ? 'Terminado' : 'En proceso'}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 rounded-3xl ring-1 ring-inset ring-black/5 transition-all duration-500 group-hover:ring-2 group-hover:ring-primary-400/60" />

      <div className="relative z-10 flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-display text-lg font-700 leading-snug text-ink transition-colors duration-300 group-hover:text-primary-600">
          {proyecto.titulo}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {proyecto.resumen || 'Consulta la información completa de este proyecto de investigación.'}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {proyecto.anio && (
            <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-1 text-[11px] text-slate-500">
              <Calendar size={11} /> {proyecto.anio}
            </span>
          )}
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11px] text-primary-700">
            <Star size={11} className="shrink-0 fill-primary-400 text-primary-400" />
            <span className="truncate">{area}</span>
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="max-w-[52%] truncate text-xs text-slate-400">
            {proyecto.autores || (proyecto.enlace ? hostDe(proyecto.enlace) : 'Red de investigación')}
          </span>
          <button
            type="button"
            onClick={() => onDetail(proyecto)}
            className="btn-shine inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-600 text-white shadow-sm transition-all duration-300 group-hover:bg-primary-500"
          >
            Ver detalle
            <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Investigaciones() {
  const [items, setItems] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [modal, setModal] = useState(null);

  useEffect(() => {
    getInvestigaciones()
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setEstado('listo');
      })
      .catch(() => setEstado('error'));
  }, []);

  return (
    <section id="investigaciones" className="relative overflow-hidden border-t border-line bg-soft py-24">
      <div className="glow-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionTitle
          index="02"
          eyebrow="Investigaciones"
          title="Proyectos de investigación de la Red"
          subtitle="Explora los proyectos de la Red y consulta su información completa sin salir de esta página."
        />

        <div className="mt-12">
          {estado === 'cargando' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-3xl border border-line bg-white" />
              ))}
            </div>
          )}

          {estado === 'error' && (
            <p className="rounded-xl border border-primary-200 bg-primary-50 p-6 text-sm text-primary-700">
              No pudimos cargar las investigaciones.
            </p>
          )}

          {estado === 'listo' && (
            items.length === 0 ? (
              <p className="rounded-xl border border-line bg-white p-6 text-sm text-slate-500">
                Aún no hay investigaciones publicadas.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((proyecto, i) => (
                  <Tarjeta key={proyecto.id} proyecto={proyecto} index={i} onDetail={setModal} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {modal && <Detail proyecto={modal} onClose={() => setModal(null)} />}
    </section>
  );
}
