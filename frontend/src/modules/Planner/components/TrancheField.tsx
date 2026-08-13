"use client";

import { NumberInput } from "@/components/ui/NumberInput";

// A labelled, full-width number field in a tranche card. Width is controlled by
// the parent cell. `variant` tints the border for SL (risk) / TP (reward).
// Commits on blur / Enter; accepts at most 2 decimals.
export function TrancheField({
  label,
  value,
  onChange,
  onCommit,
  prefix,
  placeholder,
  variant,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  prefix?: string;
  placeholder?: string;
  variant?: "risk" | "reward";
}) {
  const border =
    variant === "risk"
      ? "border-loss/40"
      : variant === "reward"
        ? "border-teal/40"
        : "border-border-soft";
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-dim">{label}</span>
      <span className={`flex items-center rounded-lg border bg-row px-2.5 py-1.5 focus-within:border-gold ${border}`}>
        {prefix && <span className="pr-1 text-xs text-faint">{prefix}</span>}
        <NumberInput
          value={value}
          onChange={onChange}
          maxDecimals={2}
          onBlur={onCommit}
          placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          className="num w-full min-w-0 bg-transparent text-right text-sm text-text outline-none placeholder:text-faint"
        />
      </span>
    </label>
  );
}
