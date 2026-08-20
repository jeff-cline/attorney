import type { Metadata } from "next";
import { CATEGORIES, getCategory, isArbitrable } from "@/content/referral-categories";
import { CategorySilo } from "@/components/category-silo";

const BASE = "https://attorney.plus";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) return { title: "Not found" };
  const arb = isArbitrable(c);
  const title = `${c.name} Lawyer — ${arb ? "Get Matched Fast or Resolve It Yourself" : "Find the Right Lawyer for Your Case"} | Attorney.plus`;
  const description = `Find a ${c.name.toLowerCase()} lawyer suited to your case${arb ? ", or resolve an eligible dispute fast with Quick-Resolve" : ""}. Matched to your category and area — you choose.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/lawyers/${c.slug}` },
    openGraph: { title, description, url: `${BASE}/lawyers/${c.slug}`, type: "article", images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default async function LawyerCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return <CategorySilo slug={category} variant="lawyer" />;
}
