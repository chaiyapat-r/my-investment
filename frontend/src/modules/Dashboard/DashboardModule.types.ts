import type { Account, ChartPoint } from "@/lib/types";

// One account's own chart series plus its summarised headline figures.
export interface AccountRow {
  account: Account;
  points: ChartPoint[];
  value: number;
  change: number;
  profit: number;
}

export type DashboardTab = "overview" | "history";
export type DashboardModal = "entry" | "account" | "cashflow" | null;
