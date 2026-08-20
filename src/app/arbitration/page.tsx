import Link from "next/link";
import type { Metadata } from "next";
import { ARBITRATION_SECTIONS, arbitrationTopicsInSection } from "@/content/arbitration-topics";
import { DualCTA } from "@/components/dual-cta";

const BASE = "https://attorney.plus";
const title = "Arbitration — What It Is, How It Works & Your Options | Attorney.plus";
const description = "A plain-English guide to arbitration: what it is, arbitration vs. mediation, binding and forced arbitration, agreements and clauses, the process and cost, and how to resolve your dispute fast with Quick-Resolve.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${BASE}/arbitration` },
  openGraph: { title, description, url: `${BASE}/arbitration`, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

export default function ArbitrationHub() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Arbitration guide",
    url: `${BASE}/arbitration`,
    about: "arbitration",
  };
  return (
    <main className="container" style={{ maxWidth: 1000, padding: "48px 24px 88px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-[720px]">
        <div className="eyebrow">Arbitration guide</div>
        <h1 className="mt-2 text-[clamp(30px,5vw,46px)]">Everything you need to know about arbitration</h1>
        <p className="muted mt-4" style={{ fontSize: 17, lineHeight: 1.6 }}>
          Arbitration is a private, often faster and cheaper alternative to a lawsuit. Learn what it is, how it differs from mediation and court, what an arbitration agreement means, and what the process costs — then resolve an eligible dispute in days with Quick-Resolve.
        </p>
        <p className="mt-3 text-[14px]">
          Ready now? <Link href="/start" className="underline font-semibold" style={{ color: "var(--brand)" }}>Try Quick-Resolve arbitration</Link> · <Link href="/attorneys" className="underline" style={{ color: "var(--brand)" }}>Find an attorney</Link> · <Link href="/lawyers" className="underline" style={{ color: "var(--brand)" }}>Find a lawyer</Link>
        </p>
      </header>

      <div className="mt-9 space-y-9">
        {ARBITRATION_SECTIONS.map((section) => {
          const topics = arbitrationTopicsInSection(section);
          if (!topics.length) return null;
          return (
            <section key={section} aria-labelledby={`h-${section}`}>
              <h2 id={`h-${section}`} className="text-[21px]">{section}</h2>
              <div className="mt-3 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                {topics.map((t) => (
                  <Link key={t.slug} href={`/arbitration/${t.slug}`} className="card" style={{ display: "block" }}>
                    <div className="flex items-center gap-3">
                      <span aria-hidden style={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 9, background: t.accent, color: "#fff", fontFamily: "var(--font-fraunces)", fontSize: 13, fontWeight: 600 }}>{t.monogram}</span>
                      <h3 style={{ fontSize: 16.5, margin: 0 }}>{t.name}</h3>
                    </div>
                    <p className="muted mt-2.5 text-[13.5px]" style={{ lineHeight: 1.5 }}>{t.blurb}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-11"><DualCTA arbitrable word="lawyer" /></div>
    </main>
  );
}
