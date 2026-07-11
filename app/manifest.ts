import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pull",
    short_name: "Pull",
    description: "Supabase, PWA, and Leaflet demo app",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}