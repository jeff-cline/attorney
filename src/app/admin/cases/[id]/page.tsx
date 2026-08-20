import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cases, agreements, users, disputeStatements } from "@/db/schema";
import { arbitratorRule } from "@/actions/cases";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";

const fmt = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—");

export default async function AdminCaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await db.query.cases.findFirst({ where: eq(cases.id, id) });
  if (!c) notFound();
  const initiator = await db.query.users.findFirst({ where: eq(users.id, c.initiatorId) });
  const joiner = c.joinerId ? await db.query.users.findFirst({ where: eq(users.id, c.joinerId) }) : null;
  const ags = await db.select().from(agreements).where(eq(agreements.caseId, id));
  const statements = await db.select().from(disputeStatements).where(eq(disputeStatements.caseId, id));
  const nameFor = (uid: string) => (uid === c.initiatorId ? initiator : joiner)?.email ?? uid;

  async function rule(fd: FormData) {
    "use server";
    const ruling = String(fd.get("ruling") ?? "").trim();
    if (ruling.length >= 10) await arbitratorRule(id, ruling);
    redirect(`/admin/cases/${id}`);
  }

  return (
    <main className="space-y-6">
      <Link href="/admin/cases" className="text-[14px] muted hover:text-[var(--brand)]">← All cases</Link>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">Case · {c.inviteCode}</div>
          <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">{c.subject?.trim() || "Dispute"}</h1>
        </div>
        <StatusChip status={c.status} />
      </header>

      {/* parties */}
      <div className="grid gap-4 sm:grid-cols-2">
        <PartyCard title="Initiator (plaintiff)" email={initiator?.email} paid={fmt(c.initiatorPaidAt)} agreed={fmt(c.initiatorAgreedAt)} />
        <PartyCard title="Joiner (respondent)" email={joiner?.email} paid={fmt(c.joinerPaidAt)} agreed={fmt(c.joinerAgreedAt)} />
      </div>

      {/* statements */}
      <section className="card">
        <h2 className="mb-3 text-[19px]">Accounts submitted ({statements.length})</h2>
        {statements.length === 0 ? <p className="muted text-[14.5px]">No statements yet.</p> : (
          <div className="space-y-3">
            {statements.map((s) => (
              <div key={s.id} className="rounded-[10px] p-3 text-[14.5px]" style={{ background: "var(--paper-2)" }}>
                <div className="mb-1 text-[12.5px] font-semibold" style={{ color: "var(--brand)" }}>{nameFor(s.userId)} · {fmt(s.submittedAt)}</div>
                <div className="whitespace-pre-wrap">{s.statement}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {c.neutralSummary && <Block title="Neutral summary" text={c.neutralSummary} />}
      {c.aiDecision && (
        <Block title="AI-assisted proposed resolution" text={c.aiDecision}
          footer={`Initiator: ${c.initiatorDecision ?? "—"} · Joiner: ${c.joinerDecision ?? "—"}`} />
      )}

      {/* arbitrator ruling UI */}
      {c.status === "arbitration" && (
        <section className="panel" style={{ borderTop: "3px solid var(--escalate)" }}>
          <h2 className="mb-2 text-[20px]">Issue the arbitrator&apos;s ruling</h2>
          <p className="muted mb-4 text-[14.5px]">This case escalated because a party declined the proposed resolution. Review both accounts above and enter an independent ruling. Both parties will be asked to accept it; if either declines, the case moves to attorneys. Arbitration fee is capped at $1,500.</p>
          <form action={rule}>
            <div className="field">
              <label>Ruling</label>
              <textarea name="ruling" required minLength={10} placeholder="State the ruling and the reasoning both parties will see…" style={{ minHeight: 160 }} />
            </div>
            <button className="btn btn-ink">Issue ruling</button>
          </form>
        </section>
      )}
      {c.arbitratorRuling && (
        <Block title="Arbitrator's ruling" text={c.arbitratorRuling}
          footer={`Ruled ${fmt(c.arbitratorRuledAt)} · Initiator accepted: ${fmt(c.initiatorArbOkAt)} · Joiner accepted: ${fmt(c.joinerArbOkAt)}`} />
      )}

      {/* audit chain */}
      <section className="card">
        <h2 className="mb-3 text-[19px]">Audit chain rows ({ags.length})</h2>
        <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
          {ags.map((a) => (
            <li key={a.id} className="break-all py-2.5 text-[12px]" style={{ fontFamily: "ui-monospace, monospace" }}>
              <div className="text-[13px]" style={{ fontFamily: "var(--font-geist-sans)" }}>{fmt(a.createdAt)} · <b>{a.agreementType}</b></div>
              <div className="muted">row: {a.rowHash}</div>
            </li>
          ))}
          {ags.length === 0 && <li className="py-2 text-[14px] muted">No agreements yet.</li>}
        </ul>
      </section>
    </main>
  );
}

function PartyCard({ title, email, paid, agreed }: { title: string; email?: string; paid: string; agreed: string }) {
  return (
    <div className="card">
      <div className="eyebrow">{title}</div>
      <div className="mt-1 text-[15.5px] font-semibold" style={{ fontFamily: "var(--font-geist-sans)" }}>{email ?? "— awaiting —"}</div>
      <div className="muted mt-2 text-[13px]">Paid: {paid}</div>
      <div className="muted text-[13px]">Accepted terms: {agreed}</div>
    </div>
  );
}
function Block({ title, text, footer }: { title: string; text: string; footer?: string }) {
  return (
    <section className="card">
      <h2 className="mb-3 text-[19px]">{title}</h2>
      <div className="whitespace-pre-wrap rounded-[10px] border p-4 text-[14.5px] leading-relaxed" style={{ borderColor: "var(--line)", background: "#fdfcf9" }}>{text}</div>
      {footer && <div className="muted mt-3 text-[13px]">{footer}</div>}
    </section>
  );
}
