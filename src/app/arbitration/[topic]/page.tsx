import type { Metadata } from "next";
import { ARBITRATION_TOPICS, getArbitrationTopic } from "@/content/arbitration-topics";
import { ArbitrationSilo } from "@/components/arbitration-silo";

const BASE = "https://attorney.plus";

export function generateStaticParams() {
  return ARBITRATION_TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const t = getArbitrationTopic(topic);
  if (!t) return { title: "Not found" };
  const title = `${t.name} | Attorney.plus`;
  return {
    title,
    description: t.blurb,
    alternates: { canonical: `${BASE}/arbitration/${t.slug}` },
    openGraph: { title, description: t.blurb, url: `${BASE}/arbitration/${t.slug}`, type: "article", images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: t.blurb, images: ["/og.png"] },
  };
}

export default async function ArbitrationTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  return <ArbitrationSilo slug={topic} />;
}
