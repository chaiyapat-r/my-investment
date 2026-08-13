"use client";

import { ArrowLeft } from "lucide-react";
import type { ChartPoint, ChartScope } from "@/lib/types";
import { signedPercent, signedThb, thb } from "@/lib/format";
import { TwoLineChart } from "@/components/ui/TwoLineChart";
import { Loading } from "@/components/ui/Spinner";
import type { AccountRow } from "../DashboardModule.types";

// The hero card: headline value + net-contribution/profit lines + two-line chart.
// Shows the combined portfolio, or a single account when one is drilled into.
export function Hero({
  selected,
  totals,
  netContribution,
  profitPct,
  showNetContribution,
  chartPoints,
  loading,
  scope,
  onToggleScope,
  onClearSelect,
}: {
  selected: AccountRow | undefined;
  totals: { value: number; profit: number };
  netContribution: number;
  profitPct: number | null;
  showNetContribution: boolean;
  chartPoints: ChartPoint[];
  loading: boolean;
  scope: ChartScope;
  onToggleScope: () => void;
  onClearSelect: () => void;
}) {
  const isCash = selected?.account.kind === "Cash";

  return (
    <div className="mb-4 rounded-[18px] border border-border bg-card p-5 sm:p-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm text-dim">{selected ? selected.account.name : "มูลค่ารวม"}</span>
            {selected ? (
              <button
                onClick={onClearSelect}
                className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-dim hover:border-gold hover:text-gold"
              >
                <ArrowLeft size={12} /> ทั้งหมด
              </button>
            ) : (
              <button
                onClick={onToggleScope}
                className="rounded-full border border-border px-2.5 py-0.5 text-xs text-dim hover:border-gold hover:text-gold"
              >
                {scope === "networth" ? "ทุกบัญชีรวมเงินสด" : "เฉพาะการลงทุน"}
              </button>
            )}
          </div>

          <div className="num text-[30px] leading-none text-text">
            {thb(selected ? selected.value : totals.value)}
          </div>

          <div className="mt-5 space-y-2 text-sm">
            {showNetContribution && (
              <StatLine label="เงินลงทุนสุทธิ" amount={netContribution} pct={null} signed={false} />
            )}
            {/* Cash has no cost basis — profit is meaningless (design brief §4c). */}
            {!isCash && (
              <StatLine
                label="กำไรสะสม"
                amount={selected ? selected.profit : totals.profit}
                pct={selected ? null : profitPct}
              />
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-xs">
            {isCash ? (
              <Legend color="var(--color-dim)">เงินลงทุนสุทธิ</Legend>
            ) : (
              <>
                <Legend color="var(--color-teal)">มูลค่าตลาด</Legend>
                <Legend color="var(--color-dim)" dashed>
                  เงินลงทุนสุทธิ
                </Legend>
                <span className="text-faint">· ช่องว่าง = กำไร</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center">
          {loading ? (
            <Loading className="h-56 w-full" />
          ) : (
            <div className="w-full">
              <TwoLineChart
                points={chartPoints}
                showContribution={!isCash}
                valueLabel={isCash ? "ลงทุน" : "ตลาด"}
                valueColor={isCash ? "var(--color-dim)" : "var(--color-teal)"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatLine({
  label,
  amount,
  pct,
  signed = true,
}: {
  label: string;
  amount: number;
  pct: number | null;
  // signed=false → a neutral level (e.g. net contribution): plain ฿, no +/-, no gain/loss colour.
  signed?: boolean;
}) {
  const tone = !signed ? "text-text" : amount >= 0 ? "text-teal" : "text-loss";
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-dim">{label}</span>
      <span className="flex items-baseline gap-2">
        <span className={`num ${tone}`}>{signed ? signedThb(amount) : thb(amount)}</span>
        {pct != null && <span className={`num text-xs ${tone}`}>· {signedPercent(pct)}</span>}
      </span>
    </div>
  );
}

function Legend({
  color,
  dashed,
  children,
}: {
  color: string;
  dashed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className="flex items-center gap-1.5 text-dim">
      <span
        className="inline-block h-0.5 w-4"
        style={{
          background: dashed ? "none" : color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
        }}
      />
      {children}
    </span>
  );
}
