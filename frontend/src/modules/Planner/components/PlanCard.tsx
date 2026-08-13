"use client";

import { Plus, Trash2 } from "lucide-react";
import { thaiDate } from "@/lib/format";
import { Spinner } from "@/components/ui/Spinner";
import { compute, money, sh } from "../compute";
import type { TrancheField as TField, UIPlan } from "../PlannerModule.types";
import { RiskRewardStrip } from "./RiskRewardStrip";
import { TrancheRow } from "./TrancheRow";

// One entry plan: header + two headline averages + risk/reward strip + tranche ladder.
export function PlanCard({
  plan,
  onAddTranche,
  onEditTranche,
  onCommitTranche,
  onToggleFilled,
  onDeleteTranche,
  onDeletePlan,
  deletingPlan,
  deletingTrancheId,
}: {
  plan: UIPlan;
  onAddTranche: () => void;
  onEditTranche: (tid: number, key: TField, value: string) => void;
  onCommitTranche: (tid: number) => void;
  onToggleFilled: (tid: number) => void;
  onDeleteTranche: (tid: number) => void;
  onDeletePlan: () => void;
  deletingPlan: boolean;
  deletingTrancheId: number | null;
}) {
  const c = compute(plan);
  const cur = plan.currency === "USD" ? "$" : "฿";

  return (
    <div className="rounded-[14px] border border-border bg-card">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border-soft px-4 py-3 sm:px-5">
        <span className="disp text-lg font-bold tracking-wide text-text">{plan.symbol || "—"}</span>
        <span className="num rounded border border-border-soft px-2 py-1 text-xs text-dim">
          {thaiDate(plan.planDate)}
        </span>
        <span className="num text-xs text-faint">{plan.currency}</span>
        <button
          onClick={onDeletePlan}
          disabled={deletingPlan}
          className="ml-auto rounded p-1.5 text-faint transition-colors hover:text-loss"
          aria-label="ลบแผน"
        >
          {deletingPlan ? <Spinner size={15} /> : <Trash2 size={15} />}
        </button>
      </div>

      {/* headline figures */}
      <div className="grid grid-cols-2">
        <div className="border-r border-border-soft px-4 py-4 sm:px-5">
          <div className="mb-1 text-xs text-dim">ต้นทุนเฉลี่ยตอนนี้</div>
          <div className={`num text-xl ${c.hasFilled ? "text-teal" : "text-faint"}`}>
            {c.hasFilled ? `${cur}${money(c.avgFilled)}` : "—"}
          </div>
          <div className="num mt-1 text-xs text-faint">
            {c.hasFilled ? `${sh(c.filledQty)} หุ้น · ${cur}${money(c.filledCost)}` : "ยังไม่ได้เข้าไม้ไหน"}
          </div>
        </div>
        <div className="px-4 py-4 sm:px-5">
          <div className="mb-1 text-xs text-dim">ถ้าซื้อครบแผน</div>
          <div className="num text-xl text-gold">
            {c.totalQty ? `${cur}${money(c.avgAll)}` : "—"}
          </div>
          <div className="num mt-1 text-xs text-faint">
            {c.totalQty ? `${sh(c.totalQty)} หุ้น · ${cur}${money(c.totalCost)}` : "ยังไม่มีไม้"}
          </div>
        </div>
      </div>

      <RiskRewardStrip c={c} cur={cur} />

      {/* ladder — one card per tranche */}
      <div className="px-3 pb-1 sm:px-4">
        {c.rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-faint">ยังไม่มีไม้ — เพิ่มไม้แรกเพื่อเริ่มคำนวณ</p>
        ) : (
          <div className="flex flex-col gap-3 py-1">
            {c.rows.map((t, i) => (
              <TrancheRow
                key={t.id}
                t={t}
                index={i}
                cur={cur}
                deleting={deletingTrancheId === t.id}
                onEdit={(key, value) => onEditTranche(t.id, key, value)}
                onCommit={() => onCommitTranche(t.id)}
                onToggle={() => onToggleFilled(t.id)}
                onDelete={() => onDeleteTranche(t.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border-soft px-4 py-3 sm:px-5">
        <button
          onClick={onAddTranche}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm text-gold transition-colors hover:border-gold"
        >
          <Plus size={14} /> เพิ่มไม้
        </button>
      </div>
    </div>
  );
}
