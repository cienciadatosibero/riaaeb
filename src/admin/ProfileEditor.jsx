import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { getMiPerfil, updateMiPerfil } from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';

export default function ProfileEditor({ onSaved }) {
  const [perfil,setPerfil]=useState(null); const [semblanza,setSemblanza]=useState(''); const [cvu,setCvu]=useState(''); const [estado,setEstado]=useState('cargando'); const [msg,setMsg]=useState(''); const [error,setError]=useState('');
  useEffect(()=>{getMiPerfil().then((p)=>{setPerfil(p);setSemblanza(p?.bio||'');setCvu(p?.cvu_rizoma||'');setEstado('listo');}).catch((e)=>{setError(e.message);setEstado('error');});},[]);
  const save=async(e)=>{e.preventDefault();setError('');setMsg('');if(cvu && !/^\d{7}$/.test(cvu)){setError('El CVU Rizoma debe contener exactamente 7 dígitos.');return;}setEstado('guardando');try{const p=await updateMiPerfil({semblanza,cvu_rizoma:cvu});setPerfil(p);setMsg('Perfil actualizado.');onSaved?.();}catch(e2){setError(e2.message);}finally{setEstado('listo');}};
  if(estado==='cargando')return <AdminLoader texto="Cargando tu perfil…"/>;
  if(!perfil)return <p className="rounded-xl border border-line bg-white p-5 text-sm text-slate-500">Esta cuenta no tiene un perfil de investigador asociado.</p>;
  return <div className="max-w-3xl">
    <div className="mb-6"><p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Profesor / Investigador</p><h2 className="mt-1 font-display text-2xl font-700 text-ink">Mi perfil</h2><p className="mt-1 text-sm text-slate-500">Actualiza tu semblanza y tu CVU Rizoma. Estos datos alimentan tu perfil público.</p></div>
    {error&&<p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{msg&&<p className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{msg}</p>}
    <form onSubmit={save} className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="flex items-center gap-4 border-b border-line pb-5"><img src={perfil.foto_url} alt="" className="h-20 w-20 rounded-2xl border border-line object-cover"/><div><h3 className="font-display text-xl font-700 text-ink">{perfil.nombre}</h3><p className="text-sm text-slate-500">{perfil.institucion_catalogo||perfil.institucion||'Sin institución'}</p><p className="mt-1 text-xs text-primary-600">{(perfil.areas||[]).join(' · ')||perfil.area}</p></div></div>
      <label className="mt-5 block"><div className="mb-1.5 flex justify-between"><span className="font-mono text-xs uppercase tracking-wider text-slate-500">Semblanza</span><span className="text-xs text-slate-400">{semblanza.length}/600</span></div><textarea rows="7" maxLength="600" value={semblanza} onChange={(e)=>setSemblanza(e.target.value)} className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-400"/></label>
      <label className="mt-4 block"><span className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-500">CVU Rizoma</span><input type="text" inputMode="numeric" pattern="[0-9]{7}" maxLength="7" value={cvu} onChange={(e)=>setCvu(e.target.value.replace(/\D/g,'').slice(0,7))} placeholder="1234567" className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary-400"/><p className="mt-1 text-xs text-slate-400">Identificador de 7 dígitos. No es una URL.</p></label>
      <div className="mt-5 flex flex-wrap items-center gap-3"><button disabled={estado==='guardando'} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-600 text-white">{estado==='guardando'?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>}Guardar cambios</button>{cvu&&<span className="rounded-xl border border-line bg-soft px-4 py-3 font-mono text-sm font-600 text-slate-600">CVU {cvu}</span>}</div>
    </form>
  </div>;
}
