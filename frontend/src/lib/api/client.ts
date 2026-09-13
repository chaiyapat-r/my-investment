// Client-side API helper. Calls the same-origin /api/* Route Handlers (see
// app/api/**/route.ts), which forward to the .NET backend server-side. That keeps
// the auth cookie SameSite=Strict. `credentials: "include"` sends/receives it.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    // A 401 on any non-auth call means the session is gone (expired, or the
    // server's cookie-encryption keys changed). Bounce to /login from wherever
    // the user is so they can recover, instead of leaving the page retrying a
    // call that will never succeed. Auth endpoints are excluded so a wrong
    // password on /login surfaces as an error rather than a redirect.
    if (
      res.status === 401 &&
      !path.startsWith("/auth/") &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.assign("/login");
    }

    let message = res.statusText;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // no JSON body
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
