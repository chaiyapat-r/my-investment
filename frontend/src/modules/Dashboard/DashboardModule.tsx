"use client";

import { ArrowUpDown, Plus } from "lucide-react";
import { WeeklyEntryModal } from "@/modules/Tracking/components/WeeklyEntryModal";
import { AddAccountModal } from "@/modules/Tracking/components/AddAccountModal";
import { CashFlowModal } from "@/modules/Tracking/components/CashFlowModal";
import { HistoryModule } from "@/modules/History/HistoryModule";
import { useDashboard } from "./hooks/useDashboard";
import { DashboardTabs } from "./components/DashboardTabs";
import { Hero } from "./components/Hero";
import { AccountGrid } from "./components/AccountGrid";
import { AllocationPanel } from "./components/AllocationPanel";

export function DashboardModule() {
  const d = useDashboard();

  return (
    <>
      <main className="min-w-0 flex-1 px-4 pt-16 pb-12 sm:px-8 lg:pt-7">
        <div className="mx-auto max-w-[1060px]">
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="num mb-1 text-xs uppercase tracking-[0.18em] text-faint">
                Net Worth Tracker
              </div>
              <div className="flex items-baseline gap-3">
                <h1 className="disp text-2xl font-bold text-text">ภาพรวมพอร์ต</h1>
                {d.updatedLabel && <span className="text-sm text-faint">อัปเดต {d.updatedLabel}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => d.setModal("cashflow")}
                className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm text-dim transition-colors hover:border-gold hover:text-gold"
              >
                <ArrowUpDown size={16} /> เงินเข้า/ออก
              </button>
              <button
                onClick={() => d.setModal("entry")}
                className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-[#14171e] transition-opacity hover:opacity-90"
              >
                <Plus size={16} strokeWidth={2.5} /> บันทึกยอด
              </button>
            </div>
          </div>

          <DashboardTabs tab={d.tab} onTab={d.setTab} />

          {d.tab === "history" ? (
            <HistoryModule
              accounts={d.allAccounts}
              refreshKey={d.refreshKey}
              onChanged={() => d.load(d.scope)}
            />
          ) : (
            <>
              <Hero
                selected={d.selected}
                totals={d.totals}
                netContribution={d.netContribution}
                profitPct={d.profitPct}
                showNetContribution={d.showNetContribution}
                chartPoints={d.chartPoints}
                loading={d.loading}
                scope={d.scope}
                onToggleScope={() => d.setScope(d.scope === "networth" ? "investment" : "networth")}
                onClearSelect={() => d.setSelectedId(null)}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <AccountGrid
                  rows={d.rows}
                  selectedId={d.selectedId}
                  deletingId={d.deletingId}
                  onSelect={(id) => d.setSelectedId(d.selectedId === id ? null : id)}
                  onEdit={(account) => d.setEditing(account)}
                  onDelete={(account) => d.deleteAccount(account)}
                  onAdd={() => d.setModal("account")}
                />
                <AllocationPanel rows={d.rows} allocationTotal={d.allocationTotal} />
              </div>
            </>
          )}
        </div>
      </main>

      {d.modal === "entry" && (
        <WeeklyEntryModal
          accounts={d.allAccounts.filter((a) => !a.isArchived)}
          onClose={() => d.setModal(null)}
          onSaved={d.refreshAll}
        />
      )}
      {d.modal === "cashflow" && (
        <CashFlowModal
          accounts={d.allAccounts.filter((a) => !a.isArchived && a.scope !== "Banking")}
          onClose={() => d.setModal(null)}
          onSaved={d.refreshAll}
        />
      )}
      {d.modal === "account" && (
        <AddAccountModal
          nextOrder={d.allAccounts.length + 1}
          onClose={() => d.setModal(null)}
          onSaved={d.refreshAll}
        />
      )}
      {d.editing && (
        <AddAccountModal
          account={d.editing}
          nextOrder={0}
          onClose={() => d.setEditing(null)}
          onSaved={d.refreshAll}
        />
      )}
    </>
  );
}
