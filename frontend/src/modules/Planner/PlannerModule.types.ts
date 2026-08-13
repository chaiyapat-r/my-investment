import type { Currency, PlanStatus } from "@/lib/types";

// Editable client model: tranche numbers live as strings for smooth typing.
export interface UITranche {
  id: number;
  price: string;
  budget: string;
  qty: string;
  sl: string; // "" = not set
  tp: string; // "" = not set
  filled: boolean;
}

export type TrancheField = "price" | "budget" | "qty" | "sl" | "tp";

export interface UIPlan {
  id: number;
  symbol: string;
  currency: Currency;
  planDate: string;
  status: PlanStatus;
  tranches: UITranche[];
}

// A tranche after ladder computation (price-descending, with running avg + SL/TP).
export interface ComputedTranche extends UITranche {
  cost: number;
  runAvg: number;
  loss: number | null; // qty × (price − SL); null when SL unset
  gain: number | null; // qty × (TP − price); null when TP unset
}

export interface PlanComputation {
  rows: ComputedTranche[];
  totalQty: number;
  totalCost: number;
  avgAll: number;
  filledQty: number;
  filledCost: number;
  avgFilled: number;
  hasFilled: boolean;
  slTot: number;
  tpTot: number;
  rr: number; // reward-to-risk over all tranches
}
