// frontend/src/components/ContactModal.jsx
import { useEffect, useState } from 'react';
import { X, Send, CheckCircle2, Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { enviarContacto, getPortada } from '../lib/api.js';
import Portal from './ui/Portal.jsx';

const INICIAL = { nombre: '', correo: '', telefono: '', asunto: '', mensaje: '' };
const CONTACTO_DEFAULT={contacto_correo:'contacto@riaaeb.org',contacto_telefono:'+52 747 000 0000',contacto_ubicacion:'Chilpancingo, Guerrero, México'};

export default function ContactModal({ open, onClose }) {
  const [form, setForm] = useState(INICIAL);
  const [estado, setEstado] = useState('idle');
  const [mensaje, setMensaje] = useState('');
  const [contacto,setContacto]=useState(CONTACTO_DEFAULT);

  useEffect(()=>{ getPortada().then((d)=>d&&setContacto({...CONTACTO_DEFAULT,...d})).catch(()=>{}); },[]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setEstado('enviando'); setMensaje('');
    try {
      const res = await enviarContacto(form);
      setEstado('ok');
      setMensaje(res?.mensaje || 'Mensaje enviado correctamente.');
      setForm(INICIAL);
    } catch (err) {
      setEstado('error'); setMensaje(err.message);
    }
  };

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="animate-overlay-in absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-modal-in relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
        <div className="glow-bg pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative p-7">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg border border-line bg-soft text-slate-500 transition-colors hover:border-primary-400 hover:text-primary-600"
          >
            <X size={18} />
          </button>

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-500">Contacto</p>
          <h3 className="mt-1 font-display text-2xl font-700 text-ink">Escríbenos</h3>
          <p className="mt-1 text-sm text-slate-500">Te responderemos lo antes posible.</p>

          <form onSubmit={onSubmit} className="mt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre" name="nombre" value={form.nombre} onChange={onChange} required />
              <Field label="Correo" name="correo" type="email" value={form.correo} onChange={onChange} required />
              <Field label="Teléfono" name="telefono" value={form.telefono} onChange={onChange} />
              <Field label="Asunto" name="asunto" value={form.asunto} onChange={onChange} required />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-500">Mensaje</label>
              <textarea
                name="mensaje" value={form.mensaje} onChange={onChange} required rows={4}
                placeholder="Cuéntanos en qué podemos colaborar…"
                className="w-full resize-none rounded-xl border border-line bg-soft px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-primary-400"
              />
            </div>
            <button
              type="submit" disabled={estado === 'enviando'}
              className="btn-shine group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 px-7 py-3.5 text-sm font-600 text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {estado === 'enviando' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje'}
            </button>

            {estado === 'ok' && (
              <p className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 size={16} /> {mensaje}
              </p>
            )}
            {estado === 'error' && (
              <p className="mt-3 rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">{mensaje}</p>
            )}
          </form>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-xs text-slate-500">
            {[
              {icon:Mail,valor:contacto.contacto_correo},
              {icon:Phone,valor:contacto.contacto_telefono},
              {icon:MapPin,valor:contacto.contacto_ubicacion},
            ].filter((d)=>d.valor).map((d) => (
              <span key={d.valor} className="inline-flex items-center gap-1.5">
                <d.icon size={13} className="text-primary-500" /> {d.valor}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}

function Field({ label, name, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-500">
        {label}{required && <span className="text-primary-500"> *</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange} required={required}
        className="w-full rounded-xl border border-line bg-soft px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary-400"
      />
    </div>
  );
}
