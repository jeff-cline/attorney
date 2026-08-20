import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRACTICE_AREAS, getArea } from "@/content/practice-areas";
import { SiloHero } from "@/components/silo-hero";
import { DualCTA } from "@/components/dual-cta";

const BASE = "https://attorney.plus";

export function generateStaticParams() {
  return PRACTICE_AREAS.map((a) => ({ area: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ area: string }> }): Promise<Metadata> {
  const { area } = await params;
  const a = getArea(area);
  if (!a) return { title: "Not found" };
  const title = `${a.name} Attorney — Find the Right Lawyer or Resolve It Fast | Attorney.plus`;
  return {
    title,
    description: a.blurb,
    alternates: { canonical: `${BASE}/attorneys/${a.slug}` },
    openGraph: { title, description: a.blurb, url: `${BASE}/attorneys/${a.slug}`, type: "article", images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description: a.blurb, images: ["/og.png"] },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const a = getArea(area);
  if (!a) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE },
          { "@type": "ListItem", position: 2, name: "Attorneys", item: `${BASE}/attorneys` },
          { "@type": "ListItem", position: 3, name: a.name, item: `${BASE}/attorneys/${a.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: a.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "LegalService",
        name: `Attorney.plus — ${a.name}`,
        description: a.blurb,
        url: `${BASE}/attorneys/${a.slug}`,
        areaServed: "US",
        disambiguatingDescription: "Attorney referral and dispute-resolution platform. Not a law firm and not legal advice.",
      },
    ],
  };

  return (
    <main className="container" style={{ maxWidth: 880, padding: "40px 24px 88px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="muted text-[13px]" aria-label="Breadcrumb">
        <Link href="/" style={{ color: "inherit" }}>Home</Link> <span aria-hidden>›</span>{" "}
        <Link href="/attorneys" style={{ color: "inherit" }}>Attorneys</Link> <span aria-hidden>›</span>{" "}
        <span style={{ color: "var(--ink)" }}>{a.name}</span>
      </nav>

      <div className="mt-4"><SiloHero accent={a.accent} monogram={a.monogram} label={`${a.name} attorneys`} /></div>

      <header className="mt-7">
        <div className="eyebrow">Find a {a.keyword}</div>
        <h1 className="mt-2 text-[clamp(28px,4.4vw,42px)]">{a.name} attorney: get matched or resolve it fast</h1>
      </header>

      <section className="mt-5 space-y-4" style={{ fontSize: 17, lineHeight: 1.65 }}>
        {a.intro.map((p, i) => <p key={i}>{p}</p>)}
      </section>

      <section className="mt-7">
        <div className="eyebrow">What this covers</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {a.subtypes.map((s) => <span key={s} className="chip chip-pending">{s}</span>)}
        </div>
      </section>

      <div className="mt-8"><DualCTA area={a.slug} /></div>

      <section className="mt-10">
        <div className="eyebrow">Frequently asked</div>
        <h2 className="mt-2 text-[26px]">{a.name} questions, answered</h2>
        <div className="mt-4 space-y-3">
          {a.faqs.map((f, i) => (
            <details key={i} className="card" style={{ padding: "18px 20px" }}>
              <summary style={{ cursor: "pointer", fontFamily: "var(--font-fraunces)", fontSize: 18, color: "var(--ink)", listStyle: "none" }}>
                {f.q}
              </summary>
              <p className="muted mt-3" style={{ fontSize: 15.5, lineHeight: 1.6 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {a.related.length > 0 && (
        <section className="mt-10">
          <div className="eyebrow">Related practice areas</div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {a.related.map((slug) => {
              const r = getArea(slug);
              if (!r) return null;
              return (
                <Link key={slug} href={`/attorneys/${slug}`} className="btn btn-outline">{r.name} →</Link>
              );
            })}
          </div>
        </section>
      )}

      <p className="muted mt-12 text-[12.5px]" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
        Attorney.plus is not a law firm and does not provide legal advice. Any fee routed to a matched attorney is a marketing fee paid by the firm. Information here is general and not a substitute for advice from a licensed attorney in your jurisdiction.
      </p>
    </main>
  );
}
