import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/content/referral-categories";

const BASE = "https://attorney.plus";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/attorney", "/lawyer", "/attorneys", "/lawyers", "/start", "/join", "/tos", "/privacy", "/contact"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  // Both full keyword sets: attorney + lawyer.
  const categoryPages = CATEGORIES.flatMap((c) => [
    { url: `${BASE}/attorneys/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE}/lawyers/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 },
  ]);
  return [...staticPages, ...categoryPages];
}
