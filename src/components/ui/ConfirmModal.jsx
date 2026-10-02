import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Trash2, X } from 'lucide-react';
import Portal from './Portal.jsx';

export default function ConfirmModal({
  open,
  title='Confirmar acción',
  message='¿Deseas continuar?',
  confirmText='Confirmar',
  cancelText='Cancelar',
  tone='danger',
  loading=false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.();
    };

    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const danger = tone === 'danger';

  return (
    <Portal>
      <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Cerrar"
          className="absolute inset-0 h-full w-full cursor-default bg-ink/55 backdrop-blur-sm"
          onClick={() => !loading && onClose?.()}
        />

        <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-lift">
          <div className="p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                danger ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
              }`}>
                {danger ? <Trash2 size={22}/> : <CheckCircle2 size={22}/>}
              </span>

              <div className="min-w-0 flex-1">
                <p className={`font-mono text-[10px] uppercase tracking-[.2em] ${
                  danger ? 'text-red-500' : 'text-primary-500'
                }`}>
                  {danger ? 'Acción irreversible' : 'Confirmación'}
                </p>
                <h3 className="mt-1 font-display text-xl font-700 text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
              </div>

              <button
                type="button"
                onClick={() => !loading && onClose?.()}
                disabled={loading}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-slate-500 hover:border-primary-300 hover:text-primary-600 disabled:opacity-40"
                aria-label="Cerrar"
              >
                <X size={17}/>
              </button>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => !loading && onClose?.()}
                disabled={loading}
                className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-600 text-slate-600 hover:bg-soft disabled:opacity-50"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-600 text-white disabled:opacity-50 ${
                  danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'btn-shine bg-primary-500 hover:bg-primary-600'
                }`}
              >
                {loading
                  ? <Loader2 size={16} className="animate-spin"/>
                  : danger
                    ? <Trash2 size={15}/>
                    : <CheckCircle2 size={15}/>}
                {loading ? 'Procesando…' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
