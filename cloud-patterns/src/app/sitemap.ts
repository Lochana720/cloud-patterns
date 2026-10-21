import type { MetadataRoute } from "next";
import { patterns } from "@/data/patterns";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 1 },
    ...patterns.map((p) => ({
      url: `${siteUrl}/patterns/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
