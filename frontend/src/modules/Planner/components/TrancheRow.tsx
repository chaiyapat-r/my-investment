"use client";

import { Check, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { money } from "../compute";
import type { ComputedTranche, TrancheField as TField } from "../PlannerModule.types";
import { TrancheField } from "./TrancheField";

// One tranche as a compact row: order toggle on the left (vertically centered),
// the fields in the middle (buy on top, SL→loss / TP→profit below), delete on
// the right. Kept as short as possible.
export function TrancheRow({
  t,
  index,
  cur,
  deleting,
  onEdit,
  onCommit,
  onToggle,
  onDelete,
}: {
  t: ComputedTranche;
  index: number;
  cur: string;
  deleting: boolean;
  onEdit: (key: TField, value: string) => void;
  onCommit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-[#141821] px-3 py-2.5">
      {/* order toggle — left, vertically centered */}
      <button
        onClick={onToggle}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]"
        style={{
          borderColor: t.filled ? "var(--color-teal)" : "var(--color-border)",
          background: t.filled ? "var(--color-teal)" : "transparent",
          color: t.filled ? "#12151c" : "var(--color-faint)",
        }}
        aria-label={t.filled ? "ยกเลิกว่าเข้าแล้ว" : "ทำเครื่องหมายว่าเข้าแล้ว"}
      >
        {t.filled ? <Check size={12} strokeWidth={3} /> : <span className="num">{index + 1}</span>}
      </button>

      {/* fields */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <TrancheField label="ราคา" prefix={cur} value={t.price}
            onChange={(v) => onEdit("price", v)} onCommit={onCommit} />
          <TrancheField label="งบ" prefix={cur} value={t.budget}
            onChange={(v) => onEdit("budget", v)} onCommit={onCommit} />
          <TrancheField label="หุ้น" value={t.qty}
            onChange={(v) => onEdit("qty", v)} onCommit={onCommit} />
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          <div className="flex items-end gap-2.5">
            <div className="w-24 shrink-0">
              <TrancheField label="SL" prefix={cur} variant="risk" value={t.sl} placeholder="—"
                onChange={(v) => onEdit("sl", v)} onCommit={onCommit} />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[10px] text-faint">ขาดทุนถ้าโดน</div>
              <div className={`num text-sm ${t.loss !== null ? "text-loss" : "text-faint"}`}>
                {t.loss !== null ? `−${cur}${money(Math.max(t.loss, 0))}` : "—"}
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2.5">
            <div className="w-24 shrink-0">
              <TrancheField label="TP" prefix={cur} variant="reward" value={t.tp} placeholder="—"
                onChange={(v) => onEdit("tp", v)} onCommit={onCommit} />
            </div>
            <div className="flex-1 text-right">
              <div className="text-[10px] text-faint">กำไรถ้าโดน</div>
              <div className={`num text-sm ${t.gain !== null ? "text-teal" : "text-faint"}`}>
                {t.gain !== null ? `+${cur}${money(Math.max(t.gain, 0))}` : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* delete — right, vertically centered */}
      <button
        onClick={onDelete}
        disabled={deleting}
        className="shrink-0 rounded p-1 text-faint transition-colors hover:text-loss"
        aria-label="ลบไม้นี้"
      >
        {deleting ? <Spinner size={16} /> : <Trash2 size={16} />}
      </button>
    </div>
  );
}
