import type { Account, AccountKind } from "./types";

// The 6 accent choices offered in the add-account modal.
export const ACCOUNT_COLORS = [
  "#6b7488", // gray
  "#5b8dbe", // blue
  "#5aa98c", // teal-green
  "#e0a458", // gold
  "#c07ba8", // purple
  "#d9534f", // red
];

// User-picked colour wins; otherwise derive from the account kind.
export function resolveAccountColor(account: Account): string {
  return account.color ?? accountColor(account.kind);
}

// Per-account accent used by sparklines and the allocation bar.
export function accountColor(kind: AccountKind): string {
  // Colours verified against the standalone mockup's computed styles.
  switch (kind) {
    case "Cash":
      return "#6b7488"; // gray
    case "FX":
      return "#5b8dbe"; // blue
    case "Equity":
      return "#5aa98c"; // teal-green
    case "Crypto":
      return "#e0a458"; // gold
    case "Liability":
      return "#d9534f"; // red
    default:
      return "#6b7488";
  }
}
