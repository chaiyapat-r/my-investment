"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

// Login form state + submit. On success does a full navigation so proxy.ts sees
// the fresh session cookie before rendering the dashboard.
export function useLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      window.location.assign("/");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
          : "เข้าสู่ระบบไม่สำเร็จ ลองใหม่อีกครั้ง",
      );
      setBusy(false);
    }
  }

  return { username, setUsername, password, setPassword, error, busy, submit };
}
