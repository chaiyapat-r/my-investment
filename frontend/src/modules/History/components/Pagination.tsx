"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// Page-number list with ellipses: always show first, last, and the current
// page's neighbours. Returns page numbers plus "…" gap markers.
function pageList(current: number, total: number): (number | "…")[] {
  const keep = new Set([1, total, current - 1, current, current + 1]);
  const out: (number | "…")[] = [];
  let last = 0;
  for (let i = 1; i <= total; i++) {
    if (!keep.has(i) || i < 1) continue;
    if (i - last > 1) out.push("…");
    out.push(i);
    last = i;
  }
  return out;
}

export function Pagination({
  total,
  totalPages,
  page,
  pageSize,
  start,
  end,
  onPage,
  onPageSize,
}: {
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  start: number;
  end: number;
  onPage: (p: number) => void;
  onPageSize: (n: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="num text-xs text-faint">
          {total === 0 ? "ไม่มีรายการ" : `แสดง ${start}–${end} จาก ${total} รายการ`}
        </span>
        <label className="flex items-center gap-1.5 text-xs text-faint">
          <span>ต่อหน้า</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="num rounded-md border border-border-soft bg-row px-2 py-1 text-text outline-none focus-visible:border-gold"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      {total > 0 && (
        <div className="flex items-center gap-1">
          <PageBtn onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="ก่อนหน้า">
            <ChevronLeft size={15} />
          </PageBtn>
          {pageList(page, totalPages).map((num, i) =>
            num === "…" ? (
              <span key={`gap-${i}`} className="num px-1 text-sm text-faint">
                …
              </span>
            ) : (
              <PageBtn key={num} onClick={() => onPage(num)} active={num === page}>
                {num}
              </PageBtn>
            ),
          )}
          <PageBtn onClick={() => onPage(page + 1)} disabled={page === totalPages} aria-label="ถัดไป">
            <ChevronRight size={15} />
          </PageBtn>
        </div>
      )}
    </div>
  );
}

function PageBtn({
  children,
  onClick,
  active,
  disabled,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`num flex h-[34px] min-w-[34px] items-center justify-center rounded-lg border px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? "border-gold bg-gold font-semibold text-[#14171e]"
          : "border-border bg-card text-dim hover:border-faint hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
