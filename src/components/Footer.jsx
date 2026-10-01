import { useEffect, useState } from 'react';
import { Twitter, Linkedin, Github, Send, FileText, Users, Handshake, Database } from 'lucide-react';
import LogoMark from './ui/LogoMark.jsx';
import { useContactModal } from '../context/ContactModalContext.jsx';
import { getPortada } from '../lib/api.js';

const NAV=[{label:'Inicio',href:'#inicio'},{label:'Nosotros',href:'#nosotros'},{label:'Investigaciones',href:'#investigaciones'},{label:'Publicaciones',href:'#publicaciones'},{label:'Investigadores',href:'#investigadores'}];
const RECURSOS=[{label:'Investigaciones',href:'#investigaciones'},{label:'Publicaciones de la Red',href:'#publicaciones'},{label:'Noticias',href:'#noticias'},{label:'Convocatorias',href:'#noticias'}];
const D={
  footer_descripcion:'Red de Inteligencia Artificial Aplicada para la Equidad y el Bienestar. Avance tecnológico con impacto social, datos abiertos y métodos reproducibles.',
  footer_boletin_texto:'Recibe nuestras publicaciones más recientes.',
  twitter_url:'',linkedin_url:'',github_url:'',
  cifra1_valor:'30+',cifra1_label:'Investigaciones',
  cifra2_valor:'15',cifra2_label:'Investigadores',
  cifra3_valor:'12',cifra3_label:'Alianzas',
  cifra4_valor:'8',cifra4_label:'Datos abiertos',
};

export default function Footer(){
  const [correo,setCorreo]=useState(''); const [suscrito,setSuscrito]=useState(false); const [c,setC]=useState(D); const {open}=useContactModal();
  useEffect(()=>{getPortada().then((d)=>d&&setC({...D,...d})).catch(()=>{});},[]);
  const onSubscribe=(e)=>{e.preventDefault();if(correo.includes('@')){setSuscrito(true);setCorreo('');}};
  const CIFRAS=[
    {icon:FileText,valor:c.cifra1_valor,label:c.cifra1_label},
    {icon:Users,valor:c.cifra2_valor,label:c.cifra2_label},
    {icon:Handshake,valor:c.cifra3_valor,label:c.cifra3_label},
    {icon:Database,valor:c.cifra4_valor,label:c.cifra4_label},
  ];
  const socials=[{Icon:Twitter,url:c.twitter_url,label:'X / Twitter'},{Icon:Linkedin,url:c.linkedin_url,label:'LinkedIn'},{Icon:Github,url:c.github_url,label:'GitHub'}].filter((x)=>x.url);

  return <footer className="border-t border-line bg-soft">
    <div className="border-b border-line"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-12 lg:grid-cols-4">{CIFRAS.map((x,i)=><div key={`${x.label}-${i}`} className="group flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-500 transition-all duration-300 group-hover:bg-primary-500 group-hover:text-white group-hover:shadow-[0_0_18px_rgba(225,29,58,.4)]"><x.icon size={18}/></span><div><p className="font-display text-2xl font-700 text-ink">{x.valor}</p><p className="text-xs text-slate-500">{x.label}</p></div></div>)}</div></div>
    <div className="mx-auto max-w-7xl px-6 py-16"><div className="grid gap-10 lg:grid-cols-4">
      <div><div className="mb-4 flex items-center gap-2.5"><LogoMark size={34}/><span className="font-display text-lg font-700 tracking-[0.04em] text-ink">RIA<span className="text-primary-500">AEB</span></span></div><p className="text-sm leading-relaxed text-slate-500">{c.footer_descripcion}</p>{socials.length>0&&<div className="mt-5 flex gap-3">{socials.map(({Icon,url,label})=><a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-slate-500 transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:text-primary-600"><Icon size={16}/></a>)}</div>}</div>
      <div><h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-ink">Navegación</h4><ul className="space-y-2.5 text-sm">{NAV.map((l)=><li key={l.label}><a href={l.href} className="text-slate-500 transition-colors hover:text-primary-600">{l.label}</a></li>)}</ul></div>
      <div><h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-ink">Recursos</h4><ul className="space-y-2.5 text-sm">{RECURSOS.map((l)=><li key={l.label}><a href={l.href} className="text-slate-500 transition-colors hover:text-primary-600">{l.label}</a></li>)}</ul><button onClick={open} className="mt-4 text-sm font-600 text-primary-600 hover:text-primary-500">Contáctanos →</button></div>
      <div><h4 className="mb-4 font-mono text-xs uppercase tracking-widest text-ink">Boletín</h4><p className="mb-3 text-sm text-slate-500">{c.footer_boletin_texto}</p>{suscrito?<p className="rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">¡Gracias por suscribirte!</p>:<form onSubmit={onSubscribe} className="flex gap-2"><input type="email" value={correo} onChange={(e)=>setCorreo(e.target.value)} placeholder="tu@correo.com" className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-slate-400 focus:border-primary-400"/><button type="submit" aria-label="Suscribirse" className="grid h-[42px] w-11 shrink-0 place-items-center rounded-lg bg-primary-500 text-white transition-colors hover:bg-primary-400"><Send size={15}/></button></form>}</div>
    </div><div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-7 text-xs text-slate-400 sm:flex-row"><p>© {new Date().getFullYear()} RIAAEB — Red de IA Aplicada para la Equidad y el Bienestar.</p><div className="flex gap-6"><a href="#" className="hover:text-primary-600">Aviso de privacidad</a><a href="#" className="hover:text-primary-600">Términos y condiciones</a></div></div></div>
  </footer>;
}
