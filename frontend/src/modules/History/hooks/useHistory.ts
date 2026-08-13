"use client";

import { useCallback, useEffect, useState } from "react";
import type { HistoryResponse } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import type { EditFlowTarget, EditSnapTarget, TypeFilter } from "../HistoryModule.types";

const PAGE_SIZE_DEFAULT = 25;

// Owns the history table's filters, pagination, fetch, and delete. `refreshKey`
// (bumped by the dashboard after a header-modal save) forces a refetch;
// `onChanged` keeps the overview totals fresh after an edit/delete here.
export function useHistory(refreshKey: number | undefined, onChanged: () => void) {
  const [accountId, setAccountId] = useState<number | "all">("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editSnap, setEditSnap] = useState<EditSnapTarget | null>(null);
  const [editFlow, setEditFlow] = useState<EditFlowTarget | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const confirm = useConfirm();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type, page: String(page), pageSize: String(pageSize) });
      if (accountId !== "all") params.set("accountId", String(accountId));
      setData(await apiFetch<HistoryResponse>(`/history?${params}`));
    } finally {
      setLoading(false);
    }
  }, [accountId, type, page, pageSize]);

  useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  const afterChange = () => {
    reload();
    onChanged();
  };

  async function del(kind: "snapshot" | "flow", id: number) {
    const label = kind === "snapshot" ? "ยอดคงเหลือนี้" : "รายการเงินนี้";
    const ok = await confirm({
      title: "ลบรายการ",
      message: `ลบ${label}?`,
      confirmLabel: "ลบ",
      danger: true,
    });
    if (!ok) return;
    setDeletingKey(`${kind}-${id}`);
    try {
      await apiFetch(`/${kind === "snapshot" ? "snapshots" : "cashflows"}/${id}`, { method: "DELETE" });
      afterChange();
    } catch {
      // a reload resyncs
    } finally {
      setDeletingKey(null);
    }
  }

  // Filter/page-size changes reset to page 1.
  const changeAccount = (v: number | "all") => {
    setAccountId(v);
    setPage(1);
  };
  const changeType = (v: TypeFilter) => {
    setType(v);
    setPage(1);
  };
  const changePageSize = (v: number) => {
    setPageSize(v);
    setPage(1);
  };

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return {
    accountId,
    type,
    page,
    pageSize,
    data,
    loading,
    editSnap,
    setEditSnap,
    editFlow,
    setEditFlow,
    deletingKey,
    del,
    afterChange,
    changeAccount,
    changeType,
    changePageSize,
    setPage,
    total,
    totalPages,
    start,
    end,
  };
}
