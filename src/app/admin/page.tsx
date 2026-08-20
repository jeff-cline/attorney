import Link from "next/link";
import { sql, eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, cases, agreements } from "@/db/schema";
import { verifyChain } from "@/lib/audit";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [u] = await db.select({ n: sql<number>`count(*)::int` }).from(users);
  const [c] = await db.select({ n: sql<number>`count(*)::int` }).from(cases);
  const [a] = await db.select({ n: sql<number>`count(*)::int` }).from(agreements);
  const [r] = await db.select({ n: sql<number>`count(*)::int` }).from(cases).where(eq(cases.status, "resolved"));
  const integrity = await verifyChain();
  const awaitingRuling = await db.select().from(cases).where(eq(cases.status, "arbitration")).orderBy(desc(cases.escalatedAt));

  return (
    <main className="space-y-8">
      <div>
        <div className="eyebrow">Overview</div>
        <h1 className="mt-2 text-[clamp(26px,3.4vw,34px)]">Platform at a glance</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Users" value={u.n} />
        <Stat label="Cases" value={c.n} />
        <Stat label="Resolved" value={r.n} tone="agreed" />
        <Stat label="Agreements" value={a.n} />
      </div>

      <div className="card flex items-center justify-between" style={{ borderLeft: `3px solid ${integrity.ok ? "var(--agreed)" : "var(--escalate)"}` }}>
        <div>
          <div className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-geist-sans)" }}>Tamper-evident audit chain</div>
          <div className="muted text-[13.5px]">{integrity.ok ? `Verified · ${integrity.checked} rows, hash chain intact` : `⚠ BROKEN at ${integrity.brokenAtId} (after ${integrity.checked} rows)`}</div>
        </div>
        <span className={`chip ${integrity.ok ? "chip-agreed" : "chip-escalate"}`}><span className="chip-dot" />{integrity.ok ? "Intact" : "Broken"}</span>
      </div>

      <section>
        <h2 className="mb-3 text-[20px]">Awaiting your ruling <span className="muted text-[15px]">({awaitingRuling.length})</span></h2>
        {awaitingRuling.length === 0 ? (
          <div className="card muted text-[14.5px]">No cases are waiting for a professional arbitrator ruling.</div>
        ) : (
          <div className="space-y-2">
            {awaitingRuling.map((k) => (
              <Link key={k.id} href={`/admin/cases/${k.id}`} className="card card-raised flex items-center justify-between" style={{ borderLeft: "3px solid var(--escalate)" }}>
                <div>
                  <div className="font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>{k.subject?.trim() || "Dispute"}</div>
                  <div className="muted text-[13px]">Case {k.inviteCode} · escalated {k.escalatedAt?.toISOString().slice(0, 16).replace("T", " ") ?? "—"}</div>
                </div>
                <span className="text-[14.5px]" style={{ color: "var(--escalate)" }}>Issue ruling →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "agreed" }) {
  return (
    <div className="card">
      <div className="eyebrow" style={{ color: tone === "agreed" ? "var(--agreed)" : "var(--brand)" }}>{label}</div>
      <div className="mt-1 text-[34px] font-medium" style={{ fontFamily: "var(--font-fraunces)" }}>{value}</div>
    </div>
  );
}
