import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { cases } from "@/db/schema";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";

export default async function AdminCases() {
  const list = await db.select().from(cases).orderBy(desc(cases.updatedAt));
  return (
    <main className="space-y-6">
      <div>
        <div className="eyebrow">Cases</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">All cases <span className="muted text-[18px]">({list.length})</span></h1>
      </div>
      {list.length === 0 ? (
        <div className="card muted">No cases yet.</div>
      ) : (
        <div className="space-y-2">
          {list.map((c) => (
            <Link key={c.id} href={`/admin/cases/${c.id}`} className="card card-raised flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>{c.subject?.trim() || "Dispute"}</div>
                <div className="muted mt-0.5 text-[13px]">{c.inviteCode} · updated {c.updatedAt.toISOString().slice(0, 16).replace("T", " ")}</div>
              </div>
              <div className="flex items-center gap-4">
                <StatusChip status={c.status} />
                <span className="text-[14px]" style={{ color: "var(--brand)" }}>Open →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
