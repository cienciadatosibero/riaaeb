// frontend/src/admin/AboutEditor.jsx
import { useEffect, useState } from 'react';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { getAbout, saveAbout } from '../lib/api.js';
import FileField from './FileField.jsx';
import AdminLoader from './AdminLoader.jsx';

const CAMPOS = [
  { name: 'titulo', label: 'Título', type: 'text' },
  { name: 'subtitulo', label: 'Subtítulo', type: 'textarea' },
  { name: 'mision', label: 'Misión', type: 'textarea' },
  { name: 'vision', label: 'Visión', type: 'textarea' },
  { name: 'valores', label: 'Valores', type: 'textarea' },
  { name: 'imagen_url', label: 'Imagen', type: 'file' },
];

export default function AboutEditor() {
  const [form, setForm] = useState({ titulo: '', subtitulo: '', mision: '', vision: '', valores: '', imagen_url: '' });
  const [estado, setEstado] = useState('cargando');
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAbout()
      .then((d) => { if (d) setForm((p) => ({ ...p, ...d })); setEstado('listo'); })
      .catch(() => setEstado('listo'));
  }, []);

  const set = (name, val) => { setForm((p) => ({ ...p, [name]: val })); setOk(false); };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true); setError(''); setOk(false);
    try { await saveAbout(form); setOk(true); }
    catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  };

  if (estado === 'cargando') return <AdminLoader texto="Cargando quiénes somos…" />;

  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-700 text-ink">Quiénes somos</h2>
      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <form onSubmit={guardar} className="rounded-2xl border border-line bg-surface p-6">
        <div className="grid gap-4">
          {CAMPOS.map((f) => (
            <div key={f.name}>
              {f.type === 'file' ? (
                <FileField label={f.label} value={form[f.name]} onChange={(v) => set(f.name, v)} />
              ) : f.type === 'textarea' ? (
                <>
                  <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-400">{f.label}</label>
                  <textarea rows={3} value={form[f.name] || ''} onChange={(e) => set(f.name, e.target.value)}
                    className="w-full resize-none rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-400" />
                </>
              ) : (
                <>
                  <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-400">{f.label}</label>
                  <input value={form[f.name] || ''} onChange={(e) => set(f.name, e.target.value)}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-400" />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button type="submit" disabled={guardando}
            className="btn-shine inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 px-6 py-3 text-sm font-600 text-white hover:-translate-y-0.5 disabled:opacity-60">
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar
          </button>
          {ok && <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300"><CheckCircle2 size={16} /> Guardado</span>}
        </div>
      </form>
    </div>
  );
}
