import type { ChartPoint } from "@/lib/types";

// Reduce a chart series to the headline figures. The gap between market value
// and net contribution is profit (the whole point of the app).
export function summarise(points: ChartPoint[]) {
  const last = points.at(-1);
  const prev = points.at(-2);
  return {
    value: last?.marketValueThb ?? 0,
    prevValue: prev?.marketValueThb ?? 0,
    netContribution: last?.netContributionThb ?? 0,
    change: last && prev ? last.marketValueThb - prev.marketValueThb : 0,
    profit: last ? last.marketValueThb - last.netContributionThb : 0,
  };
}
