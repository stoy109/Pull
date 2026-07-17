import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pull",
    short_name: "Pull",
    description: "Platform kolaborasi untuk UMKM dan pekerja.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf7",
    theme_color: "#145c46",
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
