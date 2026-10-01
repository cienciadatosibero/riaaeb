import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, FlaskConical, BookOpen, Building2, Shapes, Tags, Newspaper, Info, ShieldCheck,
  Puzzle, KeyRound, UserCog, Users, LogOut, ExternalLink, Menu, X, ChevronDown, ChevronRight, UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoMark from '../components/ui/LogoMark.jsx';
import Portal from '../components/ui/Portal.jsx';
import ResourceManager from './ResourceManager.jsx';
import AboutEditor from './AboutEditor.jsx';
import NetworkDashboard from './NetworkDashboard.jsx';
import ProjectsManager from './ProjectsManager.jsx';
import ProfileEditor from './ProfileEditor.jsx';
import {
  adminNoticias, adminInstituciones, adminAreas, adminTiposInvestigacion, adminPublicaciones,
  seguridadModulos, seguridadPermisos, seguridadRoles, seguridadUsuarios,
  getAreasConocimiento, getInstituciones, getMe,
} from '../lib/api.js';

const gradoOptions=['Licenciatura','Especialidad','Maestría','Doctorado','Posdoctorado'].map((x)=>({value:x,label:x}));
const sniiOptions=['Sin nivel','Candidato','Nivel I','Nivel II','Nivel III','Emérito'].map((x)=>({value:x,label:x}));

