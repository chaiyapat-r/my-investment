"use client";

import { Plus } from "lucide-react";
import type { Account } from "@/lib/types";
import type { AccountRow } from "../DashboardModule.types";
import { AccountCard } from "./AccountCard";

// The "บัญชี" section: add-account button + grid of account cards.
export function AccountGrid({
  rows,
  selectedId,
  deletingId,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
}: {
  rows: AccountRow[];
  selectedId: number | null;
  deletingId: number | null;
  onSelect: (id: number) => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onAdd: () => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm text-dim">
          บัญชี <span className="text-faint">· แตะเพื่อดูกราฟเฉพาะบัญชี</span>
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-[9px] border border-border px-3 py-1.5 text-xs text-[#c4cad6] transition-colors hover:border-gold hover:text-gold"
        >
          <Plus size={14} /> เพิ่มบัญชี
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <AccountCard
            key={row.account.id}
            row={row}
            selected={selectedId === row.account.id}
            deleting={deletingId === row.account.id}
            onSelect={() => onSelect(row.account.id)}
            onEdit={() => onEdit(row.account)}
            onDelete={() => onDelete(row.account)}
          />
        ))}
      </div>
    </section>
  );
}
