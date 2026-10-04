import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, GraduationCap, Microscope, Search, Trash2 } from 'lucide-react';
import { seguridadUsuarios } from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import PersonaModal from '../components/ui/PersonaModal.jsx';

const PAGE_SIZE = 10;

export default function PendingUsers({ canApprove=false, canDelete=false }) {
  const [items,setItems]=useState([]);
  const [estado,setEstado]=useState('cargando');
  const [error,setError]=useState('');
  const [ok,setOk]=useState('');
  const [buscar,setBuscar]=useState('');
  const [pagina,setPagina]=useState(1);
  const [persona,setPersona]=useState(null);
  const [confirmApprove,setConfirmApprove]=useState(null);
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [procesando,setProcesando]=useState(false);

  const cargar=async()=>{
    setEstado('cargando');
    setError('');
    try{
      const data=await seguridadUsuarios.pendientes();
      setItems(data||[]);
      setEstado('listo');
    }catch(e){
      setError(e.message);
      setEstado('error');
    }
  };

  useEffect(()=>{cargar();},[]);

  const filtrados=useMemo(()=>{
    const q=buscar.trim().toLowerCase();
    if(!q)return items;
    return items.filter((x)=>[
      x.nombre_completo,x.usuario,x.correo,x.telefono,x.institucion,
      x.tipo_perfil,...(x.roles||[]),...(x.areas||[])
    ].join(' ').toLowerCase().includes(q));
  },[items,buscar]);

  const totalPaginas=Math.max(1,Math.ceil(filtrados.length/PAGE_SIZE));
  useEffect(()=>{setPagina(1);},[buscar]);
  useEffect(()=>{if(pagina>totalPaginas)setPagina(totalPaginas);},[pagina,totalPaginas]);
  const inicio=(pagina-1)*PAGE_SIZE;
  const visibles=filtrados.slice(inicio,inicio+PAGE_SIZE);

  const aprobar=async()=>{
    if(!confirmApprove)return;
    setProcesando(true);setError('');setOk('');
    try{
      await seguridadUsuarios.aprobar(confirmApprove.id);
      setOk(`${confirmApprove.nombre_completo} fue aprobado y ya puede iniciar sesión.`);
      setConfirmApprove(null);
      await cargar();
    }catch(e){setError(e.message);}finally{setProcesando(false);}
  };

  const rechazar=async()=>{
    if(!confirmDelete)return;
    setProcesando(true);setError('');setOk('');
    try{
      await seguridadUsuarios.remove(confirmDelete.id);
      setOk('Solicitud eliminada.');
      setConfirmDelete(null);
      await cargar();
    }catch(e){setError(e.message);}finally{setProcesando(false);}
  };

  if(estado==='cargando')return <AdminLoader texto="Cargando usuarios por confirmar…"/>;

  return <div>
    <div className="mb-6">
      <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Seguridad</p>
      <h2 className="mt-1 font-display text-2xl font-700 text-ink">Usuarios por confirmar</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-500">
        Solicitudes enviadas desde el registro público. Aquí puedes revisar si la persona se registró como Investigador o Estudiante antes de activar su cuenta.
      </p>
    </div>

    {error&&<p className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {ok&&<p className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">{ok}</p>}

    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <Search size={16} className="text-slate-400"/>
        <input value={buscar} onChange={(e)=>setBuscar(e.target.value)} placeholder="Buscar nombre, correo, institución, rol o área…" className="w-full bg-transparent text-sm text-ink outline-none"/>
        <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-700 text-primary-700">{filtrados.length}</span>
      </div>

      {visibles.length===0?<p className="p-8 text-center text-sm text-slate-500">No hay solicitudes pendientes.</p>:visibles.map((u,index)=>{
        const estudiante=u.tipo_perfil==='estudiante'||(u.roles||[]).includes('estudiante');
        return <div key={u.id} className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-0 sm:flex-row sm:items-center">
          <span className="w-7 shrink-0 font-mono text-[11px] text-slate-400">{String(inicio+index+1).padStart(2,'0')}</span>
          {u.foto_url?<img src={u.foto_url} alt="" className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"/>:<span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-700 text-primary-700">{String(u.nombre_completo||'?').trim().split(/\s+/).slice(0,2).map((x)=>x[0]).join('').toUpperCase()}</span>}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-700 text-ink">{u.nombre_completo}</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-700 ${estudiante?'bg-blue-50 text-blue-700':'bg-primary-50 text-primary-700'}`}>
                {estudiante?<GraduationCap size={12}/>:<Microscope size={12}/>} {estudiante?'Estudiante':'Investigador'}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-slate-500">{u.correo}{u.institucion?` · ${u.institucion}`:''}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button onClick={()=>setPersona({...u,nombre:u.nombre_completo,bio:u.semblanza,correo_institucional:u.correo})} className="inline-flex h-9 items-center gap-2 rounded-xl border border-line px-3 text-xs font-600 text-slate-600 hover:border-primary-300 hover:text-primary-600"><Eye size={14}/>Ver datos</button>
            {canApprove&&<button onClick={()=>setConfirmApprove(u)} className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-600 text-white hover:bg-emerald-700"><CheckCircle2 size={14}/>Aprobar</button>}
            {canDelete&&<button onClick={()=>setConfirmDelete(u)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-100 px-3 text-xs font-600 text-red-600 hover:bg-red-50"><Trash2 size={14}/>Rechazar</button>}
          </div>
        </div>;
      })}

      {totalPaginas>1&&<div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <p className="text-xs text-slate-400">Página {pagina} de {totalPaginas} · {filtrados.length} solicitud(es)</p>
        <div className="flex flex-wrap gap-1">{Array.from({length:totalPaginas},(_,i)=>i+1).map((n)=><button key={n} onClick={()=>setPagina(n)} className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-700 ${n===pagina?'border-primary-500 bg-primary-500 text-white':'border-line bg-white text-slate-500'}`}>{n}</button>)}</div>
      </div>}
    </div>

    {persona&&<PersonaModal persona={persona} onClose={()=>setPersona(null)}/>} 

    <ConfirmModal
      open={!!confirmApprove}
      title="Aprobar usuario"
      message={confirmApprove?`¿Activar la cuenta de ${confirmApprove.nombre_completo}? Podrá iniciar sesión inmediatamente con el rol solicitado.`:''}
      confirmText="Sí, aprobar"
      cancelText="Cancelar"
      tone="primary"
      loading={procesando}
      onClose={()=>!procesando&&setConfirmApprove(null)}
      onConfirm={aprobar}
    />

    <ConfirmModal
      open={!!confirmDelete}
      title="Rechazar solicitud"
      message={confirmDelete?`¿Eliminar la solicitud de ${confirmDelete.nombre_completo}? Esta acción no se puede deshacer.`:''}
      confirmText="Sí, rechazar"
      cancelText="Cancelar"
      tone="danger"
      loading={procesando}
      onClose={()=>!procesando&&setConfirmDelete(null)}
      onConfirm={rechazar}
    />
  </div>;
}
