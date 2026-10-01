import { useCallback, useEffect, useState } from 'react';
import { clearToken, getMe, isLogged } from '../lib/api.js';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import AdminLoader from './AdminLoader.jsx';

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [estado, setEstado] = useState(isLogged() ? 'cargando' : 'login');

  const sincronizarSesion = useCallback(async ({ silencioso = true } = {}) => {
    if (!isLogged()) return null;

    try {
      const actual = await getMe();
      setSession(actual);
      setEstado('listo');
      return actual;
    } catch (err) {
      if (!silencioso) {
        clearToken();
        setSession(null);
        setEstado('login');
      }
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isLogged()) return;

    sincronizarSesion({ silencioso: false });

    // Si un administrador cambia permisos mientras este usuario tiene la
    // sesión abierta, el menú se actualiza automáticamente.
    const onFocus = () => sincronizarSesion();
    const onVisible = () => {
      if (document.visibilityState === 'visible') sincronizarSesion();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(() => sincronizarSesion(), 15000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [sincronizarSesion]);

  const salir = () => {
    clearToken();
    setSession(null);
    setEstado('login');
  };

  if (estado === 'cargando') {
    return (
      <div className="admin-shell grid min-h-screen place-items-center">
        <AdminLoader texto="Cargando tu espacio…" />
      </div>
    );
  }

  if (estado === 'login') {
    return (
      <div className="admin-shell">
        <Login
          onLogin={async (s) => {
            // El login ya trae permisos, pero inmediatamente pedimos /auth/me
            // para usar siempre la matriz vigente de TiDB.
            setSession(s);
            setEstado('listo');
            await sincronizarSesion();
          }}
        />
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <Dashboard
        session={session}
        onSessionChange={setSession}
        onRefreshSession={() => sincronizarSesion()}
        onLogout={salir}
      />
    </div>
  );
}
