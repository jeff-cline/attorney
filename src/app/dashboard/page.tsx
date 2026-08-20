import { redirect } from "next/navigation";
import Link from "next/link";
import { or, eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/db/schema";
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

  return (
    <main className="container" style={{ maxWidth: 900, padding: "44px 24px 80px" }}>
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Your dashboard</div>
          <h1 className="mt-2 text-[clamp(26px,3.4vw,36px)]">Your cases</h1>
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
          {myCases.map((c) => (
            <Link key={c.id} href={`/dashboard/case/${c.id}`} className="card card-raised flex items-center justify-between gap-4 transition hover:-translate-y-0.5">
              <div>
                <div className="text-[17px] font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>
                  {c.subject?.trim() || "Dispute"}
                </div>
                <div className="muted mt-1 text-[13px]">
                  Case {c.inviteCode} · {c.initiatorId === uid ? "you started this" : "you joined this"}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusChip status={c.status} />
                <span className="text-[15px]" style={{ color: "var(--brand)" }}>Open →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
