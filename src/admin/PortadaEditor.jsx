import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Save } from 'lucide-react';
import { getPortada, savePortada } from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';

const DEFAULTS = {
  hero_eyebrow: 'Red de investigación abierta',
  hero_titulo: 'Tecnología que impulsa',
  hero_palabras: 'la equidad\nel bienestar\nla salud\nla robótica\nlos datos\nla sociedad\nel futuro',
  hero_descripcion: 'Investigamos y difundimos el avance tecnológico en múltiples campos, con datos abiertos y métodos reproducibles, para que beneficie a todas las personas.',
  hero_boton_principal: 'Explora nuestras investigaciones',
  hero_boton_secundario: 'Súmate a la Red',
  valor1_titulo: 'Equidad',
  valor1_texto: 'Tecnología auditada y sin sesgos.',
  valor2_titulo: 'Bienestar',
  valor2_texto: 'Innovación centrada en las personas.',
  valor3_titulo: 'Avance abierto',
  valor3_texto: 'Datos y código para la comunidad.',
  cta_eyebrow: 'Colabora con la Red',
  cta_titulo: '¿Quieres impulsar tecnología con impacto social? Hablemos.',
  cta_descripcion: 'Propón un proyecto, súmate como investigador o solicita acceso a nuestros datos, publicaciones y recursos.',
  cta_boton: 'Contáctanos',
  contacto_correo: 'contacto@riaaeb.org',
  contacto_telefono: '+52 747 000 0000',
  contacto_ubicacion: 'Chilpancingo, Guerrero, México',
  footer_descripcion: 'Red de Inteligencia Artificial Aplicada para la Equidad y el Bienestar. Avance tecnológico con impacto social, datos abiertos y métodos reproducibles.',
  footer_boletin_texto: 'Recibe nuestras publicaciones más recientes.',
  twitter_url: '',
  linkedin_url: '',
  github_url: '',
  cifra1_valor: '30+',
  cifra1_label: 'Investigaciones',
  cifra2_valor: '15',
  cifra2_label: 'Investigadores',
  cifra3_valor: '12',
  cifra3_label: 'Alianzas',
  cifra4_valor: '8',
  cifra4_label: 'Datos abiertos',
};

function Field({ label, children, full=false, help }) {
  return <div className={full ? 'md:col-span-2' : ''}>
    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-500">{label}</label>
    {children}
    {help && <p className="mt-1 text-[11px] text-slate-400">{help}</p>}
  </div>;
}

