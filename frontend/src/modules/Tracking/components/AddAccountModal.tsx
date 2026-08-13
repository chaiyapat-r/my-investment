"use client";

import { useState } from "react";
import type { Account, AccountScope, Currency } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { NumberInput } from "@/components/ui/NumberInput";
import { Spinner } from "@/components/ui/Spinner";

const num = (v: string) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
const today = () => new Date().toISOString().slice(0, 10);

export function AddAccountModal({
  nextOrder,
  account,
  onClose,
  onSaved,
}: {
  nextOrder: number;
  account?: Account | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!account;
  const [name, setName] = useState(account?.name ?? "");
  const [scope, setScope] = useState<AccountScope>(account?.scope ?? "Investment");
  const [currency, setCurrency] = useState<Currency>(account?.currency ?? "USD");
  const [color, setColor] = useState(account?.color ?? "#5aa98c");
  const [value, setValue] = useState("");
  const [contribution, setContribution] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim()) {
      setError("กรุณาใส่ชื่อบัญชี");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (account) {
        // Edit: Kind stays as-is (this form doesn't expose it).
        await apiFetch(`/accounts/${account.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: name.trim(),
            currency,
            kind: account.kind,
            scope,
            displayOrder: account.displayOrder,
            isArchived: account.isArchived,
            color,
          }),
        });
      } else {
        // Kind isn't asked when adding; infer a sensible default from scope.
        const kind = scope === "Banking" ? "Cash" : "Equity";
        const created = await apiFetch<{ id: number }>("/accounts", {
          method: "POST",
          body: JSON.stringify({ name: name.trim(), currency, kind, scope, displayOrder: nextOrder, color }),
        });

        const v = num(value);
        const c = num(contribution);
        if (v > 0) {
          await apiFetch("/snapshots", {
            method: "POST",
            body: JSON.stringify({
              accountId: created.id,
              asOfDate: today(),
              valueThb: v,
              nativeAmount: v,
              nativeCurrency: "THB",
              fxRateUsed: 1,
              note: null,
            }),
          });
        }
        if (c > 0) {
          await apiFetch("/cashflows", {
            method: "POST",
            body: JSON.stringify({
              accountId: created.id,
              occurredOn: today(),
              direction: "In",
              amount: c,
              currency: "THB",
              fxRateUsed: 1,
              counterAccountId: null,
              note: "ยอดเริ่มต้น",
            }),
          });
        }
      }
      onSaved();
      onClose();
    } catch {
      setError(isEdit ? "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง" : "เพิ่มบัญชีไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusy(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "แก้ไขบัญชี" : "เพิ่มบัญชีใหม่"}
      subtitle={isEdit ? "แก้ไขข้อมูลบัญชี" : "เพิ่มประเภทบัญชีที่ต้องการติดตาม"}
      width={460}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-xs text-dim">ชื่อบัญชี</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น บัญชีหุ้นจีน"
            autoFocus
            className="w-full rounded border border-border-soft bg-row px-3 py-2 text-sm text-text outline-none focus-visible:border-gold"
          />
        </div>

        <ToggleGroup
          label="ประเภท"
          value={scope}
          onChange={setScope}
          options={[
            ["Investment", "ลงทุน"],
            ["Banking", "ธนาคาร"],
          ]}
        />
        <ToggleGroup
          label="สกุลเงิน"
          value={currency}
          onChange={setCurrency}
          options={[
            ["THB", "THB"],
            ["USD", "USD"],
          ]}
        />

        <div>
          <span className="mb-1.5 block text-xs text-dim">สี</span>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex h-9 w-14 items-center justify-center overflow-hidden rounded border border-border-soft">
              <span className="absolute inset-0" style={{ background: color }} />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="เลือกสีบัญชี"
              />
            </label>
            <span className="num text-xs uppercase text-faint">{color}</span>
          </div>
        </div>

        {!isEdit && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs text-dim">มูลค่าปัจจุบัน (฿)</span>
              <NumberInput
                placeholder="0"
                value={value}
                onChange={setValue}
                className="num w-full rounded border border-border-soft bg-row px-3 py-2 text-right text-sm text-text outline-none focus-visible:border-gold"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-dim">เงินลงทุนสุทธิ (฿)</span>
              <NumberInput
                placeholder="0"
                value={contribution}
                onChange={setContribution}
                className="num w-full rounded border border-border-soft bg-row px-3 py-2 text-right text-sm text-text outline-none focus-visible:border-gold"
              />
            </label>
          </div>
        )}
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
          {busy ? "กำลังบันทึก…" : isEdit ? "บันทึก" : "เพิ่มบัญชี"}
        </button>
      </div>
    </Modal>
  );
}

function ToggleGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs text-dim">{label}</span>
      <div className="inline-flex rounded-lg border border-border-soft bg-row p-1">
        {options.map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
              value === val ? "bg-gold text-[#14171e]" : "text-dim hover:text-text"
            }`}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}
