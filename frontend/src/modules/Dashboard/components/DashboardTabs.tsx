"use client";

import type { DashboardTab } from "../DashboardModule.types";

const TABS: [DashboardTab, string][] = [
  ["overview", "ภาพรวมพอร์ต"],
  ["history", "ประวัติรายการ"],
];

export function DashboardTabs({
  tab,
  onTab,
}: {
  tab: DashboardTab;
  onTab: (t: DashboardTab) => void;
}) {
  return (
    <div className="mb-5 flex gap-1 border-b border-border">
      {TABS.map(([val, label]) => (
        <button
          key={val}
          onClick={() => onTab(val)}
          className={`relative top-px border-b-2 px-3.5 py-2.5 text-sm transition-colors ${
            tab === val
              ? "border-gold font-semibold text-gold"
              : "border-transparent text-dim hover:text-text"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
