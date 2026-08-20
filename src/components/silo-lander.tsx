import Link from "next/link";
import { getCategory } from "@/content/referral-categories";
import { VARIANT, twin, type Variant } from "@/content/silo-copy";

const FEATURED = [
  "auto-accident", "truck-accident", "medical-malpractice", "wrongful-death",
  "workers-compensation", "dui-dwi-defense", "contested-divorce", "chapter-7-bankruptcy",
  "contract-dispute", "wrongful-termination", "slip-and-fall", "estate-planning",
];

/** SEO lead lander for /attorney and /lawyer. */
export function SiloLander({ variant }: { variant: Variant }) {
  const v = VARIANT[variant];
  const tw = VARIANT[twin(variant)];
  const feat = FEATURED.map(getCategory).filter(Boolean) as NonNullable<ReturnType<typeof getCategory>>[];

  const faqs = [
    { q: `How do I find the right ${v.word}?`, a: `Pick the category that matches your situation. Attorney.plus connects you with a ${v.word} who focuses on exactly that, in your area — and you approve the match before anything proceeds.` },
    { q: `What does it cost to get matched with a ${v.word}?`, a: `Nothing to you. We're supported by our ${v.word} network, so you're never charged a separate fee to be matched. The ${v.word} discusses their own fees with you directly.` },
    { q: `Can I resolve my dispute without a ${v.word}?`, a: `Often, yes. For a clear, bounded dispute, Quick-Resolve arbitration reaches a binding result in days for a flat fee — no ${v.word} required. If it isn't the right fit, we match you with one.` },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", name: `${v.hubTitle}`, url: `https://attorney.plus${v.landing}` },
      { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* hero */}
      <div className="dark-section">
        <div className="container" style={{ padding: "76px 24px 68px", maxWidth: 900 }}>
          <div className="eyebrow" style={{ color: "#e0a94b" }}>{v.hubTitle}</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(34px,6vw,56px)", lineHeight: 1.05, marginTop: 12, textWrap: "balance" } as React.CSSProperties}>
            The right {v.word} for your case — {v.word === "lawyer" ? "without the runaround." : "matched, not guessed."}
          </h1>
          <p style={{ color: "rgba(242,239,231,.82)", fontSize: 18, marginTop: 18, maxWidth: 640, lineHeight: 1.6 }}>
            Tell us your situation and we connect you with a {v.word} who handles exactly that, in your area. Many disputes can be resolved even faster with Quick-Resolve arbitration first — a flat fee, binding, in days.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 26 }}>
            <Link href={v.path} className="btn btn-seal btn-lg">Find a {v.word} by category</Link>
            <Link href="/start" className="btn btn-ghost-light btn-lg">Try Quick-Resolve first</Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 1000, padding: "56px 24px 40px" }}>
        {/* value props */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {[
            { t: "Matched, not guessed", d: `We route you to a ${v.word} who focuses on your exact category — not whoever paid for the top of a search page.` },
            { t: "You stay in control", d: `You review and approve the ${v.word} before anything moves forward. No obligation, no pressure.` },
            { t: "Resolve it faster", d: "Eligible disputes settle through Quick-Resolve arbitration in days for a flat fee — before you ever need to hire." },
          ].map((x) => (
            <div key={x.t} className="card">
              <h3 style={{ fontSize: 18 }}>{x.t}</h3>
              <p className="muted mt-2 text-[14.5px]" style={{ lineHeight: 1.55 }}>{x.d}</p>
            </div>
          ))}
        </div>

        {/* popular categories */}
        <section className="mt-12">
          <div className="eyebrow">Popular categories</div>
          <h2 className="mt-2 text-[27px]">Find a {v.word} by what happened</h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {feat.map((c) => (
              <Link key={c.slug} href={`${v.path}/${c.slug}`} className="chip chip-pending" style={{ fontSize: 14, padding: "8px 14px" }}>
                {c.name} {v.word}
              </Link>
            ))}
          </div>
          <p className="mt-5 text-[15px]">
            <Link href={v.path} className="underline font-semibold" style={{ color: "var(--brand)" }}>Browse all 100+ categories →</Link>
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <div className="eyebrow">Frequently asked</div>
          <h2 className="mt-2 text-[27px]">{v.Word} questions, answered</h2>
          <div className="mt-4 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="card" style={{ padding: "18px 20px" }}>
                <summary style={{ cursor: "pointer", fontFamily: "var(--font-fraunces)", fontSize: 18, color: "var(--ink)", listStyle: "none" }}>{f.q}</summary>
                <p className="muted mt-3" style={{ fontSize: 15.5, lineHeight: 1.6 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="muted mt-10 text-[13.5px]">
          Searching for {tw.word === "lawyer" ? "a" : "an"} <Link href={tw.landing} className="underline" style={{ color: "var(--brand)" }}>{tw.word}</Link> instead? Same network, same categories.
        </p>
      </div>
    </main>
  );
}
