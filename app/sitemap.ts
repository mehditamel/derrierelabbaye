import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/* Pas de `lastModified` : une date régénérée à chaque build serait factice
   (Google apprend à ignorer les sitemaps qui « changent » sans changer). */
export default function sitemap(): MetadataRoute.Sitemap {
  // Seules les pages publiques indexables. La coque PWA /app/* est en noindex.
  return [
    { url: `${site.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/reserver`, changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${site.url}/quartier-saint-victor`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${site.url}/mentions-legales`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site.url}/confidentialite`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
