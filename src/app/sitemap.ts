import type { MetadataRoute } from "next";

import { museums } from "@/data/museums";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    ...museums.map((museum) => ({
      url: `${siteUrl}/museums/${museum.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8
    }))
  ];
}
