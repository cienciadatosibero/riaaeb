import { useEffect, useState } from 'react';
import { Users, FlaskConical, Building2, CircleDot, BookOpen, UserCheck } from 'lucide-react';
import { getDashboard } from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';

function Metric({ icon:Icon, label, value, hint }) {
  return <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 font-display text-3xl font-700 text-ink">{value ?? 0}</p>
        {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
      </div>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600"><Icon size={20}/></span>
    </div>
  </div>;
}

function Bars({ title, rows=[] }) {
  const max = Math.max(1,...rows.map((r)=>Number(r.valor)||0));
  return <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
    <h3 className="font-display text-lg font-700 text-ink">{title}</h3>
    <div className="mt-5 space-y-4">
      {rows.length===0 && <p className="text-sm text-slate-400">Aún no hay datos.</p>}
      {rows.map((r)=><div key={r.etiqueta}>
        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="truncate text-slate-600">{r.etiqueta}</span><b className="text-ink">{r.valor}</b></div>
        <div className="h-2 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400" style={{width:`${Math.max(6,(Number(r.valor)||0)/max*100)}%`}}/></div>
      </div>)}
    </div>
  </div>;
}

export default function NetworkDashboard({ session }) {
  const [data,setData] = useState(null);
  const [error,setError] = useState('');
  useEffect(()=>{ getDashboard().then(setData).catch((e)=>setError(e.message)); },[]);
  if (!data && !error) return <AdminLoader texto="Preparando indicadores de la Red…"/>;
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  const t=data.totals || {};
  const totalStatus=(Number(t.en_proceso)||0)+(Number(t.terminados)||0);
  const pct=totalStatus ? Math.round((Number(t.terminados)||0)/totalStatus*100) : 0;
  const admin=(session?.roles||[]).includes('administrador');
  return <div>
    <div className="mb-7">
      <p className="font-mono text-[11px] uppercase tracking-[.2em] text-primary-500">Descripción general</p>
      <h1 className="mt-1 font-display text-3xl font-700 text-ink">Dashboard de la Red</h1>
      <p className="mt-2 text-sm text-slate-500">Indicadores de investigadores, proyectos, instituciones y producción académica.</p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={Users} label="Investigadores registrados" value={t.investigadores} hint={`${t.estudiantes||0} estudiante${Number(t.estudiantes)===1?'':'s'} en la Red`}/>
      <Metric icon={FlaskConical} label="Proyectos de investigación" value={t.proyectos}/>
      <Metric icon={BookOpen} label="Publicaciones de la Red" value={t.publicaciones}/>
      {admin ? <Metric icon={UserCheck} label="Registros por aprobar" value={t.registros_pendientes} hint="Actívalos en Seguridad · Usuarios"/> : <Metric icon={CircleDot} label="Proyectos terminados" value={t.terminados}/>} 
    </div>

    <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr_340px]">
      <Bars title="Profesores por institución de adscripción" rows={data.profesores_por_institucion}/>
      <Bars title="Proyectos por área de conocimiento" rows={data.proyectos_por_area}/>
      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="flex items-center gap-2"><Building2 size={18} className="text-primary-500"/><h3 className="font-display text-lg font-700 text-ink">Estatus de proyectos</h3></div>
        <div className="mx-auto mt-7 grid h-48 w-48 place-items-center rounded-full" style={{background:`conic-gradient(#e11d3a ${pct}%, #ffdede ${pct}% 100%)`}}>
          <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center shadow-inner">
            <div><p className="font-display text-3xl font-700 text-ink">{pct}%</p><p className="text-xs text-slate-500">terminados</p></div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-primary-50 p-3"><b className="block text-lg text-primary-700">{t.en_proceso||0}</b><span className="text-xs text-slate-500">En proceso</span></div>
          <div className="rounded-xl bg-soft p-3"><b className="block text-lg text-ink">{t.terminados||0}</b><span className="text-xs text-slate-500">Terminados</span></div>
        </div>
      </div>
    </div>
  </div>;
}
