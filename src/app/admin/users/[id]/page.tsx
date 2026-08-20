import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, or, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, cases, agreements } from "@/db/schema";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!u) notFound();
  const myCases = await db.select().from(cases).where(or(eq(cases.initiatorId, id), eq(cases.joinerId, id))).orderBy(desc(cases.updatedAt));
  const myAgs = await db.select().from(agreements).where(eq(agreements.userId, id)).orderBy(desc(agreements.createdAt));

  return (
    <main className="space-y-6">
      <Link href="/admin/users" className="text-[14px] muted hover:text-[var(--brand)]">← All users</Link>
      <header>
        <div className="eyebrow">User</div>
        <h1 className="mt-2 text-[clamp(22px,2.6vw,30px)]">{u.email}</h1>
        <div className="muted mt-1 text-[13.5px]">{u.displayName ?? "—"} · <span className={`chip ${u.role === "admin" ? "chip-seal" : "chip-pending"}`}>{u.role}</span> · since {u.createdAt.toISOString().slice(0, 10)}</div>
      </header>

      <section className="card">
        <h2 className="mb-3 text-[19px]">Cases ({myCases.length})</h2>
        {myCases.length === 0 ? <p className="muted text-[14.5px]">No cases.</p> : (
          <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
            {myCases.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                <span style={{ fontFamily: "var(--font-fraunces)" }}>{c.subject?.trim() || "Dispute"} <span className="muted text-[12px]">({c.inviteCode})</span></span>
                <span className="flex items-center gap-3"><StatusChip status={c.status} /><Link href={`/admin/cases/${c.id}`} style={{ color: "var(--brand)" }}>Open →</Link></span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 text-[19px]">Signed agreements ({myAgs.length})</h2>
        <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
          {myAgs.map((a) => (
            <li key={a.id} className="py-2.5 text-[13px]" style={{ fontFamily: "var(--font-geist-sans)" }}>
              {a.createdAt.toISOString().slice(0, 16).replace("T", " ")} · <b>{a.agreementType}</b> · <span className="muted" style={{ fontFamily: "ui-monospace, monospace" }}>{a.rowHash.slice(0, 16)}…</span>
            </li>
          ))}
          {myAgs.length === 0 && <li className="py-2 text-[14px] muted">No agreements.</li>}
        </ul>
      </section>
    </main>
  );
}
