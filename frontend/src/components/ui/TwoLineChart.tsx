"use client";

import { useRef, useState } from "react";
import type { ChartPoint } from "@/lib/types";
import { signedThb, thb, thaiDate } from "@/lib/format";

const W = 720;
const H = 260;
const PAD = { top: 18, right: 16, bottom: 16, left: 16 };
const tof = (iso: string) => Date.parse(iso);

export function TwoLineChart({
  points,
  showContribution = true,
  valueLabel = "ตลาด",
  valueColor = "var(--color-teal)",
}: {
  points: ChartPoint[];
  showContribution?: boolean;
  valueLabel?: string;
  valueColor?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-faint">
        ยังไม่มีข้อมูลสำหรับช่วงนี้
      </div>
    );
  }

  const ts = points.map((p) => tof(p.date));
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);

  const ys = points.flatMap((p) =>
    showContribution ? [p.marketValueThb, p.netContributionThb] : [p.marketValueThb],
  );
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  }
  const yGap = (yMax - yMin) * 0.12;
  yMin -= yGap;
  yMax += yGap;

  const xAt = (t: number) =>
    tMax === tMin ? W / 2 : PAD.left + ((t - tMin) / (tMax - tMin)) * (W - PAD.left - PAD.right);
  const yAt = (v: number) =>
    PAD.top + ((yMax - v) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);
  const px = (i: number) => xAt(ts[i]);

  const mv = points.map((p, i) => `${px(i)},${yAt(p.marketValueThb)}`);
  const nc = points.map((p, i) => `${px(i)},${yAt(p.netContributionThb)}`);
  const gapPolygon = [...mv, ...[...nc].reverse()].join(" ");
  const last = points[points.length - 1];
  const profitPositive = last.marketValueThb - last.netContributionThb >= 0;
  const zeroInRange = yMin < 0 && yMax > 0;

  function handleMove(e: React.MouseEvent) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    let best = 0;
    let bestDist = Infinity;
    points.forEach((_, i) => {
      const d = Math.abs(px(i) / W - frac);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setHover(best);
  }

  const hp = hover != null ? points[hover] : null;

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseMove={handleMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
        {zeroInRange && (
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={yAt(0)}
            y2={yAt(0)}
            stroke="var(--color-border)"
            strokeDasharray="3 3"
          />
        )}

        {/* The gap between the lines is profit — the whole point of the app. */}
        {showContribution && points.length > 1 && (
          <polygon
            points={gapPolygon}
            fill={profitPositive ? "var(--color-teal)" : "var(--color-loss)"}
            opacity={0.1}
          />
        )}

        {showContribution && points.length > 1 && (
          <polyline
            points={nc.join(" ")}
            fill="none"
            stroke="var(--color-dim)"
            strokeWidth={1.75}
            strokeDasharray="4 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.length > 1 && (
          <polyline
            points={mv.join(" ")}
            fill="none"
            stroke={valueColor}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {hover != null && (
          <line
            x1={px(hover)}
            x2={px(hover)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="var(--color-border)"
          />
        )}

        {points.map((p, i) => (
          <circle
            key={`mv-${p.date}`}
            cx={px(i)}
            cy={yAt(p.marketValueThb)}
            r={hover === i ? 4 : 2.5}
            fill={valueColor}
          />
        ))}
        {showContribution &&
          points.map((p, i) => (
            <circle
              key={`nc-${p.date}`}
              cx={px(i)}
              cy={yAt(p.netContributionThb)}
              r={hover === i ? 3.5 : 2}
              fill="var(--color-dim)"
            />
          ))}
      </svg>

      {hp && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[115%] whitespace-nowrap rounded-lg border border-border px-3 py-2.5 shadow-lg"
          style={{
            background: "#0f1218",
            left: `${(px(hover!) / W) * 100}%`,
            top: `${(yAt(hp.marketValueThb) / H) * 100}%`,
          }}
        >
          <div className="num mb-2 text-[11px] text-faint">{thaiDate(hp.date)}</div>
          <TipRow variant="solid" color={valueColor} label={valueLabel} value={hp.marketValueThb} />
          {showContribution && (
            <>
              <TipRow variant="dashed" color="var(--color-dim)" label="ลงทุน" value={hp.netContributionThb} />
              <div className="my-2 border-t border-border" />
              <div className="flex items-center gap-8 text-xs">
                <span className="text-dim">กำไร</span>
                <span
                  className={`num ml-auto ${
                    hp.marketValueThb - hp.netContributionThb >= 0 ? "text-teal" : "text-loss"
                  }`}
                >
                  {signedThb(hp.marketValueThb - hp.netContributionThb)}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TipRow({
  variant,
  color,
  label,
  value,
}: {
  variant: "solid" | "dashed";
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="inline-block w-4" style={{ borderTop: `2px ${variant} ${color}` }} />
      <span className="text-dim">{label}</span>
      <span className="num ml-auto pl-6 text-text">{thb(value)}</span>
    </div>
  );
}
