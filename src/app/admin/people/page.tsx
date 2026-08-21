import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, arbitratorProfiles, attorneyProfiles, cases } from "@/db/schema";
import { impersonate } from "@/actions/impersonate";

export const dynamic = "force-dynamic";
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "—");

export default async function AdminPeople() {
  // Arbitrators
  const arbitrators = await db
    .select({
      id: users.id, email: users.email, name: users.displayName, joined: users.createdAt,
      national: arbitratorProfiles.national, states: arbitratorProfiles.states,
      fee: arbitratorProfiles.feePerCase, cut: arbitratorProfiles.systemCutPct, active: arbitratorProfiles.active,
    })
    .from(users).leftJoin(arbitratorProfiles, eq(arbitratorProfiles.userId, users.id))
    .where(eq(users.role, "arbitrator")).orderBy(desc(users.createdAt));

  // Attorneys
  const attorneys = await db
    .select({
      id: users.id, email: users.email, name: users.displayName, joined: users.createdAt,
      firm: attorneyProfiles.firmName, barState: attorneyProfiles.barState, tier: attorneyProfiles.tier,
      approved: attorneyProfiles.approved, refCode: attorneyProfiles.refCode,
    })
    .from(users).leftJoin(attorneyProfiles, eq(attorneyProfiles.userId, users.id))
    .where(eq(users.role, "attorney")).orderBy(desc(users.createdAt));

  // Customers (regular users) + how many cases they've started
  const customers = await db
    .select({
      id: users.id, email: users.email, name: users.displayName, joined: users.createdAt,
      caseCount: sql<number>`count(${cases.id})`.as("case_count"),
    })
    .from(users).leftJoin(cases, eq(cases.initiatorId, users.id))
    .where(eq(users.role, "user"))
    .groupBy(users.id).orderBy(desc(users.createdAt));

  return (
    <main className="space-y-8">
      <div>
        <div className="eyebrow">People</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">Directory &amp; impersonation</h1>
        <p className="muted mt-1 text-[14px]">View any account exactly as they see it. Click <b>View&nbsp;as</b> to enter their session; a red bar lets you return.</p>
      </div>

      {/* Arbitrators */}
      <Section title="Arbitrators" count={arbitrators.length} accent="var(--escalate)">
        <Table head={["Email", "Name", "Coverage", "Fee · cut", "Status", "Joined", ""]}>
          {arbitrators.map((a) => (
            <Row key={a.id}>
              <Td>{a.email}</Td>
              <Td>{a.name ?? "—"}</Td>
              <Td>{a.national ? "National" : (a.states?.join(", ") || "—")}</Td>
              <Td>{a.fee != null ? `${usd(a.fee)} · ${a.cut ?? 30}%` : "—"}</Td>
              <Td>{a.active ? <span className="chip chip-seal">active</span> : <span className="chip chip-pending">off</span>}</Td>
              <Td>{day(a.joined)}</Td>
              <Td><ViewAs id={a.id} /></Td>
            </Row>
          ))}
          {arbitrators.length === 0 && <EmptyRow span={7} label="No arbitrators yet — create one under Arbitrators." />}
        </Table>
      </Section>

      {/* Attorneys */}
      <Section title="Attorneys" count={attorneys.length} accent="var(--seal)">
        <Table head={["Email", "Firm", "Bar", "Tier", "Approved", "Ref code", ""]}>
          {attorneys.map((a) => (
            <Row key={a.id}>
              <Td>{a.email}</Td>
              <Td>{a.firm ?? a.name ?? "—"}</Td>
              <Td>{a.barState ?? "—"}</Td>
              <Td>{a.tier === "premium" ? <span className="chip chip-seal">premium</span> : <span className="chip chip-pending">free</span>}</Td>
              <Td>{a.approved ? "✓" : "—"}</Td>
              <Td><code className="text-[12px]">{a.refCode ?? "—"}</code></Td>
              <Td><ViewAs id={a.id} /></Td>
            </Row>
          ))}
          {attorneys.length === 0 && <EmptyRow span={7} label="No attorneys yet." />}
        </Table>
      </Section>

      {/* Customers */}
      <Section title="Customers" count={customers.length} accent="var(--brand)">
        <Table head={["Email", "Name", "Cases", "Joined", ""]}>
          {customers.map((c) => (
            <Row key={c.id}>
              <Td>{c.email}</Td>
              <Td>{c.name ?? "—"}</Td>
              <Td>{Number(c.caseCount) || 0}</Td>
              <Td>{day(c.joined)}</Td>
              <Td><ViewAs id={c.id} /></Td>
            </Row>
          ))}
          {customers.length === 0 && <EmptyRow span={5} label="No customers yet." />}
        </Table>
      </Section>
    </main>
  );
}

function ViewAs({ id }: { id: string }) {
  return (
    <form action={impersonate.bind(null, id)}>
      <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "12.5px" }}>View as →</button>
    </form>
  );
}

function Section({ title, count, accent, children }: { title: string; count: number; accent: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-[19px]">
        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: accent }} />
        {title} <span className="muted text-[15px]">({count})</span>
      </h2>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>{children}</div>
    </section>
  );
}
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="w-full text-[14px]">
        <thead>
          <tr style={{ background: "var(--paper-2)" }}>
            {head.map((h, i) => <th key={i} className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-[.06em] muted">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <tr style={{ borderTop: "1px solid var(--line)" }}>{children}</tr>;
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
function EmptyRow({ span, label }: { span: number; label: string }) {
  return <tr><td colSpan={span} className="px-4 py-6 text-center text-[14px] muted">{label}</td></tr>;
}
