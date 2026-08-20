import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CATEGORIES, GROUPS } from "@/content/referral-categories";
import { arbitrationMultiplier } from "@/lib/settings";
import { registerAttorney } from "@/actions/attorney";
import { FeePicker } from "@/components/fee-picker";

const BASE = "https://attorney.plus";
const title = "Attorney Referral Program — Pick Your Cases, Set Your Fee | Attorney.plus";
const description = "Join the Attorney.plus referral network. Choose the exact case types you want, see the referral fee, and get matched with clients in your area — plus higher-intent leads from the arbitration funnel. Pay only for referrals you accept.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${BASE}/for-attorneys` },
  openGraph: { title, description, url: `${BASE}/for-attorneys`, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

type Result = { ok: true } | { ok: false; error: string } | null;

export default async function ForAttorneys() {
  const multiplier = await arbitrationMultiplier();
  const cats = CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, groupSlug: c.groupSlug, baseFee: c.baseFee }));
  const grps = GROUPS.map((g) => ({ slug: g.slug, name: g.name, accent: g.accent, monogram: g.monogram }));

  async function submit(_prev: Result, fd: FormData): Promise<Result> {
    "use server";
    const r = await registerAttorney(fd);
    if (!r.ok) return r;
    redirect("/portal");
  }

  return (
    <main>
      {/* hero */}
      <div className="dark-section">
        <div className="container" style={{ padding: "72px 24px 64px", maxWidth: 960 }}>
          <div className="eyebrow" style={{ color: "#e0a94b" }}>For attorneys & lawyers</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(34px,6vw,56px)", lineHeight: 1.05, marginTop: 12, textWrap: "balance", maxWidth: 780 } as React.CSSProperties}>
            Referrals in the cases you actually want — priced up front.
          </h1>
          <p style={{ color: "rgba(242,239,231,.82)", fontSize: 18, marginTop: 18, maxWidth: 660, lineHeight: 1.6 }}>
            No per-click guessing and no mystery pricing. Pick your practice categories, see the exact referral fee, and receive matched clients in your area — including higher-intent leads that already went through our arbitration funnel.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 26 }}>
            <a href="#join" className="btn btn-seal btn-lg">Build my referral plan</a>
            <a href="/attorney-opportunity.pdf" download className="btn btn-ghost-light btn-lg">Download the PDF ↓</a>
          </div>
        </div>
      </div>

      {/* value props */}
      <div className="container" style={{ maxWidth: 1040, padding: "56px 24px 24px" }}>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
          {[
            { t: "You choose the cases", d: "Opt into any of 100+ categories across 19 practice areas. Change your mix anytime." },
            { t: "Transparent flat fees", d: "Every category shows its referral fee before you commit. You set your minimum; bid higher to win more." },
            { t: "Two referral streams", d: `Direct matches from the finder, plus pre-qualified leads from the arbitration funnel priced at ${multiplier}% of base.` },
            { t: "You stay in control", d: "No client PII until you accept. You approve every match. Pay only for referrals you take." },
          ].map((x) => (
            <div key={x.t} className="card">
              <h3 style={{ fontSize: 17 }}>{x.t}</h3>
              <p className="muted mt-2 text-[14px]" style={{ lineHeight: 1.55 }}>{x.d}</p>
            </div>
          ))}
        </div>

        {/* how it works */}
        <section className="mt-12">
          <div className="eyebrow">How it works</div>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            {[
              ["1", "Pick categories", "Select the case types you want referrals for and see the fee for each."],
              ["2", "Create your account", "Add your firm and bar state. Opt into email alerts and post-arbitration leads."],
              ["3", "Get matched", "When a client in your area picks your category, you get the referral in real time."],
              ["4", "Accept & work", "Review the match with no upfront PII, accept the ones you want, and manage them in your portal."],
            ].map(([n, t, d]) => (
              <div key={n} className="card">
                <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 8, background: "var(--brand)", color: "#fff", fontFamily: "var(--font-fraunces)", fontWeight: 600 }}>{n}</span>
                <h3 className="mt-3" style={{ fontSize: 16 }}>{t}</h3>
                <p className="muted mt-1.5 text-[13.5px]" style={{ lineHeight: 1.5 }}>{d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* interactive picker + signup */}
      <div id="join" className="container" style={{ maxWidth: 1040, padding: "40px 24px 40px", scrollMarginTop: 80 }}>
        <FeePicker groups={grps} categories={cats} multiplier={multiplier} action={submit} />
      </div>

      <div className="container" style={{ maxWidth: 1040, padding: "0 24px 72px" }}>
        <p className="muted text-[12.5px]" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          Attorney.plus is not a law firm. Referral fees are marketing fees and do not constitute fee-splitting for legal services; attorneys are responsible for compliance with their jurisdiction&apos;s rules of professional conduct. Prefer to talk first? <Link href="/contact" className="underline" style={{ color: "var(--brand)" }}>Contact us</Link>.
        </p>
      </div>
    </main>
  );
}
