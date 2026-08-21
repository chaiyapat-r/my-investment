"use client";

import { useState } from "react";
import type { Account } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { thb } from "@/lib/format";
import { resolveAccountColor } from "@/lib/colors";
import { Modal } from "@/components/ui/Modal";
import { NumberInput } from "@/components/ui/NumberInput";
import { Spinner } from "@/components/ui/Spinner";

const num = (v: string) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};

// Default to today — balances can be recorded for any date, not just weekly.
const today = () => new Date().toISOString().slice(0, 10);

interface Row {
  amount: string;
  note: string;
}

export function WeeklyEntryModal({
  accounts,
  onClose,
  onSaved,
}: {
  accounts: Account[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [asOfDate, setAsOfDate] = useState(today());
  const [fxRate, setFxRate] = useState("35");
  const [rows, setRows] = useState<Record<number, Row>>(() =>
    Object.fromEntries(accounts.map((a) => [a.id, { amount: "", note: "" }])),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rate = num(fxRate);
  const set = (id: number, key: keyof Row, v: string) =>
    setRows((r) => ({ ...r, [id]: { ...r[id], [key]: v } }));

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const items = accounts
        .filter((a) => (rows[a.id]?.amount ?? "").trim() !== "")
        .map((a) => ({
          accountId: a.id,
          nativeAmount: num(rows[a.id].amount),
          nativeCurrency: a.currency,
          note: rows[a.id].note || null,
        }));

      if (items.length === 0) {
        setError("กรอกยอดอย่างน้อยหนึ่งบัญชี");
        setBusy(false);
        return;
      }

      await apiFetch("/snapshots/bulk", {
        method: "POST",
        body: JSON.stringify({ asOfDate, fxRate: rate, items }),
      });
      onSaved();
      onClose();
    } catch {
      setError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusy(false);
    }
  }

  return (
    <Modal
      title="บันทึกยอด"
      subtitle="กรอกยอดคงเหลือของแต่ละบัญชี"
      width={560}
      onClose={onClose}
    >
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-dim">วันที่</span>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="num w-full rounded border border-border-soft bg-row px-3 py-2 text-sm text-text outline-none focus-visible:border-gold"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-dim">อัตราแลกเปลี่ยน USD → THB</span>
          <NumberInput
            value={fxRate}
            onChange={setFxRate}
            className="num w-full rounded border border-border-soft bg-row px-3 py-2 text-right text-sm text-text outline-none focus-visible:border-gold"
          />
        </label>
      </div>

      <div className="space-y-2.5">
        {accounts.map((a) => {
          const isUsd = a.currency === "USD";
          const amount = num(rows[a.id]?.amount ?? "");
          return (
            <div key={a.id} className="rounded-[12px] border border-border-soft p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-text">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: resolveAccountColor(a) }}
                  />
                  {a.name}
                </span>
                <span className="num text-xs text-faint">{a.currency}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded border border-border-soft bg-row">
                  <span className="pl-2 text-xs text-faint">{isUsd ? "$" : "฿"}</span>
                  <NumberInput
                    placeholder={isUsd ? "0.00" : "0"}
                    value={rows[a.id]?.amount ?? ""}
                    onChange={(v) => set(a.id, "amount", v)}
                    className="num w-28 bg-transparent px-2 py-1.5 text-right text-sm text-text outline-none"
                  />
                </span>
                {isUsd && (
                  <span className="num text-xs text-faint">
                    × {rate} = {thb(amount * rate)}
                  </span>
                )}
                <input
                  placeholder="โน้ต (ไม่บังคับ)"
                  value={rows[a.id]?.note ?? ""}
                  onChange={(e) => set(a.id, "note", e.target.value)}
                  className="min-w-0 flex-1 rounded border border-border-soft bg-row px-2 py-1.5 text-sm text-text outline-none focus-visible:border-gold"
                />
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm text-loss">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 text-sm text-dim transition-colors hover:text-text"
        >
          ยกเลิก
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-[#14171e] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy && <Spinner size={14} />}
          {busy ? "กำลังบันทึก…" : "บันทึก"}
        </button>
      </div>
    </Modal>
  );
}
