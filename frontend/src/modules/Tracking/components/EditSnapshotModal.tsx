"use client";

import { useState } from "react";
import type { Account, Snapshot } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { thb } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { NumberInput } from "@/components/ui/NumberInput";
import { Spinner } from "@/components/ui/Spinner";

const num = (v: string) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};

// Edit a single snapshot. Mirrors the weekly-entry math: for a USD account the
// THB value is native × fx; for a THB account native is the value and fx is 1.
export function EditSnapshotModal({
  snapshot,
  account,
  onClose,
  onSaved,
}: {
  snapshot: Snapshot;
  account: Account;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isUsd = account.currency === "USD";
  const [asOfDate, setAsOfDate] = useState(snapshot.asOfDate);
  const [nativeAmount, setNativeAmount] = useState(String(snapshot.nativeAmount));
  const [fxRate, setFxRate] = useState(String(snapshot.fxRateUsed || 1));
  const [note, setNote] = useState(snapshot.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rate = isUsd ? num(fxRate) : 1;
  const valueThb = num(nativeAmount) * rate;

  async function submit() {
    if (num(nativeAmount) === 0) {
      setError("กรอกยอดคงเหลือ");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/snapshots/${snapshot.id}`, {
        method: "PUT",
        body: JSON.stringify({
          asOfDate,
          valueThb,
          nativeAmount: num(nativeAmount),
          nativeCurrency: account.currency,
          fxRateUsed: rate,
          note: note || null,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง",
      );
      setBusy(false);
    }
  }

  return (
    <Modal
      title="แก้ไขยอดคงเหลือ"
      subtitle={account.name}
      width={460}
      onClose={onClose}
    >
      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs text-dim">วันที่</span>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="num w-full rounded border border-border-soft bg-row px-3 py-2 text-sm text-text outline-none focus-visible:border-gold"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-dim">
            {account.kind === "FX" ? "อิควิตี้" : "ยอดคงเหลือ"} ({isUsd ? "$" : "฿"})
          </span>
          <NumberInput
            value={nativeAmount}
            onChange={setNativeAmount}
            placeholder={isUsd ? "0.00" : "0"}
            className="num w-full rounded border border-border-soft bg-row px-3 py-2 text-right text-sm text-text outline-none focus-visible:border-gold"
          />
        </label>
      </div>

      {isUsd && (
        <div className="mb-3 flex items-center gap-2 text-xs text-dim">
          <span>อัตราแลกเปลี่ยน USD → THB</span>
          <NumberInput
            value={fxRate}
            onChange={setFxRate}
            className="num w-20 rounded border border-border-soft bg-row px-2 py-1 text-right text-text outline-none focus-visible:border-gold"
          />
          <span className="text-faint">= {thb(valueThb)}</span>
        </div>
      )}

      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs text-dim">โน้ต (ไม่บังคับ)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded border border-border-soft bg-row px-3 py-2 text-sm text-text outline-none focus-visible:border-gold"
        />
      </label>

      {error && <p className="mb-3 text-sm text-loss">{error}</p>}

      <div className="flex justify-end gap-2">
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
