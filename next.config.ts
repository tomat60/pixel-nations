import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    NEXT_PUBLIC_VILLAGE_V2: process.env.NEXT_PUBLIC_VILLAGE_V2 ?? "1",
  },
};

export default nextConfig;
