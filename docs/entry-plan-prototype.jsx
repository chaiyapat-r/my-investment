'use client'

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";

const C = {
  bg: "#12151C",
  card: "#1A1F29",
  row: "#1F2531",
  border: "#2C3442",
  borderSoft: "#242B36",
  text: "#E6E9EF",
  dim: "#8A93A5",
  faint: "#5C6577",
  gold: "#E0A458",
  teal: "#4E9B84",
};

const ROW_H = 46;
const uid = () => Math.random().toString(36).slice(2, 9);

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};

const trim = (x) =>
  Number.isFinite(x) ? String(parseFloat(x.toFixed(6))) : "0";

const seed = [
  {
    id: uid(),
    symbol: "NVDA",
    planDate: "2026-08-02",
    tranches: [
      { id: uid(), price: "168", budget: "500", qty: "2.9762", filled: true },
      { id: uid(), price: "152", budget: "500", qty: "3.2895", filled: false },
      { id: uid(), price: "138", budget: "500", qty: "3.6232", filled: false },
    ],
  },
];

function compute(plan) {
  const rows = [...plan.tranches]
    .map((t) => ({ ...t, _price: n(t.price), _qty: n(t.qty) }))
    .sort((a, b) => b._price - a._price);

  let cq = 0, cc = 0, fq = 0, fc = 0;
  const out = rows.map((t) => {
    const cost = t._qty * t._price;
    cq += t._qty;
    cc += cost;
    if (t.filled) { fq += t._qty; fc += cost; }
    return { ...t, cost, runAvg: cq ? cc / cq : 0 };
  });

  return {
    rows: out,
    totalQty: cq,
    totalCost: cc,
    avgAll: cq ? cc / cq : 0,
    filledQty: fq,
    filledCost: fc,
    avgFilled: fq ? fc / fq : 0,
    hasFilled: fq > 0,
  };
}

const money = (x) =>
  x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sh = (x) =>
  x.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 4 });

function Field({ value, onChange, prefix, width }) {
  return (
    <span
      className="inline-flex items-center rounded"
      style={{ background: C.row, border: `1px solid ${C.borderSoft}` }}
    >
      {prefix && (
        <span className="pl-1.5 text-xs" style={{ color: C.faint }}>{prefix}</span>
      )}
      <input
        value={value}
        inputMode="decimal"
        onChange={(e) => onChange(e.target.value)}
        className="num bg-transparent px-1.5 py-1 text-sm outline-none"
        style={{ color: C.text, width, textAlign: "right" }}
      />
    </span>
  );
}

