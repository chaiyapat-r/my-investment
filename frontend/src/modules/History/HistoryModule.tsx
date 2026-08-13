"use client";

import type { Account } from "@/lib/types";
import { Loading } from "@/components/ui/Spinner";
import { EditSnapshotModal } from "@/modules/Tracking/components/EditSnapshotModal";
import { CashFlowModal } from "@/modules/Tracking/components/CashFlowModal";
import { useHistory } from "./hooks/useHistory";
import { HistoryFilters } from "./components/HistoryFilters";
import { HistoryRow } from "./components/HistoryRow";
import { Pagination } from "./components/Pagination";

// Combined snapshot + cash-flow ledger of all accounts, as a filtered,
// paginated table with inline edit/delete. Rendered as a dashboard tab.
export function HistoryModule({
  accounts,
  refreshKey,
  onChanged,
}: {
  accounts: Account[];
  refreshKey?: number;
  onChanged: () => void;
}) {
  const h = useHistory(refreshKey, onChanged);
  const acctOf = (id: number) => accounts.find((a) => a.id === id);

  return (
    <section>
      <HistoryFilters
        accounts={accounts}
        accountId={h.accountId}
        type={h.type}
        total={h.total}
        onAccount={h.changeAccount}
        onType={h.changeType}
      />

      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="bg-[#12151c]">
                <Th className="w-[130px]">วันที่</Th>
                <Th>บัญชี</Th>
                <Th>ประเภท</Th>
                <Th>รายละเอียด</Th>
                <Th right>จำนวน (฿)</Th>
                <Th>โน้ต</Th>
                <Th className="w-[70px]"> </Th>
              </tr>
            </thead>
            <tbody>
              {h.loading ? (
                <tr>
                  <td colSpan={7} className="p-9">
                    <Loading />
                  </td>
                </tr>
              ) : !h.data || h.data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-9 text-center text-sm text-faint">
                    ไม่มีรายการ
                  </td>
                </tr>
              ) : (
                h.data.items.map((item) => {
                  const rowId = item.kind === "snapshot" ? item.snapshot!.id : item.flow!.id;
                  const account = acctOf(item.accountId);
                  return (
                    <HistoryRow
                      key={`${item.kind}-${rowId}`}
                      item={item}
                      account={account}
                      deleting={h.deletingKey === `${item.kind}-${rowId}`}
                      onEdit={() =>
                        account &&
                        (item.kind === "snapshot"
                          ? h.setEditSnap({ snapshot: item.snapshot!, account })
                          : h.setEditFlow({ flow: item.flow!, account }))
                      }
                      onDelete={() => h.del(item.kind, rowId)}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        total={h.total}
        totalPages={h.totalPages}
        page={h.page}
        pageSize={h.pageSize}
        start={h.start}
        end={h.end}
        onPage={h.setPage}
        onPageSize={h.changePageSize}
      />

      {h.editSnap && (
        <EditSnapshotModal
          snapshot={h.editSnap.snapshot}
          account={h.editSnap.account}
          onClose={() => h.setEditSnap(null)}
          onSaved={h.afterChange}
        />
      )}
      {h.editFlow && (
        <CashFlowModal
          accounts={[h.editFlow.account]}
          flow={h.editFlow.flow}
          onClose={() => h.setEditFlow(null)}
          onSaved={h.afterChange}
        />
      )}
    </section>
  );
}

function Th({
  children,
  right,
  className = "",
}: {
  children: React.ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <th
      className={`whitespace-nowrap border-b border-border px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-faint ${
        right ? "text-right" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}
