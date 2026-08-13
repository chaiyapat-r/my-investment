"use client";

import { Pencil, Trash2 } from "lucide-react";
import { signedThb, thb } from "@/lib/format";
import { resolveAccountColor } from "@/lib/colors";
import { Sparkline } from "@/components/ui/Sparkline";
import { Spinner } from "@/components/ui/Spinner";
import type { AccountRow } from "../DashboardModule.types";

// One account tile: colour dot, name/scope, sparkline, value, profit. Click to
// drill down; hover reveals edit/delete.
export function AccountCard({
  row,
  selected,
  onSelect,
  onEdit,
  onDelete,
  deleting,
}: {
  row: AccountRow;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const { account, value, profit } = row;
  const color = resolveAccountColor(account);
  const scopeLabel = account.scope === "Banking" ? "ธนาคาร" : "ลงทุน";

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      className={`group relative cursor-pointer rounded-[14px] border bg-card p-4 text-left transition-colors hover:bg-[#12151c] ${
        selected ? "border-gold" : "border-border"
      }`}
    >
      {/* edit / delete — revealed on hover */}
      <div
        className={`absolute right-2 top-2 flex gap-0.5 transition-opacity group-hover:opacity-100 ${
          deleting ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="rounded p-1 text-faint transition-colors hover:text-gold"
          aria-label="แก้ไขบัญชี"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={deleting}
          className="rounded p-1 text-faint transition-colors hover:text-loss disabled:opacity-100"
          aria-label="ลบบัญชี"
        >
          {deleting ? <Spinner size={13} /> : <Trash2 size={13} />}
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
          <div>
            <div className="text-sm text-text">{account.name}</div>
            <div className="num text-[11px] text-faint">
              {scopeLabel} · {account.currency}
            </div>
          </div>
        </div>
        <div className="w-24">
          <Sparkline values={row.points.map((p) => p.marketValueThb)} color={color} />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="num text-xl text-text">{thb(value)}</span>
        {account.kind !== "Cash" && (
          <span className={`num text-xs ${profit >= 0 ? "text-teal" : "text-loss"}`}>
            กำไร {signedThb(profit)}
          </span>
        )}
      </div>
    </div>
  );
}
