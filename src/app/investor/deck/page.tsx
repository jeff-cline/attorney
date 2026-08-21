import Link from "next/link";
import { requireInvestor } from "@/lib/investor-gate";
import { PrintButton } from "@/components/print-button";
import { ProblemChart, CostChart } from "@/components/investor-charts";
import { LeasingModel, CaseEngineModel, CombinedSlider, FiveYearProjection, ValuationBox } from "@/components/revenue-models";

export const dynamic = "force-dynamic";

const PRINT_CSS = `@media print {
  header, footer, .no-print { display: none !important; }
  main { padding: 0 !important; max-width: none !important; }
  .slide { break-inside: avoid; break-after: page; box-shadow: none !important; border: none !important; min-height: 92vh; }
}`;

export default async function PitchDeck() {
  await requireInvestor();
  return (
    <main className="container" style={{ maxWidth: 960, padding: "40px 24px 80px" }}>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/investor" className="text-[14px] muted hover:text-[var(--brand)]">← Investor overview</Link>
        <div className="flex gap-2">
          <Link href="/investor/overview" className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13.5 }}>Executive overview →</Link>
          <PrintButton label="Download deck (PDF)" className="btn btn-ink" />
        </div>
      </div>

      <div className="space-y-6">
        {/* 1 — Title */}
        <Slide dark>
          <div className="eyebrow" style={{ color: "var(--seal-2)" }}>Confidential pitch · Series</div>
          <h1 className="mt-3" style={{ color: "#fff", fontSize: "clamp(30px,5vw,54px)", lineHeight: 1.04 }}>Attorney<span style={{ color: "var(--seal-2)" }}>.plus</span></h1>
          <p className="mt-4 text-[rgba(242,239,231,.82)]" style={{ fontSize: 20, maxWidth: "40ch" }}>The resolution layer for a legal system that can no longer resolve itself.</p>
          <div className="mt-8 flex flex-wrap gap-6 text-[rgba(242,239,231,.7)] text-[13.5px]">
            <span>~40M cases/yr</span><span>·</span><span>~$382B ecosystem cost</span><span>·</span><span>~$400B market</span>
          </div>
        </Slide>

        {/* 2 — Problem */}
        <Slide n="01" kicker="The problem">
          <H>Courthouses are clogged with disputes that never belonged there.</H>
          <P>Filings outpace resolutions every year. The pending pile grows on its own. The disputes are small and resolvable — but the only accessible door is the most expensive one.</P>
          <div className="mt-5"><ProblemChart /></div>
        </Slide>

        {/* 3 — Cost */}
        <Slide n="02" kicker="Why it matters">
          <H>The backlog is a ~$382B/yr tax on the economy.</H>
          <P>Business litigation, court operating cost, consumer time and lost wages, and unresolved small claims — value destroyed by process, not merit.</P>
          <div className="mt-5"><CostChart /></div>
        </Slide>

        {/* 4 — Solution */}
        <Slide n="03" kicker="The solution">
          <H>A resolution ladder — we capture value at every rung.</H>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Card t="1 · AI decision" b="Reasoned, cited resolution in minutes. Both accept → resolved." />
            <Card t="2 · Arbitration" b="A professional rules. Both pay a share; platform keeps 30%." />
            <Card t="3 · Attorneys" b="Independent counsel per side — a qualified, paid referral." />
            <Card t="4 · Proof" b="Every step timestamped and tamper-evident. Trust is the product." />
          </div>
        </Slide>

        {/* 5 — Engine */}
        <Slide n="04" kicker="Monetization · three engines">
          <H>Leasing, referrals, and arbitration — compounding together.</H>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <LeasingModel />
            <CaseEngineModel />
          </div>
        </Slide>

        {/* 5b — Combined + projection */}
        <Slide n="05" kicker="The blended model">
          <H>Tune the mix. Then read five years, after cost of goods.</H>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <CombinedSlider />
            <FiveYearProjection />
          </div>
        </Slide>

        {/* 5c — Valuation */}
        <Slide n="06" kicker="Valuation">
          <H>What a legal-tech SaaS revenue multiple implies.</H>
          <div className="mt-5"><ValuationBox /></div>
        </Slide>

        {/* 7 — Flywheel */}
        <Slide n="07" kicker="Defensibility">
          <H>A flywheel that markets itself.</H>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Card t="Shed the small stuff" b="Attorneys offload low-value disputes to arbitration — no write-offs." />
            <Card t="It circles back — exclusively" b="If it upgrades into a case, it returns to them and only them." />
            <Card t="The other side pays us" b="The counter-party uses our paid platform — income every case." />
            <Card t="Gamified to scale" b="A+COINS, reserved leads, splits reward feeding the funnel." />
          </div>
          <P>The more an attorney gives away, the more exclusive pipeline they build — and every counter-party becomes paid volume for us.</P>
        </Slide>

        {/* 7 — Ask */}
        <Slide dark>
          <div className="eyebrow" style={{ color: "var(--seal-2)" }}>The ask</div>
          <H light>We&apos;re raising to densify the attorney network and productize escalation.</H>
          <p className="mt-4 text-[rgba(242,239,231,.8)]" style={{ fontSize: 16, maxWidth: "60ch", lineHeight: 1.6 }}>
            Detailed unit economics, cohort assumptions, and the cap plan are in diligence. Request access from any team member.
          </p>
          <Link href="/investor#request-access" className="no-print btn btn-seal btn-lg mt-6" style={{ display: "inline-block" }}>Request diligence access</Link>
        </Slide>
      </div>

      <p className="muted mt-8 text-[11.5px]" style={{ lineHeight: 1.6 }}>Confidential. For information only — not an offer to sell or a solicitation to buy any security. Figures are illustrative estimates for discussion, not audited financials. Attorney.plus is not a law firm.</p>
    </main>
  );
}

function Slide({ children, n, kicker, dark }: { children: React.ReactNode; n?: string; kicker?: string; dark?: boolean }) {
  return (
    <section className={`slide card`} style={dark ? { background: "var(--ink)", borderColor: "transparent", padding: "44px 40px" } : { padding: "40px" }}>
      {(n || kicker) && (
        <div className="mb-2 flex items-center gap-3">
          {n && <span className="text-[13px] font-semibold" style={{ color: "var(--seal)", fontFamily: "var(--font-fraunces)" }}>{n}</span>}
          {kicker && <span className="eyebrow" style={{ color: "var(--brand)" }}>{kicker}</span>}
        </div>
      )}
      {children}
    </section>
  );
}
function H({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return <h2 style={{ color: light ? "#fff" : "var(--ink)", fontSize: "clamp(22px,3.2vw,32px)", lineHeight: 1.12, maxWidth: "26ch" }}>{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="muted mt-3 text-[15.5px]" style={{ maxWidth: "66ch", lineHeight: 1.6 }}>{children}</p>;
}
function Card({ t, b }: { t: string; b: string }) {
  return (
    <div className="rounded-[12px] p-4" style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }}>
      <div className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>{t}</div>
      <div className="muted mt-1 text-[13.5px]" style={{ lineHeight: 1.5 }}>{b}</div>
    </div>
  );
}
