import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Required in Next.js 16 — restricts which quality values the optimizer accepts.
    qualities: [50, 75, 90, 100],
  },
};

export default nextConfig;
