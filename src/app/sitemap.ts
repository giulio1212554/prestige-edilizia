import { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { services } from "@/data/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.prestige-edilizia.it";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/calcolatore`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookie`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const projectPages = projects.map((p) => ({
    url: `${base}/progetti/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const servicePages = services.map((s) => ({
    url: `${base}/servizi/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages, ...servicePages];
}
