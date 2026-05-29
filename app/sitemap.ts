import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${site.url}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/reserver`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.url}/app`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/app/carte`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/app/reserver`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/app/fidelite`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
