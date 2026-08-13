import type { NextConfig } from "next";

// The browser only ever talks to the Next.js origin. Route Handlers under
// app/api/**/route.ts forward each request to the .NET backend server-side
// (see src/lib/api/backend.ts), which keeps the auth cookie SameSite=Strict
// (see docs/data-model.md §5.3, §7). The backend base URL is API_PROXY_URL
// (default http://localhost:5153), read inside backend.ts.
const nextConfig: NextConfig = {
  // 'standalone' builds a slim, self-contained server for the Docker image
  // (frontend/Dockerfile copies .next/standalone). But Vercel does its own file
  // tracing and standalone output breaks it (missing .nft.json). Vercel sets the
  // VERCEL env var on every build, so disable standalone there and keep it for Docker.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
