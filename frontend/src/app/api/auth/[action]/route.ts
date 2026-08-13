import { type NextRequest } from "next/server";
import { forward } from "@/lib/api/backend";

// Covers /api/auth/login, /logout, /me — forwards to the backend, relaying the
// session cookie (Set-Cookie on login/logout) back to the browser.
type Ctx = { params: Promise<{ action: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { action } = await ctx.params;
  return forward(req, `/auth/${action}`);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { action } = await ctx.params;
  return forward(req, `/auth/${action}`);
}
