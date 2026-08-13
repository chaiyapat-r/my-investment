import { percent, thb } from "@/lib/format";
import { resolveAccountColor } from "@/lib/colors";
import type { AccountRow } from "../DashboardModule.types";

// "สัดส่วนพอร์ต": a stacked bar + per-account value and share.
export function AllocationPanel({
  rows,
  allocationTotal,
}: {
  rows: AccountRow[];
  allocationTotal: number;
}) {
  const alloc = (v: number) => (allocationTotal > 0 ? Math.max(v, 0) / allocationTotal : 0);

  return (
    <section>
      <h2 className="mb-3 text-sm text-dim">สัดส่วนพอร์ต</h2>
      <div className="rounded-[14px] border border-border bg-card p-4">
        <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-row">
          {rows.map((row) => (
            <div
              key={row.account.id}
              style={{ width: `${alloc(row.value) * 100}%`, background: resolveAccountColor(row.account) }}
            />
          ))}
        </div>
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <li key={row.account.id} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: resolveAccountColor(row.account) }}
              />
              <span className="text-text">{row.account.name}</span>
              <span className="num ml-auto text-text">{thb(row.value)}</span>
              <span className="num w-14 text-right text-dim">{percent(alloc(row.value))}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
