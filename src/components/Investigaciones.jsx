import { useEffect, useState } from 'react';
import { FlaskConical, Users, GraduationCap, X, BookOpenCheck, CircleDot } from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';
import Portal from './ui/Portal.jsx';
import { getInvestigaciones } from '../lib/api.js';

function Block({ title, children }) {
  if (!children || (Array.isArray(children) && !children.length)) return null;
  return <div className="rounded-2xl border border-line bg-soft p-4"><p className="font-mono text-[11px] uppercase tracking-[.16em] text-primary-500">{title}</p><div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div></div>;
}
function Detail({ p, onClose }) {
  useEffect(()=>{const k=(e)=>e.key==='Escape'&&onClose();document.addEventListener('keydown',k);document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',k);document.body.style.overflow='';};},[onClose]);
  return <Portal><div className="fixed inset-0 z-[135] flex items-center justify-center p-3 sm:p-6"><div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose}/><div className="animate-modal-in relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-lift sm:p-8">
    <button onClick={onClose} className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-slate-500"><X size={18}/></button>
    <div className="pr-12"><div className="flex flex-wrap gap-2"><span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-700 text-primary-700">{p.area_nombre||p.area||'Sin área'}</span><span className="rounded-full bg-soft px-3 py-1 text-xs font-600 text-slate-600">{p.estatus==='terminado'?'Terminado':'En proceso'}</span></div><h3 className="mt-4 font-display text-2xl font-700 text-ink sm:text-3xl">{p.titulo}</h3></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <Block title="Resumen"><p>{p.resumen}</p></Block>
      <Block title="Tipo de investigación"><p>{p.tipo_nombre||p.tipo||'—'}</p></Block>
      <Block title="Impacto científico"><p>{p.impacto_cientifico||'No especificado.'}</p></Block>
      <Block title="Impacto social"><p>{p.impacto_social||'No especificado.'}</p></Block>
      <Block title="Aportaciones a la solución"><p>{p.aportaciones_solucion||'No especificado.'}</p></Block>
      <Block title="Acceso universal al conocimiento"><p>{p.acceso_universal||'No especificado.'}</p></Block>
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <Block title="Profesores asociados"><ul className="space-y-2">{(p.profesores||[]).length?(p.profesores||[]).map((x)=><li key={x.usuario_id} className="flex items-center gap-2"><Users size={14} className="text-primary-500"/><span>{x.nombre}{x.institucion?` · ${x.institucion}`:''}</span></li>):<li>{p.autores||'Sin profesores asociados.'}</li>}</ul></Block>
      <Block title="Estudiantes asociados"><ul className="space-y-2">{(p.estudiantes||[]).length?(p.estudiantes||[]).map((x)=><li key={x.usuario_id} className="flex items-center gap-2"><GraduationCap size={14} className="text-primary-500"/>{x.nombre}</li>):<li>Sin estudiantes asociados.</li>}</ul></Block>
    </div>
    <div className="mt-4"><Block title="Referencias más relevantes"><ol className="list-decimal space-y-2 pl-5">{(p.referencias||[]).length?(p.referencias||[]).map((r,i)=><li key={i}>{r}</li>):<li className="list-none">No se registraron referencias.</li>}</ol></Block></div>
  </div></div></Portal>;
}

export default function Investigaciones() {
  const [items,setItems]=useState([]); const [estado,setEstado]=useState('cargando'); const [modal,setModal]=useState(null);
  useEffect(()=>{getInvestigaciones().then((d)=>{setItems(d||[]);setEstado('listo');}).catch(()=>setEstado('error'));},[]);
  return <section id="investigaciones" className="relative overflow-hidden border-t border-line bg-soft py-24"><div className="glow-bg pointer-events-none absolute inset-0 opacity-60"/><div className="relative mx-auto max-w-7xl px-6">
    <SectionTitle index="02" eyebrow="Investigaciones" title="Proyectos de investigación de la Red" subtitle="Consulta el propósito, los impactos, las referencias y las personas asociadas a cada proyecto sin salir de esta página."/>
    {estado==='cargando'&&<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-80 animate-pulse rounded-3xl bg-white"/>)}</div>}
    {estado==='error'&&<p className="mt-12 rounded-xl border border-primary-200 bg-primary-50 p-6 text-sm text-primary-700">No pudimos cargar las investigaciones.</p>}
    {estado==='listo'&&<div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((p)=><article key={p.id} className="group flex min-h-80 flex-col rounded-3xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift"><div className="flex items-start justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600"><FlaskConical size={20}/></span><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-700 ${p.estatus==='terminado'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700'}`}><CircleDot size={11}/>{p.estatus==='terminado'?'Terminado':'En proceso'}</span></div><h3 className="mt-5 line-clamp-3 font-display text-xl font-700 leading-snug text-ink">{p.titulo}</h3><p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">{p.resumen}</p><div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-primary-50 px-3 py-1 text-primary-700">{p.area_nombre||p.area||'Sin área'}</span></div><button onClick={()=>setModal(p)} className="btn-shine mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-700 text-primary-600"><BookOpenCheck size={16}/>Ver detalle</button></article>)}{items.length===0&&<p className="text-sm text-slate-500">Aún no hay investigaciones publicadas.</p>}</div>}
  </div>{modal&&<Detail p={modal} onClose={()=>setModal(null)}/>}</section>;
}
