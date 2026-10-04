import { useEffect, useMemo } from 'react';
import {
  BadgeCheck,
  BookOpenCheck,
  Building2,
  ExternalLink,
  GraduationCap,
  Mail,
  UserRound,
  X,
} from 'lucide-react';
import Portal from './Portal.jsx';

function normalizarOrcid(orcid) {
  const valor = String(orcid || '').trim();
  if (!valor) return '';
  if (/^https?:\/\//i.test(valor)) return valor;
  return `https://orcid.org/${valor.replace(/^orcid:\s*/i, '')}`;
}

function Avatar({ persona }) {
  const iniciales = String(persona?.nombre || persona?.nombre_completo || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();

  if (!persona?.foto_url) {
    return (
      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary-500 to-primary-700 text-5xl font-700 text-white">
        {iniciales || <UserRound size={48} />}
      </div>
    );
  }

  return (
    <img
      src={persona.foto_url}
      alt={persona.nombre || persona.nombre_completo || 'Perfil'}
      className="h-full w-full object-cover"
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );
}

export default function PersonaModal({ persona, onClose }) {
  const esEstudiante = String(persona?.tipo_perfil || persona?.tipo || '').toLowerCase() === 'estudiante';
  const nombre = persona?.nombre || persona?.nombre_completo || 'Perfil';
  const orcidUrl = useMemo(() => normalizarOrcid(persona?.orcid), [persona?.orcid]);
  const areas = useMemo(() => {
    if (Array.isArray(persona?.areas) && persona.areas.length) return persona.areas;
    return String(persona?.area || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }, [persona]);

  useEffect(() => {
    if (!persona) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previo;
      document.removeEventListener('keydown', onKey);
    };
  }, [persona, onClose]);

  if (!persona) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-6">
        <button
          type="button"
          className="absolute inset-0 h-full w-full bg-ink/60 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Cerrar perfil"
        />

        <div className="animate-modal-in relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-lift md:flex-row">
          <div className="relative h-64 shrink-0 overflow-hidden bg-primary-50 md:h-auto md:w-[36%]">
            <Avatar persona={persona} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-white">
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-white/80">
                {esEstudiante ? 'Estudiante de la Red' : 'Investigador de la Red'}
              </p>
              <h3 className="mt-1 font-display text-2xl font-700 leading-tight">{nombre}</h3>
              {persona.institucion && <p className="mt-1 text-sm text-white/80">{persona.institucion}</p>}
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-slate-500 transition hover:border-primary-300 hover:text-primary-600"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <div className="pr-12">
              <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">
                {esEstudiante ? 'Perfil del estudiante' : 'Perfil del investigador'}
              </p>
              <h3 className="mt-1 font-display text-2xl font-700 text-ink">{nombre}</h3>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info icon={Building2} label="Institución de adscripción" value={persona.institucion || 'No especificada'} />
              <Info icon={GraduationCap} label="Grado máximo" value={persona.grado_maximo || 'No especificado'} />
              {!esEstudiante && <Info icon={BadgeCheck} label="Nivel del SNII" value={persona.nivel_snii || 'No especificado'} />}
              <Info icon={Mail} label="Correo institucional" value={persona.correo_institucional || persona.correo || 'No especificado'} />
            </div>

            <section className="mt-5 rounded-2xl border border-line bg-soft p-4">
              <p className="font-mono text-[11px] uppercase tracking-[.16em] text-primary-500">Semblanza</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {persona.bio || persona.semblanza || 'No se registró semblanza.'}
              </p>
            </section>

            <section className="mt-4 rounded-2xl border border-line bg-soft p-4">
              <p className="font-mono text-[11px] uppercase tracking-[.16em] text-primary-500">Área de conocimiento</p>
              {areas.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <span key={area} className="rounded-full bg-white px-3 py-1 text-xs font-600 text-primary-700 shadow-sm">
                      {area}
                    </span>
                  ))}
                </div>
              ) : <p className="mt-2 text-sm text-slate-500">No especificada.</p>}
            </section>

            <section className="mt-4 rounded-2xl border border-line bg-soft p-4">
              <p className="font-mono text-[11px] uppercase tracking-[.16em] text-primary-500">Línea de investigación</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{persona.linea_investigacion || 'No especificada.'}</p>
            </section>

            <div className="mt-6 flex flex-wrap gap-3">
              {!esEstudiante && persona.cvu_rizoma && (
                <a
                  href="https://rizoma.conahcyt.mx/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shine inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-600 text-white hover:bg-primary-600"
                  title={`CVU ${persona.cvu_rizoma}`}
                >
                  <BookOpenCheck size={16} />
                  Ver CVU Rizoma · {persona.cvu_rizoma}
                  <ExternalLink size={14} />
                </a>
              )}

              {orcidUrl && (
                <a
                  href={orcidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-600 text-slate-600 transition hover:border-primary-300 hover:text-primary-600"
                >
                  ORCID
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={15} className="text-primary-500" />
        <span className="font-mono text-[10px] uppercase tracking-[.14em]">{label}</span>
      </div>
      <p className="mt-2 break-words text-sm font-600 text-ink">{value}</p>
    </div>
  );
}
