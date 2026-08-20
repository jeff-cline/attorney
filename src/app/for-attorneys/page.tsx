import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { GROUPS } from "@/content/referral-categories";
import { arbitrationMultiplier, PREMIUM_PRICE_MONTHLY } from "@/lib/settings";
import { registerAttorney } from "@/actions/attorney";
import { AttorneyJoin } from "@/components/attorney-join";

const BASE = "https://attorney.plus";
const title = "Attorney Referral Program — Free Account, Pick Your Cases | Attorney.plus";
const description = "Create a free account to see referral fees for 100+ case types, pick the cases you want, and get matched with clients in your area. Premium Partners get exclusive rights to a niche in their state.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${BASE}/for-attorneys` },
  openGraph: { title, description, url: `${BASE}/for-attorneys`, images: [{ url: "/og.png", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
};

type Result = { ok: true } | { ok: false; error: string } | null;

export default async function ForAttorneys() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role === "attorney" || role === "admin") redirect("/portal"); // already in — go to the real thing

  const multiplier = await arbitrationMultiplier();

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
        <div className="container" style={{ padding: "68px 24px 60px", maxWidth: 1040 }}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <div className="eyebrow" style={{ color: "#e0a94b" }}>For attorneys & lawyers</div>
              <h1 style={{ color: "#fff", fontSize: "clamp(32px,5vw,50px)", lineHeight: 1.06, marginTop: 12, textWrap: "balance" } as React.CSSProperties}>
                Referrals in the cases you actually want.
              </h1>
              <p style={{ color: "rgba(242,239,231,.82)", fontSize: 17, marginTop: 16, maxWidth: 520, lineHeight: 1.6 }}>
                Create a free account to unlock referral fees for 100+ case types, pick the cases you want, and get matched with clients in your area — plus higher-intent leads from our arbitration funnel.
              </p>
              <ul style={{ marginTop: 18, color: "rgba(242,239,231,.85)", fontSize: 14.5, lineHeight: 1.9, listStyle: "none" }}>
                <li>✓ Free to join — no card required</li>
                <li>✓ Transparent flat fees, shown before you commit</li>
                <li>✓ Pay only for referrals you accept</li>
              </ul>
              <a href="/attorney-opportunity.pdf" download className="btn btn-ghost-light mt-6">Download the PDF ↓</a>
            </div>

            {/* the gate: free multi-step signup */}
            <div id="join" style={{ scrollMarginTop: 80 }}>
              <div className="eyebrow" style={{ color: "#e0a94b" }}>Create your free account</div>
              <div className="mt-3">
                <AttorneyJoin action={submit} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* value props */}
      <div className="container" style={{ maxWidth: 1040, padding: "52px 24px 12px" }}>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))" }}>
          {[
            { t: "You choose the cases", d: "Opt into any of 100+ categories across 19 practice areas. Change your mix anytime — inside your account." },
            { t: "Transparent flat fees", d: "Every category has a set referral fee. Create your free account to see them and set your plan." },
            { t: "Two referral streams", d: `Direct matches from the finder, plus pre-qualified leads from the arbitration funnel at ${multiplier}% of base.` },
            { t: "You stay in control", d: "No client PII until you accept. You approve every match. Pay only for referrals you take." },
          ].map((x) => (
            <div key={x.t} className="card">
              <h3 style={{ fontSize: 17 }}>{x.t}</h3>
              <p className="muted mt-2 text-[14px]" style={{ lineHeight: 1.55 }}>{x.d}</p>
            </div>
          ))}
        </div>

        {/* locked teaser — categories visible, fees behind the free account */}
        <section className="mt-12">
          <div className="eyebrow">Inside your free account</div>
          <h2 className="mt-2 text-[27px]">See the referral fee for every case type</h2>
          <p className="muted mt-2 text-[14.5px]" style={{ maxWidth: 620 }}>A free account unlocks the full rate card and the interactive planner. A preview of the practice areas you can opt into:</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <span key={g.slug} className="chip chip-pending" style={{ fontSize: 13.5, padding: "7px 13px" }}>{g.name}</span>
            ))}
          </div>
          <div className="card mt-5 flex flex-wrap items-center justify-between gap-3" style={{ borderStyle: "dashed" }}>
            <span className="text-[14.5px]" style={{ fontFamily: "var(--font-geist-sans)" }}>🔒 Referral fees & the interactive planner unlock with your free account.</span>
            <a href="#join" className="btn btn-brand">Create free account</a>
          </div>
        </section>

        {/* premium partner */}
        <section className="mt-12">
          <div className="card" style={{ background: "var(--ink)", color: "#fff", borderColor: "transparent" }}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div style={{ maxWidth: 560 }}>
                <div className="eyebrow" style={{ color: "#e0a94b" }}>Premium Partner</div>
                <h2 style={{ color: "#fff", fontSize: 26, marginTop: 8 }}>Own your niche in your state.</h2>
                <p style={{ color: "rgba(255,255,255,.82)", fontSize: 15.5, marginTop: 10, lineHeight: 1.6 }}>
                  Go exclusive: for <b>${PREMIUM_PRICE_MONTHLY.toLocaleString()}/month</b> you lock a single practice niche in your state — we remove every other attorney from that category in your market, so those referrals come only to you.
                </p>
                <p style={{ color: "rgba(255,255,255,.6)", fontSize: 12.5, marginTop: 10 }}>Available inside your account. Set up your free account first, then upgrade.</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-fraunces)", fontSize: 40, color: "#e0a94b", lineHeight: 1 }}>${PREMIUM_PRICE_MONTHLY.toLocaleString()}</div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>per month · per niche</div>
              </div>
            </div>
          </div>
        </section>

        <p className="muted mt-12 text-[12.5px]" style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          Attorney.plus is not a law firm. Referral fees are marketing fees and do not constitute fee-splitting for legal services; attorneys are responsible for compliance with their jurisdiction&apos;s rules of professional conduct. Prefer to talk first? <Link href="/contact" className="underline" style={{ color: "var(--brand)" }}>Contact us</Link>.
        </p>
      </div>
    </main>
  );
}
