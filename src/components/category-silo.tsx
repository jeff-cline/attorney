import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory, getGroup, categoriesInGroup, isArbitrable, an } from "@/content/referral-categories";
import { VARIANT, copyFor, twin, type Variant } from "@/content/silo-copy";
import { SiloHero } from "@/components/silo-hero";
import { DualCTA } from "@/components/dual-cta";
import { Skyscraper } from "@/components/skyscraper";

const BASE = "https://attorney.plus";

/** Shared body for /attorneys/[category] and /lawyers/[category]. Content is
 *  variant-specific (unique copy); layout, cross-linking, and JSON-LD are shared. */
export async function CategorySilo({ slug, variant }: { slug: string; variant: Variant }) {
  const c = getCategory(slug);
  if (!c) notFound();
  const g = getGroup(c.groupSlug)!;
  const v = VARIANT[variant];
  const tw = VARIANT[twin(variant)];
  const arb = isArbitrable(c);
  const { intro, faqs } = copyFor(variant);
  const intros = intro(c);
  const questions = faqs(c);
  const siblings = categoriesInGroup(c.groupSlug).filter((x) => x.slug !== c.slug).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE },
          { "@type": "ListItem", position: 2, name: v.hubTitle, item: `${BASE}${v.path}` },
          { "@type": "ListItem", position: 3, name: c.name, item: `${BASE}${v.path}/${c.slug}` },
        ],
      },
      { "@type": "FAQPage", mainEntity: questions.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      {
        "@type": "LegalService",
        name: `Attorney.plus — ${c.name} ${v.word}`,
        description: `${v.Word} referral${arb ? " and dispute resolution" : ""} for ${c.name} matters. Not a law firm and not legal advice.`,
        url: `${BASE}${v.path}/${c.slug}`,
        areaServed: "US",
      },
    ],
  };

  return (
    <main className="container" style={{ padding: "40px 24px 88px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* main column */}
        <div style={{ flex: "1 1 auto", minWidth: 0, maxWidth: 760 }}>
          <nav className="muted text-[13px]" aria-label="Breadcrumb">
            <Link href="/" style={{ color: "inherit" }}>Home</Link> <span aria-hidden>›</span>{" "}
            <Link href={v.path} style={{ color: "inherit" }}>{v.hubTitle}</Link> <span aria-hidden>›</span>{" "}
            <span style={{ color: "var(--ink)" }}>{c.name}</span>
          </nav>

          <div className="mt-4"><SiloHero accent={g.accent} monogram={g.monogram} label={`${c.name} ${v.plural}`} /></div>

          <header className="mt-7">
            <div className="eyebrow">{g.name} · find {an(c.name)} {c.name.toLowerCase()} {v.word}</div>
            <h1 className="mt-2 text-[clamp(27px,4.2vw,40px)]">
              {c.name} {v.word}: {arb ? "get matched or resolve it fast" : "get matched with the right " + v.word}
            </h1>
          </header>

          {/* twin cross-link — the OTHER powerful keyword */}
          <p className="muted mt-3 text-[14px]">
            Prefer to search by &ldquo;{tw.word}&rdquo;? See <Link href={`${tw.path}/${c.slug}`} className="underline" style={{ color: "var(--brand)" }}>{c.name} {tw.plural}</Link>.
          </p>

          <section className="mt-5 space-y-4" style={{ fontSize: 17, lineHeight: 1.65 }}>
            {intros.map((p, i) => <p key={i}>{p}</p>)}
          </section>

          <div className="mt-8"><DualCTA category={c.slug} arbitrable={arb} word={v.word} /></div>

          <section className="mt-10">
            <div className="eyebrow">Frequently asked</div>
            <h2 className="mt-2 text-[26px]">{c.name} {v.word} questions, answered</h2>
            <div className="mt-4 space-y-3">
              {questions.map((f, i) => (
                <details key={i} className="card" style={{ padding: "18px 20px" }}>
                  <summary style={{ cursor: "pointer", fontFamily: "var(--font-fraunces)", fontSize: 18, color: "var(--ink)", listStyle: "none" }}>{f.q}</summary>
                  <p className="muted mt-3" style={{ fontSize: 15.5, lineHeight: 1.6 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {siblings.length > 0 && (
            <section className="mt-10">
              <div className="eyebrow">More {g.name.toLowerCase()} {v.plural}</div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {siblings.map((s) => (
                  <Link key={s.slug} href={`${v.path}/${s.slug}`} className="btn btn-outline">{s.name} →</Link>
                ))}
              </div>
            </section>
          )}

          <p className="muted mt-12 text-[12.5px]" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            Attorney.plus is not a law firm and does not provide legal advice. Any fee routed to a matched {v.word} is a marketing fee. Information here is general and not a substitute for advice from a licensed {v.word} in your jurisdiction.
          </p>
        </div>

        {/* right rail */}
        <Skyscraper category={c} variant={variant} />
      </div>
    </main>
  );
}
