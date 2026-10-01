// frontend/src/components/Header.jsx
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import LogoMark from './ui/LogoMark.jsx';
import IberoLogo from './ui/IberoLogo.jsx';
import RegistroModal from './RegistroModal.jsx';

const NAV = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Investigaciones', href: '#investigaciones' },
  { label: 'Publicaciones', href: '#publicaciones' },
  { label: 'Noticias', href: '#noticias' },
  { label: 'Investigadores', href: '#investigadores' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#inicio');
  const [registro, setRegistro] = useState(false);
  const { pathname } = useLocation();
  const enHome = pathname === '/';
  // En otras páginas, los anclas apuntan al home ("/#seccion").
  const hrefDe = (h) => (enHome ? h : `/${h}`);
  const hrefInicio = enHome ? '#inicio' : '/#inicio';

  useEffect(() => {
    if (!enHome) return;
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
      const secciones = NAV.map((n) => document.querySelector(n.href)).filter(Boolean);
      const pos = window.scrollY + 120;
      let current = '#inicio';
      for (const sec of secciones) if (sec.offsetTop <= pos) current = `#${sec.id}`;
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [enHome]);

  // Fuera del home, el header siempre va con fondo blanco (sólido).
  const solido = scrolled || !enHome;

  return (
    <>
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${solido ? 'border-b border-line bg-white/90 shadow-sm backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href={hrefInicio} className="group flex items-center gap-3">
          {/* Logo Universidad Iberoamericana CDMX (rojo, sobre fondo claro) */}
          <IberoLogo tono="rojo" />
          <span className="h-8 w-px bg-line" />
          {/* Logo propio del sitio */}
          <span className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-display text-lg font-700 leading-none tracking-[0.04em] text-ink">
              RIA<span className="text-primary-500">AEB</span>
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={hrefDe(item.href)}
              className={`relative text-sm font-500 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:bg-primary-400 after:transition-all after:duration-300 ${active === item.href ? 'text-primary-600 after:w-full' : 'text-slate-500 after:w-0 hover:text-ink hover:after:w-full'}`}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href="/admin" className="rounded-xl border border-line bg-white/80 px-4 py-2.5 text-sm font-600 text-slate-600 transition hover:border-primary-200 hover:text-primary-600">Acceso</a>
          <button
            onClick={() => setRegistro(true)}
            className="btn-shine rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 px-5 py-2.5 text-sm font-600 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(225,29,58,.4)]"
          >Registro</button>
        </div>

        <button className="grid h-10 w-10 place-items-center rounded-lg text-ink lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Abrir menú">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className={`overflow-hidden border-t border-line bg-white/95 backdrop-blur-md transition-all duration-300 lg:hidden ${open ? 'max-h-96' : 'max-h-0'}`}>
        <nav className="flex flex-col gap-1 px-6 py-4">
          {NAV.map((item) => (
            <a key={item.href} href={hrefDe(item.href)} onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-500 text-slate-600 hover:bg-primary-50 hover:text-primary-600">
              {item.label}
            </a>
          ))}
          <a href="/admin" onClick={() => setOpen(false)} className="mt-2 rounded-lg border border-line px-3 py-2.5 text-sm font-600 text-slate-600">Acceso</a>
          <button onClick={() => { setOpen(false); setRegistro(true); }}
            className="rounded-lg bg-primary-500 px-3 py-2.5 text-left text-sm font-600 text-white">Registro</button>
        </nav>
      </div>
    </header>
    <RegistroModal open={registro} onClose={() => setRegistro(false)} />
    </>
  );
}
