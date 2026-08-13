"use client";

import type { Account, HistoryItem } from "@/lib/types";
import { thaiDate, thb } from "@/lib/format";
import { resolveAccountColor } from "@/lib/colors";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowDownLeft, ArrowUpRight, Camera, Pencil, Trash2 } from "lucide-react";

// One ledger row: date · account · type chip · native×fx detail · amount · note · edit/delete.
export function HistoryRow({
  item,
  account,
  deleting,
  onEdit,
  onDelete,
}: {
  item: HistoryItem;
  account?: Account;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isSnap = item.kind === "snapshot";
  const snap = item.snapshot;
  const flow = item.flow;
  const flowIn = flow?.direction === "In";
  const isUsd = account?.currency === "USD";
  const color = account ? resolveAccountColor(account) : "#8a93a5";
  const note = (isSnap ? snap?.note : flow?.note) || null;

  return (
    <tr className="group border-t border-border-soft transition-colors hover:bg-[#12151c]">
      <td className="num px-4 py-3 text-sm text-dim">{thaiDate(item.date)}</td>
      <td className="px-4 py-3 text-sm">
        <span className="flex items-center gap-2 whitespace-nowrap">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
          {account?.name ?? "—"}
        </span>
      </td>
      <td className="px-4 py-3">
        <TypeChip kind={item.kind} flowIn={!!flowIn} />
      </td>
      <td className="num whitespace-nowrap px-4 py-3 text-xs text-faint">
        {isUsd && snap
          ? `$${snap.nativeAmount} × ${snap.fxRateUsed}`
          : isUsd && flow
            ? `$${flow.amount} × ${flow.fxRateUsed}`
            : "—"}
      </td>
      <td className="num whitespace-nowrap px-4 py-3 text-right text-sm">
        {isSnap ? (
          <span className="text-text">{thb(snap!.valueThb)}</span>
        ) : (
          <span style={{ color: flowIn ? "var(--color-teal)" : "var(--color-loss)" }}>
            {flowIn ? "+" : "−"}
            {thb(flow!.amountThb)}
          </span>
        )}
      </td>
      <td className="max-w-[220px] truncate px-4 py-3 text-sm text-dim">
        {note ?? <span className="text-faint">—</span>}
      </td>
      <td className="px-4 py-3">
        <div
          className={`flex gap-0.5 transition-opacity group-hover:opacity-100 ${
            deleting ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={onEdit}
            disabled={!account || deleting}
            className="rounded p-1 text-faint transition-colors hover:text-gold disabled:opacity-40"
            aria-label="แก้ไข"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="rounded p-1 text-faint transition-colors hover:text-loss"
            aria-label="ลบ"
          >
            {deleting ? <Spinner size={14} /> : <Trash2 size={14} />}
          </button>
        </div>
      </td>
    </tr>
  );
}

function TypeChip({ kind, flowIn }: { kind: "snapshot" | "flow"; flowIn: boolean }) {
  if (kind === "snapshot") {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-row px-2.5 py-1 text-xs text-dim">
        <Camera size={13} /> ยอดคงเหลือ
      </span>
    );
  }
  return flowIn ? (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs"
      style={{ background: "rgba(90,169,140,.14)", color: "var(--color-teal)" }}
    >
      <ArrowDownLeft size={13} /> เงินเข้า
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs"
      style={{ background: "rgba(217,83,79,.14)", color: "var(--color-loss)" }}
    >
      <ArrowUpRight size={13} /> เงินออก
    </span>
  );
}
