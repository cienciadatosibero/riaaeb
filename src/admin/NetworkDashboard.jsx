import { useEffect, useState } from 'react';
import {
  AlertTriangle, BookOpen, CheckCircle2, CircleDot, FlaskConical,
  GraduationCap, UserCheck, Users, UsersRound,
} from 'lucide-react';
import { getDashboard } from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';

function Metric({ icon:Icon, label, value, hint, tone='primary' }) {
  const toneClass = tone === 'warning'
    ? 'bg-amber-50 text-amber-700'
    : tone === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-primary-50 text-primary-600';
  return <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 font-display text-3xl font-700 text-ink">{value ?? 0}</p>
        {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
      </div>
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${toneClass}`}><Icon size={20}/></span>
    </div>
  </div>;
}

function Bars({ title, rows=[] }) {
  const max = Math.max(1, ...rows.map((r)=>Number(r.valor)||0));
  return <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
    <h3 className="font-display text-lg font-700 text-ink">{title}</h3>
    <div className="mt-5 space-y-4">
      {rows.length === 0 && <p className="text-sm text-slate-400">Aún no hay datos.</p>}
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

  const t = data.totals || {};
  const personal = data.personal || {};
  const roles = (session?.roles || []).map((x)=>String(x).toLowerCase());
  const admin = roles.includes('administrador');
  const investigador = roles.includes('investigador');
  const estudiante = roles.includes('estudiante');
  const totalStatus = (Number(t.en_proceso)||0) + (Number(t.terminados)||0);
  const pct = totalStatus ? Math.round((Number(t.terminados)||0) / totalStatus * 100) : 0;

  return <div>
    <div className="mb-7">
      <p className="font-mono text-[11px] uppercase tracking-[.2em] text-primary-500">Descripción general</p>
      <h1 className="mt-1 font-display text-3xl font-700 text-ink">Dashboard de la Red</h1>
      <p className="mt-2 text-sm text-slate-500">Indicadores calculados únicamente con usuarios, roles y proyectos registrados en la base de datos.</p>
    </div>

    {admin && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <Metric icon={Users} label="Investigadores registrados" value={t.investigadores}/>
      <Metric icon={FlaskConical} label="Proyectos registrados" value={t.proyectos}/>
      <Metric icon={GraduationCap} label="Estudiantes en la Red" value={t.estudiantes}/>
      <Metric icon={UsersRound} label="Participaciones estudiantiles" value={t.participaciones_estudiantes} hint="Asociaciones estudiante ↔ proyecto"/>
      <Metric icon={CircleDot} label="En proceso" value={t.en_proceso}/>
      <Metric icon={CheckCircle2} label="Terminados" value={t.terminados} tone="success"/>
    </div>}

    {investigador && !admin && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={FlaskConical} label="Mis proyectos" value={personal.mis_proyectos}/>
      <Metric icon={CircleDot} label="Mis proyectos en proceso" value={personal.mis_en_proceso}/>
      <Metric icon={CheckCircle2} label="Mis proyectos terminados" value={personal.mis_terminados} tone="success"/>
      <Metric icon={GraduationCap} label="Estudiantes asociados" value={personal.mis_estudiantes}/>
    </div>}

    {estudiante && !admin && !investigador && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={FlaskConical} label="Proyectos disponibles" value={personal.proyectos_disponibles}/>
      <Metric icon={UserCheck} label="Proyectos en los que participo" value={personal.mis_participaciones}/>
      <Metric icon={Users} label="Investigadores de la Red" value={t.investigadores}/>
      <Metric icon={BookOpen} label="Publicaciones de la Red" value={t.publicaciones}/>
    </div>}

    {admin && Number(t.proyectos_sin_profesor || 0) > 0 && <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <AlertTriangle size={20} className="mt-0.5 shrink-0"/>
      <div>
        <b>{t.proyectos_sin_profesor} proyecto(s) sin profesor / investigador responsable.</b>
        <p className="mt-1 text-amber-800">Así no podrán recibir estudiantes. Entra a Investigaciones y asigna un responsable.</p>
        {(data.proyectos_sin_profesor || []).length > 0 && <div className="mt-2 flex flex-wrap gap-2">{data.proyectos_sin_profesor.map((p)=><span key={p.id} className="rounded-full bg-white px-2.5 py-1 text-xs">{p.titulo}</span>)}</div>}
      </div>
    </div>}

    <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr_340px]">
      <Bars title="Profesores por institución de adscripción" rows={data.profesores_por_institucion}/>
      <Bars title="Proyectos por área de conocimiento" rows={data.proyectos_por_area}/>
      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <div className="flex items-center gap-2"><FlaskConical size={18} className="text-primary-500"/><h3 className="font-display text-lg font-700 text-ink">Estatus de los proyectos</h3></div>
        <div className="mx-auto mt-7 grid h-48 w-48 place-items-center rounded-full" style={{background:`conic-gradient(#e11d3a ${pct}%, #ffdede ${pct}% 100%)`}}>
          <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center shadow-inner">
            <div><p className="font-display text-3xl font-700 text-ink">{pct}%</p><p className="text-xs text-slate-500">terminados</p></div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-primary-50 p-3"><b className="block text-lg text-primary-700">{t.en_proceso || 0}</b><span className="text-xs text-slate-500">En proceso</span></div>
          <div className="rounded-xl bg-soft p-3"><b className="block text-lg text-ink">{t.terminados || 0}</b><span className="text-xs text-slate-500">Terminados</span></div>
        </div>
        {admin && <div className="mt-3 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-emerald-50 p-3"><b className="block text-lg text-emerald-700">{t.proyectos_con_profesor || 0}</b><span className="text-xs text-slate-500">Con profesor</span></div>
          <div className="rounded-xl bg-amber-50 p-3"><b className="block text-lg text-amber-700">{t.proyectos_con_estudiantes || 0}</b><span className="text-xs text-slate-500">Con estudiantes</span></div>
        </div>}
      </div>
    </div>
  </div>;
}
