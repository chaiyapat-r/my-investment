"use client";

// Tiny market-value line for an account card. No axes, no labels.
export function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 96;
  const h = 28;
  const p = 3;

  if (values.length < 2) {
    return <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => p + (i / (values.length - 1)) * (w - 2 * p);
  const y = (v: number) => (max === min ? h / 2 : p + ((max - v) / (max - min)) * (h - 2 * p));
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
