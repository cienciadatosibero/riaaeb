import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, Loader2, Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { adminInvestigaciones, getAreasConocimiento, getTiposInvestigacion, seguridadUsuarios } from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';

const emptyForm = {
  titulo:'',resumen:'',impacto_cientifico:'',impacto_social:'',aportaciones_solucion:'',acceso_universal:'',
  area_id:'',tipo_investigacion_id:'',estatus:'en_proceso',referencias:'',propietario_usuario_id:'',profesor_ids:[],publicado:true,
};

export default function ProjectsManager({ session }) {
  const roles=session?.roles||[];
  const isAdmin=roles.includes('administrador');
  const isStudent=roles.includes('estudiante');
  const canManage=isAdmin || roles.includes('investigador');
  const [items,setItems]=useState([]); const [areas,setAreas]=useState([]); const [tipos,setTipos]=useState([]); const [profesores,setProfesores]=useState([]);
  const [estado,setEstado]=useState('cargando'); const [error,setError]=useState(''); const [form,setForm]=useState(null); const [editId,setEditId]=useState(null); const [saving,setSaving]=useState(false); const [buscar,setBuscar]=useState('');

  const load=async()=>{ setEstado('cargando'); setError(''); try {
    const [p,a,t]=await Promise.all([adminInvestigaciones.list(),getAreasConocimiento(),getTiposInvestigacion()]);
    setItems(p||[]); setAreas(a||[]); setTipos(t||[]);
    if (isAdmin) { const u=await seguridadUsuarios.list(); setProfesores((u||[]).filter((x)=>x.activo && (x.roles||[]).includes('investigador'))); }
    setEstado('listo');
  } catch(e){setError(e.message);setEstado('error');}};
  useEffect(()=>{load();},[]); // eslint-disable-line

  const beginNew=()=>{setForm({...emptyForm});setEditId(null);};
  const beginEdit=(p)=>{setEditId(p.id);setForm({
    ...emptyForm,...p,
    referencias:(p.referencias||[]).join('\n'),
    propietario_usuario_id:p.propietario_usuario_id||'',
    profesor_ids:(p.profesores||[]).map((x)=>x.usuario_id),
    publicado:!!p.publicado,
  });};
  const set=(k,v)=>setForm((f)=>({...f,[k]:v}));
  const save=async(e)=>{e.preventDefault();setSaving(true);setError('');try{
    const referencias=String(form.referencias||'').split(/\n+/).map((x)=>x.trim()).filter(Boolean);
    if(referencias.length<3) throw new Error('Agrega al menos 3 referencias relevantes, una por línea.');
    const payload={...form,area_id:Number(form.area_id)||null,tipo_investigacion_id:Number(form.tipo_investigacion_id)||null,
      propietario_usuario_id:Number(form.propietario_usuario_id)||null,profesor_ids:(form.profesor_ids||[]).map(Number),referencias};
    if(editId) await adminInvestigaciones.update(editId,payload); else await adminInvestigaciones.create(payload);
    setForm(null);setEditId(null);await load();
  }catch(e2){setError(e2.message);}finally{setSaving(false);}};
  const del=async(id)=>{if(!confirm('¿Eliminar este proyecto de investigación?'))return;try{await adminInvestigaciones.remove(id);await load();}catch(e){setError(e.message);}};
  const join=async(p)=>{try{p.participando?await adminInvestigaciones.salir(p.id):await adminInvestigaciones.participar(p.id);await load();}catch(e){setError(e.message);}};

  const filtrados=useMemo(()=>items.filter((p)=>!buscar.trim()||JSON.stringify(p).toLowerCase().includes(buscar.toLowerCase())),[items,buscar]);
  const input='w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100';

  if(estado==='cargando')return <AdminLoader texto="Cargando proyectos de la Red…"/>;
  return <div>
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Catálogo</p><h2 className="mt-1 font-display text-2xl font-700 text-ink">Investigaciones</h2>
        <p className="mt-1 text-sm text-slate-500">Proyectos con impactos, referencias, responsables y participantes de la Red.</p></div>
      {canManage&&!form&&<button onClick={beginNew} className="btn-shine inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-600 text-white"><Plus size={16}/>Agregar proyecto</button>}
    </div>
    {error&&<p className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

    {form ? <form onSubmit={save} className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between"><h3 className="font-display text-lg font-700 text-ink">{editId?'Editar proyecto':'Nuevo proyecto'}</h3><button type="button" onClick={()=>setForm(null)} className="grid h-9 w-9 place-items-center rounded-xl border border-line"><X size={17}/></button></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título" full><input className={input} value={form.titulo} onChange={(e)=>set('titulo',e.target.value)} required/></Field>
        <Field label="Resumen" full count={`${form.resumen.length}/1200`}><textarea rows="4" maxLength="1200" className={input} value={form.resumen} onChange={(e)=>set('resumen',e.target.value)} required/></Field>
        {[
          ['impacto_cientifico','Impacto científico'],['impacto_social','Impacto social'],['aportaciones_solucion','Aportaciones a la solución'],['acceso_universal','Estrategias para el acceso universal al conocimiento']
        ].map(([k,l])=><Field key={k} label={l} count={`${String(form[k]||'').length}/600`}><textarea rows="4" maxLength="600" className={input} value={form[k]||''} onChange={(e)=>set(k,e.target.value)} required/></Field>)}
        <Field label="Área de conocimiento"><select className={input} value={form.area_id||''} onChange={(e)=>set('area_id',e.target.value)} required><option value="">Seleccione…</option>{areas.map((a)=><option key={a.id} value={a.id}>{a.nombre}</option>)}</select></Field>
        <Field label="Tipo de investigación"><select className={input} value={form.tipo_investigacion_id||''} onChange={(e)=>set('tipo_investigacion_id',e.target.value)} required><option value="">Seleccione…</option>{tipos.map((t)=><option key={t.id} value={t.id}>{t.nombre}</option>)}</select></Field>
        <Field label="Estatus"><select className={input} value={form.estatus} onChange={(e)=>set('estatus',e.target.value)}><option value="en_proceso">En proceso</option><option value="terminado">Terminado</option></select></Field>
        {isAdmin&&<Field label="Profesor responsable"><select className={input} value={form.propietario_usuario_id||''} onChange={(e)=>set('propietario_usuario_id',e.target.value)}><option value="">Sin asignar</option>{profesores.map((p)=><option key={p.id} value={p.id}>{p.nombre_completo}</option>)}</select></Field>}
        {isAdmin&&<Field label="Profesores asociados" full><div className="grid max-h-40 gap-2 overflow-auto rounded-xl border border-line bg-soft p-3 sm:grid-cols-2">{profesores.map((p)=>{const c=(form.profesor_ids||[]).map(Number).includes(p.id);return <label key={p.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm"><input type="checkbox" checked={c} onChange={(e)=>set('profesor_ids',e.target.checked?[...new Set([...(form.profesor_ids||[]),p.id])]:(form.profesor_ids||[]).filter((x)=>Number(x)!==p.id))} className="accent-primary-500"/>{p.nombre_completo}</label>;})}</div></Field>}
        <Field label="Referencias más relevantes" full count={`${String(form.referencias||'').split(/\n+/).filter(Boolean).length} referencia(s), mínimo 3`}><textarea rows="5" className={input} value={form.referencias} onChange={(e)=>set('referencias',e.target.value)} placeholder="Una referencia por línea" required/></Field>
        <label className="flex items-center gap-3 rounded-xl border border-line bg-soft px-4 py-3 text-sm font-600 text-slate-700"><input type="checkbox" checked={!!form.publicado} onChange={(e)=>set('publicado',e.target.checked)} className="accent-primary-500"/>Visible en la parte pública</label>
      </div>
      <div className="mt-6 flex gap-3"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-600 text-white">{saving?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>}Guardar</button><button type="button" onClick={()=>setForm(null)} className="rounded-xl border border-line px-5 py-3 text-sm font-600">Cancelar</button></div>
    </form> : <>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 shadow-sm"><Search size={16} className="text-slate-400"/><input value={buscar} onChange={(e)=>setBuscar(e.target.value)} className="w-full outline-none" placeholder="Buscar proyecto, área, profesor…"/></div>
      <div className="grid gap-4 xl:grid-cols-2">{filtrados.map((p)=><article key={p.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="flex items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-[11px] font-700 ${p.estatus==='terminado'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}>{p.estatus==='terminado'?'Terminado':'En proceso'}</span><h3 className="mt-3 font-display text-lg font-700 text-ink">{p.titulo}</h3></div>
          {canManage&&<div className="flex gap-2"><button onClick={()=>beginEdit(p)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500 hover:text-primary-600"><Pencil size={15}/></button><button onClick={()=>del(p.id)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500 hover:text-red-600"><Trash2 size={15}/></button></div>}</div>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{p.resumen}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-primary-50 px-3 py-1 text-primary-700">{p.area_nombre||'Sin área'}</span><span className="rounded-full bg-soft px-3 py-1 text-slate-600">{p.tipo_nombre||p.tipo}</span></div>
        <div className="mt-4 border-t border-line pt-4 text-xs text-slate-500"><p className="flex items-center gap-2"><Users size={14} className="text-primary-500"/>Profesores: {(p.profesores||[]).map((x)=>x.nombre).join(', ')||'Sin asociados'}</p><p className="mt-2">Estudiantes: {(p.estudiantes||[]).map((x)=>x.nombre).join(', ')||'Sin asociados'}</p></div>
        {isStudent&&<button onClick={()=>join(p)} className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-600 ${p.participando?'border border-line text-slate-600':'bg-primary-500 text-white'}`}>{p.participando?<><UserMinus size={16}/>Dejar proyecto</>:<><UserPlus size={16}/>Asociarme como participante</>}</button>}
      </article>)}{filtrados.length===0&&<p className="rounded-2xl border border-line bg-white p-6 text-sm text-slate-500">No hay proyectos para mostrar.</p>}</div>
    </>}
  </div>;
}

function Field({label,count,full,children}){return <div className={full?'md:col-span-2':''}><div className="mb-1.5 flex items-center justify-between gap-2"><label className="font-mono text-xs uppercase tracking-wider text-slate-500">{label}</label>{count&&<span className="text-[11px] text-slate-400">{count}</span>}</div>{children}</div>}
