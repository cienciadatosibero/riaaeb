import { useEffect, useState } from 'react';
import { BookOpen, Calendar, X } from 'lucide-react';
import SectionTitle from './ui/SectionTitle.jsx';
import Portal from './ui/Portal.jsx';
import { getPublicaciones } from '../lib/api.js';

function Modal({ item, onClose }) {
  useEffect(()=>{const k=(e)=>e.key==='Escape'&&onClose();document.addEventListener('keydown',k);document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',k);document.body.style.overflow='';};},[onClose]);
  return <Portal><div className="fixed inset-0 z-[130] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={onClose}/><div className="animate-modal-in relative z-10 w-full max-w-2xl rounded-3xl bg-white p-7 shadow-lift">
    <button onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500"><X size={17}/></button>
    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-700 text-primary-700">{item.tipo_producto}</span>
    <h3 className="mt-4 pr-10 font-display text-2xl font-700 text-ink">{item.titulo}</h3>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.resumen || 'Sin resumen registrado.'}</p>
    <div className="mt-6 grid gap-3 rounded-2xl bg-soft p-4 sm:grid-cols-2"><div><span className="text-xs uppercase tracking-wider text-slate-400">Autores</span><p className="mt-1 text-sm font-600 text-ink">{item.autores}</p></div><div><span className="text-xs uppercase tracking-wider text-slate-400">Año</span><p className="mt-1 text-sm font-600 text-ink">{item.anio || '—'}</p></div></div>
  </div></div></Portal>;
}

export default function Publicaciones() {
  const [items,setItems]=useState([]); const [estado,setEstado]=useState('cargando'); const [modal,setModal]=useState(null);
  useEffect(()=>{getPublicaciones().then((d)=>{setItems(d||[]);setEstado('listo');}).catch(()=>setEstado('error'));},[]);
  return <section id="publicaciones" className="relative overflow-hidden border-t border-line bg-white py-24"><div className="glow-bg pointer-events-none absolute inset-0 opacity-40"/><div className="relative mx-auto max-w-7xl px-6">
    <SectionTitle index="03" eyebrow="Publicaciones de la Red" title="Productos generados en colaboración" subtitle="Artículos, libros, capítulos, desarrollos y otros productos registrados por integrantes de la Red."/>
    {estado==='cargando'&&<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-56 animate-pulse rounded-2xl bg-soft"/>)}</div>}
    {estado==='error'&&<p className="mt-10 rounded-xl bg-primary-50 p-5 text-sm text-primary-700">No pudimos cargar las publicaciones.</p>}
    {estado==='listo'&&<div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((p)=><article key={p.id} className="group flex min-h-56 flex-col rounded-2xl border border-line bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-lift"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-700 text-primary-700">{p.tipo_producto}</span><span className="inline-flex items-center gap-1 text-xs text-slate-400"><Calendar size={12}/>{p.anio||'—'}</span></div><h3 className="mt-4 line-clamp-2 font-display text-lg font-700 text-ink">{p.titulo}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.autores}</p><button onClick={()=>setModal(p)} className="mt-auto inline-flex w-fit items-center gap-2 pt-5 text-sm font-700 text-primary-600"><BookOpen size={15}/>Ver detalle</button></article>)}{items.length===0&&<p className="text-sm text-slate-500">Aún no hay publicaciones registradas.</p>}</div>}
  </div>{modal&&<Modal item={modal} onClose={()=>setModal(null)}/>}</section>;
}
