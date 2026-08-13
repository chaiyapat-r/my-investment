"use client";

import { Loader2 } from "lucide-react";

// Spinning loader icon. Inherits color from `currentColor`, so set text-* on a
// parent (or via className). Respects prefers-reduced-motion — no spin then.
export function Spinner({
  size = 16,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Loader2 size={size} className={`shrink-0 motion-safe:animate-spin ${className}`} aria-hidden="true" />
  );
}

// Centered spinner + label for a whole area that is waiting on the API
// (initial data load, empty-while-fetching). Announces politely to screen readers.
export function Loading({
  label = "กำลังโหลด…",
  size = 16,
  className = "",
}: {
  label?: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-2 text-sm text-faint ${className}`}
    >
      <Spinner size={size} />
      <span>{label}</span>
    </div>
  );
}
