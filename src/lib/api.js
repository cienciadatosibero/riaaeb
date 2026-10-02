const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'riaaeb_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLogged = () => !!getToken();

async function request(path, { auth = false, ...options } = {}) {
  const headers = { 'Content-Type':'application/json', ...(options.headers || {}) };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401) clearToken();
  if (!res.ok || json.success === false) throw new Error(json.message || 'Error de comunicación con el servidor.');
  return json.data;
}

// Público
export const getInvestigadores = () => request('/investigadores');
export const getInvestigaciones = () => request('/investigaciones');
export const getPublicaciones = () => request('/publicaciones');
export const getNoticias = () => request('/noticias');
export const getInstituciones = () => request('/instituciones');
export const getAreasConocimiento = () => request('/areas-conocimiento');
export const getTiposInvestigacion = () => request('/tipos-investigacion');
export const getAreasInvestigacion = () => request('/areas-investigacion');
export const getAbout = () => request('/about');
export const getPortada = () => request('/portada');
export const enviarContacto = (payload) => request('/contacto', { method:'POST', body:JSON.stringify(payload) });
export const registrarInvestigador = (payload) => request('/registro', { method:'POST', body:JSON.stringify(payload) });

// Auth / sesión
export const login = (usuario,password) => request('/auth/login', { method:'POST', body:JSON.stringify({ usuario,password }) });
export const getMe = () => request('/auth/me', { auth:true });
export const getDashboard = () => request('/dashboard', { auth:true });
export const getMiPerfil = () => request('/perfil/me', { auth:true });
export const updateMiPerfil = (d) => request('/perfil/me', { method:'PUT', auth:true, body:JSON.stringify(d) });

const crud = (base, listPath='') => ({
  list: () => request(`/${base}${listPath}`, { auth:!!listPath }),
  create: (d) => request(`/${base}`, { method:'POST', auth:true, body:JSON.stringify(d) }),
  update: (id,d) => request(`/${base}/${id}`, { method:'PUT', auth:true, body:JSON.stringify(d) }),
  remove: (id) => request(`/${base}/${id}`, { method:'DELETE', auth:true }),
});

// Admin / rol
export const adminInvestigaciones = {
  list: () => request('/investigaciones/admin', { auth:true }),
  create: (d) => request('/investigaciones', { method:'POST', auth:true, body:JSON.stringify(d) }),
  update: (id,d) => request(`/investigaciones/${id}`, { method:'PUT', auth:true, body:JSON.stringify(d) }),
  remove: (id) => request(`/investigaciones/${id}`, { method:'DELETE', auth:true }),
  participar: (id) => request(`/investigaciones/${id}/participar`, { method:'POST', auth:true }),
  salir: (id) => request(`/investigaciones/${id}/participar`, { method:'DELETE', auth:true }),
};
export const adminPublicaciones = {
  list: () => request('/publicaciones/admin', { auth:true }),
  create: (d) => request('/publicaciones', { method:'POST', auth:true, body:JSON.stringify(d) }),
  update: (id,d) => request(`/publicaciones/${id}`, { method:'PUT', auth:true, body:JSON.stringify(d) }),
  remove: (id) => request(`/publicaciones/${id}`, { method:'DELETE', auth:true }),
};
export const adminNoticias = crud('noticias');
export const adminInvestigadores = {
  list: () => request('/investigadores/admin', { auth:true }),
  create: (d) => request('/investigadores', { method:'POST', auth:true, body:JSON.stringify(d) }),
  update: (id,d) => request(`/investigadores/${id}`, { method:'PUT', auth:true, body:JSON.stringify(d) }),
  remove: (id) => request(`/investigadores/${id}`, { method:'DELETE', auth:true }),
};
export const adminInstituciones = crud('instituciones');
export const adminAreas = crud('areas-conocimiento','/admin');
export const adminTiposInvestigacion = crud('tipos-investigacion','/admin');
export const adminAreasInvestigacion = crud('areas-investigacion','/admin');
export const saveAbout = (d) => request('/about', { method:'PUT', auth:true, body:JSON.stringify(d) });
export const savePortada = (d) => request('/portada', { method:'PUT', auth:true, body:JSON.stringify(d) });
export const getMensajesContacto = () => request('/contacto/admin', { auth:true });
export const marcarMensajeContacto = (id,leido=true) => request(`/contacto/${id}/leido`, { method:'PUT', auth:true, body:JSON.stringify({leido}) });
export const eliminarMensajeContacto = (id) => request(`/contacto/${id}`, { method:'DELETE', auth:true });
export const guardarRespuestaContacto = (id,respuesta) => request(`/contacto/${id}/respuesta`, { method:'PUT', auth:true, body:JSON.stringify({respuesta}) });
export const marcarRespondidoContacto = (id,respuesta) => request(`/contacto/${id}/respondido`, { method:'PUT', auth:true, body:JSON.stringify({respuesta}) });

// Seguridad
export const seguridadModulos = crud('seguridad/modulos','');
export const seguridadPermisos = crud('seguridad/permisos','');
export const seguridadRoles = crud('seguridad/roles','');
export const seguridadUsuarios = crud('seguridad/usuarios','');
// Las listas de seguridad también necesitan token.
seguridadModulos.list = () => request('/seguridad/modulos', { auth:true });
seguridadPermisos.list = () => request('/seguridad/permisos', { auth:true });
seguridadRoles.list = () => request('/seguridad/roles', { auth:true });
seguridadUsuarios.list = () => request('/seguridad/usuarios', { auth:true });

async function uploadTo(path,file,auth) {
  const fd = new FormData();
  fd.append('archivo',file);
  const headers = {};
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${API_URL}${path}`, { method:'POST', headers, body:fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.message || 'No se pudo subir el archivo.');
  return json.data;
}
export const subirArchivo = (file) => uploadTo('/upload',file,true);
export const subirArchivoPublico = (file) => uploadTo('/upload/publico',file,false);
