"use client";

import { useLogin } from "./hooks/useLogin";

// Single-user password gate. The real authorization lives in the .NET API;
// this is just the sign-in screen.
export function LoginModule() {
  const { username, setUsername, password, setPassword, error, busy, submit } = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="num mb-2 text-xs uppercase tracking-[0.18em] text-faint">
            Portfolio Tracker
          </div>
          <h1 className="disp text-2xl font-bold text-text">เข้าสู่ระบบ</h1>
        </div>

        <form onSubmit={submit} className="rounded-lg border border-border bg-card p-6">
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm text-dim">ชื่อผู้ใช้</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              className="w-full rounded border border-border-soft bg-row px-3 py-2 text-text outline-none focus-visible:border-gold"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1.5 block text-sm text-dim">รหัสผ่าน</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded border border-border-soft bg-row px-3 py-2 text-text outline-none focus-visible:border-gold"
            />
          </label>

          {error && (
            <p className="mb-4 text-sm text-loss" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-gold py-2.5 font-medium text-[#14171e] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
