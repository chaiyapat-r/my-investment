"use client";

// Text input that only accepts a non-negative decimal (digits + a single dot).
// Rejecting at the keystroke level keeps invalid characters out entirely.
// `maxDecimals` caps the digits after the dot (omit for unlimited).
export function NumberInput({
  value,
  onChange,
  maxDecimals,
  ...props
}: {
  value: string;
  onChange: (v: string) => void;
  maxDecimals?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const pattern =
    maxDecimals != null ? new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`) : /^\d*\.?\d*$/;
  return (
    <input
      {...props}
      inputMode="decimal"
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        if (v === "" || pattern.test(v)) onChange(v);
      }}
    />
  );
}
