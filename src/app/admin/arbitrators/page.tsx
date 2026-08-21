import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, arbitratorProfiles, cases } from "@/db/schema";
import { createArbitrator } from "@/actions/arbitrator";

export const dynamic = "force-dynamic";
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default async function AdminArbitrators() {
  const rows = await db
    .select({
      id: users.id, email: users.email, name: users.displayName,
      states: arbitratorProfiles.states, national: arbitratorProfiles.national,
      fee: arbitratorProfiles.feePerCase, cut: arbitratorProfiles.systemCutPct, active: arbitratorProfiles.active,
    })
    .from(arbitratorProfiles)
    .innerJoin(users, eq(users.id, arbitratorProfiles.userId))
    .orderBy(desc(arbitratorProfiles.createdAt));

  const openCount = (await db.select().from(cases).where(eq(cases.status, "arbitration"))).length;

  async function add(fd: FormData) {
    "use server";
    const r = await createArbitrator(fd);
    redirect(r.ok ? "/admin/arbitrators" : `/admin/arbitrators?error=${encodeURIComponent(r.error ?? "failed")}`);
  }

  return (
    <main className="space-y-6" style={{ maxWidth: 860 }}>
      <header>
        <div className="eyebrow">Panel</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">Arbitrators</h1>
        <p className="muted mt-2 text-[14px]">Create professional arbitrators, set their coverage (by state or national) and per-case fee. The platform keeps a cut; the arbitrator gets the rest. {openCount > 0 && <b>{openCount} case(s) awaiting assignment →</b>}</p>
      </header>

      <form action={add} className="card space-y-1">
        <h2 className="text-[17px] mb-2">Add an arbitrator</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="field"><label>Name</label><input name="displayName" required placeholder="Full name" /></div>
          <div className="field"><label>Email</label><input name="email" type="email" required placeholder="arbitrator@email.com" /></div>
        </div>
        <div className="field"><label>Temporary password</label><input name="password" type="password" required minLength={12} placeholder="At least 12 characters" /></div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="field"><label>States <span className="muted">(comma, 2-letter)</span></label><input name="states" placeholder="TX, CA, NY" style={{ textTransform: "uppercase" }} /></div>
          <div className="field"><label>Fee per case ($)</label><input name="feePerCase" type="number" min={0} step={50} defaultValue={1500} /></div>
          <div className="field"><label>Platform cut (%)</label><input name="systemCutPct" type="number" min={0} max={100} defaultValue={30} /></div>
        </div>
        <label className="mb-3 flex items-center gap-2.5 text-[14px]"><input type="checkbox" name="national" style={{ width: "auto" }} /><span>National (available in every state)</span></label>
        <button className="btn btn-brand">Create arbitrator</button>
      </form>

      <section className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-geist-sans)", fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
                <th style={{ padding: "9px 16px" }}>Arbitrator</th>
                <th style={{ padding: "9px 16px" }}>Coverage</th>
                <th style={{ padding: "9px 16px", textAlign: "right" }}>Fee</th>
                <th style={{ padding: "9px 16px", textAlign: "right" }}>Arbitrator gets</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td style={{ padding: "10px 16px" }}><b style={{ fontFamily: "var(--font-fraunces)" }}>{r.name}</b><div className="muted text-[12.5px]">{r.email}</div></td>
                  <td style={{ padding: "10px 16px" }}>{r.national ? <span className="chip chip-seal">National</span> : (r.states?.length ? r.states.join(", ") : <span className="muted">none</span>)}</td>
                  <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{usd(r.fee)}</td>
                  <td style={{ padding: "10px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--seal)" }}>{usd(Math.round(r.fee * (100 - (r.cut ?? 30)) / 100))} <span className="muted text-[11px]">({100 - (r.cut ?? 30)}%)</span></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="muted" style={{ padding: "14px 16px" }}>No arbitrators yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
