import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, users, disputeStatements, caseMessages, arbitratorProfiles } from "@/db/schema";
import { arbitratorRule } from "@/actions/cases";
import { postCaseMessage } from "@/actions/arbitrator";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";
const fmt = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 16).replace("T", " ") : "—");
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default async function ArbitratorCase({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await auth();
  const u = s?.user as { id?: string; role?: string } | undefined;
  if (!u?.id) redirect("/auth/login");

  const c = await db.query.cases.findFirst({ where: eq(cases.id, id) });
  if (!c) notFound();
  const isAssigned = c.arbitratorId === u.id;
  if (!isAssigned && u.role !== "admin") redirect("/arbitrator");

  const initiator = await db.query.users.findFirst({ where: eq(users.id, c.initiatorId) });
  const joiner = c.joinerId ? await db.query.users.findFirst({ where: eq(users.id, c.joinerId) }) : null;
  const statements = await db.select().from(disputeStatements).where(eq(disputeStatements.caseId, id));
  const messages = await db.select().from(caseMessages).where(eq(caseMessages.caseId, id)).orderBy(asc(caseMessages.createdAt));
  const profile = await db.query.arbitratorProfiles.findFirst({ where: eq(arbitratorProfiles.userId, c.arbitratorId ?? "") });
  const nameFor = (uid: string) => (uid === c.initiatorId ? initiator : joiner)?.displayName ?? (uid === c.initiatorId ? initiator : joiner)?.email ?? "Party";
  const cut = profile?.systemCutPct ?? 30;
  const fee = c.arbitratorFee ?? 0;
  const bothPaid = c.initiatorArbFeePaidAt && c.joinerArbFeePaidAt;

  async function ask(fd: FormData) {
    "use server";
    await postCaseMessage(id, String(fd.get("body") ?? ""));
    redirect(`/arbitrator/case/${id}`);
  }
  async function rule(fd: FormData) {
    "use server";
    const r = String(fd.get("ruling") ?? "").trim();
    if (r.length >= 10) await arbitratorRule(id, r);
    redirect(`/arbitrator/case/${id}`);
  }

  return (
    <main className="container" style={{ maxWidth: 820, padding: "40px 24px 80px" }}>
      <Link href="/arbitrator" className="text-[14px] muted hover:text-[var(--brand)]">← My cases</Link>
      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Case · {c.inviteCode}</div>
          <h1 className="mt-2 text-[clamp(22px,3vw,30px)]">{c.subject?.trim() || "Dispute"}</h1>
          <p className="muted mt-1 text-[13.5px]">Fee {usd(fee)} → you keep {usd(Math.round(fee * (100 - cut) / 100))} ({100 - cut}%) · {bothPaid ? "both parties paid" : "awaiting party payment"}</p>
        </div>
        <StatusChip status={c.status} />
      </header>

      {!bothPaid && <div className="form-msg mt-5" style={{ background: "#f7ecd6", color: "#96631a" }}>Both parties must pay their part of the fee before a ruling takes effect. You can review and ask questions now.</div>}

      <section className="card mt-6">
        <h2 className="mb-3 text-[18px]">The two accounts</h2>
        {statements.length === 0 ? <p className="muted text-[14px]">No accounts submitted.</p> : (
          <div className="space-y-3">
            {statements.map((st) => (
              <div key={st.id} className="rounded-[10px] p-3 text-[14.5px]" style={{ background: "var(--paper-2)" }}>
                <div className="mb-1 text-[12.5px] font-semibold" style={{ color: "var(--brand)" }}>{nameFor(st.userId)} · {fmt(st.submittedAt)}</div>
                <div className="whitespace-pre-wrap">{st.statement}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {c.neutralSummary && <Block title="Neutral summary" text={c.neutralSummary} />}
      {c.aiDecision && <Block title="AI-assisted proposed resolution (declined)" text={c.aiDecision} />}

      {/* follow-up Q&A */}
      <section className="card mt-6">
        <h2 className="mb-3 text-[18px]">Follow-up questions</h2>
        <div className="space-y-2">
          {messages.map((m) => (
            <div key={m.id} className="rounded-[10px] px-3 py-2 text-[14px]" style={{ background: m.authorRole === "arbitrator" ? "var(--brand-100)" : "#fff", border: m.authorRole === "party" ? "1px solid var(--line)" : "none" }}>
              <span className="text-[12px] font-semibold" style={{ color: m.authorRole === "arbitrator" ? "var(--brand-700)" : "var(--ink)" }}>{m.authorRole === "arbitrator" ? "Arbitrator" : nameFor(m.authorId)}</span>
              <span className="muted text-[11px]"> · {fmt(m.createdAt)}</span>
              <div className="mt-0.5 whitespace-pre-wrap">{m.body}</div>
            </div>
          ))}
          {messages.length === 0 && <p className="muted text-[13.5px]">No questions yet. Ask both parties for any clarification you need.</p>}
        </div>
        <form action={ask} className="mt-3">
          <div className="field"><textarea name="body" required minLength={2} placeholder="Ask a follow-up question — both parties will see it and can answer…" style={{ minHeight: 90 }} /></div>
          <button className="btn btn-outline">Post question</button>
        </form>
      </section>

      {/* ruling */}
      {c.status === "arbitration" && (
        <section className="panel mt-6" style={{ borderTop: "3px solid var(--escalate)" }}>
          <h2 className="mb-2 text-[19px]">Issue your ruling</h2>
          <p className="muted mb-3 text-[14px]">State your decision and reasoning. Both parties will be asked to accept it. If either declines, the case moves to independent attorneys.</p>
          <form action={rule}>
            <div className="field"><textarea name="ruling" required minLength={10} placeholder="Your ruling and reasoning…" style={{ minHeight: 160 }} /></div>
            <button className="btn btn-ink">Issue ruling</button>
          </form>
        </section>
      )}
      {c.arbitratorRuling && <Block title="Your ruling" text={c.arbitratorRuling} footer={`Initiator accepted: ${fmt(c.initiatorArbOkAt)} · Joiner accepted: ${fmt(c.joinerArbOkAt)}`} />}
    </main>
  );
}

function Block({ title, text, footer }: { title: string; text: string; footer?: string }) {
  return (
    <section className="card mt-6">
      <h2 className="mb-3 text-[18px]">{title}</h2>
      <div className="whitespace-pre-wrap rounded-[10px] border p-4 text-[14.5px] leading-relaxed" style={{ borderColor: "var(--line)", background: "#fdfcf9" }}>{text}</div>
      {footer && <div className="muted mt-3 text-[13px]">{footer}</div>}
    </section>
  );
}
