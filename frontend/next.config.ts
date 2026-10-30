import type { NextConfig } from "next";

// Set by the Docker dev setup: file-change events from Windows/macOS bind mounts don't
// reach the container, so the dev server polls for changes instead.
const pollIntervalMs = Number(process.env.WATCH_POLL_INTERVAL_MS) || undefined;

// The FastAPI backend. In production builds this is fixed at build time (see frontend/Dockerfile).
const apiUrl = process.env.API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server in .next/standalone for the prod image.
  output: "standalone",
  // Hide the floating "N" dev badge; compile and runtime errors are still shown.
  devIndicators: false,
  ...(pollIntervalMs && { watchOptions: { pollIntervalMs } }),
  // The browser only talks to this site: API calls (including the admin's session cookie)
  // and uploaded images are proxied to the backend.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      { source: "/uploads/:path*", destination: `${apiUrl}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
