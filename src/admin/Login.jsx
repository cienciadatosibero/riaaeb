// frontend/src/admin/Login.jsx
import { useState } from 'react';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { login as apiLogin, setToken } from '../lib/api.js';
import LogoMark from '../components/ui/LogoMark.jsx';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [estado, setEstado] = useState('idle');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setEstado('enviando'); setError('');
    try {
      const session = await apiLogin(usuario, password);
      setToken(session.token);
      onLogin(session);
    } catch (err) {
      setError(err.message); setEstado('idle');
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-base px-4">
      <div className="glow-bg pointer-events-none fixed inset-0 -z-10 opacity-60" />
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-glow">
        <div className="mb-6 flex items-center gap-2.5">
          <LogoMark />
          <span className="font-display text-lg font-700 tracking-[0.04em] text-ink">RIA<span className="text-primary-400">AEB</span></span>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-400">Acceso a la Red</p>
        <h1 className="mt-1 font-display text-2xl font-700 text-ink">Iniciar sesión</h1>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-400">Usuario</label>
            <input value={usuario} onChange={(e) => setUsuario(e.target.value)} required
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-400" />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-slate-400">Contraseña</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 pr-11 text-sm text-ink outline-none focus:border-primary-400" />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-soft hover:text-primary-500"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

        <button type="submit" disabled={estado === 'enviando'}
          className="btn-shine mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-400 px-6 py-3 text-sm font-600 text-white transition-all hover:-translate-y-0.5 disabled:opacity-60">
          {estado === 'enviando' ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          Entrar
        </button>
      </form>
    </div>
  );
}
