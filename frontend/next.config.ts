import type { NextConfig } from "next";

// Set by the Docker dev setup: file-change events from Windows/macOS bind mounts don't
// reach the container, so the dev server polls for changes instead.
const pollIntervalMs = Number(process.env.WATCH_POLL_INTERVAL_MS) || undefined;

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server in .next/standalone for the prod image.
  output: "standalone",
  ...(pollIntervalMs && { watchOptions: { pollIntervalMs } }),
};

export default nextConfig;
