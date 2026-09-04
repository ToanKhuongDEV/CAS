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
    className: "border-cas-secondary/35 bg-cas-surface text-cas-secondary",
    title: "Thành công",
  },
  error: {
    icon: "close",
    className: "border-cas-error/35 bg-cas-surface text-cas-error",
    title: "Có lỗi xảy ra",
  },
  info: {
    icon: "info",
    className: "border-cas-secondary/35 bg-cas-surface text-cas-secondary",
    title: "Thông tin",
  },
  warning: {
    icon: "info",
    className: "border-cas-secondary/35 bg-cas-surface text-cas-secondary",
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
        className="pointer-events-none fixed right-5 bottom-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-md flex-col gap-3"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          return (
            <section
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-[0_12px_28px_var(--cas-shadow-color)] ${style.className}`}
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-cas-surface-container">
                <CasIcon className="size-4.5" name={style.icon} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">{toast.title ?? style.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed">{toast.message}</p>
              </div>
              <button
                aria-label="Đóng thông báo"
                className={`grid size-8 shrink-0 place-items-center rounded-lg hover:bg-cas-on-surface/8 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${
                  toast.type === "error" ? "text-cas-error" : "text-cas-secondary"
                }`}
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