export default function Dashboard({ session, onSessionChange, onLogout }) {
  const [tab,setTab]=useState('dashboard'); const [confirmar,setConfirmar]=useState(false); const [mobile,setMobile]=useState(false);
  const [secOpen,setSecOpen]=useState(true); const [catOpen,setCatOpen]=useState(true); const [contentOpen,setContentOpen]=useState(true);
  const [deps,setDeps]=useState({modules:[],permissions:[],roles:[],areas:[],instituciones:[]});
  const roles=session?.roles||[]; const admin=roles.includes('administrador'); const investigador=roles.includes('investigador'); const estudiante=roles.includes('estudiante');
  const can=(m,a='lectura')=>admin || (session?.permissions||[]).includes('*') || (session?.permissions||[]).includes(`${m}.${a}`);

  const loadDeps=async()=>{
    try {
      const [areas,instituciones]=await Promise.all([getAreasConocimiento(),getInstituciones()]);
      let modules=[],permissions=[],r=[];
      if(admin){ [modules,permissions,r]=await Promise.all([seguridadModulos.list(),seguridadPermisos.list(),seguridadRoles.list()]); }
      setDeps({areas:areas||[],instituciones:instituciones||[],modules:modules||[],permissions:permissions||[],roles:r||[]});
    } catch { /* cada módulo mostrará su propio error si falta algo */ }
  };
  useEffect(()=>{loadDeps();},[]); // eslint-disable-line

  const navMain=[{id:'dashboard',label:'Dashboard',icon:LayoutDashboard,show:can('dashboard')}];
  if(investigador||estudiante) navMain.push({id:'investigaciones',label:estudiante?'Proyectos para participar':'Mis proyectos',icon:FlaskConical,show:can('investigaciones')});
  if(investigador) navMain.push({id:'publicaciones',label:'Publicaciones de la Red',icon:BookOpen,show:can('publicaciones')},{id:'perfil',label:'Mi perfil',icon:UserRound,show:can('perfil')});

  const catalogs=[
    {id:'investigaciones',label:'Investigaciones',icon:FlaskConical,show:admin&&can('investigaciones')},
    {id:'instituciones',label:'Instituciones',icon:Building2,show:admin&&can('instituciones')},
    {id:'areas',label:'Áreas de conocimiento',icon:Shapes,show:admin&&can('areas_conocimiento')},
    {id:'tipos',label:'Tipos de investigaciones',icon:Tags,show:admin&&can('tipos_investigacion')},
  ];
  const content=[
    {id:'publicaciones',label:'Publicaciones de la Red',icon:BookOpen,show:admin&&can('publicaciones')},
    {id:'noticias',label:'Noticias',icon:Newspaper,show:admin&&can('noticias')},
    {id:'about',label:'Quiénes somos',icon:Info,show:admin&&can('about')},
  ];
  const security=[
    {id:'modulos',label:'Módulos',icon:Puzzle,show:admin&&can('seguridad_modulos')},
    {id:'permisos',label:'Permisos',icon:KeyRound,show:admin&&can('seguridad_permisos')},
    {id:'roles',label:'Roles',icon:UserCog,show:admin&&can('seguridad_roles')},
    {id:'usuarios',label:'Usuarios',icon:Users,show:admin&&can('seguridad_usuarios')},
  ];

  const publicationFields=[
    {name:'titulo',label:'Título',type:'text',required:true,full:true},
    {name:'resumen',label:'Resumen / descripción',type:'textarea',full:true,maxLength:1200},
    {name:'autores',label:'Autores',type:'text',required:true,full:true},
    {name:'tipo_producto',label:'Tipo de producto',type:'text',required:true,placeholder:'Artículo, capítulo, libro, software…'},
    {name:'anio',label:'Año',type:'number',defaultValue:new Date().getFullYear()},
    {name:'enlace',label:'Enlace de consulta',type:'url',full:true},
    {name:'publicado',label:'Visible en la parte pública',type:'checkbox',defaultValue:true},
  ];
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
    {name:'cvu_rizoma',label:'CVU Rizoma',type:'url'},
    {name:'activo',label:'Cuenta activa / aprobada',type:'checkbox',defaultValue:true,full:true},
  ],[deps]);

  const render=()=>{
    if(tab==='dashboard') return <NetworkDashboard session={session}/>;
    if(tab==='investigaciones') return <ProjectsManager session={session}/>;
    if(tab==='perfil') return <ProfileEditor onSaved={async()=>{try{onSessionChange(await getMe());}catch{}}}/>;
    if(tab==='publicaciones') return <ResourceManager titulo="Publicaciones de la Red" api={adminPublicaciones} label={(i)=>i.titulo} fields={publicationFields} subtitle={admin?'Administra todos los productos generados con miembros de la Red.':'Registra los productos académicos y tecnológicos generados con miembros de la Red.'}/>;
    if(tab==='instituciones') return <ResourceManager titulo="Instituciones" api={adminInstituciones} label={(i)=>i.nombre} fields={[
      {name:'nombre',label:'Nombre',type:'text',required:true,full:true},{name:'logo_url',label:'Logo',type:'file',full:true},{name:'enlace',label:'Enlace',type:'url'},{name:'orden',label:'Orden',type:'number'}]}/>;
    if(tab==='areas') return <ResourceManager titulo="Áreas de conocimiento" api={adminAreas} label={(i)=>i.nombre} fields={[{name:'nombre',label:'Nombre',type:'text',required:true},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]}/>;
    if(tab==='tipos') return <ResourceManager titulo="Tipos de investigaciones" api={adminTiposInvestigacion} label={(i)=>i.nombre} fields={[{name:'nombre',label:'Nombre',type:'text',required:true},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]}/>;
    if(tab==='noticias') return <ResourceManager titulo="Noticias" api={adminNoticias} label={(i)=>i.titulo} fields={[
      {name:'titulo',label:'Título',type:'text',required:true,full:true},{name:'extracto',label:'Extracto',type:'textarea',required:true,full:true},{name:'contenido',label:'Contenido',type:'textarea',required:true,full:true},{name:'categoria',label:'Categoría',type:'text'},{name:'fecha',label:'Fecha',type:'date',required:true},{name:'imagen_url',label:'Imagen',type:'file',full:true}]}/>;
    if(tab==='about') return <AboutEditor/>;
    if(tab==='modulos') return <ResourceManager titulo="Seguridad · Módulos" api={seguridadModulos} label={(i)=>i.nombre} fields={[{name:'clave',label:'Clave',type:'text',required:true},{name:'nombre',label:'Nombre',type:'text',required:true},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]} subtitle="Catálogo de todos los módulos que integran el sistema."/>;
    if(tab==='permisos') return <ResourceManager titulo="Seguridad · Permisos" api={seguridadPermisos} label={(i)=>`${i.modulo} · ${i.accion}`} fields={[
      {name:'modulo_id',label:'Módulo',type:'select',required:true,options:deps.modules.map((x)=>({value:x.id,label:x.nombre}))},{name:'accion',label:'Permiso',type:'select',required:true,options:['lectura','escritura','actualizar','eliminar'].map((x)=>({value:x,label:x[0].toUpperCase()+x.slice(1)}))},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]} subtitle="Permisos de lectura, escritura, actualización y eliminación asociados a cada módulo."/>;
    if(tab==='roles') return <ResourceManager titulo="Seguridad · Roles" api={seguridadRoles} label={(i)=>i.nombre} fields={[
      {name:'clave',label:'Clave',type:'text',required:true},{name:'nombre',label:'Nombre',type:'text',required:true},{name:'descripcion',label:'Descripción',type:'textarea',full:true},{name:'permiso_ids',label:'Permisos asociados',type:'multiselect',full:true,options:deps.permissions.map((x)=>({value:x.id,label:`${x.modulo} · ${x.accion}`}))},{name:'activo',label:'Activo',type:'checkbox',defaultValue:true}]} subtitle="Cada rol controla qué opciones y acciones puede visualizar y utilizar."/>;
    if(tab==='usuarios') return <ResourceManager titulo="Seguridad · Usuarios" api={seguridadUsuarios} label={(i)=>`${i.nombre_completo}${i.activo?'':' · PENDIENTE DE ACTIVACIÓN'}`} fields={userFields} subtitle="Activa registros públicos, asigna uno o más roles y administra el perfil de investigadores y estudiantes."/>;
    return null;
  };

  const NavButton=({item})=>item.show?<button onClick={()=>{setTab(item.id);setMobile(false);}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-600 transition ${tab===item.id?'bg-primary-500 text-white shadow-lg shadow-primary-950/10':'text-slate-300 hover:bg-white/10 hover:text-white'}`}><item.icon size={17}/><span className="min-w-0 flex-1 truncate">{item.label}</span>{tab===item.id&&<span className="h-1.5 w-1.5 rounded-full bg-white"/>}</button>:null;
  const Group=({title,items,open,setOpen})=>items.some((x)=>x.show)?<div className="mt-5"><button onClick={()=>setOpen(!open)} className="mb-1 flex w-full items-center justify-between px-3 text-[10px] font-700 uppercase tracking-[.18em] text-slate-500"><span>{title}</span>{open?<ChevronDown size={13}/>:<ChevronRight size={13}/>}</button>{open&&<div className="space-y-1">{items.map((i)=><NavButton key={i.id} item={i}/>)}</div>}</div>:null;
  const Sidebar=()=> <aside className="flex h-full w-[270px] flex-col bg-[#172033] p-4 text-white">
    <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-5"><LogoMark size={36}/><div><p className="font-display text-lg font-700 tracking-wide">RIA<span className="text-primary-400">AEB</span></p><p className="text-[10px] uppercase tracking-[.16em] text-slate-400">Gestión de la Red</p></div></div>
    <nav className="mt-5 flex-1 overflow-y-auto pr-1"><div className="space-y-1">{navMain.filter((x)=>x.show).map((i)=><NavButton key={i.id} item={i}/>)}</div>{admin&&<><Group title="Catálogos" items={catalogs} open={catOpen} setOpen={setCatOpen}/><Group title="Contenido" items={content} open={contentOpen} setOpen={setContentOpen}/><Group title="Seguridad" items={security} open={secOpen} setOpen={setSecOpen}/></>}</nav>
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
