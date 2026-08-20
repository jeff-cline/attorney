import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, users, disputeStatements } from "@/db/schema";
import {
  payShare, agreeToArbitration, submitDispute, approveSummary,
  respondToDecision, respondToArbitration,
} from "@/actions/cases";
import { StatusChip } from "@/components/status-chip";
import { CopyCode } from "@/components/copy-code";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "opt_in", label: "Both sides opt in", desc: "Pay your share · share the code · accept the terms" },
  { key: "statements", label: "Your accounts", desc: "Each side submits what happened" },
  { key: "summary", label: "Neutral summary", desc: "Both approve a fair summary of positions" },
  { key: "decision", label: "Quick decision", desc: "Accept the proposed resolution — or escalate" },
];
const STAGE: Record<string, number> = {
  awaiting_initiator_payment: 0, pending_join: 0, awaiting_joiner_payment: 0, pending_agreements: 0,
  pending_disputes: 1, summary_review: 2, ai_decision: 3,
  resolved: 4, arbitration: 4, arbitration_ruling: 4, litigation: 4,
};

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/auth/login");

  const c = await db.query.cases.findFirst({ where: eq(cases.id, id) });
  if (!c) notFound();
  if (c.initiatorId !== uid && c.joinerId !== uid) notFound();
  const isInitiator = c.initiatorId === uid;

  const initiator = await db.query.users.findFirst({ where: eq(users.id, c.initiatorId) });
  const joiner = c.joinerId ? await db.query.users.findFirst({ where: eq(users.id, c.joinerId) }) : null;
  const myStatement = await db.query.disputeStatements.findFirst({
    where: (d, { and }) => and(eq(d.caseId, c.id), eq(d.userId, uid)),
  });

  const myPaid = isInitiator ? c.initiatorPaidAt : c.joinerPaidAt;
  const myAgreed = isInitiator ? c.initiatorAgreedAt : c.joinerAgreedAt;
  const otherAgreed = isInitiator ? c.joinerAgreedAt : c.initiatorAgreedAt;
  const mySummaryOk = isInitiator ? c.initiatorSummaryOkAt : c.joinerSummaryOkAt;
  const myDecision = isInitiator ? c.initiatorDecision : c.joinerDecision;
  const myArbOk = isInitiator ? c.initiatorArbOkAt : c.joinerArbOkAt;
  const escalated = ["arbitration", "arbitration_ruling", "litigation"].includes(c.status);
  const litigation = c.status === "litigation";
  const stageIdx = STAGE[c.status] ?? 0;

  // ── server action wrappers (reload the page) ──
  async function pay() { "use server"; await payShare(id); redirect(`/dashboard/case/${id}`); }
  async function agree() { "use server"; await agreeToArbitration(id); redirect(`/dashboard/case/${id}`); }
  async function submit(fd: FormData) { "use server"; await submitDispute(id, String(fd.get("statement") ?? "")); redirect(`/dashboard/case/${id}`); }
  async function approve() { "use server"; await approveSummary(id); redirect(`/dashboard/case/${id}`); }
  async function decAgree() { "use server"; await respondToDecision(id, "agree"); redirect(`/dashboard/case/${id}`); }
  async function decDisagree() { "use server"; await respondToDecision(id, "disagree"); redirect(`/dashboard/case/${id}`); }
  async function arbAgree() { "use server"; await respondToArbitration(id, "agree"); redirect(`/dashboard/case/${id}`); }
  async function arbDisagree() { "use server"; await respondToArbitration(id, "disagree"); redirect(`/dashboard/case/${id}`); }

  return (
    <main className="container" style={{ maxWidth: 960, padding: "40px 24px 80px" }}>
      <Link href="/dashboard" className="text-[14px] muted hover:text-[var(--brand)]">← All cases</Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Case · {c.inviteCode}</div>
          <h1 className="mt-2 text-[clamp(26px,3.4vw,36px)]">{c.subject?.trim() || "Dispute"}</h1>
          <p className="muted mt-1 text-[14.5px]">
            {initiator?.displayName ?? initiator?.email} <span className="opacity-50">vs</span>{" "}
            {joiner ? (joiner.displayName ?? joiner.email) : <em>awaiting the other party</em>}
          </p>
        </div>
        <StatusChip status={c.status} />
      </header>

      <div className="mt-8 grid gap-8 md:grid-cols-[280px_1fr]">
        {/* progress spine */}
        <aside className="card" style={{ alignSelf: "start" }}>
          <div className="eyebrow mb-4">Progress</div>
          <div className="spine">
            {STEPS.map((s, i) => {
              const state = c.status === "resolved" || i < stageIdx ? "done" : i === stageIdx && !escalated ? "current" : "";
              return (
                <div key={s.key} className={`spine-step ${state}`}>
                  <span className="spine-node">{state === "done" ? "✓" : i + 1}</span>
                  <h4>{s.label}</h4>
                  <p>{s.desc}</p>
                </div>
              );
            })}
            {escalated && (
              <div className={`spine-step ${c.status === "litigation" ? "done" : "current"}`}>
                <span className="spine-node">!</span>
                <h4>Professional arbitration</h4>
                <p>An independent arbitrator reviews the case</p>
              </div>
            )}
            {litigation && (
              <div className="spine-step current">
                <span className="spine-node">§</span>
                <h4>Attorneys</h4>
                <p>Independent counsel matched to each side</p>
              </div>
            )}
          </div>
        </aside>

        {/* action panel */}
        <section className="space-y-5">
          {/* 1. payment gate — initiator */}
          {c.status === "awaiting_initiator_payment" && isInitiator && (
            <Panel title="Pay your share to unlock your code" tone="seal">
              <p className="muted text-[15px]">As the party opening this case, you pay your share first. Then you&apos;ll receive a private code to send to the other party.</p>
              <Money />
              <form action={pay}><button className="btn btn-seal btn-block mt-3">Pay my share &amp; get my code</button></form>
            </Panel>
          )}

          {/* 2. share code — initiator */}
          {c.status === "pending_join" && isInitiator && (
            <Panel title="Send this code to the other party" tone="brand">
              <p className="muted text-[15px]">They go to <b>attorney.plus/join</b>, create an account, and enter this code. You don&apos;t need to be online at the same time.</p>
              <CopyCode code={c.inviteCode} />
            </Panel>
          )}

          {/* 3. payment gate — joiner */}
          {c.status === "awaiting_joiner_payment" && !isInitiator && (
            <Panel title="Pay your half to continue" tone="seal">
              <p className="muted text-[15px]">You&apos;ve joined the case. Pay your half and both sides can accept the terms and begin.</p>
              <Money />
              <form action={pay}><button className="btn btn-seal btn-block mt-3">Pay my half</button></form>
            </Panel>
          )}

          {/* 4. accept terms */}
          {c.status === "pending_agreements" && (
            <Panel title="Accept the arbitration terms" tone="brand">
              <p className="text-[15px]"><em>&ldquo;I agree to use Attorney.plus arbitration as defined in the current Terms.&rdquo;</em></p>
              {myAgreed ? (
                <Waiting done={Boolean(otherAgreed)} youText="You accepted the terms." />
              ) : (
                <form action={agree}><button className="btn btn-brand btn-block mt-2">I agree</button></form>
              )}
            </Panel>
          )}

          {/* 5. submit account */}
          {c.status === "pending_disputes" && (
            <Panel title="Submit your account" tone="brand">
              {myStatement ? (
                <>
                  <div className="rounded-[10px] p-3 text-[14.5px]" style={{ background: "var(--paper-2)" }}>{myStatement.statement}</div>
                  <Waiting done={false} youText="Your account is in. When both sides have submitted, we&apos;ll prepare a neutral summary." />
                </>
              ) : (
                <form action={submit}>
                  <div className="field"><label>Tell us, in your own words, what happened</label>
                    <textarea name="statement" required minLength={20} placeholder="Describe the dispute, what you're asking for, and any key facts or dates…" />
                    <span className="hint">This is shared with the neutral summary, not published.</span>
                  </div>
                  <button className="btn btn-brand btn-block">Submit my account</button>
                </form>
              )}
            </Panel>
          )}

          {/* 6. review summary */}
          {c.status === "summary_review" && (
            <Panel title="Neutral summary" tone="brand">
              <Prose text={c.neutralSummary ?? ""} />
              {mySummaryOk ? (
                <Waiting done={false} youText="You approved the summary. Waiting on the other party." />
              ) : (
                <form action={approve}><button className="btn btn-brand btn-block mt-3">This fairly reflects my position</button></form>
              )}
            </Panel>
          )}

          {/* 7. respond to AI decision */}
          {c.status === "ai_decision" && (
            <Panel title="Proposed resolution" tone="seal">
              <Prose text={c.aiDecision ?? ""} />
              {myDecision ? (
                <Waiting done={false} youText={myDecision === "agree" ? "You accepted. Waiting on the other party." : "You declined — this will escalate to arbitration."} />
              ) : (
                <div className="mt-4 flex flex-wrap gap-3">
                  <form action={decAgree}><button className="btn btn-seal">I accept this resolution</button></form>
                  <form action={decDisagree}><button className="btn btn-outline">I don&apos;t agree — escalate</button></form>
                </div>
              )}
            </Panel>
          )}

          {/* 8. escalated — waiting on arbitrator */}
          {c.status === "arbitration" && (
            <Panel title="Escalated to a professional arbitrator" tone="escalate">
              <p className="muted text-[15px]">One or both parties declined the proposed resolution. An independent arbitrator will review both accounts and issue a ruling. The arbitration fee is capped at <b>$1,500</b>.</p>
            </Panel>
          )}

          {/* 9. respond to arbitrator ruling */}
          {c.status === "arbitration_ruling" && (
            <Panel title="The arbitrator's ruling" tone="brand">
              <Prose text={c.arbitratorRuling ?? ""} />
              {myArbOk ? (
                <Waiting done={false} youText="You accepted the ruling. Waiting on the other party." />
              ) : (
                <div className="mt-4 flex flex-wrap gap-3">
                  <form action={arbAgree}><button className="btn btn-brand">I accept the ruling</button></form>
                  <form action={arbDisagree}><button className="btn btn-outline">I don&apos;t accept — go to attorneys</button></form>
                </div>
              )}
            </Panel>
          )}

          {/* 10. litigation */}
          {litigation && (
            <Panel title="Matched with attorneys" tone="escalate">
              <p className="muted text-[15px]">This case is moving to independent counsel. Each side is matched with a participating attorney in your area — never from the same firm. You&apos;ll be contacted with next steps.</p>
            </Panel>
          )}

          {/* resolved */}
          {c.status === "resolved" && (
            <Panel title="Resolved by mutual agreement" tone="agreed">
              <p className="text-[15px]">Both parties accepted a decision. The terms and timestamps are recorded in the tamper-evident audit chain.</p>
              <Prose text={c.arbitratorRuling ?? c.aiDecision ?? ""} />
            </Panel>
          )}

          {/* waiting-on-initiator (joiner-less states seen by initiator) */}
          {c.status === "awaiting_joiner_payment" && isInitiator && (
            <Panel title="Waiting on the other party" tone="brand">
              <p className="muted text-[15px]">The other party has joined and needs to pay their half before you both accept the terms.</p>
            </Panel>
          )}
        </section>
      </div>
    </main>
  );
}

