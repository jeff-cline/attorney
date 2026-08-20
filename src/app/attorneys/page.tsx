import type { Metadata } from "next";
import { CategoryHub } from "@/components/category-hub";

const BASE = "https://attorney.plus";
const title = "Find an Attorney by Category — or Resolve It Fast | Attorney.plus";
const description = "Pick your exact situation from 100+ legal categories — accidents, malpractice, employment, family, criminal, business and more. Get matched with the right attorney, or try Quick-Resolve arbitration first.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${BASE}/attorneys` },
  openGraph: { title, description, url: `${BASE}/attorneys`, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function AttorneysHub() {
  return <CategoryHub variant="attorney" />;
}
