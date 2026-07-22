import type { NextConfig } from "next";

const postalLookupApi = (process.env.POSTAL_LOOKUP_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/location/lookup-postal-code",
        destination: `${postalLookupApi}/api/location/lookup-postal-code`,
      },
    ];
  },
};

export default nextConfig;