/* ── small presentational helpers ── */
function Panel({ title, tone, children }: { title: string; tone: "brand" | "seal" | "escalate" | "agreed"; children: React.ReactNode }) {
  const bar: Record<string, string> = { brand: "var(--brand)", seal: "var(--seal)", escalate: "var(--escalate)", agreed: "var(--agreed)" };
  return (
    <div className="panel" style={{ borderTop: `3px solid ${bar[tone]}` }}>
      <h3 className="mb-3 text-[21px]">{title}</h3>
      {children}
    </div>
  );
}
function Money() {
  return (
    <div className="mt-3 flex items-center justify-between rounded-[10px] px-4 py-3" style={{ background: "var(--paper-2)" }}>
      <span className="text-[14.5px] font-semibold">Your share</span>
      <span className="text-[14.5px]"><b>$0</b> <span className="muted">— free during early access</span></span>
    </div>
  );
}
function Waiting({ done, youText }: { done: boolean; youText: string }) {
  return (
    <div className="mt-3 rounded-[10px] px-4 py-3 text-[14.5px]" style={{ background: "var(--brand-100)", color: "var(--brand-700)" }}>
      {youText} {done ? "Both parties are done — advancing." : ""}
    </div>
  );
}
function Prose({ text }: { text: string }) {
  return (
    <div className="mt-3 whitespace-pre-wrap rounded-[12px] border p-4 text-[15px] leading-relaxed" style={{ borderColor: "var(--line)", background: "#fdfcf9" }}>
      {text}
    </div>
  );
}
