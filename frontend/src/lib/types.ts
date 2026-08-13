export type Currency = "THB" | "USD";
export type AccountScope = "Banking" | "Investment";
export type AccountKind = "Cash" | "FX" | "Equity" | "Crypto" | "Liability";

export interface Account {
  id: number;
  name: string;
  currency: Currency;
  kind: AccountKind;
  scope: AccountScope;
  color: string | null;
  displayOrder: number;
  isArchived: boolean;
}

export interface Snapshot {
  id: number;
  accountId: number;
  asOfDate: string; // yyyy-MM-dd
  valueThb: number;
  nativeAmount: number;
  nativeCurrency: Currency;
  fxRateUsed: number;
  note: string | null;
}

export type Direction = "In" | "Out";

export interface CashFlow {
  id: number;
  accountId: number;
  occurredOn: string; // yyyy-MM-dd
  direction: Direction;
  amount: number;
  currency: Currency;
  fxRateUsed: number;
  amountThb: number;
  counterAccountId: number | null;
  note: string | null;
}

export interface ChartPoint {
  date: string; // yyyy-MM-dd
  marketValueThb: number;
  netContributionThb: number;
}

export interface ChartResponse {
  points: ChartPoint[];
}

export type ChartScope = "networth" | "investment";

export interface HistoryItem {
  kind: "snapshot" | "flow";
  accountId: number;
  date: string; // yyyy-MM-dd
  snapshot: Snapshot | null;
  flow: CashFlow | null;
}

export interface HistoryResponse {
  items: HistoryItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type PlanStatus = "Active" | "Completed" | "Abandoned";

export interface PlanTranche {
  id: number;
  planId: number;
  price: number;
  budget: number;
  quantity: number;
  filled: boolean;
  slPrice: number | null;
  tpPrice: number | null;
}

export interface EntryPlan {
  id: number;
  accountId: number | null;
  symbol: string;
  currency: Currency;
  planDate: string; // yyyy-MM-dd
  status: PlanStatus;
  tranches: PlanTranche[];
}
