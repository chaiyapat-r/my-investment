"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  subtitle,
  width = 520,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  width?: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(9, 11, 17, 0.66)" }}
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-[18px] border border-border"
        style={{ background: "#14171f", maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-0">
          <div>
            <h2 className="disp text-lg font-bold text-text">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-dim">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-faint transition-colors hover:text-text"
            aria-label="ปิด"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
