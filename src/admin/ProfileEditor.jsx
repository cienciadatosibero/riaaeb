import { useEffect, useMemo, useState } from 'react';
import { Save, Loader2, UserRound, ShieldCheck } from 'lucide-react';
import {
  getMiPerfil,
  updateMiPerfil,
  getAreasConocimiento,
  getInstituciones,
} from '../lib/api.js';
import AdminLoader from './AdminLoader.jsx';
import FileField from './FileField.jsx';

const grados = ['Licenciatura','Especialidad','Maestría','Doctorado','Posdoctorado'];
const niveles = ['Sin nivel','Candidato','Nivel I','Nivel II','Nivel III','Emérito'];

function normalizarPerfil(p) {
  return {
    nombre: p?.nombre || '',
    correo_institucional: p?.correo_institucional || '',
    telefono: p?.telefono || '',
    area_ids: Array.isArray(p?.area_ids) ? p.area_ids.map(Number) : [],
    institucion_id: p?.institucion_id ? Number(p.institucion_id) : '',
    semblanza: p?.bio || '',
    nivel_snii: p?.nivel_snii || '',
    grado_maximo: p?.grado_maximo || '',
    linea_investigacion: p?.linea_investigacion || '',
    foto_url: p?.foto_url || '',
    logo_institucion_url: p?.logo_institucion_url || p?.logo_catalogo || '',
    orcid: p?.orcid || '',
    cvu_rizoma: p?.cvu_rizoma || '',
  };
}

