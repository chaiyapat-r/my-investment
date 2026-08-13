// All displayed money is in THB (see CLAUDE.md). Rounded to whole baht for the
// dashboard; tabular figures keep columns aligned.

const grouped = new Intl.NumberFormat("en-US");

export function thb(n: number): string {
  const r = Math.round(n);
  return (r < 0 ? "-" : "") + "฿" + grouped.format(Math.abs(r));
}

export function signedThb(n: number): string {
  const r = Math.round(n);
  return (r >= 0 ? "+" : "-") + "฿" + grouped.format(Math.abs(r));
}

export function percent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

// "2026-08-02" -> "8/2" without timezone drift.
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

// "2026-08-02" -> "2 ส.ค. 2569" (Thai, Buddhist year).
const thaiFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
export function thaiDate(iso: string): string {
  return thaiFmt.format(new Date(`${iso}T00:00:00`));
}

export function signedPercent(n: number): string {
  return `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;
}