export default function EntryPlanner() {
  const [plans, setPlans] = useState(seed);

  const update = (pid, fn) =>
    setPlans((ps) => ps.map((p) => (p.id === pid ? fn(p) : p)));

  const addPlan = () =>
    setPlans((ps) => [
      ...ps,
      {
        id: uid(),
        symbol: "",
        planDate: new Date().toISOString().slice(0, 10),
        tranches: [],
      },
    ]);

  const addTranche = (pid) =>
    update(pid, (p) => {
      const lowest = [...p.tranches].sort((a, b) => n(a.price) - n(b.price))[0];
      const price = lowest ? n(lowest.price) * 0.9 : 100;
      const budget = lowest ? n(lowest.budget) : 500;
      return {
        ...p,
        tranches: [
          ...p.tranches,
          {
            id: uid(),
            price: trim(price),
            budget: trim(budget),
            qty: trim(price > 0 ? budget / price : 0),
            filled: false,
          },
        ],
      };
    });

  // whichever field you edit wins; the other one follows
  const editTranche = (pid, tid, key, value) =>
    update(pid, (p) => ({
      ...p,
      tranches: p.tranches.map((t) => {
        if (t.id !== tid) return t;
        const next = { ...t, [key]: value };
        const price = n(next.price);
        if (key === "qty") {
          next.budget = trim(n(next.qty) * price);
        } else {
          // price or budget changed -> hold the budget, recalculate shares
          next.qty = trim(price > 0 ? n(next.budget) / price : 0);
        }
        return next;
      }),
    }));

  return (
    <div className="min-h-screen w-full p-4 sm:p-8" style={{ background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .disp { font-family: 'Space Grotesk', system-ui, sans-serif; }
        .num { font-family: 'IBM Plex Mono', ui-monospace, Menlo, monospace; font-variant-numeric: tabular-nums; }
        input:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 1px; }
        button:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 780 }}>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="num mb-1 text-xs uppercase"
                 style={{ color: C.faint, letterSpacing: "0.18em" }}>
              Entry Ladder
            </div>
            <h1 className="disp text-2xl font-bold" style={{ color: C.text }}>
              แผนการเข้าซื้อ
            </h1>
          </div>
          <button onClick={addPlan}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium"
                  style={{ background: C.gold, color: "#14171E" }}>
            <Plus size={15} strokeWidth={2.5} /> เพิ่มแผน
          </button>
        </div>

        {plans.length === 0 && (
          <div className="rounded-lg px-6 py-16 text-center"
               style={{ border: `1px dashed ${C.border}` }}>
            <p className="disp mb-1 text-base" style={{ color: C.text }}>ยังไม่มีแผน</p>
            <p className="text-sm" style={{ color: C.dim }}>
              เริ่มจากเพิ่มแผนแรก แล้ววางไม้ที่อยากเข้าไว้เป็นชั้น ๆ
            </p>
          </div>
        )}

        <div className="space-y-6">
          {plans.map((plan) => {
            const c = compute(plan);

            return (
              <div key={plan.id} className="rounded-lg"
                   style={{ background: C.card, border: `1px solid ${C.border}` }}>

                <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
                     style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                  <input
                    value={plan.symbol}
                    placeholder="TICKER"
                    onChange={(e) =>
                      update(plan.id, (p) => ({ ...p, symbol: e.target.value.toUpperCase() }))
                    }
                    className="disp bg-transparent text-lg font-bold outline-none"
                    style={{ color: C.text, width: 110, letterSpacing: "0.04em" }}
                  />
                  <input
                    type="date"
                    value={plan.planDate}
                    onChange={(e) =>
                      update(plan.id, (p) => ({ ...p, planDate: e.target.value }))
                    }
                    className="num rounded bg-transparent px-2 py-1 text-xs outline-none"
                    style={{ color: C.dim, border: `1px solid ${C.borderSoft}` }}
                  />
                  <button
                    onClick={() => setPlans((ps) => ps.filter((p) => p.id !== plan.id))}
                    className="ml-auto rounded p-1.5"
                    style={{ color: C.faint }}
                    aria-label="ลบแผน"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-2">
                  <div className="px-4 py-4 sm:px-5"
                       style={{ borderRight: `1px solid ${C.borderSoft}` }}>
                    <div className="mb-1 text-xs" style={{ color: C.dim }}>ต้นทุนเฉลี่ยตอนนี้</div>
                    <div className="num text-2xl"
                         style={{ color: c.hasFilled ? C.teal : C.faint }}>
                      {c.hasFilled ? `$${money(c.avgFilled)}` : "—"}
                    </div>
                    <div className="num mt-1 text-xs" style={{ color: C.faint }}>
                      {c.hasFilled
                        ? `${sh(c.filledQty)} หุ้น · $${money(c.filledCost)}`
                        : "ยังไม่ได้เข้าไม้ไหน"}
                    </div>
                  </div>
                  <div className="px-4 py-4 sm:px-5">
                    <div className="mb-1 text-xs" style={{ color: C.dim }}>ถ้าซื้อครบแผน</div>
                    <div className="num text-2xl" style={{ color: C.gold }}>
                      {c.totalQty ? `$${money(c.avgAll)}` : "—"}
                    </div>
                    <div className="num mt-1 text-xs" style={{ color: C.faint }}>
                      {c.totalQty
                        ? `${sh(c.totalQty)} หุ้น · $${money(c.totalCost)}`
                        : "ยังไม่มีไม้"}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-2 sm:px-5">
                  <div className="num flex items-center gap-2 py-2 text-xs uppercase"
                       style={{ color: C.faint, letterSpacing: "0.08em" }}>
                    <span style={{ width: 20 }} />
                    <span className="flex-1">ราคา</span>
                    <span className="text-right" style={{ width: 68 }}>งบ</span>
                    <span className="text-right" style={{ width: 68 }}>หุ้น</span>
                    <span className="text-right" style={{ width: 76 }}>เฉลี่ยสะสม</span>
                    <span style={{ width: 28 }} />
                  </div>

                  <div className="relative">
                    {c.rows.map((t, i) => (
                      <div key={t.id} className="flex items-center gap-2"
                           style={{ height: ROW_H }}>
                        <button
                          onClick={() =>
                            update(plan.id, (p) => ({
                              ...p,
                              tranches: p.tranches.map((x) =>
                                x.id === t.id ? { ...x, filled: !x.filled } : x
                              ),
                            }))
                          }
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: 20, height: 20, flexShrink: 0,
                            border: `1px solid ${t.filled ? C.teal : C.border}`,
                            background: t.filled ? C.teal : "transparent",
                            color: t.filled ? "#12151C" : C.faint,
                          }}
                          aria-label={t.filled ? "ยกเลิกว่าเข้าแล้ว" : "ทำเครื่องหมายว่าเข้าแล้ว"}
                        >
                          {t.filled
                            ? <Check size={11} strokeWidth={3} />
                            : <span className="num" style={{ fontSize: 10 }}>{i + 1}</span>}
                        </button>

                        <span className="flex-1">
                          <Field prefix="$" width={58} value={t.price}
                                 onChange={(v) => editTranche(plan.id, t.id, "price", v)} />
                        </span>

                        <span style={{ width: 68 }}>
                          <Field prefix="$" width={48} value={t.budget}
                                 onChange={(v) => editTranche(plan.id, t.id, "budget", v)} />
                        </span>

                        <span style={{ width: 68 }}>
                          <Field width={60} value={t.qty}
                                 onChange={(v) => editTranche(plan.id, t.id, "qty", v)} />
                        </span>

                        <span className="num text-right text-sm"
                              style={{ width: 76, color: t.filled ? C.teal : C.text }}>
                          ${money(t.runAvg)}
                        </span>

                        <span className="flex justify-end" style={{ width: 28 }}>
                          <button
                            onClick={() =>
                              update(plan.id, (p) => ({
                                ...p,
                                tranches: p.tranches.filter((x) => x.id !== t.id),
                              }))
                            }
                            className="rounded p-1"
                            style={{ color: C.faint }}
                            aria-label="ลบไม้นี้"
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>

                  {c.rows.length === 0 && (
                    <p className="py-6 text-center text-sm" style={{ color: C.faint }}>
                      ยังไม่มีไม้ — เพิ่มไม้แรกเพื่อเริ่มคำนวณ
                    </p>
                  )}
                </div>

                <div className="px-4 py-3 sm:px-5"
                     style={{ borderTop: `1px solid ${C.borderSoft}` }}>
                  <button onClick={() => addTranche(plan.id)}
                          className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm"
                          style={{ color: C.gold, border: `1px solid ${C.border}` }}>
                    <Plus size={14} /> เพิ่มไม้
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
