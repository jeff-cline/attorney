import Link from "next/link";
import { notFound } from "next/navigation";
import { getArbitrationTopic } from "@/content/arbitration-topics";
import { SiloHero } from "@/components/silo-hero";
import { DualCTA } from "@/components/dual-cta";

const BASE = "https://attorney.plus";

/** Body for /arbitration/[topic]. Cross-links to sibling topics, the hub, and
 *  the attorney/lawyer directories, and funnels to Quick-Resolve. */
export async function ArbitrationSilo({ slug }: { slug: string }) {
  const t = getArbitrationTopic(slug);
  if (!t) notFound();
  const siblings = t.related.map(getArbitrationTopic).filter(Boolean) as NonNullable<ReturnType<typeof getArbitrationTopic>>[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE },
          { "@type": "ListItem", position: 2, name: "Arbitration", item: `${BASE}/arbitration` },
          { "@type": "ListItem", position: 3, name: t.name, item: `${BASE}/arbitration/${t.slug}` },
        ],
      },
      { "@type": "FAQPage", mainEntity: t.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "Article", headline: t.name, about: "arbitration", url: `${BASE}/arbitration/${t.slug}`, publisher: { "@type": "Organization", name: "Attorney.plus" } },
    ],
  };

  return (
    <main className="container" style={{ padding: "40px 24px 88px" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 auto", minWidth: 0, maxWidth: 760 }}>
          <nav className="muted text-[13px]" aria-label="Breadcrumb">
            <Link href="/" style={{ color: "inherit" }}>Home</Link> <span aria-hidden>›</span>{" "}
            <Link href="/arbitration" style={{ color: "inherit" }}>Arbitration</Link> <span aria-hidden>›</span>{" "}
            <span style={{ color: "var(--ink)" }}>{t.name}</span>
          </nav>

          <div className="mt-4"><SiloHero accent={t.accent} monogram={t.monogram} label={t.name} /></div>

          <header className="mt-7">
            <div className="eyebrow">Arbitration guide</div>
            <h1 className="mt-2 text-[clamp(27px,4.2vw,40px)]">{t.name}</h1>
          </header>

          <section className="mt-5 space-y-4" style={{ fontSize: 17, lineHeight: 1.65 }}>
            {t.intro.map((p, i) => <p key={i}>{p}</p>)}
          </section>

          <section className="mt-7">
            <div className="eyebrow">Related searches</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.clusters.map((c) => <span key={c} className="chip chip-pending">{c}</span>)}
            </div>
          </section>

          <div className="mt-8"><DualCTA arbitrable word="lawyer" /></div>

          <section className="mt-10">
            <div className="eyebrow">Frequently asked</div>
            <h2 className="mt-2 text-[26px]">{t.name} — questions answered</h2>
            <div className="mt-4 space-y-3">
              {t.faqs.map((f, i) => (
                <details key={i} className="card" style={{ padding: "18px 20px" }}>
                  <summary style={{ cursor: "pointer", fontFamily: "var(--font-fraunces)", fontSize: 18, color: "var(--ink)", listStyle: "none" }}>{f.q}</summary>
                  <p className="muted mt-3" style={{ fontSize: 15.5, lineHeight: 1.6 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {siblings.length > 0 && (
            <section className="mt-10">
              <div className="eyebrow">Keep reading</div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {siblings.map((s) => (
                  <Link key={s.slug} href={`/arbitration/${s.slug}`} className="btn btn-outline">{s.name} →</Link>
                ))}
              </div>
            </section>
          )}

          <p className="muted mt-9 text-[14px]">
            Need representation? <Link href="/attorneys" className="underline" style={{ color: "var(--brand)" }}>Find an attorney</Link> or <Link href="/lawyers" className="underline" style={{ color: "var(--brand)" }}>find a lawyer</Link> for your matter — or <Link href="/start" className="underline" style={{ color: "var(--brand)" }}>try Quick-Resolve arbitration</Link> first.
          </p>

          <p className="muted mt-8 text-[12.5px]" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            Attorney.plus is not a law firm and does not provide legal advice. This is general information about arbitration, not a substitute for advice from a licensed attorney in your jurisdiction.
          </p>
        </div>

        {/* right rail */}
        <aside className="hidden lg:block" style={{ flex: "0 0 300px", alignSelf: "flex-start", position: "sticky", top: 88 }}>
          <div style={{ width: 300, borderRadius: 14, overflow: "hidden", background: `linear-gradient(160deg, ${t.accent} 0%, var(--ink) 100%)`, color: "#fff", padding: "34px 26px" }}>
            <div className="eyebrow" style={{ color: "#e0a94b" }}>Quick-Resolve</div>
            <h3 style={{ color: "#fff", fontSize: 24, lineHeight: 1.15, marginTop: 10, textWrap: "balance" } as React.CSSProperties}>Arbitrate your dispute in days.</h3>
            <p style={{ color: "rgba(255,255,255,.82)", fontSize: 14.5, marginTop: 12, lineHeight: 1.55 }}>Both sides agree, pay a flat fee, and get a binding resolution — no lawyer required for a clear dispute.</p>
            <Link href="/start" className="btn btn-seal btn-block" style={{ marginTop: 18 }}>Start Quick-Resolve →</Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
