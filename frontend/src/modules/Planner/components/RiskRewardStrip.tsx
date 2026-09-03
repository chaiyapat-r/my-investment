import { money, pct } from "../compute";
import type { PlanComputation } from "../PlannerModule.types";

// The three risk/reward totals above the ladder (over all tranches).
export function RiskRewardStrip({ c, cur }: { c: PlanComputation; cur: string }) {
  return (
    <div className="grid grid-cols-1 border-y border-border-soft bg-[#12151c] sm:grid-cols-3">
      <RRItem label="ขาดทุนถ้าโดน SL ทั้งหมด" swatch="var(--color-loss)">
        <span className="text-loss">
          {c.slTot > 0 ? `−${cur}${money(c.slTot)}` : "—"}
          {c.slTot > 0 && c.slPct > 0 && (
            <span className="ml-1 text-xs">(−{pct(c.slPct)}%)</span>
          )}
        </span>
      </RRItem>
      <RRItem label="กำไรถ้าโดน TP ทั้งหมด" swatch="var(--color-teal)" divided>
        <span className="text-teal">
          {c.tpTot > 0 ? `+${cur}${money(c.tpTot)}` : "—"}
          {c.tpTot > 0 && c.tpPct > 0 && (
            <span className="ml-1 text-xs">(+{pct(c.tpPct)}%)</span>
          )}
        </span>
      </RRItem>
      <RRItem label="อัตราส่วน R:R" divided>
        <span className="text-text">{c.rr > 0 ? `1 : ${c.rr.toFixed(2)}` : "—"}</span>
      </RRItem>
    </div>
  );
}

function RRItem({
  label,
  swatch,
  divided,
  children,
}: {
  label: string;
  swatch?: string;
  divided?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`px-4 py-2.5 sm:px-5 ${
        divided ? "border-t border-border-soft sm:border-l sm:border-t-0" : ""
      }`}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[11px] text-dim">
        {swatch && <span className="inline-block h-2 w-2 rounded-sm" style={{ background: swatch }} />}
        {label}
      </div>
      <div className="num text-base">{children}</div>
    </div>
  );
}
