import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Microscope,
  UserPlus,
  X,
} from 'lucide-react';
import Portal from './ui/Portal.jsx';
import FileField from '../admin/FileField.jsx';
import { getAreasConocimiento, getInstituciones, registrarInvestigador } from '../lib/api.js';

const init = {
  tipo_registro:'investigador',
  nombre_completo:'', correo_institucional:'', telefono:'', area_ids:[], institucion_id:'', semblanza:'',
  nivel_snii:'', grado_maximo:'', linea_investigacion:'', foto_url:'', logo_institucion_url:'', orcid:'', cvu_rizoma:'',
  usuario:'', password:'', confirmar:'',
};

const grados=['Licenciatura','Especialidad','Maestría','Doctorado','Posdoctorado'];
const niveles=['Sin nivel','Candidato','Nivel I','Nivel II','Nivel III','Emérito'];

export default function RegistroModal({ open, onClose }) {
  const [form,setForm]=useState(init);
  const [areas,setAreas]=useState([]);
  const [inst,setInst]=useState([]);
  const [estado,setEstado]=useState('idle');
  const [error,setError]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [showConfirm,setShowConfirm]=useState(false);

  useEffect(()=>{
    if(!open)return;
    Promise.all([getAreasConocimiento(),getInstituciones()])
      .then(([a,i])=>{setAreas(a||[]);setInst(i||[]);})
      .catch((e)=>setError(e.message));
  },[open]);

  useEffect(()=>{
    if(!open)return;
    const previo=document.body.style.overflow;
    document.body.style.overflow='hidden';
    return()=>{document.body.style.overflow=previo;};
  },[open]);

  if(!open)return null;

  const esInvestigador=form.tipo_registro==='investigador';
  const set=(k,v)=>setForm((f)=>({...f,[k]:v}));
  const cambiarTipo=(tipo)=>setForm((f)=>({
    ...f,
    tipo_registro:tipo,
    nivel_snii:tipo==='investigador'?f.nivel_snii:'',
    cvu_rizoma:tipo==='investigador'?f.cvu_rizoma:'',
  }));

  const submit=async(e)=>{
    e.preventDefault();
    setError('');

    if(form.password!==form.confirmar){setError('Las contraseñas no coinciden.');return;}
    if((form.area_ids||[]).length===0){setError('Selecciona al menos un área de conocimiento.');return;}
    if(esInvestigador && form.cvu_rizoma && !/^\d{7}$/.test(form.cvu_rizoma)){
      setError('El CVU Rizoma debe contener exactamente 7 dígitos.');
      return;
    }

    setEstado('sending');
    try{
      await registrarInvestigador({
        ...form,
        institucion_id:Number(form.institucion_id)||null,
        nivel_snii:esInvestigador?form.nivel_snii:null,
        cvu_rizoma:esInvestigador?(form.cvu_rizoma||null):null,
      });
      setEstado('done');
    }catch(e2){
      setError(e2.message);
      setEstado('idle');
    }
  };

  const input='w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100';

  return <Portal><div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6">
    <div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={onClose}/>
    <div className="animate-modal-in relative z-10 max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-lift">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-6 py-5 backdrop-blur">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[.2em] text-primary-500">Registro a la Red</p>
          <h2 className="font-display text-2xl font-700 text-ink">Quiero sumarme</h2>
        </div>
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-slate-500 hover:text-primary-600"><X size={19}/></button>
      </div>

      {estado==='done' ? (
        <div className="p-10 text-center">
          <CheckCircle2 size={54} className="mx-auto text-emerald-500"/>
          <h3 className="mt-4 font-display text-2xl font-700 text-ink">Registro recibido</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
            Tu solicitud como {esInvestigador?'Investigador':'Estudiante'} quedó en Usuarios por confirmar. El administrador revisará tus datos antes de habilitar el acceso.
          </p>
          <button onClick={()=>{setForm(init);setEstado('idle');onClose();}} className="mt-6 rounded-xl bg-primary-500 px-6 py-3 text-sm font-600 text-white">Cerrar</button>
        </div>
      ) : (
        <form onSubmit={submit} className="p-6 sm:p-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-slate-500">¿Cómo deseas registrarte?</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <TypeCard
                active={esInvestigador}
                icon={Microscope}
                title="Investigador / docente"
                text="Podrás registrar proyectos, publicaciones, CVU Rizoma y actualizar tu semblanza."
                onClick={()=>cambiarTipo('investigador')}
              />
              <TypeCard
                active={!esInvestigador}
                icon={GraduationCap}
                title="Estudiante"
                text="Podrás consultar proyectos y asociarte como participante a proyectos de investigadores."
                onClick={()=>cambiarTipo('estudiante')}
              />
            </div>
          </div>

          <div className="my-7 border-t border-line"/>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nombre completo"><input className={input} value={form.nombre_completo} onChange={(e)=>set('nombre_completo',e.target.value)} required/></Field>
            <Field label="Correo institucional"><input type="email" className={input} value={form.correo_institucional} onChange={(e)=>{set('correo_institucional',e.target.value);if(!form.usuario)set('usuario',e.target.value.toLowerCase());}} required/></Field>
            <Field label="Teléfono"><input className={input} value={form.telefono} onChange={(e)=>set('telefono',e.target.value)} required/></Field>
            <Field label="Institución de adscripción"><select className={input} value={form.institucion_id} onChange={(e)=>set('institucion_id',e.target.value)} required><option value="">Seleccione…</option>{inst.map((x)=><option key={x.id} value={x.id}>{x.nombre}</option>)}</select></Field>

            <Field label="Área de conocimiento (una o más)" full>
              <div className="grid max-h-40 gap-2 overflow-y-auto rounded-xl border border-line bg-soft p-3 sm:grid-cols-2">
                {areas.map((a)=>{
                  const checked=form.area_ids.map(Number).includes(Number(a.id));
                  return <label key={a.id} className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700">
                    <input type="checkbox" checked={checked} onChange={(e)=>set('area_ids',e.target.checked?[...form.area_ids,a.id]:form.area_ids.filter((x)=>Number(x)!==Number(a.id)))} className="accent-primary-500"/>
                    {a.nombre}
                  </label>;
                })}
              </div>
            </Field>

            <Field label="Semblanza" full count={`${form.semblanza.length}/600`}>
              <textarea rows="5" maxLength="600" className={input} value={form.semblanza} onChange={(e)=>set('semblanza',e.target.value)} required/>
            </Field>

            {esInvestigador && <Field label="Nivel del SNII">
              <select className={input} value={form.nivel_snii} onChange={(e)=>set('nivel_snii',e.target.value)}>
                <option value="">Seleccione…</option>{niveles.map((x)=><option key={x}>{x}</option>)}
              </select>
            </Field>}

            <Field label="Grado máximo de estudios">
              <select className={input} value={form.grado_maximo} onChange={(e)=>set('grado_maximo',e.target.value)} required>
                <option value="">Seleccione…</option>{grados.map((x)=><option key={x}>{x}</option>)}
              </select>
            </Field>

            <Field label="Línea de investigación" full><input className={input} value={form.linea_investigacion} onChange={(e)=>set('linea_investigacion',e.target.value)} required/></Field>
            <FileField publicUpload label="Foto" value={form.foto_url} onChange={(v)=>set('foto_url',v)}/>
            <FileField publicUpload label="Logo de institución (opcional)" value={form.logo_institucion_url} onChange={(v)=>set('logo_institucion_url',v)}/>
            <Field label="ORCID"><input type="url" className={input} placeholder="https://orcid.org/..." value={form.orcid} onChange={(e)=>set('orcid',e.target.value)}/></Field>

            {esInvestigador && <Field label="CVU Rizoma (opcional)">
              <input type="text" inputMode="numeric" pattern="[0-9]{7}" maxLength="7" className={input} placeholder="1234567" value={form.cvu_rizoma} onChange={(e)=>set('cvu_rizoma',e.target.value.replace(/\D/g,'').slice(0,7))}/>
              <p className="mt-1 text-[11px] text-slate-400">Identificador de exactamente 7 dígitos.</p>
            </Field>}
          </div>

          <div className="my-7 border-t border-line"/>
          <h3 className="font-display text-lg font-700 text-ink">Datos de acceso</h3>
          <p className="mt-1 text-sm text-slate-500">Podrás iniciar sesión cuando el administrador apruebe tu solicitud.</p>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Usuario"><input className={input} value={form.usuario} onChange={(e)=>set('usuario',e.target.value)} required/></Field>
            <Field label="Contraseña">
              <PasswordInput input={input} value={form.password} show={showPassword} setShow={setShowPassword} onChange={(v)=>set('password',v)}/>
            </Field>
            <Field label="Confirmar contraseña">
              <PasswordInput input={input} value={form.confirmar} show={showConfirm} setShow={setShowConfirm} onChange={(v)=>set('confirmar',v)}/>
            </Field>
          </div>

          {error&&<p className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          <div className="mt-6 flex justify-end">
            <button disabled={estado==='sending'} className="btn-shine inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-600 text-white disabled:opacity-60">
              {estado==='sending'?<Loader2 size={16} className="animate-spin"/>:<UserPlus size={16}/>}Enviar solicitud
            </button>
          </div>
        </form>
      )}
    </div>
  </div></Portal>;
}

function TypeCard({ active, icon: Icon, title, text, onClick }) {
  return <button type="button" onClick={onClick} className={`rounded-2xl border p-4 text-left transition ${active?'border-primary-400 bg-primary-50 shadow-sm':'border-line bg-white hover:border-primary-200'}`}>
    <span className={`grid h-10 w-10 place-items-center rounded-xl ${active?'bg-primary-500 text-white':'bg-soft text-slate-500'}`}><Icon size={18}/></span>
    <b className="mt-3 block font-display text-base text-ink">{title}</b>
    <span className="mt-1 block text-xs leading-relaxed text-slate-500">{text}</span>
  </button>;
}

function PasswordInput({ input, value, show, setShow, onChange }) {
  return <div className="relative">
    <input type={show?'text':'password'} minLength="8" className={`${input} pr-11`} value={value} onChange={(e)=>onChange(e.target.value)} required/>
    <button type="button" onClick={()=>setShow((v)=>!v)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-soft hover:text-primary-600" aria-label={show?'Ocultar contraseña':'Mostrar contraseña'}>
      {show?<EyeOff size={17}/>:<Eye size={17}/>} 
    </button>
  </div>;
}

function Field({label,count,full,children}){
  return <div className={full?'md:col-span-2':''}>
    <div className="mb-1.5 flex items-center justify-between">
      <label className="font-mono text-xs uppercase tracking-wider text-slate-500">{label}</label>
      {count&&<span className="text-[11px] text-slate-400">{count}</span>}
    </div>
    {children}
  </div>;
}
