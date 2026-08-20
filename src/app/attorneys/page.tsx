import Link from "next/link";
import type { Metadata } from "next";
import { PRACTICE_AREAS } from "@/content/practice-areas";
import { DualCTA } from "@/components/dual-cta";

const BASE = "https://attorney.plus";
const title = "Find an Attorney by Practice Area — or Resolve It Fast | Attorney.plus";
const description = "Browse attorneys by practice area — personal injury, family, criminal, real estate, employment and more. Get matched with the right lawyer, or try Quick-Resolve arbitration first.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${BASE}/attorneys` },
  openGraph: { title, description, url: `${BASE}/attorneys`, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function AttorneysHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Attorneys by practice area",
    url: `${BASE}/attorneys`,
    hasPart: PRACTICE_AREAS.map((a) => ({ "@type": "WebPage", name: `${a.name} attorney`, url: `${BASE}/attorneys/${a.slug}` })),
  };
  return (
    <main className="container" style={{ maxWidth: 1000, padding: "48px 24px 88px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-[680px]">
        <div className="eyebrow">Attorney directory</div>
        <h1 className="mt-2 text-[clamp(30px,5vw,46px)]">Find an attorney best suited to your need</h1>
        <p className="muted mt-4" style={{ fontSize: 17, lineHeight: 1.6 }}>
          Pick your situation below. Every path gives you two options: get matched with an attorney who handles your exact issue, or try Quick-Resolve arbitration first and settle it in days for a flat fee.
        </p>
      </header>

      <div className="mt-9 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {PRACTICE_AREAS.map((a) => (
          <Link key={a.slug} href={`/attorneys/${a.slug}`} className="card" style={{ display: "block", transition: "transform .12s" }}>
            <div className="flex items-center gap-3">
              <span aria-hidden style={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: 10, background: a.accent, color: "#fff", fontFamily: "var(--font-fraunces)", fontWeight: 600 }}>{a.monogram}</span>
              <h2 style={{ fontSize: 19, margin: 0 }}>{a.name}</h2>
            </div>
            <p className="muted mt-3 text-[14px]" style={{ lineHeight: 1.55 }}>{a.blurb}</p>
            <span className="mt-3 inline-block text-[14px] font-semibold" style={{ color: "var(--brand)" }}>Explore {a.name} →</span>
          </Link>
        ))}
      </div>

      <div className="mt-10"><DualCTA /></div>
    </main>
  );
}
