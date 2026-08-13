import type { Account, CashFlow, Snapshot } from "@/lib/types";

export type TypeFilter = "all" | "snapshot" | "flow";

export type EditSnapTarget = { snapshot: Snapshot; account: Account };
export type EditFlowTarget = { flow: CashFlow; account: Account };
