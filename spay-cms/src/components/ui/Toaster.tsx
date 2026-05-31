'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './Toast';

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
};

type ToastContextType = {
  toast: (t: Omit<ToastItem, 'id'>) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToasterProvider');
  return ctx;
}

const variantIcon = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

const variantIconColor = {
  default: 'text-fg-2',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider swipeDirection="right" duration={3000}>
        {children}
        {toasts.map((t) => {
          const Icon = variantIcon[t.variant ?? 'default'];
          return (
            <Toast
              key={t.id}
              variant={t.variant ?? 'default'}
              onOpenChange={(open) => {
                if (!open) setToasts((prev) => prev.filter((x) => x.id !== t.id));
              }}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 size-4 shrink-0 ${variantIconColor[t.variant ?? 'default']}`} />
                <div className="grid gap-0.5">
                  <ToastTitle>{t.title}</ToastTitle>
                  {t.description && <ToastDescription>{t.description}</ToastDescription>}
                </div>
              </div>
              <ToastClose />
            </Toast>
          );
        })}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
