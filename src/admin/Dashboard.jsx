import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, FlaskConical, BookOpen, Building2, Shapes, Tags, Newspaper, Info, ShieldCheck,
  Puzzle, KeyRound, UserCog, Users, LogOut, ExternalLink, Menu, X, ChevronDown, ChevronRight, UserRound,
  ContactRound, Home, UserSearch,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoMark from '../components/ui/LogoMark.jsx';
import Portal from '../components/ui/Portal.jsx';
import ResourceManager from './ResourceManager.jsx';
import AboutEditor from './AboutEditor.jsx';
import NetworkDashboard from './NetworkDashboard.jsx';
import ProjectsManager from './ProjectsManager.jsx';
import ProfileEditor from './ProfileEditor.jsx';
import PortadaEditor from './PortadaEditor.jsx';
import ContactMessages from './ContactMessages.jsx';
import {
  adminNoticias, adminInstituciones, adminAreas, adminTiposInvestigacion, adminAreasInvestigacion, adminPublicaciones, adminInvestigadores,
  seguridadModulos, seguridadPermisos, seguridadRoles, seguridadUsuarios,
  getAreasConocimiento, getInstituciones, getMe,
} from '../lib/api.js';

const gradoOptions=['Licenciatura','Especialidad','Maestría','Doctorado','Posdoctorado'].map((x)=>({value:x,label:x}));
const sniiOptions=['Sin nivel','Candidato','Nivel I','Nivel II','Nivel III','Emérito'].map((x)=>({value:x,label:x}));

