/**
 * End-to-end walkthrough of the two-party arbitration funnel.
 * Drives the REAL server-action code (src/actions/cases.ts) against the live DB;
 * only the session (auth) + side effects (email/ip) are mocked.
 *
 * Run on the box:  npx vitest run tests/funnel.walk.test.ts
 */
import { readFileSync } from "node:fs";
import { describe, it, beforeAll, expect, vi } from "vitest";
import { eq } from "drizzle-orm";

// Load .env into process.env before any DB module is dynamically imported.
try {
  for (const l of readFileSync(".env", "utf8").split("\n")) {
    const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) {
      let v = m[2].trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
} catch { /* env already present */ }

vi.mock("@/lib/ip", () => ({ captureRequestMeta: async () => ({ ip: "127.0.0.1", userAgent: "funnel-walk" }) }));
vi.mock("@/lib/email", () => ({ sendTemplated: async () => ({ ok: true }) }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn(async () => ({ user: null })), signIn: vi.fn(), signOut: vi.fn() }));

/* eslint-disable @typescript-eslint/no-explicit-any */
let db: any, schema: any, actions: any, authMod: any, verifyChain: any;
let P: any, D: any, ADMIN: any, caseId: string, inviteCode: string;
const trail: Array<[string, string]> = [];

const actAs = (u: any) => (authMod.auth as any).mockResolvedValue({ user: u });
const status = async (): Promise<string> =>
  (await db.query.cases.findFirst({ where: eq(schema.cases.id, caseId) }))?.status;
async function step(label: string) {
  const s = await status();
  trail.push([label, s]);
  return s;
}

describe("two-party arbitration funnel — full walkthrough", () => {
  beforeAll(async () => {
    ({ db } = await import("@/lib/db"));
    schema = await import("@/db/schema");
    actions = await import("@/actions/cases");
    authMod = await import("@/lib/auth");
    ({ verifyChain } = await import("@/lib/audit"));
    const bcrypt = (await import("bcryptjs")).default;
    const hash = await bcrypt.hash("Walkthrough!23", 12);
    const tag = `${Date.now()}`;
    [P] = await db.insert(schema.users).values({ email: `walk-plaintiff-${tag}@test.attorney.plus`, passwordHash: hash, displayName: "Test Plaintiff (Dana)", role: "user" }).returning();
    [D] = await db.insert(schema.users).values({ email: `walk-defendant-${tag}@test.attorney.plus`, passwordHash: hash, displayName: "Test Defendant (Morgan)", role: "user" }).returning();
    ADMIN = await db.query.users.findFirst({ where: eq(schema.users.email, "jeff.cline@me.com") });
    expect(ADMIN?.role).toBe("admin");
  });

  it("1. Plaintiff starts a case", async () => {
    actAs(P);
    const c = await actions.createCase("TEST — Security deposit dispute: $1,800 withheld after move-out");
    caseId = c.id; inviteCode = c.inviteCode;
    expect(await step("Plaintiff starts case")).toBe("awaiting_initiator_payment");
  });

  it("2. Plaintiff pays their share → gets a shareable code", async () => {
    actAs(P);
    await actions.payShare(caseId);
    expect(await step("Plaintiff pays (code active)")).toBe("pending_join");
  });

  it("3. Defendant joins with the code", async () => {
    actAs(D);
    const fd = new FormData(); fd.set("inviteCode", inviteCode);
    const r = await actions.joinCase(fd);
    expect(r.ok).toBe(true);
    expect(await step("Defendant joins with code")).toBe("awaiting_joiner_payment");
  });

  it("4. Defendant pays their half", async () => {
    actAs(D);
    await actions.payShare(caseId);
    expect(await step("Defendant pays their half")).toBe("pending_agreements");
  });

  it("5. Both accept the arbitration terms", async () => {
    actAs(P); await actions.agreeToArbitration(caseId);
    expect(await step("Plaintiff accepts terms")).toBe("pending_agreements"); // waiting on other
    actAs(D); await actions.agreeToArbitration(caseId);
    expect(await step("Both accept terms")).toBe("pending_disputes");
  });

  it("6. Both submit their account of the dispute", async () => {
    actAs(P); await actions.submitDispute(caseId, "Plaintiff: The landlord withheld my entire $1,800 deposit citing vague 'cleaning and damages' with no itemized receipts, which violates the lease and state deposit law.");
    expect(await step("Plaintiff submits account")).toBe("pending_disputes");
    actAs(D); await actions.submitDispute(caseId, "Defendant: The unit needed professional cleaning, carpet replacement, and wall repair well beyond normal wear; I have invoices totalling more than the deposit.");
    expect(await step("Both submit → neutral summary")).toBe("summary_review");
  });

  it("7. Both approve the neutral summary → AI proposes a resolution", async () => {
    actAs(P); await actions.approveSummary(caseId);
    expect(await step("Plaintiff approves summary")).toBe("summary_review");
    actAs(D); await actions.approveSummary(caseId);
    expect(await step("Both approve → AI decision")).toBe("ai_decision");
  });

  it("8. One party disagrees with the AI decision → escalates to an arbitrator", async () => {
    actAs(P); await actions.respondToDecision(caseId, "agree");
    expect(await step("Plaintiff accepts AI decision")).toBe("ai_decision");
    actAs(D); await actions.respondToDecision(caseId, "disagree");
    expect(await step("Defendant declines → ESCALATE")).toBe("arbitration");
  });

  it("9. Admin/arbitrator issues a binding ruling", async () => {
    actAs(ADMIN);
    await actions.arbitratorRule(caseId, "Arbitrator ruling: Landlord returns $1,200 of the deposit within 14 days; tenant bears $600 toward documented cleaning. Binding under the Attorney.plus Terms of Service.");
    expect(await step("Arbitrator issues ruling")).toBe("arbitration_ruling");
  });

  it("10. Both accept the ruling → RESOLVED", async () => {
    actAs(P); await actions.respondToArbitration(caseId, "agree");
    expect(await step("Plaintiff accepts ruling")).toBe("arbitration_ruling");
    actAs(D); await actions.respondToArbitration(caseId, "agree");
    expect(await step("Both accept ruling → RESOLVED")).toBe("resolved");
  });

  it("11. Audit chain is intact and records every agreement", async () => {
    const res = await verifyChain();
    expect(res.ok).toBe(true);
    const ags = await db.select().from(schema.agreements).where(eq(schema.agreements.caseId, caseId));
    // 2 arbitration_consent + 1 decision_accepted (P) + 2 decision_accepted (both accept ruling) = 5
    expect(ags.length).toBeGreaterThanOrEqual(5);

    // Print the walked funnel.
    const line = "─".repeat(58);
    console.log("\n" + line + "\n  TWO-PARTY ARBITRATION FUNNEL — WALKED END TO END\n" + line);
    trail.forEach(([label, s], i) => console.log(`  ${String(i + 1).padStart(2)}. ${label.padEnd(34)} → ${s}`));
    console.log(line);
    console.log(`  Case ${caseId}`);
    console.log(`  Invite code: ${inviteCode}`);
    console.log(`  Audit chain: ${res.ok ? "INTACT" : "BROKEN"} · ${ags.length} agreements recorded`);
    console.log(line + "\n");
  });
});
