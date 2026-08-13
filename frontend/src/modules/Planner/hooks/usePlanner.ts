"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Currency, EntryPlan, PlanTranche } from "@/lib/types";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { n, toUI, tranchePayload, trim } from "../compute";
import type { TrancheField, UIPlan } from "../PlannerModule.types";

// Owns the planner's client state and all CRUD against /api/entry-plans*.
// Field edits update local state live (for budget↔qty recalc); persistTranche
// writes on blur. Add/toggle/delete write immediately.
export function usePlanner() {
  const [plans, setPlans] = useState<UIPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const [deletingTrancheId, setDeletingTrancheId] = useState<number | null>(null);
  const confirm = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<EntryPlan[]>("/entry-plans");
      setPlans(data.map(toUI));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        window.location.assign("/login");
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateLocal = (pid: number, fn: (p: UIPlan) => UIPlan) =>
    setPlans((ps) => ps.map((p) => (p.id === pid ? fn(p) : p)));

  // --- plan-level ---
  async function addPlan(d: { symbol: string; currency: Currency; planDate: string }) {
    const created = await apiFetch<EntryPlan>("/entry-plans", {
      method: "POST",
      body: JSON.stringify({ ...d, accountId: null }),
    });
    setPlans((ps) => [toUI(created), ...ps]); // newest on top
  }

  async function deletePlan(pid: number, symbol: string) {
    const ok = await confirm({
      title: "ลบแผน",
      message: `ลบแผน "${symbol || "ไม่มีชื่อ"}"?`,
      confirmLabel: "ลบ",
      danger: true,
    });
    if (!ok) return;
    setDeletingPlanId(pid);
    try {
      await apiFetch(`/entry-plans/${pid}`, { method: "DELETE" });
      setPlans((ps) => ps.filter((p) => p.id !== pid));
    } catch {
      load();
    } finally {
      setDeletingPlanId(null);
    }
  }

  // --- tranche-level ---
  async function addTranche(pid: number) {
    const plan = plans.find((p) => p.id === pid);
    if (!plan) return;
    const lowest = [...plan.tranches].sort((a, b) => n(a.price) - n(b.price))[0];
    const price = lowest ? n(lowest.price) * 0.9 : 100;
    const budget = lowest ? n(lowest.budget) : 500;
    const qty = price > 0 ? budget / price : 0;
    try {
      const created = await apiFetch<PlanTranche>(`/entry-plans/${pid}/tranches`, {
        method: "POST",
        body: JSON.stringify({ price, budget, quantity: qty, filled: false, slPrice: null, tpPrice: null }),
      });
      updateLocal(pid, (p) => ({
        ...p,
        tranches: [
          ...p.tranches,
          {
            id: created.id,
            price: trim(created.price),
            budget: trim(created.budget),
            qty: trim(created.quantity),
            sl: created.slPrice != null ? trim(created.slPrice) : "",
            tp: created.tpPrice != null ? trim(created.tpPrice) : "",
            filled: created.filled,
          },
        ],
      }));
    } catch {
      load();
    }
  }

  // Editing price/budget/qty keeps budget & qty in sync; SL/TP are independent.
  function editTranche(pid: number, tid: number, key: TrancheField, value: string) {
    updateLocal(pid, (p) => ({
      ...p,
      tranches: p.tranches.map((t) => {
        if (t.id !== tid) return t;
        const next = { ...t, [key]: value };
        const price = n(next.price);
        if (key === "qty") next.budget = trim(n(next.qty) * price);
        else if (key === "price" || key === "budget")
          next.qty = trim(price > 0 ? n(next.budget) / price : 0);
        return next;
      }),
    }));
  }

  async function persistTranche(pid: number, tid: number) {
    const t = plans.find((p) => p.id === pid)?.tranches.find((x) => x.id === tid);
    if (!t) return;
    try {
      await apiFetch(`/entry-plans/${pid}/tranches/${tid}`, {
        method: "PUT",
        body: JSON.stringify(tranchePayload(t)),
      });
    } catch {
      load();
    }
  }

  async function toggleFilled(pid: number, tid: number) {
    const t = plans.find((p) => p.id === pid)?.tranches.find((x) => x.id === tid);
    if (!t) return;
    const filled = !t.filled;
    updateLocal(pid, (p) => ({
      ...p,
      tranches: p.tranches.map((x) => (x.id === tid ? { ...x, filled } : x)),
    }));
    try {
      await apiFetch(`/entry-plans/${pid}/tranches/${tid}`, {
        method: "PUT",
        body: JSON.stringify(tranchePayload(t, filled)),
      });
    } catch {
      load();
    }
  }

  async function deleteTranche(pid: number, tid: number) {
    setDeletingTrancheId(tid);
    try {
      await apiFetch(`/entry-plans/${pid}/tranches/${tid}`, { method: "DELETE" });
      updateLocal(pid, (p) => ({ ...p, tranches: p.tranches.filter((t) => t.id !== tid) }));
    } catch {
      load();
    } finally {
      setDeletingTrancheId(null);
    }
  }

  const q = search.trim().toLowerCase();
  const filtered = q ? plans.filter((p) => p.symbol.toLowerCase().includes(q)) : plans;

  return {
    plans,
    filtered,
    loading,
    search,
    setSearch,
    showAdd,
    setShowAdd,
    deletingPlanId,
    deletingTrancheId,
    addPlan,
    deletePlan,
    addTranche,
    editTranche,
    persistTranche,
    toggleFilled,
    deleteTranche,
  };
}
