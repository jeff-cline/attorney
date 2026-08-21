import { redirect } from "next/navigation";
import Link from "next/link";
import { or, eq, and, desc, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, disputeStatements } from "@/db/schema";
import { caseTurn } from "@/lib/case-turn";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/auth/login");

  const myCases = await db
    .select()
    .from(cases)
    .where(or(eq(cases.initiatorId, uid), eq(cases.joinerId, uid)))
    .orderBy(desc(cases.updatedAt));

  // Which of my cases have I already submitted an account for? (turn signal for pending_disputes)
  const ids = myCases.map((c) => c.id);
  const myStmts = ids.length ? await db.select({ caseId: disputeStatements.caseId }).from(disputeStatements).where(and(eq(disputeStatements.userId, uid), inArray(disputeStatements.caseId, ids))) : [];
  const submitted = new Set(myStmts.map((s) => s.caseId));
  const myMoveCount = myCases.filter((c) => caseTurn(c, uid, submitted.has(c.id)).mine).length;

  return (
    <main className="container" style={{ maxWidth: 900, padding: "44px 24px 80px" }}>
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Your dashboard</div>
          <h1 className="mt-2 text-[clamp(26px,3.4vw,36px)]">Your cases</h1>
          {myMoveCount > 0 && <p className="mt-1 text-[14px] font-semibold" style={{ color: "var(--seal)" }}>✋ {myMoveCount} {myMoveCount === 1 ? "case needs" : "cases need"} your move</p>}
        </div>
        <Link href="/start" className="btn btn-brand">+ New case</Link>
      </header>

      {myCases.length === 0 ? (
        <div className="panel text-center">
          <h3 className="text-[22px]">No cases yet</h3>
          <p className="muted mx-auto mt-2 max-w-[40ch]">Open a case to resolve a dispute, or join one with a code the other party sent you.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/start" className="btn btn-brand">Start a case</Link>
            <Link href="/join" className="btn btn-outline">I have a code</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {myCases.map((c) => {
            const t = caseTurn(c, uid, submitted.has(c.id));
            return (
              <Link key={c.id} href={`/dashboard/case/${c.id}`} className="card card-raised flex items-center justify-between gap-4 transition hover:-translate-y-0.5" style={t.mine ? { borderLeft: "4px solid var(--seal)" } : undefined}>
                <div>
                  <div className="text-[17px] font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>
                    {c.subject?.trim() || "Dispute"}
                  </div>
                  <div className="muted mt-1 text-[13px]">
                    Case {c.inviteCode} · {c.initiatorId === uid ? "you started this" : "you joined this"} · {t.label}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {t.mine ? <span className="chip chip-seal">✋ Your move</span> : t.terminal ? <span className="chip chip-agreed"><span className="chip-dot" />Done</span> : <span className="chip chip-pending">⏳ Waiting</span>}
                  <StatusChip status={c.status} />
                  <span className="text-[15px]" style={{ color: "var(--brand)" }}>Open →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