export default function PortadaEditor({ canEdit=true }) {
  const [form,setForm]=useState(DEFAULTS);
  const [estado,setEstado]=useState('cargando');
  const [guardando,setGuardando]=useState(false);
  const [error,setError]=useState('');
  const [ok,setOk]=useState(false);

  useEffect(()=>{
    getPortada()
      .then((d)=>{ if(d) setForm({...DEFAULTS,...d}); setEstado('listo'); })
      .catch((e)=>{ setError(e.message); setEstado('listo'); });
  },[]);

  const set=(k,v)=>{setForm((p)=>({...p,[k]:v}));setOk(false);};

  const guardar=async(e)=>{
    e.preventDefault();
    if(!canEdit) return;
    setGuardando(true); setError(''); setOk(false);
    try { const d=await savePortada(form); setForm({...DEFAULTS,...d}); setOk(true); }
    catch(e2){ setError(e2.message); }
    finally{ setGuardando(false); }
  };

  if(estado==='cargando') return <AdminLoader texto="Cargando contenido de portada…"/>;

  const input='w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-400 disabled:bg-slate-50 disabled:text-slate-500';

  return <div>
    <div className="mb-6">
      <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Contenido público</p>
      <h2 className="mt-1 font-display text-2xl font-700 text-ink">Portada y datos generales</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-500">
        Administra textos del inicio, llamada a la acción, datos de contacto, redes sociales y cifras del pie de página.
      </p>
    </div>

    {error && <p className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {ok && <p className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700"><CheckCircle2 size={16}/>Cambios guardados.</p>}

    <form onSubmit={guardar} className="space-y-6">
      <Section title="Inicio / Hero">
        <Field label="Etiqueta superior"><input disabled={!canEdit} className={input} value={form.hero_eyebrow||''} onChange={(e)=>set('hero_eyebrow',e.target.value)}/></Field>
        <Field label="Título"><input disabled={!canEdit} className={input} value={form.hero_titulo||''} onChange={(e)=>set('hero_titulo',e.target.value)}/></Field>
        <Field label="Palabras rotatorias" full help="Una palabra o frase por línea.">
          <textarea disabled={!canEdit} rows="5" className={`${input} resize-y`} value={form.hero_palabras||''} onChange={(e)=>set('hero_palabras',e.target.value)}/>
        </Field>
        <Field label="Descripción" full><textarea disabled={!canEdit} rows="4" className={`${input} resize-y`} value={form.hero_descripcion||''} onChange={(e)=>set('hero_descripcion',e.target.value)}/></Field>
        <Field label="Botón principal"><input disabled={!canEdit} className={input} value={form.hero_boton_principal||''} onChange={(e)=>set('hero_boton_principal',e.target.value)}/></Field>
        <Field label="Botón secundario"><input disabled={!canEdit} className={input} value={form.hero_boton_secundario||''} onChange={(e)=>set('hero_boton_secundario',e.target.value)}/></Field>
      </Section>

      <Section title="Valores del inicio">
        {[1,2,3].map((n)=><div key={n} className="md:col-span-2 grid gap-4 rounded-2xl border border-line bg-soft p-4 md:grid-cols-2">
          <Field label={`Valor ${n} · título`}><input disabled={!canEdit} className={input} value={form[`valor${n}_titulo`]||''} onChange={(e)=>set(`valor${n}_titulo`,e.target.value)}/></Field>
          <Field label={`Valor ${n} · descripción`}><input disabled={!canEdit} className={input} value={form[`valor${n}_texto`]||''} onChange={(e)=>set(`valor${n}_texto`,e.target.value)}/></Field>
        </div>)}
      </Section>

      <Section title="Llamada a la acción">
        <Field label="Etiqueta"><input disabled={!canEdit} className={input} value={form.cta_eyebrow||''} onChange={(e)=>set('cta_eyebrow',e.target.value)}/></Field>
        <Field label="Botón"><input disabled={!canEdit} className={input} value={form.cta_boton||''} onChange={(e)=>set('cta_boton',e.target.value)}/></Field>
        <Field label="Título" full><input disabled={!canEdit} className={input} value={form.cta_titulo||''} onChange={(e)=>set('cta_titulo',e.target.value)}/></Field>
        <Field label="Descripción" full><textarea disabled={!canEdit} rows="3" className={`${input} resize-y`} value={form.cta_descripcion||''} onChange={(e)=>set('cta_descripcion',e.target.value)}/></Field>
      </Section>

      <Section title="Datos de contacto">
        <Field label="Correo"><input disabled={!canEdit} type="email" className={input} value={form.contacto_correo||''} onChange={(e)=>set('contacto_correo',e.target.value)}/></Field>
        <Field label="Teléfono"><input disabled={!canEdit} className={input} value={form.contacto_telefono||''} onChange={(e)=>set('contacto_telefono',e.target.value)}/></Field>
        <Field label="Ubicación" full><input disabled={!canEdit} className={input} value={form.contacto_ubicacion||''} onChange={(e)=>set('contacto_ubicacion',e.target.value)}/></Field>
      </Section>

      <Section title="Pie de página">
        <Field label="Descripción" full><textarea disabled={!canEdit} rows="3" className={`${input} resize-y`} value={form.footer_descripcion||''} onChange={(e)=>set('footer_descripcion',e.target.value)}/></Field>
        <Field label="Texto del boletín" full><input disabled={!canEdit} className={input} value={form.footer_boletin_texto||''} onChange={(e)=>set('footer_boletin_texto',e.target.value)}/></Field>
        <Field label="X / Twitter"><input disabled={!canEdit} type="url" className={input} value={form.twitter_url||''} onChange={(e)=>set('twitter_url',e.target.value)}/></Field>
        <Field label="LinkedIn"><input disabled={!canEdit} type="url" className={input} value={form.linkedin_url||''} onChange={(e)=>set('linkedin_url',e.target.value)}/></Field>
        <Field label="GitHub"><input disabled={!canEdit} type="url" className={input} value={form.github_url||''} onChange={(e)=>set('github_url',e.target.value)}/></Field>
      </Section>

      <Section title="Cifras del pie de página">
        {[1,2,3,4].map((n)=><div key={n} className="grid gap-4 rounded-2xl border border-line bg-soft p-4 md:grid-cols-[140px_1fr]">
          <Field label={`Cifra ${n}`}><input disabled={!canEdit} className={input} value={form[`cifra${n}_valor`]||''} onChange={(e)=>set(`cifra${n}_valor`,e.target.value)}/></Field>
          <Field label="Etiqueta"><input disabled={!canEdit} className={input} value={form[`cifra${n}_label`]||''} onChange={(e)=>set(`cifra${n}_label`,e.target.value)}/></Field>
        </div>)}
      </Section>

      {canEdit && <button type="submit" disabled={guardando} className="btn-shine inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-600 text-white hover:bg-primary-600 disabled:opacity-60">
        {guardando?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>} Guardar portada
      </button>}
    </form>
  </div>;
}

function Section({title,children}) {
  return <section className="rounded-2xl border border-line bg-white p-5 shadow-card">
    <h3 className="mb-4 font-display text-lg font-700 text-ink">{title}</h3>
    <div className="grid gap-4 md:grid-cols-2">{children}</div>
  </section>;
}
