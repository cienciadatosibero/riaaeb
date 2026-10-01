import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, Search, Trash2, X } from 'lucide-react';
import { eliminarMensajeContacto, getMensajesContacto, marcarMensajeContacto } from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';
import Portal from '../components/ui/Portal.jsx';

const PAGE_SIZE=10;

export default function ContactMessages({ canUpdate=false, canDelete=false }) {
  const [items,setItems]=useState([]);
  const [estado,setEstado]=useState('cargando');
  const [error,setError]=useState('');
  const [buscar,setBuscar]=useState('');
  const [pagina,setPagina]=useState(1);
  const [abierto,setAbierto]=useState(null);

  const cargar=()=>{
    setEstado('cargando');
    getMensajesContacto().then((d)=>{setItems(d||[]);setEstado('listo');}).catch((e)=>{setError(e.message);setEstado('error');});
  };
  useEffect(cargar,[]);

  const filtrados=useMemo(()=>{
    const q=buscar.trim().toLowerCase();
    if(!q) return items;
    return items.filter((x)=>[x.nombre,x.correo,x.telefono,x.asunto,x.mensaje].some((v)=>String(v||'').toLowerCase().includes(q)));
  },[items,buscar]);

  const pages=Math.max(1,Math.ceil(filtrados.length/PAGE_SIZE));
  useEffect(()=>{setPagina(1);},[buscar]);
  useEffect(()=>{if(pagina>pages)setPagina(pages);},[pagina,pages]);
  const inicio=(pagina-1)*PAGE_SIZE;
  const visibles=filtrados.slice(inicio,inicio+PAGE_SIZE);

  const leer=async(item)=>{
    setAbierto(item);
    if(!item.leido && canUpdate){
      try{await marcarMensajeContacto(item.id,true);setItems((arr)=>arr.map((x)=>x.id===item.id?{...x,leido:1}:x));}
      catch{}
    }
  };

  const borrar=async(id)=>{
    if(!window.confirm('¿Eliminar este mensaje?'))return;
    try{await eliminarMensajeContacto(id);setItems((a)=>a.filter((x)=>x.id!==id));}
    catch(e){setError(e.message);}
  };

  if(estado==='cargando') return <AdminLoader texto="Cargando mensajes…"/>;

  return <div>
    <div className="mb-6">
      <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Contenido público</p>
      <h2 className="mt-1 font-display text-2xl font-700 text-ink">Mensajes de contacto</h2>
      <p className="mt-1 text-sm text-slate-500">Mensajes enviados desde el formulario público de la Red.</p>
    </div>
    {error&&<p className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <Search size={16} className="text-slate-400"/>
        <input value={buscar} onChange={(e)=>setBuscar(e.target.value)} placeholder="Buscar por nombre, correo, asunto o mensaje…" className="w-full bg-transparent text-sm text-ink outline-none"/>
        <span className="rounded-full bg-soft px-2.5 py-1 text-xs text-slate-500">{filtrados.length}</span>
      </div>
      {visibles.length===0?<p className="p-6 text-sm text-slate-500">Sin mensajes.</p>:visibles.map((x,i)=><div key={x.id} className={`flex items-center gap-4 border-b border-line px-5 py-4 last:border-0 ${x.leido?'bg-white':'bg-primary-50/35'}`}>
        <span className="w-7 shrink-0 font-mono text-[11px] text-slate-400">{String(inicio+i+1).padStart(2,'0')}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${x.leido?'bg-slate-200':'bg-primary-500'}`}/>
        <div className="min-w-0 flex-1">
          <p className="truncate font-600 text-ink">{x.asunto}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{x.nombre} · {x.correo}</p>
        </div>
        <button onClick={()=>leer(x)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500 hover:border-primary-300 hover:text-primary-600" title="Ver mensaje"><Eye size={15}/></button>
        {canDelete&&<button onClick={()=>borrar(x.id)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500 hover:border-red-200 hover:text-red-600" title="Eliminar"><Trash2 size={15}/></button>}
      </div>)}
      {pages>1&&<div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <p className="text-xs text-slate-400">Página {pagina} de {pages}</p>
        <div className="flex gap-1">{Array.from({length:pages},(_,i)=>i+1).map((n)=><button key={n} onClick={()=>setPagina(n)} className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-700 ${n===pagina?'border-primary-500 bg-primary-500 text-white':'border-line bg-white text-slate-500'}`}>{n}</button>)}</div>
      </div>}
    </div>

    {abierto&&<Portal><div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={()=>setAbierto(null)}/>
      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white p-7 shadow-lift">
        <button onClick={()=>setAbierto(null)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500"><X size={17}/></button>
        <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Mensaje de contacto</p>
        <h3 className="mt-2 pr-10 font-display text-2xl font-700 text-ink">{abierto.asunto}</h3>
        <div className="mt-5 grid gap-3 rounded-2xl bg-soft p-4 sm:grid-cols-2">
          <div><span className="text-[11px] uppercase tracking-wider text-slate-400">Nombre</span><p className="mt-1 text-sm font-600 text-ink">{abierto.nombre}</p></div>
          <div><span className="text-[11px] uppercase tracking-wider text-slate-400">Correo</span><p className="mt-1 break-all text-sm font-600 text-ink">{abierto.correo}</p></div>
          <div><span className="text-[11px] uppercase tracking-wider text-slate-400">Teléfono</span><p className="mt-1 text-sm font-600 text-ink">{abierto.telefono||'—'}</p></div>
          <div><span className="text-[11px] uppercase tracking-wider text-slate-400">Fecha</span><p className="mt-1 text-sm font-600 text-ink">{abierto.created_at?new Date(abierto.created_at).toLocaleString():'—'}</p></div>
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{abierto.mensaje}</p>
        {!abierto.leido&&canUpdate&&<button onClick={async()=>{await marcarMensajeContacto(abierto.id,true);setAbierto({...abierto,leido:1});setItems((arr)=>arr.map((x)=>x.id===abierto.id?{...x,leido:1}:x));}} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-600 text-white"><Check size={15}/>Marcar como leído</button>}
      </div>
    </div></Portal>}
  </div>;
}
