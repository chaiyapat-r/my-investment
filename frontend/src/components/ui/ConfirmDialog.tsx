"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export type ConfirmOptions = {
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean; // red confirm button + warning icon (for destructive actions)
};

type Pending = ConfirmOptions & { resolve: (v: boolean) => void };

// Returns a promise that resolves true (confirmed) / false (cancelled) — a
// drop-in replacement for window.confirm that matches the app's look.
const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<boolean>>(() =>
  Promise.resolve(false),
);

export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback(
    (o: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...o, resolve })),
    [],
  );

  const close = (v: boolean) => {
    pending?.resolve(v);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && <Dialog pending={pending} onClose={close} />}
    </ConfirmContext.Provider>
  );
}

function Dialog({ pending, onClose }: { pending: Pending; onClose: (v: boolean) => void }) {
  const { message, title, confirmLabel = "ยืนยัน", cancelLabel = "ยกเลิก", danger } = pending;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(9, 11, 17, 0.66)" }}
      onClick={() => onClose(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-[18px] border border-border p-5"
        style={{ background: "#14171f", maxWidth: 400 }}
      >
        <div className="flex gap-3">
          {danger && (
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: "rgba(217,83,79,.14)", color: "var(--color-loss)" }}
            >
              <AlertTriangle size={18} />
            </span>
          )}
          <div className="min-w-0">
            {title && <h2 className="disp text-base font-bold text-text">{title}</h2>}
            <p className={`text-sm text-dim ${title ? "mt-1" : ""}`}>{message}</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => onClose(false)}
            className="rounded-lg border border-border px-4 py-2 text-sm text-dim transition-colors hover:text-text"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onClose(true)}
            autoFocus
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${
              danger ? "text-white" : "text-[#14171e]"
            }`}
            style={{ background: danger ? "var(--color-loss)" : "var(--color-gold)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
