"use client";

import { useState } from "react";
import type { Account, CashFlow } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { thb } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { NumberInput } from "@/components/ui/NumberInput";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowDownLeft, ArrowUpRight, Info } from "lucide-react";

type Mode = "in" | "out";

const num = (v: string) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
const today = () => new Date().toISOString().slice(0, 10);

const IN = "#5aa98c";
const OUT = "#d9534f";

export function CashFlowModal({
  accounts,
  flow,
  onClose,
  onSaved,
}: {
  accounts: Account[];
  flow?: CashFlow; // present ⇒ edit an existing flow instead of creating one
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = flow != null;
  const [mode, setMode] = useState<Mode>(flow?.direction === "Out" ? "out" : "in");
  const [accountId, setAccountId] = useState<number>(flow?.accountId ?? accounts[0]?.id ?? 0);
  const [amount, setAmount] = useState(flow ? String(flow.amount) : "");
  const [fxRate, setFxRate] = useState(flow ? String(flow.fxRateUsed || 35) : "35");
  const [date, setDate] = useState(flow?.occurredOn ?? today());
  const [note, setNote] = useState(flow?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeAccount = accounts.find((a) => a.id === accountId);
  const isUsd = activeAccount?.currency === "USD";
  const rate = isUsd ? num(fxRate) : 1;
  const amountThb = num(amount) * rate;

  async function submit() {
    if (num(amount) <= 0) {
      setError("กรอกจำนวนเงิน");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const currency = activeAccount?.currency ?? "THB";
      const body = JSON.stringify({
        accountId,
        occurredOn: date,
        direction: mode === "in" ? "In" : "Out",
        amount: num(amount),
        currency,
        fxRateUsed: currency === "USD" ? num(fxRate) : 1,
        counterAccountId: flow?.counterAccountId ?? null,
        note: note || null,
      });
      await apiFetch(editing ? `/cashflows/${flow!.id}` : "/cashflows", {
        method: editing ? "PUT" : "POST",
        body,
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
      title={editing ? "แก้ไขเงินเข้า/ออก" : "บันทึกเงินเข้า/ออก"}
      subtitle="เงินที่เข้าหรือออกจากบัญชี"
      width={460}
      onClose={onClose}
    >
      <div className="mb-4 grid grid-cols-2 gap-2">
        <ModeCard active={mode === "in"} onClick={() => setMode("in")} color={IN} label="เงินเข้า">
          <ArrowDownLeft size={20} />
        </ModeCard>
        <ModeCard active={mode === "out"} onClick={() => setMode("out")} color={OUT} label="เงินออก">
          <ArrowUpRight size={20} />
        </ModeCard>
      </div>

      <label className="mb-3 block">
        <span className="mb-1.5 block text-xs text-dim">
          {mode === "in" ? "เข้าบัญชี" : "ออกจากบัญชี"}
        </span>
        <select
          value={accountId}
          onChange={(e) => setAccountId(Number(e.target.value))}
          className="w-full rounded border border-border-soft bg-row px-3 py-2 text-sm text-text outline-none focus-visible:border-gold"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs text-dim">จำนวน ({isUsd ? "$" : "฿"})</span>
          <NumberInput
            value={amount}
            onChange={setAmount}
            placeholder={isUsd ? "0.00" : "0"}
            className="num w-full rounded border border-border-soft bg-row px-3 py-2 text-right text-sm text-text outline-none focus-visible:border-gold"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-dim">วันที่</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="num w-full rounded border border-border-soft bg-row px-3 py-2 text-sm text-text outline-none focus-visible:border-gold"
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
          <span className="text-faint">= {thb(amountThb)}</span>
        </div>
      )}

      <label className="mb-4 block">
        <span className="mb-1.5 block text-xs text-dim">โน้ต (ไม่บังคับ)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="เช่น เงินเดือนเข้า, ย้ายเงินมาซื้อ BTC"
          className="w-full rounded border border-border-soft bg-row px-3 py-2 text-sm text-text outline-none focus-visible:border-gold"
        />
      </label>

      <div
        className="mb-4 flex gap-2 rounded-lg border px-3 py-2.5"
        style={{
          borderColor: mode === "in" ? `${IN}40` : `${OUT}40`,
          background: mode === "in" ? `${IN}14` : `${OUT}14`,
        }}
      >
        <Info size={16} style={{ color: mode === "in" ? IN : OUT, flexShrink: 0 }} />
        <div className="text-xs leading-relaxed text-dim">
          {mode === "in" ? (
            <>
              เงินเข้าบัญชี (เงินเดือน, ย้ายมาลงทุน) →{" "}
              <span style={{ color: IN }}>เส้นเงินลงทุนขยับขึ้น</span>
            </>
          ) : (
            <>
              เงินออกจากบัญชี (ถอนไปใช้) →{" "}
              <span style={{ color: OUT }}>เส้นเงินลงทุนขยับลง</span>
            </>
          )}
        </div>
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

function ModeCard({
  active,
  onClick,
  color,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-[12px] border p-3 text-center transition-colors"
      style={
        active
          ? { borderColor: color, background: `${color}1f` }
          : { borderColor: "var(--color-border)" }
      }
    >
      <span style={{ color: active ? color : "var(--color-faint)" }}>{children}</span>
      <div className="mt-1.5 text-[13px]" style={{ color: active ? "var(--color-text)" : "var(--color-dim)" }}>
        {label}
      </div>
    </button>
  );
}