export default function ProfileEditor({ session, canEdit = false, onSaved }) {
  const [perfil,setPerfil] = useState(null);
  const [form,setForm] = useState(normalizarPerfil(null));
  const [areas,setAreas] = useState([]);
  const [instituciones,setInstituciones] = useState([]);
  const [estado,setEstado] = useState('cargando');
  const [msg,setMsg] = useState('');
  const [error,setError] = useState('');

  const roles = (session?.roles || []).map((x)=>String(x).trim().toLowerCase());
  const esInvestigador = roles.includes('investigador') || perfil?.tipo_perfil === 'investigador';
  const esEstudiante = roles.includes('estudiante') || perfil?.tipo_perfil === 'estudiante';

  useEffect(()=>{
    let activo = true;
    Promise.all([getMiPerfil(), getAreasConocimiento(), getInstituciones()])
      .then(([p,a,i])=>{
        if(!activo) return;
        setPerfil(p);
        setForm(normalizarPerfil(p));
        setAreas(a || []);
        setInstituciones(i || []);
        setEstado('listo');
      })
      .catch((e)=>{
        if(!activo) return;
        setError(e.message);
        setEstado('error');
      });
    return ()=>{activo=false;};
  },[]);

  const set = (k,v)=>setForm((f)=>({...f,[k]:v}));

  const institucionNombre = useMemo(()=>{
    const x = instituciones.find((i)=>Number(i.id)===Number(form.institucion_id));
    return x?.nombre || perfil?.institucion_catalogo || perfil?.institucion || 'Sin institución';
  },[instituciones,form.institucion_id,perfil]);

  const guardar = async(e)=>{
    e.preventDefault();
    if(!canEdit) return;
    setError('');
    setMsg('');

    if(!form.nombre.trim()){
      setError('El nombre completo es obligatorio.');
      return;
    }
    if(!form.correo_institucional.trim()){
      setError('El correo institucional es obligatorio.');
      return;
    }
    if((form.area_ids || []).length === 0){
      setError('Selecciona al menos un área de conocimiento.');
      return;
    }
    if(form.semblanza.length > 600){
      setError('La semblanza no puede exceder 600 caracteres.');
      return;
    }
    if(esInvestigador && form.cvu_rizoma && !/^\d{7}$/.test(form.cvu_rizoma)){
      setError('El CVU Rizoma debe contener exactamente 7 dígitos.');
      return;
    }

    setEstado('guardando');
    try{
      const p = await updateMiPerfil({
        ...form,
        institucion_id: Number(form.institucion_id) || null,
        area_ids: (form.area_ids || []).map(Number),
        cvu_rizoma: esInvestigador ? form.cvu_rizoma : null,
        nivel_snii: esInvestigador ? form.nivel_snii : null,
      });
      setPerfil(p);
      setForm(normalizarPerfil(p));
      setMsg('Perfil actualizado correctamente.');
      onSaved?.();
    }catch(e2){
      setError(e2.message);
    }finally{
      setEstado('listo');
    }
  };

  if(estado==='cargando') return <AdminLoader texto="Cargando tu perfil…"/>;

  if(!perfil) return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <h2 className="font-display text-xl font-700 text-amber-900">Perfil no vinculado</h2>
      <p className="mt-2 text-sm text-amber-800">
        Tu usuario existe, pero todavía no tiene un perfil de investigador o estudiante asociado.
        El administrador debe vincularlo desde Seguridad · Usuarios.
      </p>
    </div>
  );

  const input = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-400 disabled:bg-slate-50 disabled:text-slate-500';
  const disabled = !canEdit || estado==='guardando';

  return <div className="max-w-5xl">
    <div className="mb-6">
      <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">
        {esEstudiante ? 'Estudiante' : 'Profesor / Investigador'}
      </p>
      <h2 className="mt-1 font-display text-2xl font-700 text-ink">Mi perfil</h2>
      <p className="mt-1 text-sm text-slate-500">
        {canEdit
          ? 'Consulta y actualiza la información de tu perfil.'
          : 'Consulta la información de tu perfil. Tu rol no tiene permiso de actualización.'}
      </p>
    </div>

    {error && <p className="mb-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {msg && <p className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">{msg}</p>}

    <form onSubmit={guardar} className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center">
        {form.foto_url ? (
          <img src={form.foto_url} alt="" className="h-24 w-24 rounded-2xl border border-line bg-white object-cover"/>
        ) : (
          <span className="grid h-24 w-24 place-items-center rounded-2xl bg-primary-50 text-primary-500">
            <UserRound size={34}/>
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-display text-xl font-700 text-ink">{form.nombre || 'Mi perfil'}</h3>
          <p className="text-sm text-slate-500">{institucionNombre}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-600 text-primary-600">
            <ShieldCheck size={13}/>
            {esEstudiante ? 'Estudiante' : 'Profesor / Investigador'}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Nombre completo">
          <input className={input} value={form.nombre} onChange={(e)=>set('nombre',e.target.value)} disabled={disabled}/>
        </Field>

        <Field label="Correo institucional">
          <input type="email" className={input} value={form.correo_institucional} onChange={(e)=>set('correo_institucional',e.target.value)} disabled={disabled}/>
        </Field>

        <Field label="Teléfono">
          <input className={input} value={form.telefono} onChange={(e)=>set('telefono',e.target.value)} disabled={disabled}/>
        </Field>

        <Field label="Institución de adscripción">
          <select className={input} value={form.institucion_id} onChange={(e)=>set('institucion_id',e.target.value)} disabled={disabled}>
            <option value="">Seleccione…</option>
            {instituciones.map((x)=><option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        </Field>

        <Field label="Áreas de conocimiento" full>
          <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-line bg-soft p-3 sm:grid-cols-2">
            {areas.map((a)=>{
              const checked=(form.area_ids||[]).map(Number).includes(Number(a.id));
              return <label key={a.id} className={`flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ${disabled?'cursor-default text-slate-500':'cursor-pointer text-slate-700'}`}>
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={checked}
                  onChange={(e)=>set('area_ids',e.target.checked
                    ? [...form.area_ids,Number(a.id)]
                    : form.area_ids.filter((x)=>Number(x)!==Number(a.id))
                  )}
                  className="accent-primary-500"
                />
                {a.nombre}
              </label>;
            })}
          </div>
        </Field>

        <Field label="Semblanza" full count={`${form.semblanza.length}/600`}>
          <textarea rows="6" maxLength="600" className={input} value={form.semblanza} onChange={(e)=>set('semblanza',e.target.value)} disabled={disabled}/>
        </Field>

        {esInvestigador && <Field label="Nivel del SNII">
          <select className={input} value={form.nivel_snii} onChange={(e)=>set('nivel_snii',e.target.value)} disabled={disabled}>
            <option value="">Seleccione…</option>
            {niveles.map((x)=><option key={x}>{x}</option>)}
          </select>
        </Field>}

        <Field label="Grado máximo de estudios">
          <select className={input} value={form.grado_maximo} onChange={(e)=>set('grado_maximo',e.target.value)} disabled={disabled}>
            <option value="">Seleccione…</option>
            {grados.map((x)=><option key={x}>{x}</option>)}
          </select>
        </Field>

        <Field label="Línea de investigación" full>
          <input className={input} value={form.linea_investigacion} onChange={(e)=>set('linea_investigacion',e.target.value)} disabled={disabled}/>
        </Field>

        {canEdit ? (
          <FileField label="Foto" value={form.foto_url} onChange={(v)=>set('foto_url',v)}/>
        ) : (
          <Field label="Foto"><ReadOnlyText value={form.foto_url ? 'Imagen registrada' : 'Sin imagen'}/></Field>
        )}

        {canEdit ? (
          <FileField label="Logo de institución" value={form.logo_institucion_url} onChange={(v)=>set('logo_institucion_url',v)}/>
        ) : (
          <Field label="Logo de institución"><ReadOnlyText value={form.logo_institucion_url ? 'Logo registrado' : 'Sin logo'}/></Field>
        )}

        <Field label="ORCID">
          <input type="url" className={input} placeholder="https://orcid.org/0000-0000-0000-0000" value={form.orcid} onChange={(e)=>set('orcid',e.target.value)} disabled={disabled}/>
        </Field>

        {esInvestigador && <Field label="CVU Rizoma">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{7}"
            maxLength="7"
            className={input}
            placeholder="1234567"
            value={form.cvu_rizoma}
            onChange={(e)=>set('cvu_rizoma',e.target.value.replace(/\D/g,'').slice(0,7))}
            disabled={disabled}
          />
          <p className="mt-1 text-[11px] text-slate-400">Identificador de 7 dígitos.</p>
        </Field>}
      </div>

      {canEdit && <div className="mt-6 flex justify-end">
        <button disabled={estado==='guardando'} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-600 text-white disabled:opacity-60">
          {estado==='guardando'?<Loader2 size={16} className="animate-spin"/>:<Save size={16}/>}
          Guardar cambios
        </button>
      </div>}
    </form>
  </div>;
}

function Field({label,count,full,children}){
  return <div className={full?'md:col-span-2':''}>
    <div className="mb-1.5 flex items-center justify-between">
      <label className="font-mono text-xs uppercase tracking-wider text-slate-500">{label}</label>
      {count && <span className="text-[11px] text-slate-400">{count}</span>}
    </div>
    {children}
  </div>;
}

function ReadOnlyText({value}){
  return <div className="rounded-xl border border-line bg-slate-50 px-3 py-2.5 text-sm text-slate-500">{value}</div>;
}
