import Link from "next/link";
import type { Metadata } from "next";
import { ProblemChart, CostChart, RevenueChart } from "@/components/investor-charts";
import { InvestorAccessForm } from "@/components/investor-access-form";
import { PrintButton } from "@/components/print-button";

export const metadata: Metadata = {
  title: "Attorney.plus — Investor Overview",
  description: "The legal system is clogged with disputes that should have been settled or arbitrated. Attorney.plus is the technology that clears the backlog — and monetizes the connection to counsel.",
};

export default function InvestorLanding() {
  return (
    <main>
      {/* HERO */}
      <section className="dark-section" style={{ padding: "72px 0 60px" }}>
        <div className="container" style={{ maxWidth: 980 }}>
          <div className="eyebrow" style={{ color: "var(--seal-2)" }}>Investor overview</div>
          <h1 className="mt-3 text-white" style={{ fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.05, maxWidth: 20 + "ch" }}>
            Our courthouses are full of cases that never belonged there.
          </h1>
          <p className="mt-5 text-[rgba(242,239,231,.82)]" style={{ fontSize: "clamp(16px,2vw,20px)", maxWidth: "62ch", lineHeight: 1.55 }}>
            Tens of millions of disputes each year should have been <b style={{ color: "#fff" }}>settled or arbitrated</b> — not litigated.
            The demand for a faster path is enormous and growing. <b style={{ color: "#fff" }}>Attorney.plus is the technology that answers it</b>,
            and connects the people who still need a lawyer to the attorneys who want them.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#request-access" className="btn btn-seal btn-lg">Request access</Link>
            <Link href="/investor/deck" className="btn btn-lg" style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}>View the pitch deck →</Link>
            <Link href="/auth/login" className="btn btn-lg" style={{ background: "transparent", color: "var(--seal-2)", border: "1px solid rgba(255,255,255,.25)" }}>Log in</Link>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            <Stat n="~40M" l="US civil cases filed a year that could be resolved without a courtroom" />
            <Stat n="~$382B" l="drained from the economy annually by disputes that never needed one" />
            <Stat n="~$400B" l="US legal-services market we sit inside — and route" />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <Section eyebrow="The problem" title="It has gotten bigger, every single year.">
        <p className="muted max-w-[64ch] text-[16px]" style={{ lineHeight: 1.6 }}>
          Court backlogs compound. Every year more disputes are filed than resolved, and the pile of pending civil
          cases keeps rising. Most of them are small, factual, and resolvable — but the only door available is the
          most expensive one. That gap is the opportunity.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ProblemChart />
          <CostChart />
        </div>
      </Section>

      {/* SOLUTION */}
      <section style={{ background: "var(--paper-2)" }}>
        <div className="container" style={{ padding: "64px 24px", maxWidth: 1040 }}>
          <div className="eyebrow" style={{ color: "var(--brand)" }}>The solution</div>
          <h2 className="mt-2 text-[clamp(24px,3.4vw,36px)]">A ladder that resolves most disputes before they ever reach a lawyer.</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-4">
            <Step n="1" title="AI decision" body="Both parties state their case. AI proposes a reasoned, cited resolution in minutes." />
            <Step n="2" title="Arbitration" body="If either declines, a professional arbitrator rules. Both pay a share; the platform keeps 30%." />
            <Step n="3" title="Attorneys" body="Still unresolved? Each side is routed to independent counsel — a qualified, paid referral." />
            <Step n="4" title="Every step logged" body="Timestamped, tamper-evident agreements at each stage. Trust is the product." />
          </div>
          <p className="muted mt-6 text-[15px]" style={{ maxWidth: "64ch", lineHeight: 1.6 }}>
            Each rung that resolves a dispute saves the system money. Each rung that doesn&apos;t creates a
            <b> high-intent, pre-qualified lead</b> for an attorney — and revenue for us. We win whether the case settles or escalates.
          </p>
        </div>
      </section>

      {/* MONETIZATION */}
      <Section eyebrow="The monetization engine" title="We connect the dots — and get paid on both.">
        <p className="muted max-w-[64ch] text-[16px]" style={{ lineHeight: 1.6 }}>
          The obvious business is <b>service fees</b> — every case pays to use the platform. That alone compounds into
          a durable, high-margin business. But the larger engine is the <b>attorney network</b>: the qualified leads we
          create at the top of the funnel, monetized through referral commissions and revenue splits worth a
          <b> multiple</b> of the service fees.
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <RevenueChart />
          <div className="card" style={{ background: "var(--ink)", color: "#fff", borderColor: "transparent" }}>
            <div className="eyebrow" style={{ color: "#e0a94b" }}>Two revenue layers</div>
            <RevLayer title="Service fees (shown)" body="Per-case platform fees + arbitration cut (30%) + partner subscriptions. Conservative, and the only line we model publicly." />
            <RevLayer title="Attorney-owned upside (hinted)" body="Referral commissions and revenue splits on every escalated case. Significantly larger — and it grows as the network compounds." gold />
            <p className="mt-4 text-[12px]" style={{ color: "rgba(255,255,255,.55)", lineHeight: 1.5 }}>
              Detailed unit economics for the attorney layer are in the gated deck.
            </p>
          </div>
        </div>
      </Section>

      {/* FLYWHEEL — self-fulfilling */}
      <section className="dark-section" style={{ padding: "64px 0" }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div className="eyebrow" style={{ color: "var(--seal-2)" }}>The self-fulfilling flywheel</div>
          <h2 className="mt-2 text-white text-[clamp(24px,3.4vw,36px)]" style={{ maxWidth: "22ch" }}>
            Attorneys grow their own pipeline by giving cases away.
          </h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <Flywheel n="1" title="Shed the small stuff" body="An attorney sends a low-value dispute into arbitration to cut their caseload — no write-off, no wasted hours." />
            <Flywheel n="2" title="It circles back — exclusively" body="If that dispute upgrades into a real case, it returns to them and only them. Everyone they refer comes back to them." />
            <Flywheel n="3" title="The other side pays us" body="The opposing party uses our paid platform to find their own counsel — creating income for the system on every case." />
            <Flywheel n="4" title="Gamified to scale" body="A+COINS, reserved leads, and revenue splits reward attorneys for feeding the funnel — so they scale their firm while shrinking the backlog." />
          </div>
          <p className="mt-6 text-[15px]" style={{ color: "rgba(242,239,231,.75)", maxWidth: "68ch", lineHeight: 1.6 }}>
            The result is a system that markets itself: the more an attorney offloads, the more exclusive pipeline
            they build — and every counter-party they touch becomes paid volume for us. It answers the legal
            system&apos;s single biggest problem while aligning every participant&apos;s incentives with ours.
          </p>
        </div>
      </section>

      {/* ACCESS + DOCS */}
      <Section eyebrow="Get the full picture" title="Open the data room.">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <InvestorAccessForm />
          <div className="card">
            <h3 className="text-[20px]">Materials</h3>
            <p className="muted mt-1 text-[13.5px]">Executive overview and pitch deck are inside the data room. Preview and download:</p>
            <ul className="mt-4 space-y-3">
              <DocRow href="/investor/overview" title="Executive overview" note="The thesis, market, model, and ask — one read." />
              <DocRow href="/investor/deck" title="Pitch deck" note="Tight, board-ready. Problem → solution → engine → numbers." />
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <PrintButton label="Download this overview (PDF)" />
              <Link href="/investor/deck" className="btn btn-ink">Open the deck →</Link>
            </div>
          </div>
        </div>
      </Section>

      <div className="container" style={{ padding: "0 24px 60px", maxWidth: 1040 }}>
        <p className="muted text-[12px]" style={{ lineHeight: 1.6 }}>
          <b>Disclaimer.</b> This page is for informational purposes only and does not constitute an offer to sell,
          or a solicitation of an offer to buy, any security. All figures are illustrative estimates for discussion
          and are not audited financials, projections you should rely upon, or a guarantee of future performance.
          Attorney.plus is not a law firm and does not provide legal advice.
        </p>
      </div>
    </main>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="container" style={{ padding: "64px 24px", maxWidth: 1040 }}>
      <div className="eyebrow" style={{ color: "var(--brand)" }}>{eyebrow}</div>
      <h2 className="mt-2 mb-6 text-[clamp(24px,3.4vw,36px)]" style={{ maxWidth: "24ch" }}>{title}</h2>
      {children}
    </section>
  );
}
function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div style={{ borderLeft: "2px solid var(--seal-2)", paddingLeft: 14 }}>
      <div className="text-white" style={{ fontFamily: "var(--font-fraunces)", fontSize: 34, lineHeight: 1 }}>{n}</div>
      <div className="mt-1.5 text-[13px]" style={{ color: "rgba(242,239,231,.7)", lineHeight: 1.45 }}>{l}</div>
    </div>
  );
}
function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card">
      <div className="grid h-8 w-8 place-items-center rounded-full text-[14px] font-semibold text-white" style={{ background: "var(--brand)" }}>{n}</div>
      <h3 className="mt-3 text-[16px]">{title}</h3>
      <p className="muted mt-1.5 text-[13.5px]" style={{ lineHeight: 1.5 }}>{body}</p>
    </div>
  );
}
function RevLayer({ title, body, gold }: { title: string; body: string; gold?: boolean }) {
  return (
    <div className="mt-4" style={{ borderTop: "1px solid rgba(255,255,255,.14)", paddingTop: 14 }}>
      <h4 style={{ color: gold ? "#e0a94b" : "#fff", fontSize: 15, fontWeight: 600 }}>{title}</h4>
      <p className="mt-1 text-[13px]" style={{ color: "rgba(255,255,255,.78)", lineHeight: 1.5 }}>{body}</p>
    </div>
  );
}
function Flywheel({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card" style={{ background: "rgba(255,255,255,.05)", borderColor: "rgba(255,255,255,.12)" }}>
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-full text-[14px] font-semibold" style={{ background: "var(--seal-2)", color: "var(--ink)" }}>{n}</span>
        <h3 className="text-white text-[17px]">{title}</h3>
      </div>
      <p className="mt-2 text-[14px]" style={{ color: "rgba(242,239,231,.75)", lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}
function DocRow({ href, title, note }: { href: string; title: string; note: string }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-[10px] px-3 py-3" style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }}>
      <span><b className="text-[14.5px]">{title}</b><span className="muted block text-[12.5px]">{note}</span></span>
      <Link href={href} className="text-[13.5px] font-semibold" style={{ color: "var(--brand)", whiteSpace: "nowrap" }}>Open →</Link>
    </li>
  );
}
