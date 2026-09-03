import type { EntryPlan } from "@/lib/types";
import type { PlanComputation, UIPlan, UITranche } from "./PlannerModule.types";

// --- number helpers ---
export const n = (v: string) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
// Planner values are kept to 2 decimals (matches the 2-dp inputs).
export const trim = (x: number) => (Number.isFinite(x) ? String(parseFloat(x.toFixed(2))) : "0");
export const money = (x: number) =>
  x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const sh = (x: number) =>
  x.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
// Percentages show 2 decimals, no thousands separators needed.
export const pct = (x: number) => x.toFixed(2);

export function toUI(p: EntryPlan): UIPlan {
  return {
    id: p.id,
    symbol: p.symbol,
    currency: p.currency,
    planDate: p.planDate,
    status: p.status,
    tranches: p.tranches.map((t) => ({
      id: t.id,
      price: trim(t.price),
      budget: trim(t.budget),
      qty: trim(t.quantity),
      sl: t.slPrice != null ? trim(t.slPrice) : "",
      tp: t.tpPrice != null ? trim(t.tpPrice) : "",
      filled: t.filled,
    })),
  };
}

// Weighted average accumulated price-descending — the ladder order.
export function compute(plan: UIPlan): PlanComputation {
  const rows = plan.tranches
    .map((t) => ({ ...t, _price: n(t.price), _qty: n(t.qty) }))
    .sort((a, b) => b._price - a._price);

  let cq = 0,
    cc = 0,
    fq = 0,
    fc = 0,
    slTot = 0,
    tpTot = 0;
  const out = rows.map((t) => {
    const cost = t._qty * t._price;
    cq += t._qty;
    cc += cost;
    if (t.filled) {
      fq += t._qty;
      fc += cost;
    }
    // loss/profit if the whole tranche stops out / takes profit (positive magnitudes)
    const loss = t.sl.trim() !== "" ? t._qty * (t._price - n(t.sl)) : null;
    const gain = t.tp.trim() !== "" ? t._qty * (n(t.tp) - t._price) : null;
    if (loss !== null) slTot += loss;
    if (gain !== null) tpTot += gain;
    // Per-tranche % move from entry to SL/TP (independent of quantity).
    const lossPct =
      loss !== null && t._price > 0 ? ((t._price - n(t.sl)) / t._price) * 100 : null;
    const gainPct =
      gain !== null && t._price > 0 ? ((n(t.tp) - t._price) / t._price) * 100 : null;
    return { ...t, cost, runAvg: cq ? cc / cq : 0, loss, gain, lossPct, gainPct };
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
    slTot,
    tpTot,
    // Totals as a % of the whole ladder's planned cost.
    slPct: cc > 0 ? (slTot / cc) * 100 : 0,
    tpPct: cc > 0 ? (tpTot / cc) * 100 : 0,
    rr: slTot > 0 ? tpTot / slTot : 0,
  };
}

// Body sent to the tranche POST/PUT. Loss/profit are derived on render, not stored.
export const tranchePayload = (t: UITranche, filled = t.filled) => ({
  price: n(t.price),
  budget: n(t.budget),
  quantity: n(t.qty),
  filled,
  slPrice: t.sl.trim() === "" ? null : n(t.sl),
  tpPrice: t.tp.trim() === "" ? null : n(t.tp),
});
