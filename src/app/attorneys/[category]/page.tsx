import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CATEGORIES,
  getCategory,
  getGroup,
  categoriesInGroup,
  isArbitrable,
  categoryIntro,
  categoryFaqs,
} from "@/content/referral-categories";
import { SiloHero } from "@/components/silo-hero";
import { DualCTA } from "@/components/dual-cta";

const BASE = "https://attorney.plus";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) return { title: "Not found" };
  const arb = isArbitrable(c);
  const title = `${c.name} Attorney — ${arb ? "Resolve It Fast or Get Matched" : "Get Matched With the Right Lawyer"} | Attorney.plus`;
  const description = `${c.name}: understand your options and ${arb ? "resolve it fast with Quick-Resolve or " : ""}get matched with a ${c.name.toLowerCase()} attorney best suited to your need.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/attorneys/${c.slug}` },
    openGraph: { title, description, url: `${BASE}/attorneys/${c.slug}`, type: "article", images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  const g = getGroup(c.groupSlug)!;
  const arb = isArbitrable(c);
  const intro = categoryIntro(c);
  const faqs = categoryFaqs(c);
  const siblings = categoriesInGroup(c.groupSlug).filter((x) => x.slug !== c.slug).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE },
          { "@type": "ListItem", position: 2, name: "Attorneys", item: `${BASE}/attorneys` },
          { "@type": "ListItem", position: 3, name: c.name, item: `${BASE}/attorneys/${c.slug}` },
        ],
      },
      { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      {
        "@type": "LegalService",
        name: `Attorney.plus — ${c.name}`,
        description: `Attorney referral${arb ? " and dispute resolution" : ""} for ${c.name} matters. Not a law firm and not legal advice.`,
        url: `${BASE}/attorneys/${c.slug}`,
        areaServed: "US",
      },
    ],
  };

  return (
    <main className="container" style={{ maxWidth: 880, padding: "40px 24px 88px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="muted text-[13px]" aria-label="Breadcrumb">
        <Link href="/" style={{ color: "inherit" }}>Home</Link> <span aria-hidden>›</span>{" "}
        <Link href="/attorneys" style={{ color: "inherit" }}>Attorneys</Link> <span aria-hidden>›</span>{" "}
        <span style={{ color: "var(--ink)" }}>{c.name}</span>
      </nav>

      <div className="mt-4"><SiloHero accent={g.accent} monogram={g.monogram} label={`${c.name} attorneys`} /></div>

      <header className="mt-7">
        <div className="eyebrow">{g.name} · find a {c.name.toLowerCase()} attorney</div>
        <h1 className="mt-2 text-[clamp(27px,4.2vw,40px)]">
          {c.name} attorney: {arb ? "get matched or resolve it fast" : "get matched with the right lawyer"}
        </h1>
      </header>

      <section className="mt-5 space-y-4" style={{ fontSize: 17, lineHeight: 1.65 }}>
        {intro.map((p, i) => <p key={i}>{p}</p>)}
      </section>

      <div className="mt-8"><DualCTA category={c.slug} arbitrable={arb} /></div>

      <section className="mt-10">
        <div className="eyebrow">Frequently asked</div>
        <h2 className="mt-2 text-[26px]">{c.name} questions, answered</h2>
        <div className="mt-4 space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="card" style={{ padding: "18px 20px" }}>
              <summary style={{ cursor: "pointer", fontFamily: "var(--font-fraunces)", fontSize: 18, color: "var(--ink)", listStyle: "none" }}>{f.q}</summary>
              <p className="muted mt-3" style={{ fontSize: 15.5, lineHeight: 1.6 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {siblings.length > 0 && (
        <section className="mt-10">
          <div className="eyebrow">More {g.name.toLowerCase()} categories</div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {siblings.map((s) => (
              <Link key={s.slug} href={`/attorneys/${s.slug}`} className="btn btn-outline">{s.name} →</Link>
            ))}
          </div>
        </section>
      )}

      <p className="muted mt-12 text-[12.5px]" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
        Attorney.plus is not a law firm and does not provide legal advice. Any fee routed to a matched attorney is a marketing fee. Information here is general and not a substitute for advice from a licensed attorney in your jurisdiction.
      </p>
    </main>
  );
}
