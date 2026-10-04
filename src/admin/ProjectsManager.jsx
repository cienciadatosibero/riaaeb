import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, FlaskConical, GraduationCap, Loader2, Pencil,
  Plus, Save, Search, Trash2, UserMinus, UserPlus, Users, X,
} from 'lucide-react';
import {
  adminInvestigaciones,
  getAreasConocimiento,
  getTiposInvestigacion,
} from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';

const PAGE_SIZE = 10;

const emptyForm = {
  titulo: '',
  resumen: '',
  impacto_cientifico: '',
  impacto_social: '',
  aportaciones_solucion: '',
  acceso_universal: '',
  area_id: '',
  tipo_investigacion_id: '',
  estatus: 'en_proceso',
  referencias: '',
  propietario_usuario_id: '',
  profesor_ids: [],
  estudiante_ids: [],
  publicado: true,
};

const norm = (v) => String(v ?? '').trim().toLowerCase();

export default function ProjectsManager({ session }) {
  const roles = (session?.roles || []).map(norm);
  const isAdmin = roles.includes('administrador');
  const isResearcher = roles.includes('investigador');
  const isStudent = roles.includes('estudiante');
  const canManage = isAdmin || isResearcher;

  const [items, setItems] = useState([]);
  const [areas, setAreas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [buscar, setBuscar] = useState('');
  const [pagina, setPagina] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setEstado('cargando');
    setError('');
    try {
      const solicitudes = [
        adminInvestigaciones.list(),
        getAreasConocimiento(),
        getTiposInvestigacion(),
      ];
      if (canManage) solicitudes.push(adminInvestigaciones.personas());

      const [p, a, t, personas] = await Promise.all(solicitudes);
      setItems(p || []);
      setAreas(a || []);
      setTipos(t || []);
      setProfesores(personas?.profesores || []);
      setEstudiantes(personas?.estudiantes || []);
      setEstado('listo');
    } catch (e) {
      setError(e.message);
      setEstado('error');
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const beginNew = () => {
    setError('');
    setOk('');
    setEditId(null);
    setForm({
      ...emptyForm,
      propietario_usuario_id: isResearcher ? session?.id || '' : '',
    });
  };

  const beginEdit = (p) => {
    setError('');
    setOk('');
    setEditId(p.id);
    setForm({
      ...emptyForm,
      ...p,
      referencias: (p.referencias || []).join('\n'),
      propietario_usuario_id: p.propietario_usuario_id || '',
      profesor_ids: (p.profesores || []).map((x) => Number(x.usuario_id)).filter(Boolean),
      estudiante_ids: (p.estudiantes || []).map((x) => Number(x.usuario_id)).filter(Boolean),
      publicado: !!p.publicado,
    });
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setOk('');
    try {
      const referencias = String(form.referencias || '')
        .split(/\n+/)
        .map((x) => x.trim())
        .filter(Boolean);

      if (referencias.length < 3) {
        throw new Error('Agrega al menos 3 referencias relevantes, una por línea.');
      }

      if (isAdmin && !Number(form.propietario_usuario_id)) {
        throw new Error('Selecciona un profesor / investigador responsable.');
      }

      const payload = {
        ...form,
        area_id: Number(form.area_id) || null,
        tipo_investigacion_id: Number(form.tipo_investigacion_id) || null,
        propietario_usuario_id: isAdmin ? (Number(form.propietario_usuario_id) || null) : session?.id,
        profesor_ids: isAdmin ? (form.profesor_ids || []).map(Number).filter(Boolean) : [],
        estudiante_ids: isAdmin ? (form.estudiante_ids || []).map(Number).filter(Boolean) : [],
        referencias,
      };

      if (editId) await adminInvestigaciones.update(editId, payload);
      else await adminInvestigaciones.create(payload);

      setForm(null);
      setEditId(null);
      setOk(editId ? 'Proyecto actualizado.' : 'Proyecto registrado.');
      await load();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    setError('');
    try {
      await adminInvestigaciones.remove(confirmDelete.id);
      setConfirmDelete(null);
      setOk('Proyecto eliminado.');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const join = async (p) => {
    setError('');
    setOk('');
    try {
      if (p.participando) {
        await adminInvestigaciones.salir(p.id);
        setOk('Ya no participas en este proyecto.');
      } else {
        await adminInvestigaciones.participar(p.id);
        setOk('Te asociaste correctamente al proyecto.');
      }
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const filtrados = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const texto = [
        p.titulo, p.resumen, p.area_nombre, p.tipo_nombre, p.estatus,
        ...(p.profesores || []).map((x) => x.nombre),
        ...(p.estudiantes || []).map((x) => x.nombre),
      ].join(' ').toLowerCase();
      return texto.includes(q);
    });
  }, [items, buscar]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  useEffect(() => { setPagina(1); }, [buscar]);
  useEffect(() => { if (pagina > totalPaginas) setPagina(totalPaginas); }, [pagina, totalPaginas]);
  const inicio = (pagina - 1) * PAGE_SIZE;
  const visibles = filtrados.slice(inicio, inicio + PAGE_SIZE);

  const input = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100';

  if (estado === 'cargando') return <AdminLoader texto="Cargando proyectos de la Red…" />;

  return <div>
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Catálogo</p>
        <h2 className="mt-1 font-display text-2xl font-700 text-ink">
          {isStudent ? 'Proyectos para participar' : isResearcher ? 'Mis proyectos de investigación' : 'Investigaciones'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isStudent
            ? 'Puedes asociarte a proyectos que tengan un profesor / investigador responsable.'
            : 'Proyectos con impactos, referencias, responsables y participantes de la Red.'}
        </p>
      </div>
      {canManage && !form && <button
        onClick={beginNew}
        className="btn-shine inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-600 text-white"
      >
        <Plus size={16}/>Agregar proyecto
      </button>}
    </div>

    {error && <p className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {ok && <p className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">{ok}</p>}

    {canManage && profesores.length === 0 && <div className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <AlertTriangle size={18} className="mt-0.5 shrink-0"/>
      <div>
        <b>No hay profesores / investigadores activos.</b>
        <p className="mt-1">Activa un usuario y asígnale el rol Investigador en Seguridad · Usuarios. Hasta entonces los estudiantes no podrán asociarse a un proyecto.</p>
      </div>
    </div>}

    {form ? <form onSubmit={save} className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-lg font-700 text-ink">{editId ? 'Editar proyecto' : 'Nuevo proyecto'}</h3>
        <button type="button" onClick={() => setForm(null)} className="grid h-9 w-9 place-items-center rounded-xl border border-line"><X size={17}/></button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Título" full><input className={input} value={form.titulo} onChange={(e)=>set('titulo', e.target.value)} required/></Field>
        <Field label="Resumen" full count={`${String(form.resumen || '').length}/1200`}><textarea rows="4" maxLength="1200" className={input} value={form.resumen} onChange={(e)=>set('resumen', e.target.value)} required/></Field>

        {[
          ['impacto_cientifico','Impacto científico'],
          ['impacto_social','Impacto social'],
          ['aportaciones_solucion','Aportaciones a la solución'],
          ['acceso_universal','Estrategias para el acceso universal al conocimiento'],
        ].map(([k,l]) => <Field key={k} label={l} count={`${String(form[k] || '').length}/600`}>
          <textarea rows="4" maxLength="600" className={input} value={form[k] || ''} onChange={(e)=>set(k, e.target.value)} required/>
        </Field>)}

        <Field label="Área de conocimiento">
          <select className={input} value={form.area_id || ''} onChange={(e)=>set('area_id', e.target.value)} required>
            <option value="">Seleccione…</option>
            {areas.map((a)=><option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </Field>

        <Field label="Tipo de investigación">
          <select className={input} value={form.tipo_investigacion_id || ''} onChange={(e)=>set('tipo_investigacion_id', e.target.value)} required>
            <option value="">Seleccione…</option>
            {tipos.map((t)=><option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </Field>

        <Field label="Estatus">
          <select className={input} value={form.estatus} onChange={(e)=>set('estatus', e.target.value)}>
            <option value="en_proceso">En proceso</option>
            <option value="terminado">Terminado</option>
          </select>
        </Field>

        {isAdmin ? <Field label="Profesor / investigador responsable">
          <select className={input} value={form.propietario_usuario_id || ''} onChange={(e)=>set('propietario_usuario_id', e.target.value)} required>
            <option value="">Seleccione…</option>
            {profesores.map((p)=><option key={p.id} value={p.id}>{p.nombre_completo}{p.institucion ? ` · ${p.institucion}` : ''}</option>)}
          </select>
        </Field> : <Field label="Profesor responsable">
          <div className="rounded-xl border border-line bg-soft px-3 py-2.5 text-sm font-600 text-ink">{session?.nombre_completo || 'Tu usuario'}</div>
        </Field>}

        {isAdmin && <Field label="Profesores asociados" full>
          <ChoiceGrid
            items={profesores}
            selected={form.profesor_ids || []}
            onChange={(ids)=>set('profesor_ids', ids)}
            empty="No hay investigadores activos para asociar."
            icon={Users}
          />
        </Field>}

        {isAdmin && <Field label="Estudiantes asociados" full>
          <ChoiceGrid
            items={estudiantes}
            selected={form.estudiante_ids || []}
            onChange={(ids)=>set('estudiante_ids', ids)}
            empty="No hay estudiantes activos para asociar."
            icon={GraduationCap}
          />
          <p className="mt-2 text-xs text-slate-400">El estudiante también puede asociarse por sí mismo desde su panel.</p>
        </Field>}

        <Field label="Referencias más relevantes" full count={`${String(form.referencias || '').split(/\n+/).filter(Boolean).length} referencia(s), mínimo 3`}>
          <textarea rows="5" className={input} value={form.referencias} onChange={(e)=>set('referencias', e.target.value)} placeholder="Una referencia por línea" required/>
        </Field>

        <label className="flex items-center gap-3 rounded-xl border border-line bg-soft px-4 py-3 text-sm font-600 text-slate-700">
          <input type="checkbox" checked={!!form.publicado} onChange={(e)=>set('publicado', e.target.checked)} className="accent-primary-500"/>
          Visible en la parte pública
        </label>
      </div>

      <div className="mt-6 flex gap-3">
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-600 text-white disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}Guardar
        </button>
        <button type="button" onClick={()=>setForm(null)} className="rounded-xl border border-line px-5 py-3 text-sm font-600">Cancelar</button>
      </div>
    </form> : <>
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 shadow-sm">
        <Search size={16} className="text-slate-400"/>
        <input value={buscar} onChange={(e)=>setBuscar(e.target.value)} className="w-full outline-none" placeholder="Buscar proyecto, área, profesor o estudiante…"/>
        <span className="rounded-full bg-soft px-2.5 py-1 text-xs text-slate-500">{filtrados.length}</span>
      </div>

      <div className="space-y-3">
        {visibles.length === 0 && <div className="rounded-2xl border border-line bg-white p-8 text-center text-sm text-slate-500">No hay proyectos para mostrar.</div>}
        {visibles.map((p, idx) => {
          const tieneProfesor = (p.profesores || []).length > 0;
          return <article key={p.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-400">{String(inicio + idx + 1).padStart(2,'0')}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-700 ${p.estatus === 'terminado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {p.estatus === 'terminado' ? 'Terminado' : 'En proceso'}
                  </span>
                  {!tieneProfesor && <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-700 text-red-700">Sin profesor responsable</span>}
                </div>
                <h3 className="mt-3 font-display text-lg font-700 text-ink">{p.titulo}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">{p.resumen}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-primary-50 px-2.5 py-1 text-primary-700">{p.area_nombre || p.area || 'Sin área'}</span>
                  <span className="rounded-full bg-soft px-2.5 py-1 text-slate-600">{p.tipo_nombre || p.tipo || 'Proyecto'}</span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <PeopleBlock title="Profesores / investigadores" icon={Users} people={p.profesores || []}/>
                  <PeopleBlock title="Estudiantes asociados" icon={GraduationCap} people={p.estudiantes || []}/>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {canManage && <button onClick={()=>beginEdit(p)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-line px-3 text-xs font-600 text-slate-600 hover:border-primary-300 hover:text-primary-600"><Pencil size={14}/>Editar</button>}
                {isAdmin && <button onClick={()=>setConfirmDelete(p)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-line px-3 text-xs font-600 text-slate-600 hover:border-red-200 hover:text-red-600"><Trash2 size={14}/>Eliminar</button>}
                {isStudent && <button
                  onClick={()=>join(p)}
                  disabled={!p.participando && !tieneProfesor}
                  className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-600 ${p.participando ? 'border border-slate-200 bg-white text-slate-600' : 'bg-primary-500 text-white'} disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                >
                  {p.participando ? <><UserMinus size={14}/>Dejar proyecto</> : <><UserPlus size={14}/>Asociarme</>}
                </button>}
              </div>
            </div>
          </article>;
        })}
      </div>

      {totalPaginas > 1 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3">
        <p className="text-xs text-slate-400">Página {pagina} de {totalPaginas} · {filtrados.length} proyecto(s)</p>
        <div className="flex flex-wrap gap-1">
          {Array.from({length: totalPaginas}, (_, i) => i + 1).map((n)=><button key={n} onClick={()=>setPagina(n)} className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-700 ${n === pagina ? 'border-primary-500 bg-primary-500 text-white' : 'border-line bg-white text-slate-500'}`}>{n}</button>)}
        </div>
      </div>}
    </>}

    <ConfirmModal
      open={!!confirmDelete}
      title="Eliminar proyecto"
      message={confirmDelete ? `¿Deseas eliminar “${confirmDelete.titulo}”? También se eliminarán sus asociaciones con profesores y estudiantes.` : ''}
      confirmText="Sí, eliminar"
      cancelText="Cancelar"
      tone="danger"
      loading={saving}
      onClose={()=>!saving && setConfirmDelete(null)}
      onConfirm={confirmarEliminar}
    />
  </div>;
}

function ChoiceGrid({ items, selected, onChange, empty, icon: Icon }) {
  const [q, setQ] = useState('');
  const ids = (selected || []).map(Number);
  const filtrados = items.filter((x)=>`${x.nombre_completo} ${x.institucion || ''} ${x.correo || ''}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="rounded-xl border border-line bg-soft p-3">
    <div className="mb-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2">
      <Search size={14} className="text-slate-400"/>
      <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Buscar…" className="w-full bg-transparent text-sm outline-none"/>
      <span className="text-[11px] text-slate-400">{ids.length} seleccionado(s)</span>
    </div>
    <div className="grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2">
      {filtrados.length === 0 && <p className="col-span-full p-2 text-sm text-slate-400">{empty}</p>}
      {filtrados.map((p)=>{
        const checked = ids.includes(Number(p.id));
        return <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e)=>onChange(e.target.checked ? [...new Set([...ids, Number(p.id)])] : ids.filter((x)=>x !== Number(p.id)))}
            className="accent-primary-500"
          />
          {Icon && <Icon size={14} className="shrink-0 text-primary-500"/>}
          <span className="min-w-0">
            <b className="block truncate font-600 text-ink">{p.nombre_completo}</b>
            <span className="block truncate text-[11px] text-slate-400">{p.institucion || p.correo || 'Sin institución'}</span>
          </span>
        </label>;
      })}
    </div>
  </div>;
}

function PeopleBlock({ title, icon: Icon, people }) {
  return <div className="rounded-xl bg-soft p-3">
    <div className="mb-2 flex items-center gap-2 text-xs font-700 uppercase tracking-wide text-slate-400"><Icon size={14}/>{title}</div>
    {people.length === 0
      ? <p className="text-xs text-slate-400">Ninguno.</p>
      : <div className="flex flex-wrap gap-1.5">{people.map((x)=><span key={x.usuario_id} className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600">{x.nombre}</span>)}</div>}
  </div>;
}

function Field({ label, count, full, children }) {
  return <div className={full ? 'md:col-span-2' : ''}>
    <div className="mb-1.5 flex items-center justify-between">
      <label className="font-mono text-xs uppercase tracking-wider text-slate-500">{label}</label>
      {count && <span className="text-[11px] text-slate-400">{count}</span>}
    </div>
    {children}
  </div>;
}
