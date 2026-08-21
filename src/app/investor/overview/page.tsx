import Link from "next/link";
import { requireInvestor } from "@/lib/investor-gate";
import { PrintButton } from "@/components/print-button";
import { ProblemChart } from "@/components/investor-charts";
import { LeasingModel, CaseEngineModel, CombinedSlider, FiveYearProjection, ValuationBox } from "@/components/revenue-models";

export const dynamic = "force-dynamic";

const PRINT_CSS = `@media print { header, footer, .no-print { display: none !important; } main { padding: 0 !important; } .pagebreak { break-before: page; } }`;

export default async function ExecutiveOverview() {
  await requireInvestor();
  return (
    <main className="container" style={{ maxWidth: 820, padding: "48px 24px 80px" }}>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/investor" className="text-[14px] muted hover:text-[var(--brand)]">← Investor overview</Link>
        <div className="flex gap-2">
          <Link href="/investor/deck" className="btn btn-outline" style={{ padding: "8px 14px", fontSize: 13.5 }}>Pitch deck →</Link>
          <PrintButton label="Download PDF" className="btn btn-ink" />
        </div>
      </div>

      <header>
        <div className="eyebrow" style={{ color: "var(--brand)" }}>Executive overview · confidential</div>
        <h1 className="mt-2 text-[clamp(28px,4vw,40px)]">Attorney.plus</h1>
        <p className="muted mt-2 text-[16px]" style={{ lineHeight: 1.5 }}>Clearing the disputes that should never have reached a courtroom — and monetizing the path to counsel.</p>
      </header>

      <Doc>
        <H>The thesis</H>
        <P>Every year, tens of millions of civil disputes enter a legal system built for none of them. The overwhelming majority are small, factual, and resolvable — yet the only accessible door is litigation: slow, expensive, and adversarial. The backlog compounds annually because filings outpace resolutions. This is not a niche inefficiency; it is a structural failure of access, and it grows on its own.</P>
        <P>Attorney.plus resolves disputes on a ladder — AI decision, professional arbitration, then attorney referral — capturing value at every rung. Cases that resolve save the system money. Cases that escalate become high-intent, pre-qualified demand for attorneys, which we monetize. The business is indifferent to which happens.</P>

        <div className="my-6"><ProblemChart /></div>

        <H>The market</H>
        <Bullets items={[
          "~40M civil cases filed annually in US state courts — most resolvable outside a courtroom (illustrative estimate).",
          "~$382B/yr drained from the economy by disputes that never needed litigation.",
          "~$400B US legal-services market we sit inside and route into.",
          "Demand is structural and counter-cyclical: backlogs rise in good times and bad.",
        ]} />

        <H>The solution</H>
        <P>A trust-first resolution ladder with tamper-evident, timestamped agreements at each step. AI proposes a reasoned, cited resolution; if either party declines, a professional arbitrator rules (platform keeps 30%, arbitrator 70%); if still unresolved, each side is routed to independent counsel — a qualified, paid referral with no conflict.</P>

        <div className="pagebreak" />
        <H>The monetization engine — three revenue streams</H>
        <P>Three engines compound together: <b>exclusive niche leasing</b> (recurring SaaS), <b>per-case referral fees</b>, and <b>arbitration retainers</b>. The models below are interactive — adjust the mix and read the five-year projection and valuation.</P>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <LeasingModel />
          <CaseEngineModel />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CombinedSlider />
          <FiveYearProjection />
        </div>
        <div className="mt-4"><ValuationBox /></div>

        <div className="pagebreak" />
        <H>The flywheel that markets itself</H>
        <P>Attorneys shed low-value disputes into arbitration to cut caseload. If a dispute upgrades into a real case, it returns to the referring attorney — <b>exclusively</b>. Everyone they refer comes back to them, while the opposing party becomes paid volume on our platform. A+COINS, reserved leads, and revenue splits gamify participation, so attorneys scale their firms while shrinking the backlog. Every participant's incentive points at more volume for us.</P>

        <H>The ask</H>
        <P>We are raising to accelerate attorney-network density and productize the escalation layer. Detailed unit economics, cohort assumptions, and the capitalization plan are in the pitch deck and in diligence materials available on request.</P>

        <p className="muted mt-8 text-[11.5px]" style={{ lineHeight: 1.6 }}>Confidential. For information only — not an offer to sell or a solicitation to buy any security. Figures are illustrative estimates for discussion, not audited financials or reliable projections. Attorney.plus is not a law firm.</p>
      </Doc>
    </main>
  );
}

function Doc({ children }: { children: React.ReactNode }) {
  return <article className="mt-8" style={{ fontSize: 16, lineHeight: 1.65, color: "#2c2a25" }}>{children}</article>;
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 mb-2 text-[clamp(20px,2.6vw,26px)]">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3" style={{ maxWidth: "68ch" }}>{children}</p>;
}
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2" style={{ maxWidth: "68ch" }}>
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5"><span style={{ color: "var(--seal)" }}>▸</span><span>{t}</span></li>
      ))}
    </ul>
  );
}
