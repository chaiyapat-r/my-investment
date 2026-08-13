import { type NextRequest } from "next/server";

// Server-only. Forwards a Route Handler's request to the .NET backend, relaying
// the auth cookie both ways (incoming Cookie → backend, backend Set-Cookie →
// browser). One place owns the backend base URL and header hygiene.
const BACKEND = process.env.API_PROXY_URL ?? "http://localhost:5153";

export async function forward(request: NextRequest, backendPath: string): Promise<Response> {
  const url = `${BACKEND}/api${backendPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const method = request.method;
  const init: RequestInit = { method, headers, redirect: "manual" };
  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.text();
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    return Response.json({ error: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" }, { status: 502 });
  }

  const out = new Headers();
  const resType = res.headers.get("content-type");
  if (resType) out.set("content-type", resType);
  // Relay session cookies from login/logout back to the browser.
  for (const c of res.headers.getSetCookie?.() ?? []) out.append("set-cookie", c);

  const body = res.status === 204 ? null : await res.arrayBuffer();
  return new Response(body, { status: res.status, headers: out });
}
