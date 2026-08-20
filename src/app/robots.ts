import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/dashboard", "/api"] }],
    sitemap: "https://attorney.plus/sitemap.xml",
    host: "https://attorney.plus",
  };
}
