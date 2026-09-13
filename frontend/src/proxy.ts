import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic redirect only — NOT a security boundary. The real authorization
// gate is the .NET API ([Authorize] on every endpoint). This just keeps the UX
// clean by bouncing unauthenticated visitors to /login before rendering.
// (Next 16 renamed middleware.ts -> proxy.ts; see docs/data-model.md §5.3.)

const SESSION_COOKIE = "portfolio.session";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isLoginPage = request.nextUrl.pathname === "/login";

  // No cookie at all → bounce to login. We deliberately do NOT redirect the
  // other way (cookie present on /login → dashboard): mere cookie *presence*
  // doesn't mean the session is valid. A stale/undecryptable cookie would
  // otherwise trap the user in a /login ⇄ / redirect loop (the API returns 401,
  // the client sends them to /login, and proxy bounced them straight back).
  // Letting /login always render lets them re-authenticate and recover.
  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except the API proxy, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
