import { useState, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext(null);

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

const STYLES = {
  success: 'bg-success/10 border-success/30 text-success',
  error:   'bg-error/10   border-error/30   text-error',
  warning: 'bg-warning/10 border-warning/30 text-warning',
  info:    'bg-info/10    border-info/30    text-info',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => remove(toast.id)}
            className={`slide-in-right flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg cursor-pointer backdrop-blur-sm ${STYLES[toast.type] || STYLES.info}`}
          >
            <span className="text-base flex-shrink-0 mt-0.5">{ICONS[toast.type]}</span>
            <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
            <button
              onClick={(e) => { e.stopPropagation(); remove(toast.id); }}
              className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity text-xs mt-0.5"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
