import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Save, Search, Eye, EyeOff } from 'lucide-react';
import FileField from './FileField.jsx';
import AdminLoader from './AdminLoader.jsx';


function Miniatura({ src, id }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 font-mono text-xs font-700 text-primary-600">
        #{id}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="h-12 w-12 shrink-0 rounded-xl border border-line bg-white object-contain"
      onError={() => setError(true)}
    />
  );
}

function vacio(fields) {
  const o = {};
  fields.forEach((f) => {
    if (f.type === 'multiselect') o[f.name] = [];
    else if (f.type === 'checkbox') o[f.name] = f.defaultValue ?? true;
    else o[f.name] = f.defaultValue ?? '';
  });
  return o;
}

export default function ResourceManager({ titulo, api, fields, label, subtitle, canCreate=true, canEdit=true, canDelete=true }) {
  const [items, setItems] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [buscar, setBuscar] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});

  const cargar = () => {
    setEstado('cargando');
    api.list().then((d) => { setItems(d || []); setEstado('listo'); })
      .catch((e) => { setError(e.message); setEstado('error'); });
  };
  useEffect(cargar, [api]); // eslint-disable-line react-hooks/exhaustive-deps

  const nuevo = () => { setForm(vacio(fields)); setEditId(null); setError(''); setVisiblePasswords({}); };
  const editar = (item) => {
    const f = {};
    fields.forEach((fl) => {
      const v = item[fl.name];
      f[fl.name] = fl.type === 'multiselect' ? (Array.isArray(v) ? v : []) : fl.type === 'checkbox' ? !!v : (v ?? '');
    });
    setForm(f); setEditId(item.id); setError(''); setVisiblePasswords({});
  };
  const cancelar = () => { setForm(null); setEditId(null); setError(''); setVisiblePasswords({}); };
  const set = (name,val) => setForm((p)=>({ ...p, [name]:val }));

  const guardar = async (e) => {
    e.preventDefault(); setGuardando(true); setError('');
    try {
      const payload = { ...form };
      fields.forEach((f) => {
        if (f.type === 'number') payload[f.name] = payload[f.name] === '' ? null : Number(payload[f.name]);
        if (f.type === 'multiselect') payload[f.name] = (payload[f.name] || []).map((v)=>Number(v)).filter(Boolean);
        if (f.type === 'checkbox') payload[f.name] = !!payload[f.name];
      });
      if (editId) await api.update(editId,payload); else await api.create(payload);
      cancelar(); cargar();
    } catch (err) { setError(err.message); } finally { setGuardando(false); }
  };

  const borrar = async (id) => {
    if (!window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;
    try { await api.remove(id); cargar(); } catch (err) { setError(err.message); }
  };

  const filtrados = items.filter((item) => {
    const q = buscar.trim().toLowerCase();
    return !q || JSON.stringify(item).toLowerCase().includes(q);
  });

  const inputClass = 'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100';

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[.18em] text-primary-500">Gestión de la Red</p>
          <h2 className="mt-1 font-display text-2xl font-700 text-ink">{titulo}</h2>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-slate-500">{subtitle}</p>}
        </div>
        {!form && canCreate && (
          <button onClick={nuevo} className="btn-shine inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-600 text-white shadow-sm hover:bg-primary-600">
            <Plus size={16}/> Nuevo
          </button>
        )}
      </div>

      {error && <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {form ? (
        <form onSubmit={guardar} className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-lg font-700 text-ink">{editId ? 'Editar registro' : 'Nuevo registro'}</h3>
            <button type="button" onClick={cancelar} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500 hover:text-primary-600"><X size={17}/></button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {fields.filter((f)=>f.type!=='hidden').map((f) => (
              <div key={f.name} className={f.full ? 'md:col-span-2' : ''}>
                {f.type === 'file' ? (
                  <FileField label={f.label} value={form[f.name]} onChange={(v)=>set(f.name,v)} />
                ) : f.type === 'textarea' ? (
                  <>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <label className="font-mono text-xs uppercase tracking-wider text-slate-500">{f.label}</label>
                      {f.maxLength && <span className="text-[11px] text-slate-400">{String(form[f.name]||'').length}/{f.maxLength}</span>}
                    </div>
                    <textarea rows={f.rows || 4} value={form[f.name]} required={f.required} maxLength={f.maxLength}
                      onChange={(e)=>set(f.name,e.target.value)} className={`${inputClass} resize-y`} placeholder={f.placeholder || ''}/>
                  </>
                ) : f.type === 'select' ? (
                  <>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-500">{f.label}</label>
                    <select value={form[f.name] ?? ''} required={f.required} onChange={(e)=>set(f.name,e.target.value)} className={inputClass}>
                      <option value="">{f.placeholder || 'Seleccione una opción'}</option>
                      {(f.options || []).map((op)=><option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                  </>
                ) : f.type === 'multiselect' ? (
                  <>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-500">{f.label}</label>
                    <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-line bg-soft p-2.5">
                      {(f.options || []).map((op) => {
                        const checked = (form[f.name] || []).map(Number).includes(Number(op.value));
                        return <label key={op.value} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-white">
                          <input type="checkbox" checked={checked} onChange={(e)=>{
                            const arr=(form[f.name]||[]).map(Number);
                            set(f.name,e.target.checked ? [...new Set([...arr,Number(op.value)])] : arr.filter((x)=>x!==Number(op.value)));
                          }} className="accent-primary-500"/>
                          {op.label}
                        </label>;
                      })}
                    </div>
                  </>
                ) : f.type === 'checkbox' ? (
                  <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-soft px-4 py-3 text-sm font-600 text-slate-700">
                    <input type="checkbox" checked={!!form[f.name]} onChange={(e)=>set(f.name,e.target.checked)} className="h-4 w-4 accent-primary-500"/>
                    {f.label}
                  </label>
                ) : f.type === 'password' ? (
                  <>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-500">{f.label}</label>
                    <div className="relative">
                      <input
                        type={visiblePasswords[f.name] ? 'text' : 'password'}
                        value={form[f.name] ?? ''}
                        required={f.required && !editId}
                        maxLength={f.maxLength}
                        minLength={f.minLength}
                        placeholder={f.placeholder || ''}
                        onChange={(e)=>set(f.name,e.target.value)}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={()=>setVisiblePasswords((p)=>({ ...p, [f.name]: !p[f.name] }))}
                        className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-soft hover:text-primary-600"
                        aria-label={visiblePasswords[f.name] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        title={visiblePasswords[f.name] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {visiblePasswords[f.name] ? <EyeOff size={17}/> : <Eye size={17}/>}
                      </button>
                    </div>
                    {f.help && <p className="mt-1 text-[11px] text-slate-400">{f.help}</p>}
                  </>
                ) : (
                  <>
                    <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-500">{f.label}</label>
                    <input type={['number','date','email','url'].includes(f.type) ? f.type : 'text'} value={form[f.name] ?? ''}
                      required={f.required} maxLength={f.maxLength} minLength={f.minLength}
                      pattern={f.pattern} inputMode={f.inputMode} placeholder={f.placeholder || ''}
                      onChange={(e)=>set(f.name,f.digitsOnly ? e.target.value.replace(/\D/g,'').slice(0,f.maxLength || 100) : e.target.value)} className={inputClass}/>
                    {f.help && <p className="mt-1 text-[11px] text-slate-400">{f.help}</p>}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={guardando} className="btn-shine inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-600 text-white hover:bg-primary-600 disabled:opacity-60">
              {guardando ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Guardar
            </button>
            <button type="button" onClick={cancelar} className="rounded-xl border border-line px-5 py-3 text-sm font-600 text-slate-600 hover:bg-soft">Cancelar</button>
          </div>
        </form>
      ) : estado === 'cargando' ? <AdminLoader texto={`Cargando ${titulo.toLowerCase()}…`} /> : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <Search size={16} className="text-slate-400"/>
            <input value={buscar} onChange={(e)=>setBuscar(e.target.value)} placeholder="Buscar…" className="w-full bg-transparent text-sm text-ink outline-none"/>
            <span className="rounded-full bg-soft px-2.5 py-1 text-xs text-slate-500">{filtrados.length}</span>
          </div>
          {filtrados.length === 0 && <p className="p-6 text-sm text-slate-500">Sin registros.</p>}
          {filtrados.map((item)=>(
            <div key={item.id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0 hover:bg-soft/60">
              <Miniatura src={item.foto_url || item.imagen_url || item.logo_url} id={item.id} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-600 text-ink">{label(item)}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{item.descripcion || item.roles?.join?.(', ') || item.rol || item.autores || item.clave || item.categoria || item.enlace || ''}</p>
              </div>
              {canEdit && <button onClick={()=>editar(item)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500 hover:border-primary-300 hover:text-primary-600"><Pencil size={15}/></button>}
              {canDelete && <button onClick={()=>borrar(item.id)} className="grid h-9 w-9 place-items-center rounded-xl border border-line text-slate-500 hover:border-red-200 hover:text-red-600"><Trash2 size={15}/></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
