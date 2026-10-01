import { useEffect, useState } from 'react';
import { clearToken, getMe, isLogged } from '../lib/api.js';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import AdminLoader from './AdminLoader.jsx';

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [estado, setEstado] = useState(isLogged() ? 'cargando' : 'login');

  useEffect(() => {
    if (!isLogged()) return;
    getMe()
      .then((s) => { setSession(s); setEstado('listo'); })
      .catch(() => { clearToken(); setEstado('login'); });
  }, []);

  const salir = () => { clearToken(); setSession(null); setEstado('login'); };
  if (estado === 'cargando') return <div className="admin-shell grid min-h-screen place-items-center"><AdminLoader texto="Cargando tu espacio…" /></div>;
  if (estado === 'login') return <div className="admin-shell"><Login onLogin={(s) => { setSession(s); setEstado('listo'); }} /></div>;
  return <div className="admin-shell"><Dashboard session={session} onSessionChange={setSession} onLogout={salir} /></div>;
}
