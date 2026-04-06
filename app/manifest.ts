import type { MetadataRoute } from "next";
import { getSiteUrl, siteConfig } from "../lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#ff4fa3",
    categories: ["social", "entertainment", "productivity"],
    icons: [
      {
        src: `${siteUrl}/brand-mark.svg`,
        sizes: "any",
        type: "image/svg+xml"
      },
      {
        src: `${siteUrl}/apple-icon`,
        sizes: "180x180",
        type: "image/png"
      },
      {
        src: `${siteUrl}/icon`,
        sizes: "64x64",
        type: "image/png"
      }
    ]
  };
}
