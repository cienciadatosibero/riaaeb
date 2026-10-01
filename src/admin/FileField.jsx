// frontend/src/admin/FileField.jsx
import { useState } from 'react';
import { Upload, Loader2, Link2 } from 'lucide-react';
import { subirArchivo, subirArchivoPublico } from '../lib/api.js';

/* Convierte cualquier imagen a WebP en el navegador antes de subirla.
   Si el navegador no soporta WebP (muy raro) o falla, devuelve el archivo original. */
async function aWebp(file, calidad = 0.9, maxLado = 2000) {
  if (!file.type.startsWith('image/')) return file;
  // No reconvertir si ya es webp
  if (file.type === 'image/webp') return file;
  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    // Limitar dimensiones máximas conservando proporción
    if (Math.max(width, height) > maxLado) {
      const r = maxLado / Math.max(width, height);
      width = Math.round(width * r);
      height = Math.round(height * r);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', calidad));
    if (!blob) return file;
    const nombre = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], nombre, { type: 'image/webp' });
  } catch {
    return file; // fallback al original
  }
}

export default function FileField({ label, value, onChange, publicUpload = false }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [modoUrl, setModoUrl] = useState(false);

  const onFile = async (e) => {
    const original = e.target.files?.[0];
    if (!original) return;
    setSubiendo(true); setError('');
    try {
      const file = await aWebp(original);
      const { url } = await (publicUpload ? subirArchivoPublico(file) : subirArchivo(file));
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="font-mono text-xs uppercase tracking-wider text-slate-400">{label}</label>
        <button type="button" onClick={() => setModoUrl((v) => !v)}
          className="inline-flex items-center gap-1 text-[11px] text-primary-400 hover:text-primary-300">
          <Link2 size={11} /> {modoUrl ? 'Subir archivo' : 'Pegar URL'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        {value && (
          <img src={value} alt="vista previa"
            className="h-14 w-14 shrink-0 rounded-lg border border-line bg-white object-contain" />
        )}
        <div className="flex-1">
          {modoUrl ? (
            <input
              type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-400"
            />
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line bg-white px-3 py-2.5 text-sm text-slate-600 hover:border-primary-400">
              {subiendo ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {subiendo ? 'Convirtiendo y subiendo…' : 'Seleccionar imagen'}
              <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={subiendo} />
            </label>
          )}
        </div>
      </div>
      {!modoUrl && <p className="mt-1 text-[11px] text-slate-500">La imagen se convertirá automáticamente a WebP antes de subirse.</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
