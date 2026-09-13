"use client";

import { Plus, Search } from "lucide-react";
import { AddPlanModal } from "@/modules/Tracking/components/AddPlanModal";
import { Loading } from "@/components/ui/Spinner";
import { usePlanner } from "./hooks/usePlanner";
import { PlanCard } from "./components/PlanCard";

export function PlannerModule() {
  const p = usePlanner();

  return (
    <>
      <main className="min-w-0 flex-1 px-4 pt-16 pb-12 sm:px-8 lg:pt-7">
        <div className="mx-auto max-w-[820px]">
          {/* header */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="num mb-1 text-xs uppercase tracking-[0.18em] text-faint">Entry Ladder</div>
              <h1 className="disp text-2xl font-bold text-text">แผนการเข้าซื้อ</h1>
            </div>
            <button
              onClick={() => p.setShowAdd(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2.5 text-sm font-medium text-[#14171e] transition-opacity hover:opacity-90"
            >
              <Plus size={16} strokeWidth={2.5} /> เพิ่มแผน
            </button>
          </div>

          {/* search */}
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-border-soft bg-row px-3 py-2 focus-within:border-gold">
            <Search size={16} className="text-faint" />
            <input
              value={p.search}
              onChange={(e) => p.setSearch(e.target.value)}
              placeholder="ค้นหาสัญลักษณ์หุ้น…"
              className="disp w-full bg-transparent text-sm tracking-wide text-text outline-none placeholder:text-faint placeholder:tracking-normal"
            />
          </div>

          {p.loading ? (
            <Loading className="py-16" />
          ) : p.plans.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-border px-6 py-16 text-center">
              <p className="disp mb-1 text-base text-text">ยังไม่มีแผน</p>
              <p className="text-sm text-dim">เริ่มจากเพิ่มแผนแรก แล้ววางไม้ที่อยากเข้าไว้เป็นชั้น ๆ</p>
            </div>
          ) : p.filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-faint">ไม่พบแผนที่ตรงกับ “{p.search.trim()}”</p>
          ) : (
            <div className="space-y-6">
              {p.filtered.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onAddTranche={() => p.addTranche(plan.id)}
                  onEditTranche={(tid, key, value) => p.editTranche(plan.id, tid, key, value)}
                  onCommitTranche={(tid) => p.persistTranche(plan.id, tid)}
                  onToggleFilled={(tid) => p.toggleFilled(plan.id, tid)}
                  onDeleteTranche={(tid) => p.deleteTranche(plan.id, tid)}
                  onMoveTranche={(tid, dir) => p.moveTranche(plan.id, tid, dir)}
                  onDeletePlan={() => p.deletePlan(plan.id, plan.symbol)}
                  deletingPlan={p.deletingPlanId === plan.id}
                  deletingTrancheId={p.deletingTrancheId}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {p.showAdd && <AddPlanModal onSubmit={p.addPlan} onClose={() => p.setShowAdd(false)} />}
    </>
  );
}
