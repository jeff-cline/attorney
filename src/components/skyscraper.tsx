import Link from "next/link";
import { VARIANT, type Variant } from "@/content/silo-copy";
import { getGroup, type ReferralCategory } from "@/content/referral-categories";

/**
 * Right-rail skyscraper ad slot (300×600) shown on every category sub-page.
 * Currently rotates two house ads (deterministic by category id, so SSR is
 * stable); swap the inner block for a real ad unit when a network is wired.
 */
export function Skyscraper({ category, variant }: { category: ReferralCategory; variant: Variant }) {
  const v = VARIANT[variant];
  const g = getGroup(category.groupSlug);
  const showJoin = category.id % 2 === 0; // alternate creative

  return (
    <aside
      className="skyscraper hidden lg:block"
      aria-label="Advertisement"
      style={{ flex: "0 0 300px", alignSelf: "flex-start", position: "sticky", top: 88 }}
    >
      {/* AD SLOT — replace this block with a real 300×600 creative when available */}
      <div style={{ width: 300, minHeight: 600, borderRadius: 14, overflow: "hidden", position: "relative", background: `linear-gradient(160deg, ${g?.accent ?? "var(--brand)"} 0%, var(--ink) 100%)`, color: "#fff", boxShadow: "0 18px 40px -24px rgba(15,42,45,.5)" }}>
        <span style={{ position: "absolute", top: 10, right: 12, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", opacity: 0.6 }}>Ad</span>
        <div style={{ padding: "40px 26px", display: "flex", flexDirection: "column", height: 600 }}>
          {showJoin ? (
            <>
              <div className="eyebrow" style={{ color: "#e0a94b" }}>For {v.plural}</div>
              <h3 style={{ color: "#fff", fontSize: 26, lineHeight: 1.15, marginTop: 12, textWrap: "balance" } as React.CSSProperties}>
                Get {category.name} referrals in your area.
              </h3>
              <p style={{ color: "rgba(255,255,255,.82)", fontSize: 14.5, marginTop: 14, lineHeight: 1.55 }}>
                Join the Attorney.plus network, pick the categories you want, and receive matched {g?.name.toLowerCase()} referrals — plus higher-intent cases from the arbitration funnel.
              </p>
              <div style={{ marginTop: "auto" }}>
                <Link href="/for-attorneys" className="btn btn-seal btn-block">Join as a {v.word} →</Link>
              </div>
            </>
          ) : (
            <>
              <div className="eyebrow" style={{ color: "#e0a94b" }}>Quick-Resolve</div>
              <h3 style={{ color: "#fff", fontSize: 26, lineHeight: 1.15, marginTop: 12, textWrap: "balance" } as React.CSSProperties}>
                Skip the wait. Resolve it in days.
              </h3>
              <p style={{ color: "rgba(255,255,255,.82)", fontSize: 14.5, marginTop: 14, lineHeight: 1.55 }}>
                Many disputes settle fast for a flat fee — no lawyer required. See if your {category.name.toLowerCase()} matter qualifies for Quick-Resolve arbitration.
              </p>
              <div style={{ marginTop: "auto" }}>
                <Link href={`/start?category=${category.slug}`} className="btn btn-seal btn-block">Try Quick-Resolve →</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
