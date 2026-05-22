import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "票记",
    short_name: "票记",
    description: "宝宝喂养、大小便记录",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#1c1c1e",
    theme_color: "#1c1c1e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}