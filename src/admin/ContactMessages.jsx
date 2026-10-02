import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, Mail, Save, Search, Send, Trash2, X } from 'lucide-react';
import {
  eliminarMensajeContacto,
  getMensajesContacto,
  guardarRespuestaContacto,
  marcarMensajeContacto,
  responderMensajeContacto,
} from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';
import Portal from '../components/ui/Portal.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

const PAGE_SIZE=10;

const estadoDe=(x)=>x.estado || (x.fecha_respuesta?'respondido':x.leido?'leido':'nuevo');
const estadoUI={
  nuevo:{label:'Nuevo',dot:'bg-red-500',pill:'bg-red-50 text-red-700'},
  leido:{label:'Leído',dot:'bg-amber-400',pill:'bg-amber-50 text-amber-700'},
  respondido:{label:'Respondido',dot:'bg-emerald-500',pill:'bg-emerald-50 text-emerald-700'},
};

export default function ContactMessages({ canUpdate=false, canDelete=false }) {
  const [items,setItems]=useState([]);
  const [estado,setEstado]=useState('cargando');
  const [error,setError]=useState('');
  const [buscar,setBuscar]=useState('');
  const [pagina,setPagina]=useState(1);
  const [abierto,setAbierto]=useState(null);
  const [respuesta,setRespuesta]=useState('');
  const [enviando,setEnviando]=useState(false);
  const [ok,setOk]=useState('');
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [confirmSend,setConfirmSend]=useState(false);
  const [eliminando,setEliminando]=useState(false);

  const cargar=()=>{
    setEstado('cargando');
    getMensajesContacto().then((d)=>{setItems(d||[]);setEstado('listo');}).catch((e)=>{setError(e.message);setEstado('error');});
  };
  useEffect(cargar,[]);

  const filtrados=useMemo(()=>{
    const q=buscar.trim().toLowerCase();
    if(!q) return items;
    return items.filter((x)=>[x.nombre,x.correo,x.telefono,x.asunto,x.mensaje,x.respuesta,estadoDe(x)].some((v)=>String(v||'').toLowerCase().includes(q)));
  },[items,buscar]);

  const pages=Math.max(1,Math.ceil(filtrados.length/PAGE_SIZE));
  useEffect(()=>{setPagina(1);},[buscar]);
  useEffect(()=>{if(pagina>pages)setPagina(pages);},[pagina,pages]);
  const inicio=(pagina-1)*PAGE_SIZE;
  const visibles=filtrados.slice(inicio,inicio+PAGE_SIZE);

  const actualizarLocal=(data)=>{
    setItems((arr)=>arr.map((x)=>x.id===data.id?{...x,...data}:x));
    setAbierto((x)=>x?.id===data.id?{...x,...data}:x);
  };

  const leer=async(item)=>{
    setAbierto(item);
    setRespuesta(item.respuesta||'');
    setError(''); setOk('');
    if(!item.leido && canUpdate){
      try{const data=await marcarMensajeContacto(item.id,true);actualizarLocal(data);}
      catch{}
    }
  };

  const borrar=(item)=>{
    setError('');
    setConfirmDelete(item);
  };

  const confirmarBorrado=async()=>{
    if(!confirmDelete)return;
    setEliminando(true);
    setError('');
    try{
      await eliminarMensajeContacto(confirmDelete.id);
      setItems((a)=>a.filter((x)=>x.id!==confirmDelete.id));
      if(abierto?.id===confirmDelete.id)setAbierto(null);
      setConfirmDelete(null);
    }catch(e){
      setError(e.message);
    }finally{
      setEliminando(false);
    }
  };

  const guardar=async()=>{
    if(!respuesta.trim()) return setError('Escribe una respuesta antes de guardarla.');
    setEnviando(true); setError(''); setOk('');
    try{
      const data=await guardarRespuestaContacto(abierto.id,respuesta.trim());
      actualizarLocal(data); setOk('Borrador guardado.');
    }catch(e){setError(e.message);}finally{setEnviando(false);}
  };

  const enviar=()=>{
    if(!respuesta.trim()) return setError('Escribe una respuesta antes de enviarla.');
    setError('');
    setConfirmSend(true);
  };

  const confirmarEnvio=async()=>{
    if(!abierto)return;
    setEnviando(true); setError(''); setOk('');
    try{
      const data=await responderMensajeContacto(abierto.id,respuesta.trim());
      actualizarLocal(data);
      setOk('Respuesta enviada por correo y guardada en el sistema.');
      setConfirmSend(false);
    }catch(e){
      setError(e.message);
    }finally{
      setEnviando(false);
    }
  };

  if(estado==='cargando') return <AdminLoader texto="Cargando mensajes…"/>;

  return <div>
    <div className="mb-6">
      <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Contenido público</p>
      <h2 className="mt-1 font-display text-2xl font-700 text-ink">Mensajes de contacto</h2>
      <p className="mt-1 text-sm text-slate-500">Consulta y responde los mensajes enviados desde el sitio público.</p>
    </div>
    {error&&<p className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <Search size={16} className="text-slate-400"/>
        <input value={buscar} onChange={(e)=>setBuscar(e.target.value)} placeholder="Buscar por nombre, correo, asunto, mensaje o estado…" className="w-full bg-transparent text-sm text-ink outline-none"/>
        <span className="rounded-full bg-soft px-2.5 py-1 text-xs text-slate-500">{filtrados.length}</span>
      </div>
      {visibles.length===0?<p className="p-6 text-sm text-slate-500">Sin mensajes.</p>:visibles.map((x,i)=>{
        const st=estadoUI[estadoDe(x)]||estadoUI.nuevo;
        return <div key={x.id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
          <span className="w-7 shrink-0 font-mono text-[11px] text-slate-400">{String(inicio+i+1).padStart(2,'0')}</span>
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${st.dot}`}/>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><p className="truncate font-600 text-ink">{x.asunto}</p><span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-700 ${st.pill}`}>{st.label}</span></div>
            <p className="mt-0.5 truncate text-xs text-slate-500">{x.nombre} · {x.correo}</p>
          </div>
          <button onClick={()=>leer(x)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500 hover:border-primary-300 hover:text-primary-600" title="Ver / responder"><Eye size={15}/></button>
          {canDelete&&<button onClick={()=>borrar(x)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500 hover:border-red-200 hover:text-red-600" title="Eliminar"><Trash2 size={15}/></button>}
        </div>;
      })}
      {pages>1&&<div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <p className="text-xs text-slate-400">Página {pagina} de {pages}</p>
        <div className="flex gap-1">{Array.from({length:pages},(_,i)=>i+1).map((n)=><button key={n} onClick={()=>setPagina(n)} className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-700 ${n===pagina?'border-primary-500 bg-primary-500 text-white':'border-line bg-white text-slate-500'}`}>{n}</button>)}</div>
      </div>}
    </div>

    <ConfirmModal
      open={!!confirmDelete}
      title="Eliminar mensaje"
      message={confirmDelete ? `¿Deseas eliminar el mensaje “${confirmDelete.asunto}” de ${confirmDelete.nombre}? Esta acción no se puede deshacer.` : ''}
      confirmText="Sí, eliminar"
      cancelText="Cancelar"
      tone="danger"
      loading={eliminando}
      onClose={()=>!eliminando&&setConfirmDelete(null)}
      onConfirm={confirmarBorrado}
    />

    <ConfirmModal
      open={confirmSend}
      title="Enviar respuesta"
      message={abierto ? `La respuesta se enviará por correo a ${abierto.correo}. ¿Deseas continuar?` : ''}
      confirmText="Enviar respuesta"
      cancelText="Cancelar"
      tone="primary"
      loading={enviando}
      onClose={()=>!enviando&&setConfirmSend(false)}
      onConfirm={confirmarEnvio}
    />

    {abierto&&<Portal><div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={()=>setAbierto(null)}/>
      <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-7 shadow-lift">
        <button onClick={()=>setAbierto(null)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500"><X size={17}/></button>
        <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Mensaje de contacto</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 pr-10"><h3 className="font-display text-2xl font-700 text-ink">{abierto.asunto}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-700 ${(estadoUI[estadoDe(abierto)]||estadoUI.nuevo).pill}`}>{(estadoUI[estadoDe(abierto)]||estadoUI.nuevo).label}</span></div>
        <div className="mt-5 grid gap-3 rounded-2xl bg-soft p-4 sm:grid-cols-2">
          <div><span className="text-[11px] uppercase tracking-wider text-slate-400">Nombre</span><p className="mt-1 text-sm font-600 text-ink">{abierto.nombre}</p></div>
          <div><span className="text-[11px] uppercase tracking-wider text-slate-400">Correo</span><p className="mt-1 break-all text-sm font-600 text-ink">{abierto.correo}</p></div>
          <div><span className="text-[11px] uppercase tracking-wider text-slate-400">Teléfono</span><p className="mt-1 text-sm font-600 text-ink">{abierto.telefono||'—'}</p></div>
          <div><span className="text-[11px] uppercase tracking-wider text-slate-400">Fecha</span><p className="mt-1 text-sm font-600 text-ink">{abierto.created_at?new Date(abierto.created_at).toLocaleString():'—'}</p></div>
        </div>
        <div className="mt-5 rounded-2xl border border-line p-4"><p className="mb-2 text-[11px] font-700 uppercase tracking-wider text-slate-400">Mensaje recibido</p><p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{abierto.mensaje}</p></div>

        <div className="mt-5 border-t border-line pt-5">
          <div className="mb-2 flex items-center gap-2"><Mail size={16} className="text-primary-500"/><h4 className="font-display text-lg font-700 text-ink">Respuesta</h4></div>
          {abierto.fecha_respuesta&&<p className="mb-3 text-xs text-slate-400">Respondido {new Date(abierto.fecha_respuesta).toLocaleString()}{abierto.respondido_por?` por ${abierto.respondido_por}`:''}</p>}
          <textarea rows="7" disabled={!canUpdate||enviando} value={respuesta} onChange={(e)=>{setRespuesta(e.target.value);setOk('');setError('');}} placeholder="Escribe aquí la contestación…" className="w-full resize-y rounded-xl border border-line bg-white px-3 py-3 text-sm text-ink outline-none focus:border-primary-400 disabled:bg-slate-50"/>
          {error&&<p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {ok&&<p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{ok}</p>}
          {canUpdate&&<div className="mt-4 flex flex-wrap justify-end gap-2">
            <button disabled={enviando} onClick={guardar} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-600 text-slate-600 hover:border-primary-300 hover:text-primary-600 disabled:opacity-50"><Save size={15}/>Guardar borrador</button>
            <button disabled={enviando} onClick={enviar} className="btn-shine inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-600 text-white hover:bg-primary-600 disabled:opacity-50"><Send size={15}/>{enviando?'Procesando…':'Enviar respuesta'}</button>
          </div>}
        </div>
      </div>
    </div></Portal>}
  </div>;
}
