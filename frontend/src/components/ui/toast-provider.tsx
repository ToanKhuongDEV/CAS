"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { CasIcon, type CasIconName } from "./cas-icon";

type ToastType = "success" | "error" | "info" | "warning";

type ToastInput = {
  message: string;
  title?: string;
  type?: ToastType;
};

type Toast = ToastInput & {
  id: string;
  type: ToastType;
};

type ToastContextValue = {
  dismissToast: (id: string) => void;
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toastStyles: Record<ToastType, { icon: CasIconName; className: string; title: string }> = {
  success: {
    icon: "check",
    className: "border-cas-secondary/35 bg-cas-secondary-container/25 text-cas-on-surface",
    title: "Thành công",
  },
  error: {
    icon: "close",
    className: "border-cas-error/35 bg-cas-error-container/45 text-cas-on-error-container",
    title: "Có lỗi xảy ra",
  },
  info: {
    icon: "info",
    className: "border-cas-primary/25 bg-cas-primary-container/15 text-cas-on-surface",
    title: "Thông tin",
  },
  warning: {
    icon: "info",
    className: "border-cas-tertiary/35 bg-cas-tertiary-container/25 text-cas-on-surface",
    title: "Lưu ý",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, title, type = "info" }: ToastInput) => {
      const id = crypto.randomUUID();
      setToasts((currentToasts) => [...currentToasts, { id, message, title, type }]);
      window.setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ dismissToast, showToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] mx-auto flex w-auto max-w-md flex-col gap-3 sm:top-5 sm:right-5 sm:left-auto"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          return (
            <section
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-[0_12px_28px_var(--cas-shadow-color)] ${style.className}`}
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-cas-surface/50">
                <CasIcon className="size-4.5" name={style.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">{toast.title ?? style.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed">{toast.message}</p>
              </div>
              <button
                aria-label="Đóng thông báo"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-cas-on-surface-variant hover:bg-cas-on-surface/8 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => dismissToast(toast.id)}
                type="button"
              >
                <CasIcon className="size-4" name="close" />
              </button>
            </section>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast phải được dùng bên trong ToastProvider.");
  }

  return context;
}
