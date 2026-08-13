"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Account, ChartResponse, ChartScope } from "@/lib/types";
import { thaiDate } from "@/lib/format";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { summarise } from "../summarise";
import type { AccountRow, DashboardModal, DashboardTab } from "../DashboardModule.types";

// Owns the dashboard's client state: scope toggle, account drill-down, chart
// data (combined + per-account), modals, and derived headline figures.
export function useDashboard() {
  const [scope, setScope] = useState<ChartScope>("networth");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [combined, setCombined] = useState<ChartResponse["points"]>([]);
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [modal, setModal] = useState<DashboardModal>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<DashboardTab>("overview");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // Bumped whenever a header modal saves, so the history table reloads too.
  const [refreshKey, setRefreshKey] = useState(0);
  const confirm = useConfirm();

  const load = useCallback(async (s: ChartScope) => {
    setLoading(true);
    try {
      const accounts = await apiFetch<Account[]>("/accounts");
      setAllAccounts(accounts);
      const inScope = accounts.filter((a) => s === "networth" || a.scope === "Investment");

      const [chart, accountRows] = await Promise.all([
        apiFetch<ChartResponse>(`/chart?scope=${s}`),
        Promise.all(
          inScope.map(async (account): Promise<AccountRow> => {
            const res = await apiFetch<ChartResponse>(`/chart?accountId=${account.id}`);
            const sum = summarise(res.points);
            return { account, points: res.points, value: sum.value, change: sum.change, profit: sum.profit };
          }),
        ),
      ]);

      setCombined(chart.points);
      setRows(accountRows);
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
    setSelectedId(null);
    load(scope);
  }, [scope, load]);

  // Reload the overview data and signal the history table to refetch.
  const refreshAll = useCallback(() => {
    load(scope);
    setRefreshKey((k) => k + 1);
  }, [load, scope]);

  async function deleteAccount(a: Account) {
    const ok = await confirm({
      title: "ลบบัญชี",
      message: `ลบบัญชี "${a.name}"?`,
      confirmLabel: "ลบ",
      danger: true,
    });
    if (!ok) return;
    setDeletingId(a.id);
    try {
      await apiFetch(`/accounts/${a.id}`, { method: "DELETE" });
      if (selectedId === a.id) setSelectedId(null);
      load(scope);
    } catch {
      // a reload will resync
    } finally {
      setDeletingId(null);
    }
  }

  const selected = selectedId != null ? rows.find((r) => r.account.id === selectedId) : undefined;
  const chartPoints = selected ? selected.points : combined;

  const totals = useMemo(() => summarise(combined), [combined]);
  const profitPct = totals.netContribution > 1 ? totals.profit / totals.netContribution : null;
  // profit = value − netContribution, so netContribution = value − profit.
  const netContribution = selected ? selected.value - selected.profit : totals.netContribution;
  // Only meaningful for invested accounts (and the combined view); bank cash has no cost basis.
  const showNetContribution = !selected || selected.account.scope === "Investment";

  const allocationTotal = rows.reduce((sum, r) => sum + Math.max(r.value, 0), 0);
  const updatedLabel = combined.length ? thaiDate(combined[combined.length - 1].date) : undefined;

  return {
    // state
    scope,
    setScope,
    selectedId,
    setSelectedId,
    rows,
    allAccounts,
    loading,
    tab,
    setTab,
    modal,
    setModal,
    editing,
    setEditing,
    deletingId,
    refreshKey,
    // actions
    load,
    refreshAll,
    deleteAccount,
    // derived
    selected,
    chartPoints,
    totals,
    profitPct,
    netContribution,
    showNetContribution,
    allocationTotal,
    updatedLabel,
  };
}
