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
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
