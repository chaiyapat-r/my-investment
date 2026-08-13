"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, LogOut, Menu, PieChart, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

// Brand mark: two lines with a gap between them — the app's core idea (market
// value vs. net contribution, the gap is profit). Replaces the old "พ" tile.
function BrandMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-gold/35 bg-gold/10">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <polyline
          points="3,15 9,11 14,13 21,5"
          stroke="var(--color-teal)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="3,19 9,17.5 14,17 21,14.5"
          stroke="var(--color-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0.1 3.4"
        />
      </svg>
    </span>
  );
}

function SidebarContent({
  onNavigate,
  inDrawer,
}: {
  onNavigate?: () => void;
  inDrawer?: boolean; // reserve room on the right so the logout icon clears the drawer's ✕
}) {
  const pathname = usePathname();

  async function logout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      window.location.assign("/login");
    }
  }

  const items = [
    { href: "/", label: "Portfolio", icon: PieChart },
    { href: "/planner", label: "Entry plan", icon: Layers },
  ];

  return (
    <>
      <div className={`mb-8 flex items-center gap-2.5 ${inDrawer ? "pr-12" : ""}`}>
        <BrandMark />
        <div className="min-w-0">
          <div className="disp text-sm font-bold text-text">พอร์ตของฉัน</div>
          <div className="num text-[10px] uppercase tracking-wider text-faint">Net Worth</div>
        </div>
        <button
          onClick={logout}
          aria-label="ออกจากระบบ"
          title="ออกจากระบบ"
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-faint transition-colors hover:bg-loss/10 hover:text-loss"
        >
          <LogOut size={18} />
        </button>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                active ? "bg-card text-gold" : "text-dim hover:text-text"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the drawer on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* desktop */}
      <aside className="hidden w-[272px] shrink-0 flex-col border-r border-border-soft p-6 lg:flex">
        <SidebarContent />
      </aside>

      {/* mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="เปิดเมนู"
        className="fixed left-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-dim transition-colors hover:text-text lg:hidden"
      >
        <Menu size={18} />
      </button>

      {/* mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* mobile drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[272px] flex-col border-r border-border-soft bg-bg p-6 transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="ปิดเมนู"
          className="absolute right-3 top-3 rounded p-1 text-faint transition-colors hover:text-text"
        >
          <X size={18} />
        </button>
        <SidebarContent onNavigate={() => setOpen(false)} inDrawer />
      </aside>
    </>
  );
}
