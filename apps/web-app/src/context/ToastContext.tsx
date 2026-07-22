import React, { createContext, useContext, useState } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContextType {
  showToast: (message: string, type?: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = { id, type, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px', width: '100%' }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="glass-card"
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              background: toast.type === 'error' ? 'rgba(244, 63, 94, 0.2)' : toast.type === 'info' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              border: toast.type === 'error' ? '1px solid rgba(244, 63, 94, 0.4)' : toast.type === 'info' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              color: '#fff',
              fontSize: '0.9rem',
              animation: 'fadeIn 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {toast.type === 'error' && <AlertTriangle size={20} color="#f87171" />}
              {toast.type === 'info' && <Info size={20} color="#38bdf8" />}
              {toast.type === 'success' && <CheckCircle size={20} color="#34d399" />}
              <span>{toast.message}</span>
            </div>

            <button onClick={() => removeToast(toast.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
