import type { NextConfig } from "next";

// The browser only ever talks to the Next.js origin. Route Handlers under
// app/api/**/route.ts forward each request to the .NET backend server-side
// (see src/lib/api/backend.ts), which keeps the auth cookie SameSite=Strict
// (see docs/data-model.md §5.3, §7). The backend base URL is API_PROXY_URL
// (default http://localhost:5153), read inside backend.ts.
const nextConfig: NextConfig = {
  output: "standalone", // slim, self-contained server build for Docker
};

export default nextConfig;
