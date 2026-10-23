import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Required in Next.js 16 — restricts which quality values the optimizer accepts.
    qualities: [50, 75, 90, 100],
  },
  async headers() {
    return [
      {
        source: "/:all",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; img: data: https:; style: 'self'; script: 'self'; connect: 'self'; frame-src 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;