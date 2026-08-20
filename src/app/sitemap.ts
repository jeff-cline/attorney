import type { MetadataRoute } from "next";
import { PRACTICE_AREAS } from "@/content/practice-areas";

const BASE = "https://attorney.plus";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/attorneys", "/start", "/join", "/tos", "/privacy", "/contact"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const areaPages = PRACTICE_AREAS.map((a) => ({
    url: `${BASE}/attorneys/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [...staticPages, ...areaPages];
}
