import type { Metadata } from "next";
import { CategoryHub } from "@/components/category-hub";

const BASE = "https://attorney.plus";
const title = "Find a Lawyer by Category — Matched to Your Case | Attorney.plus";
const description = "Find a lawyer for your exact situation across 100+ categories — accidents, malpractice, family, criminal, employment, business and more. Matched to your area, you choose. Eligible disputes can resolve fast with Quick-Resolve.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${BASE}/lawyers` },
  openGraph: { title, description, url: `${BASE}/lawyers`, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function LawyersHub() {
  return <CategoryHub variant="lawyer" />;
}
