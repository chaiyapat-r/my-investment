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

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except the API proxy, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
