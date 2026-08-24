'use client';

import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string) => addToast(message, 'success');
  const error = (message: string) => addToast(message, 'error');
  const warning = (message: string) => addToast(message, 'warning');
  const info = (message: string) => addToast(message, 'info');

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />,
    error: <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
  };

  const borderMap = {
    success: 'border-emerald-200',
    error: 'border-red-200',
    warning: 'border-amber-200',
    info: 'border-blue-200',
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-lg border bg-white shadow-md animate-slide-up text-sm ${borderMap[t.type]}`}
          >
            {iconMap[t.type]}
            <span className="flex-1 text-gray-800 leading-snug">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
