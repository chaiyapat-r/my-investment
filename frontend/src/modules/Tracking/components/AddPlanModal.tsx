"use client";

import { useState } from "react";
import type { Currency } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

const today = () => new Date().toISOString().slice(0, 10);

// Collects the plan header before the ladder card appears. The ladder (tranches)
// is built afterwards on the card itself.
export function AddPlanModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (data: { symbol: string; currency: Currency; planDate: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [symbol, setSymbol] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [planDate, setPlanDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const sym = symbol.trim().toUpperCase();
    if (!sym) {
      setError("กรอกสัญลักษณ์หุ้น");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ symbol: sym, currency, planDate });
      onClose();
    } catch {
      setError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusy(false);
    }
  }

  return (
    <Modal title="เพิ่มแผนเข้าซื้อ" subtitle="ระบุหุ้นและสกุลเงินของแผน" width={420} onClose={onClose}>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-xs text-dim">สัญลักษณ์หุ้น</span>
        <input
          value={symbol}
          autoFocus
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="เช่น NVDA, PTT"
          className="disp w-full rounded border border-border-soft bg-row px-3 py-2 text-lg font-bold tracking-wide text-text outline-none focus-visible:border-gold"
        />
      </label>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs text-dim">สกุลเงิน</span>
          <div className="grid grid-cols-2 gap-0.5 rounded border border-border-soft bg-row p-0.5">
            {(["USD", "THB"] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`num rounded py-1.5 text-sm transition-colors ${
                  currency === c ? "bg-card text-text shadow-[inset_0_0_0_1px_var(--color-border)]" : "text-dim hover:text-text"
                }`}
              >
                {c === "USD" ? "$ USD" : "฿ THB"}
              </button>
            ))}
          </div>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-dim">วันที่</span>
          <input
            type="date"
            value={planDate}
            onChange={(e) => setPlanDate(e.target.value)}
            className="num w-full rounded border border-border-soft bg-row px-3 py-2 text-sm text-text outline-none focus-visible:border-gold"
          />
        </label>
      </div>

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
