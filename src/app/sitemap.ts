import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/content/referral-categories";

const BASE = "https://attorney.plus";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/attorneys", "/start", "/join", "/tos", "/privacy", "/contact"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const categoryPages = CATEGORIES.map((c) => ({
    url: `${BASE}/attorneys/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [...staticPages, ...categoryPages];
}
