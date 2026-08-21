import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cases, agreements, users, disputeStatements, arbitratorProfiles } from "@/db/schema";
import { arbitratorRule } from "@/actions/cases";
import { assignArbitrator } from "@/actions/arbitrator";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";

const fmt = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—");
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default async function AdminCaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await db.query.cases.findFirst({ where: eq(cases.id, id) });
  if (!c) notFound();
  const initiator = await db.query.users.findFirst({ where: eq(users.id, c.initiatorId) });
  const joiner = c.joinerId ? await db.query.users.findFirst({ where: eq(users.id, c.joinerId) }) : null;
  const ags = await db.select().from(agreements).where(eq(agreements.caseId, id));
  const statements = await db.select().from(disputeStatements).where(eq(disputeStatements.caseId, id));
  const nameFor = (uid: string) => (uid === c.initiatorId ? initiator : joiner)?.email ?? uid;

  const arbitrators = await db
    .select({ id: users.id, name: users.displayName, national: arbitratorProfiles.national, states: arbitratorProfiles.states, fee: arbitratorProfiles.feePerCase, cut: arbitratorProfiles.systemCutPct, active: arbitratorProfiles.active })
    .from(arbitratorProfiles).innerJoin(users, eq(users.id, arbitratorProfiles.userId));
  const activeArbs = arbitrators.filter((a) => a.active);
  const assignedArb = c.arbitratorId ? arbitrators.find((a) => a.id === c.arbitratorId) : undefined;
  const cut = assignedArb?.cut ?? 30;
  const fee = c.arbitratorFee ?? 0;

  async function rule(fd: FormData) {
    "use server";
    const ruling = String(fd.get("ruling") ?? "").trim();
    if (ruling.length >= 10) await arbitratorRule(id, ruling);
    redirect(`/admin/cases/${id}`);
  }
  async function assign(fd: FormData) {
    "use server";
    await assignArbitrator(fd);
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
          footer={`Initiator: ${c.initiatorDecision ?? "—"} · Joiner: ${c.joinerDecision ?? "—"}${c.aiCostMicros != null ? ` · AI cost: $${(c.aiCostMicros / 1_000_000).toFixed(4)} (${c.aiPromptTokens ?? 0} in / ${c.aiCompletionTokens ?? 0} out)` : ""}`} />
      )}
      {c.aiCitations && c.aiCitations.length > 0 && (
        <section className="card">
          <h2 className="mb-2 text-[19px]">Authorities cited by AI</h2>
          <ul className="pl-5 text-[14px]" style={{ listStyle: "disc" }}>{c.aiCitations.map((cit, i) => <li key={i}>{cit}</li>)}</ul>
          <p className="muted mt-2 text-[12px]">AI-suggested — verify before relying on any authority.</p>
        </section>
      )}

      {/* professional arbitration — assign + ruling */}
      {c.status === "arbitration" && (
        <section className="panel" style={{ borderTop: "3px solid var(--escalate)" }}>
          <h2 className="mb-2 text-[20px]">Professional arbitration</h2>
          {assignedArb ? (
            <>
              <p className="text-[14.5px]">Assigned to <b>{assignedArb.name}</b>. Fee <b>{usd(fee)}</b> — platform keeps {cut}% ({usd(Math.round(fee * cut / 100))}), arbitrator gets {100 - cut}% (<span style={{ color: "var(--seal)" }}>{usd(Math.round(fee * (100 - cut) / 100))}</span>).</p>
              <p className="muted mt-1 text-[13px]">Fee paid — initiator: {fmt(c.initiatorArbFeePaidAt)} · joiner: {fmt(c.joinerArbFeePaidAt)}</p>
              <p className="muted mt-3 text-[13px]">The assigned arbitrator issues the ruling from their portal. As God you can also rule here:</p>
              <form action={rule} className="mt-2">
                <div className="field"><label>Ruling (God override)</label><textarea name="ruling" required minLength={10} placeholder="State the ruling and reasoning…" style={{ minHeight: 140 }} /></div>
                <button className="btn btn-ink">Issue ruling</button>
              </form>
            </>
          ) : (
            <>
              <p className="muted mb-3 text-[14.5px]">A party declined the proposed resolution. Assign an arbitrator; both parties then pay their part of the fee and the arbitrator issues a ruling.</p>
              {activeArbs.length === 0 ? (
                <p className="text-[14px]">No active arbitrators — <Link href="/admin/arbitrators" className="underline" style={{ color: "var(--brand)" }}>create one first</Link>.</p>
              ) : (
                <form action={assign} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="caseId" value={id} />
                  <label className="field" style={{ marginBottom: 0, minWidth: 240 }}>
                    <span className="text-[12px] muted">Arbitrator</span>
                    <select name="arbitratorId" required style={{ padding: "10px 12px", borderRadius: 10 }}>
                      <option value="" disabled>Choose…</option>
                      {activeArbs.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.national ? "National" : (a.states?.join(", ") || "no states")} · {usd(a.fee)}</option>)}
                    </select>
                  </label>
                  <label className="field" style={{ marginBottom: 0, width: 120 }}><span className="text-[12px] muted">Fee ($)</span><input name="fee" type="number" min={0} step={50} defaultValue={activeArbs[0]?.fee ?? 1500} /></label>
                  <button className="btn btn-ink">Assign arbitrator</button>
                </form>
              )}
            </>
          )}
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
