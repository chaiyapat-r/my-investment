"use client";

import type { Account } from "@/lib/types";
import type { TypeFilter } from "../HistoryModule.types";

const TYPES: [TypeFilter, string][] = [
  ["all", "ทั้งหมด"],
  ["snapshot", "ยอดคงเหลือ"],
  ["flow", "เงินเข้า/ออก"],
];

// Account dropdown + type chips + result count.
export function HistoryFilters({
  accounts,
  accountId,
  type,
  total,
  onAccount,
  onType,
}: {
  accounts: Account[];
  accountId: number | "all";
  type: TypeFilter;
  total: number;
  onAccount: (v: number | "all") => void;
  onType: (v: TypeFilter) => void;
}) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <select
        value={accountId}
        onChange={(e) => onAccount(e.target.value === "all" ? "all" : Number(e.target.value))}
        className="rounded-lg border border-border-soft bg-row px-3 py-2 text-sm text-text outline-none focus-visible:border-gold"
      >
        <option value="all">ทุกบัญชี</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <div className="inline-flex gap-0.5 rounded-lg border border-border-soft bg-row p-0.5">
        {TYPES.map(([val, label]) => (
          <button
            key={val}
            onClick={() => onType(val)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              type === val
                ? "bg-card text-text shadow-[inset_0_0_0_1px_var(--color-border)]"
                : "text-dim hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <span className="num ml-auto text-xs text-faint">{total} รายการ</span>
    </div>
  );
}
