import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, or, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, arbitratorProfiles } from "@/db/schema";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default async function ArbitratorPortal() {
  const s = await auth();
  const role = (s?.user as { role?: string } | undefined)?.role;
  if (!s?.user) redirect("/auth/login");
  if (role !== "arbitrator" && role !== "admin") redirect("/dashboard");
  const uid = (s.user as { id: string }).id;

  const profile = await db.query.arbitratorProfiles.findFirst({ where: eq(arbitratorProfiles.userId, uid) });
  const myCases = await db.select().from(cases).where(eq(cases.arbitratorId, uid)).orderBy(desc(cases.updatedAt));
  const cut = profile?.systemCutPct ?? 30;

  return (
    <main className="container" style={{ maxWidth: 900, padding: "44px 24px 80px" }}>
      <header>
        <div className="eyebrow">Arbitrator portal</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">Welcome{s.user.name ? `, ${s.user.name}` : ""}</h1>
        <p className="muted mt-1 text-[13.5px]">
          {profile ? (profile.national ? "National" : (profile.states?.join(", ") || "no states set")) : "—"}
          {profile ? ` · fee ${usd(profile.feePerCase)} · you keep ${100 - cut}%` : ""}
        </p>
      </header>

      <section className="mt-7">
        <h2 className="text-[18px]">Your assigned cases ({myCases.length})</h2>
        {myCases.length === 0 ? (
          <p className="muted mt-3 text-[14.5px]">No cases assigned yet. When a case escalates and God assigns it to you, it appears here.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {myCases.map((c) => {
              const fee = c.arbitratorFee ?? 0;
              const bothPaid = c.initiatorArbFeePaidAt && c.joinerArbFeePaidAt;
              return (
                <Link key={c.id} href={`/arbitrator/case/${c.id}`} className="card flex items-center justify-between gap-3" style={{ display: "flex" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-fraunces)", fontSize: 17 }}>{c.subject?.trim() || "Dispute"}</div>
                    <div className="muted text-[12.5px]">{c.inviteCode} · fee {usd(fee)} → you {usd(Math.round(fee * (100 - cut) / 100))} · {bothPaid ? "both paid" : "awaiting payment"}</div>
                  </div>
                  <span className="flex items-center gap-3"><StatusChip status={c.status} /><span style={{ color: "var(--brand)" }}>Open →</span></span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
