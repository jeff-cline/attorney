import Link from "next/link";
import type { Metadata } from "next";
import { GROUPS, categoriesInGroup } from "@/content/referral-categories";
import { DualCTA } from "@/components/dual-cta";

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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Find an attorney by category",
    url: `${BASE}/attorneys`,
  };
  return (
    <main className="container" style={{ maxWidth: 1040, padding: "48px 24px 88px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="max-w-[720px]">
        <div className="eyebrow">Find your category</div>
        <h1 className="mt-2 text-[clamp(30px,5vw,46px)]">Pick the situation you&apos;re in</h1>
        <p className="muted mt-4" style={{ fontSize: 17, lineHeight: 1.6 }}>
          Choose the category that fits your matter. That&apos;s the same category attorneys in our network sign up to handle — so you&apos;re connected to a lawyer who does exactly this. Many disputes can be resolved even faster with Quick-Resolve arbitration first.
        </p>
      </header>

      <div className="mt-9 space-y-9">
        {GROUPS.map((g) => {
          const cats = categoriesInGroup(g.slug);
          if (cats.length === 0) return null;
          return (
            <section key={g.slug} aria-labelledby={`h-${g.slug}`}>
              <div className="flex items-center gap-3">
                <span aria-hidden style={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 9, background: g.accent, color: "#fff", fontFamily: "var(--font-fraunces)", fontSize: 13, fontWeight: 600 }}>{g.monogram}</span>
                <h2 id={`h-${g.slug}`} style={{ fontSize: 21, margin: 0 }}>{g.name}</h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {cats.map((c) => (
                  <Link key={c.slug} href={`/attorneys/${c.slug}`} className="chip chip-pending" style={{ fontSize: 13.5, padding: "7px 13px" }}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-11"><DualCTA /></div>
    </main>
  );
}
