import type { Metadata } from "next";
import { SiloLander } from "@/components/silo-lander";

const BASE = "https://attorney.plus";
const title = "Find a Lawyer — Matched to Your Case, You Choose | Attorney.plus";
const description = "Find a lawyer for your exact situation across 100+ categories. Matched to your area, no cost to you, you approve the match. Eligible disputes resolve fast with Quick-Resolve arbitration.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${BASE}/lawyer` },
  openGraph: { title, description, url: `${BASE}/lawyer`, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function LawyerLander() {
  return <SiloLander variant="lawyer" />;
}