export default function Dashboard({ session, onSessionChange, onRefreshSession, onLogout }) {
  const [tab,setTab]=useState('dashboard'); const [confirmar,setConfirmar]=useState(false); const [mobile,setMobile]=useState(false);
  const [secOpen,setSecOpen]=useState(true); const [catOpen,setCatOpen]=useState(true); const [contentOpen,setContentOpen]=useState(true);
  const [deps,setDeps]=useState({modules:[],permissions:[],roles:[],areas:[],instituciones:[]});
  const norm=(v)=>String(v ?? '').trim().toLowerCase();
  const roles=(session?.roles||[]).map(norm);
  const permisos=(session?.permissions||[]).map(norm);
  const admin=roles.includes('administrador');
  const investigador=roles.includes('investigador');
  const estudiante=roles.includes('estudiante');
  const can=(m,a='lectura')=>admin || permisos.includes('*') || permisos.includes(`${norm(m)}.${norm(a)}`);

  const loadDeps=async()=>{
    try {
      const [areas,instituciones]=await Promise.all([getAreasConocimiento(),getInstituciones()]);
      let modules=[],permissions=[],r=[];
      if(admin){ [modules,permissions,r]=await Promise.all([seguridadModulos.list(),seguridadPermisos.list(),seguridadRoles.list()]); }
      setDeps({areas:areas||[],instituciones:instituciones||[],modules:modules||[],permissions:permissions||[],roles:r||[]});
    } catch { /* cada módulo mostrará su propio error si falta algo */ }
  };
  useEffect(()=>{loadDeps();},[]); // eslint-disable-line

  // La visibilidad del panel depende de los permisos efectivos.
  // El rol solo cambia etiquetas/contexto; ya no bloquea módulos que sí fueron autorizados.
  const navMain=[
    {id:'dashboard',label:'Dashboard',icon:LayoutDashboard,show:can('dashboard','lectura')},
    {id:'investigaciones',label:estudiante?'Proyectos para participar':investigador?'Mis proyectos':'Investigaciones',icon:FlaskConical,show:can('investigaciones','lectura')},
    {id:'publicaciones',label:'Publicaciones de la Red',icon:BookOpen,show:can('publicaciones','lectura')},
    {id:'perfil',label:'Mi perfil',icon:UserRound,show:can('perfil','lectura')},
  ];

  const catalogs=[
    {id:'instituciones',label:'Instituciones',icon:Building2,show:can('instituciones','lectura')},
    {id:'areas',label:'Áreas de conocimiento',icon:Shapes,show:can('areas_conocimiento','lectura')},
    {id:'areasInvestigacion',label:'Áreas de investigación',icon:Shapes,show:can('areas_investigacion','lectura')},
    {id:'tipos',label:'Tipos de investigaciones',icon:Tags,show:can('tipos_investigacion','lectura')},
  ];
  const content=[
    {id:'portada',label:'Portada',icon:Home,show:can('portada','lectura')},
    {id:'personas',label:'Personas de la Red',icon:UserSearch,show:can('investigadores','lectura')},
    {id:'noticias',label:'Noticias',icon:Newspaper,show:can('noticias','lectura')},
    {id:'about',label:'Quiénes somos',icon:Info,show:can('about','lectura')},
    {id:'mensajes',label:'Mensajes de contacto',icon:ContactRound,show:can('mensajes_contacto','lectura')},
  ];
  const security=[
    {id:'modulos',label:'Módulos',icon:Puzzle,show:can('seguridad_modulos','lectura')},
    {id:'permisos',label:'Permisos',icon:KeyRound,show:can('seguridad_permisos','lectura')},
    {id:'roles',label:'Roles',icon:UserCog,show:can('seguridad_roles','lectura')},
    {id:'usuarios',label:'Usuarios',icon:Users,show:can('seguridad_usuarios','lectura')},
  ];

  const opcionesVisibles = [
    ...navMain,
    ...catalogs,
    ...content,
    ...security,
  ].filter((x) => x.show);

  useEffect(() => {
    const actualVisible = opcionesVisibles.some((x) => x.id === tab);
    if (!actualVisible && opcionesVisibles.length) {
      setTab(opcionesVisibles[0].id);
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const publicationFields=[
    {name:'titulo',label:'Título',type:'text',required:true,full:true},
    {name:'resumen',label:'Resumen / descripción',type:'textarea',full:true,maxLength:1200},
    {name:'autores',label:'Autores',type:'text',required:true,full:true},
    {name:'tipo_producto',label:'Tipo de producto',type:'text',required:true,placeholder:'Artículo, capítulo, libro, software…'},
    {name:'anio',label:'Año',type:'number',defaultValue:new Date().getFullYear()},
    {name:'enlace',label:'Enlace de consulta',type:'url',full:true},
    {name:'publicado',label:'Visible en la parte pública',type:'checkbox',defaultValue:true},
  ];
  const personFields=useMemo(()=>[
    {name:'nombre',label:'Nombre completo',type:'text',required:true,full:true},
    {name:'rol',label:'Cargo / rol público',type:'text',defaultValue:'Profesor / Investigador'},
    {name:'correo_institucional',label:'Correo institucional',type:'email'},
    {name:'telefono',label:'Teléfono',type:'text'},
    {name:'area_ids',label:'Áreas de conocimiento (una o más)',type:'multiselect',full:true,options:deps.areas.map((x)=>({value:x.id,label:x.nombre}))},
    {name:'institucion_id',label:'Institución de adscripción',type:'select',options:deps.instituciones.map((x)=>({value:x.id,label:x.nombre}))},
    {name:'bio',label:'Semblanza',type:'textarea',maxLength:600,full:true},
    {name:'nivel_snii',label:'Nivel del SNII',type:'select',options:sniiOptions},
    {name:'grado_maximo',label:'Grado máximo de estudios',type:'select',options:gradoOptions},
    {name:'linea_investigacion',label:'Línea de investigación',type:'text',full:true},
    {name:'foto_url',label:'Foto',type:'file'},
    {name:'logo_institucion_url',label:'Logo institución (opcional)',type:'file'},
    {name:'orcid',label:'ORCID',type:'url'},
    {name:'cvu_rizoma',label:'CVU Rizoma',type:'text',maxLength:7,digitsOnly:true,pattern:'[0-9]{7}',inputMode:'numeric',help:'Identificador de 7 dígitos. No es una URL.'},
    {name:'orden',label:'Orden en la portada',type:'number',defaultValue:0},
    {name:'activo',label:'Visible en la parte pública',type:'checkbox',defaultValue:true,full:true},
  ],[deps.areas,deps.instituciones]);

  const userFields=useMemo(()=>[
    {name:'nombre_completo',label:'Nombre completo',type:'text',required:true,full:true},
    {name:'correo',label:'Correo institucional',type:'email',required:true},
    {name:'telefono',label:'Teléfono',type:'text'},
    {name:'usuario',label:'Usuario',type:'text',required:true},
    {name:'password',label:'Contraseña',type:'password',help:'Mínimo 8 caracteres. Al editar, déjala vacía para conservar la actual.'},
    {name:'role_ids',label:'Roles',type:'multiselect',full:true,options:deps.roles.map((x)=>({value:x.id,label:x.nombre}))},
    {name:'area_ids',label:'Áreas de conocimiento (una o más)',type:'multiselect',full:true,options:deps.areas.map((x)=>({value:x.id,label:x.nombre}))},
    {name:'institucion_id',label:'Institución de adscripción',type:'select',options:deps.instituciones.map((x)=>({value:x.id,label:x.nombre}))},
    {name:'grado_maximo',label:'Grado máximo de estudios',type:'select',options:gradoOptions},
    {name:'nivel_snii',label:'Nivel del SNII',type:'select',options:sniiOptions},
    {name:'linea_investigacion',label:'Línea de investigación',type:'text',full:true},
    {name:'semblanza',label:'Semblanza',type:'textarea',maxLength:600,full:true},
    {name:'foto_url',label:'Foto',type:'file'},
    {name:'logo_institucion_url',label:'Logo institución (opcional)',type:'file'},
    {name:'orcid',label:'ORCID',type:'url'},
    {name:'cvu_rizoma',label:'CVU Rizoma',type:'text',maxLength:7,digitsOnly:true,pattern:'[0-9]{7}',inputMode:'numeric',help:'Identificador de 7 dígitos. No es una URL.'},
    {name:'activo',label:'Cuenta activa / aprobada',type:'checkbox',defaultValue:true,full:true},
  ],[deps]);

  const render=()=>{
    if (!admin && opcionesVisibles.length === 0) {
      return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-display text-xl font-700 text-amber-900">Permisos todavía no disponibles</h2>
        <p className="mt-2 text-sm text-amber-800">
          Tu rol está asignado, pero esta sesión aún no está recibiendo permisos activos desde la base.
        </p>
        <button
          type="button"
          onClick={()=>onRefreshSession?.()}
          className="mt-4 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-600 text-white hover:bg-primary-600"
        >
          Actualizar permisos
        </button>
      </div>;
    }
    if(tab==='dashboard') return <NetworkDashboard session={session}/>;
    if(tab==='investigaciones') return <ProjectsManager session={session}/>;
    if(tab==='perfil') return <ProfileEditor session={session} canEdit={can('perfil','actualizar')} onSaved={async()=>{try{onSessionChange(await getMe());}catch{}}}/>;
    if(tab==='portada') return <PortadaEditor canEdit={can('portada','actualizar')}/>;
    if(tab==='personas') return <ResourceManager titulo="Personas de la Red" api={adminInvestigadores} label={(i)=>i.nombre} fields={personFields} canCreate={can('investigadores','escritura')} canEdit={can('investigadores','actualizar')} canDelete={can('investigadores','eliminar')} subtitle="Administra las personas que aparecen en la sección pública ‘Las personas detrás de la Red’."/>;
    if(tab==='publicaciones') return <ResourceManager titulo="Publicaciones de la Red" api={adminPublicaciones} label={(i)=>i.titulo} fields={publicationFields} canCreate={can('publicaciones','escritura')} canEdit={can('publicaciones','actualizar')} canDelete={can('publicaciones','eliminar')} subtitle={admin?'Administra todos los productos generados con miembros de la Red.':'Registra los productos académicos y tecnológicos generados con miembros de la Red.'}/>;
    if(tab==='instituciones') return <ResourceManager titulo="Instituciones" api={adminInstituciones} label={(i)=>i.nombre} canCreate={can('instituciones','escritura')} canEdit={can('instituciones','actualizar')} canDelete={can('instituciones','eliminar')} fields={[
      {name:'nombre',label:'Nombre',type:'text',required:true,full:true},{name:'logo_url',label:'Logo',type:'file',full:true},{name:'enlace',label:'Enlace',type:'url'},{name:'orden',label:'Orden',type:'number'}]}/>;
    if(tab==='areas') return <ResourceManager titulo="Áreas de conocimiento" api={adminAreas} label={(i)=>i.nombre} canCreate={can('areas_conocimiento','escritura')} canEdit={can('areas_conocimiento','actualizar')} canDelete={can('areas_conocimiento','eliminar')} fields={[{name:'nombre',label:'Nombre',type:'text',required:true},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]}/>;
    if(tab==='areasInvestigacion') return <ResourceManager titulo="Áreas de investigación" api={adminAreasInvestigacion} label={(i)=>i.nombre} canCreate={can('areas_investigacion','escritura')} canEdit={can('areas_investigacion','actualizar')} canDelete={can('areas_investigacion','eliminar')} fields={[{name:'nombre',label:'Nombre',type:'text',required:true},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]} subtitle="Catálogo de áreas temáticas de investigación que también se muestran en la portada."/>;
    if(tab==='tipos') return <ResourceManager titulo="Tipos de investigaciones" api={adminTiposInvestigacion} label={(i)=>i.nombre} canCreate={can('tipos_investigacion','escritura')} canEdit={can('tipos_investigacion','actualizar')} canDelete={can('tipos_investigacion','eliminar')} fields={[{name:'nombre',label:'Nombre',type:'text',required:true},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]}/>;
    if(tab==='noticias') return <ResourceManager titulo="Noticias" api={adminNoticias} label={(i)=>i.titulo} canCreate={can('noticias','escritura')} canEdit={can('noticias','actualizar')} canDelete={can('noticias','eliminar')} fields={[
      {name:'titulo',label:'Título',type:'text',required:true,full:true},{name:'extracto',label:'Extracto',type:'textarea',required:true,full:true},{name:'contenido',label:'Contenido',type:'textarea',required:true,full:true},{name:'categoria',label:'Categoría',type:'text'},{name:'fecha',label:'Fecha',type:'date',required:true},{name:'imagen_url',label:'Imagen',type:'file',full:true}]}/>;
    if(tab==='about') return <AboutEditor canEdit={can('about','actualizar')}/>;
    if(tab==='mensajes') return <ContactMessages canUpdate={can('mensajes_contacto','actualizar')} canDelete={can('mensajes_contacto','eliminar')}/>;
    if(tab==='modulos') return <ResourceManager titulo="Seguridad · Módulos" api={seguridadModulos} label={(i)=>i.nombre} canCreate={can('seguridad_modulos','escritura')} canEdit={can('seguridad_modulos','actualizar')} canDelete={can('seguridad_modulos','eliminar')} fields={[{name:'clave',label:'Clave',type:'text',required:true},{name:'nombre',label:'Nombre',type:'text',required:true},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]} subtitle="Catálogo de todos los módulos que integran el sistema."/>;
    if(tab==='permisos') return <ResourceManager titulo="Seguridad · Permisos" api={seguridadPermisos} label={(i)=>`${i.modulo} · ${i.accion}`} canCreate={can('seguridad_permisos','escritura')} canEdit={can('seguridad_permisos','actualizar')} canDelete={can('seguridad_permisos','eliminar')} fields={[
      {name:'modulo_id',label:'Módulo',type:'select',required:true,options:deps.modules.map((x)=>({value:x.id,label:x.nombre}))},{name:'accion',label:'Permiso',type:'select',required:true,options:['lectura','escritura','actualizar','eliminar'].map((x)=>({value:x,label:x[0].toUpperCase()+x.slice(1)}))},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]} subtitle="Permisos de lectura, escritura, actualización y eliminación asociados a cada módulo."/>;
    if(tab==='roles') return <ResourceManager titulo="Seguridad · Roles" api={seguridadRoles} label={(i)=>i.nombre} canCreate={can('seguridad_roles','escritura')} canEdit={can('seguridad_roles','actualizar')} canDelete={can('seguridad_roles','eliminar')} fields={[
      {name:'clave',label:'Clave',type:'text',required:true},{name:'nombre',label:'Nombre',type:'text',required:true},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'permiso_ids',label:'Permisos asociados',type:'duallist',full:true,options:deps.permissions.map((x)=>({value:x.id,label:`${x.modulo} · ${x.accion}`}))},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]} subtitle="Cada rol controla qué opciones y acciones puede visualizar y utilizar."/>;
    if(tab==='usuarios') return <ResourceManager titulo="Seguridad · Usuarios" api={seguridadUsuarios} label={(i)=>`${i.nombre_completo}${i.activo?'':' · PENDIENTE DE ACTIVACIÓN'}`} fields={userFields} canCreate={can('seguridad_usuarios','escritura')} canEdit={can('seguridad_usuarios','actualizar')} canDelete={can('seguridad_usuarios','eliminar')} subtitle="Activa registros públicos, asigna uno o más roles y administra el perfil de investigadores y estudiantes."/>;
    return null;
  };

  const NavButton=({item})=>item.show?<button onClick={()=>{setTab(item.id);setMobile(false);}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-600 transition ${tab===item.id?'bg-primary-500 text-white shadow-lg shadow-primary-950/10':'text-slate-300 hover:bg-white/10 hover:text-white'}`}><item.icon size={17}/><span className="min-w-0 flex-1 truncate">{item.label}</span>{tab===item.id&&<span className="h-1.5 w-1.5 rounded-full bg-white"/>}</button>:null;
  const Group=({title,items,open,setOpen})=>items.some((x)=>x.show)?<div className="mt-5"><button onClick={()=>setOpen(!open)} className="mb-1 flex w-full items-center justify-between px-3 text-[10px] font-700 uppercase tracking-[.18em] text-slate-500"><span>{title}</span>{open?<ChevronDown size={13}/>:<ChevronRight size={13}/>}</button>{open&&<div className="space-y-1">{items.map((i)=><NavButton key={i.id} item={i}/>)}</div>}</div>:null;
  const Sidebar=()=> <aside className="flex h-full w-[270px] flex-col bg-[#172033] p-4 text-white">
    <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-5"><LogoMark size={36}/><div><p className="font-display text-lg font-700 tracking-wide">RIA<span className="text-primary-400">AEB</span></p><p className="text-[10px] uppercase tracking-[.16em] text-slate-400">Gestión de la Red</p></div></div>
    <nav className="mt-5 flex-1 overflow-y-auto pr-1"><div className="space-y-1">{navMain.filter((x)=>x.show).map((i)=><NavButton key={i.id} item={i}/>)}</div><Group title="Catálogos" items={catalogs} open={catOpen} setOpen={setCatOpen}/><Group title="Contenido" items={content} open={contentOpen} setOpen={setContentOpen}/><Group title="Seguridad" items={security} open={secOpen} setOpen={setSecOpen}/></nav>
    <div className="space-y-1 border-t border-white/10 pt-4"><Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/10 hover:text-white"><ExternalLink size={16}/>Ver sitio público</Link><button onClick={()=>setConfirmar(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-red-500/15 hover:text-red-300"><LogOut size={16}/>Cerrar sesión</button></div>
  </aside>;

  return <div className="min-h-screen bg-[#f5f7fb] text-slate-700">
    <div className="fixed inset-y-0 left-0 z-40 hidden lg:block"><Sidebar/></div>
    {mobile&&<div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-ink/50" onClick={()=>setMobile(false)}/><div className="relative h-full"><Sidebar/></div></div>}
    <div className="lg:pl-[270px]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur sm:px-7"><button onClick={()=>setMobile(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-line lg:hidden"><Menu size={19}/></button><div className="hidden sm:block"><p className="text-xs text-slate-400">Red de IA aplicada para la equidad y el bienestar</p></div><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary-50 text-primary-600"><ShieldCheck size={17}/></span><div className="hidden text-right sm:block"><p className="text-sm font-700 text-ink">{session?.nombre_completo||session?.usuario}</p><p className="text-[11px] text-slate-400">{admin?'Administrador':investigador?'Profesor / Investigador':'Estudiante'}</p></div></div></header>
      <main className="mx-auto max-w-[1600px] p-4 sm:p-7 lg:p-8">{render()}</main>
    </div>

    {confirmar&&<Portal><div className="fixed inset-0 z-[160] flex items-center justify-center p-4"><div className="absolute inset-0 bg-ink/55 backdrop-blur-sm" onClick={()=>setConfirmar(false)}/><div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift"><div className="flex items-center justify-between"><h3 className="font-display text-lg font-700 text-ink">Cerrar sesión</h3><button onClick={()=>setConfirmar(false)} className="grid h-8 w-8 place-items-center rounded-lg border border-line"><X size={16}/></button></div><p className="mt-3 text-sm text-slate-500">¿Seguro que deseas cerrar la sesión?</p><div className="mt-6 flex justify-end gap-3"><button onClick={()=>setConfirmar(false)} className="rounded-xl border border-line px-4 py-2.5 text-sm font-600">Cancelar</button><button onClick={onLogout} className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-600 text-white">Sí, cerrar sesión</button></div></div></div></Portal>}
  </div>;
}
