"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cases, users, disputeStatements } from "@/db/schema";
import { generateInviteCode, INVITE_CODE_REGEX } from "@/lib/codes";
import { auth } from "@/lib/auth";
import { appendAgreement } from "@/lib/audit";
import { sha256 } from "@/lib/hash";
import { captureRequestMeta } from "@/lib/ip";
import { currentTos } from "@/lib/tos";
import { sendTemplated } from "@/lib/email";
import { pleaseAgreeHtml } from "@/emails/templates";
import { neutralSummary, proposedResolution, type PartyStatement } from "@/lib/ai";
import { env } from "@/lib/env";

const ARBITRATION_TEXT =
  "I agree to use Attorney.plus arbitration as defined in the current Terms of Service.";

async function currentUserId(): Promise<string> {
  const s = await auth();
  const id = (s?.user as { id?: string } | undefined)?.id;
  if (!id) throw new Error("unauthenticated");
  return id;
}

type CaseRow = typeof cases.$inferSelect;
function role(c: CaseRow, userId: string) {
  const isInitiator = c.initiatorId === userId;
  const isJoiner = c.joinerId === userId;
  if (!isInitiator && !isJoiner) throw new Error("not a party to this case");
  return { isInitiator, isJoiner };
}

async function partyName(userId: string): Promise<string> {
  const u = await db.query.users.findFirst({ where: eq(users.id, userId) });
  return u?.displayName || u?.email || "A party";
}

/** Email the OTHER party a nudge with a link to the case. */
async function nudgeOther(c: CaseRow, actingUserId: string, subject: string) {
  const otherId = actingUserId === c.initiatorId ? c.joinerId : c.initiatorId;
  if (!otherId) return;
  const other = await db.query.users.findFirst({ where: eq(users.id, otherId) });
  if (!other) return;
  const caseUrl = `${env.APP_URL}/dashboard/case/${c.id}`;
  await sendTemplated({
    to: other.email,
    subject,
    html: pleaseAgreeHtml({ caseUrl }),
    template: "action-needed",
    payload: { caseId: c.id },
  }).catch(() => {});
}

async function getCase(caseId: string): Promise<CaseRow> {
  const c = await db.query.cases.findFirst({ where: eq(cases.id, caseId) });
  if (!c) throw new Error("case not found");
  return c;
}

/* ── 1. Start ─────────────────────────────────────────────────────── */
export async function createCase(subject?: string) {
  const userId = await currentUserId();
  for (let i = 0; i < 6; i++) {
    const code = generateInviteCode();
    try {
      const [c] = await db
        .insert(cases)
        .values({ inviteCode: code, initiatorId: userId, subject: subject ?? null, status: "awaiting_initiator_payment" })
        .returning();
      return c;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("cases_invite_code_uq")) throw e;
    }
  }
  throw new Error("could not generate unique invite code after 6 attempts");
}

/* ── 2. Pay your share (stubbed free until Stripe) ────────────────── */
export async function payShare(caseId: string) {
  const userId = await currentUserId();
  const c = await getCase(caseId);
  const { isInitiator, isJoiner } = role(c, userId);
  const now = new Date();

  if (isInitiator && !c.initiatorPaidAt) {
    // Initiator pays first → their code becomes active and shareable.
    await db.update(cases).set({ initiatorPaidAt: now, status: "pending_join", updatedAt: now }).where(eq(cases.id, c.id));
  } else if (isJoiner && !c.joinerPaidAt) {
    // Respondent pays their half → both move to accepting the terms.
    await db.update(cases).set({ joinerPaidAt: now, status: "pending_agreements", updatedAt: now }).where(eq(cases.id, c.id));
    await nudgeOther(c, userId, "The other party has paid — accept the terms to continue");
  }
  return getCase(caseId);
}

/* ── 3. Join with a code ──────────────────────────────────────────── */
const JoinInput = z.object({
  inviteCode: z.string().trim().toUpperCase().refine((v) => INVITE_CODE_REGEX.test(v), "Invalid invite code format"),
});
export async function joinCase(
  fd: FormData,
): Promise<{ ok: true; caseId: string } | { ok: false; error: string }> {
  let parsed;
  try {
    parsed = JoinInput.parse(Object.fromEntries(fd));
  } catch {
    return { ok: false, error: "Invalid code format. Expected ATTPLUS-XXXXXX." };
  }
  const userId = await currentUserId();
  const c = await db.query.cases.findFirst({ where: eq(cases.inviteCode, parsed.inviteCode) });
  if (!c) return { ok: false, error: "Code not found." };
  if (!c.initiatorPaidAt) return { ok: false, error: "This case isn't ready to join yet." };
  if (c.initiatorId === userId) return { ok: false, error: "You can't join your own case." };
  if (c.joinerId && c.joinerId !== userId) return { ok: false, error: "This case has already been joined." };

  const [updated] = await db
    .update(cases)
    .set({ joinerId: userId, status: "awaiting_joiner_payment", updatedAt: new Date() })
    .where(eq(cases.id, c.id))
    .returning();
  await nudgeOther(updated, userId, "The other party has joined your case");
  return { ok: true, caseId: updated.id };
}

/* ── 4. Accept the arbitration terms (both parties) ───────────────── */
export async function agreeToArbitration(caseId: string) {
  const userId = await currentUserId();
  const meta = await captureRequestMeta();
  const tos = await currentTos();
  const c = await getCase(caseId);
  const { isInitiator, isJoiner } = role(c, userId);

  await appendAgreement({
    caseId: c.id,
    userId,
    agreementType: "arbitration_consent",
    agreementTextHash: sha256(`${ARBITRATION_TEXT}::${tos.version}`),
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  const now = new Date();
  const initiatorAgreedAt = isInitiator && !c.initiatorAgreedAt ? now : c.initiatorAgreedAt;
  const joinerAgreedAt = isJoiner && !c.joinerAgreedAt ? now : c.joinerAgreedAt;
  const both = initiatorAgreedAt && joinerAgreedAt;

  await db.update(cases).set({
    initiatorAgreedAt: initiatorAgreedAt ?? null,
    joinerAgreedAt: joinerAgreedAt ?? null,
    status: both ? "pending_disputes" : c.status,
    updatedAt: now,
  }).where(eq(cases.id, c.id));

  await nudgeOther(c, userId, both ? "Both parties have agreed — submit your account" : "Action needed: accept the terms");
  return getCase(caseId);
}

/* ── 5. Submit your account of the dispute ────────────────────────── */
const StatementInput = z.string().trim().min(20, "Please add at least a couple of sentences.").max(8000);
export async function submitDispute(
  caseId: string,
  raw: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const userId = await currentUserId();
  let statement: string;
  try {
    statement = StatementInput.parse(raw);
  } catch (e) {
    return { ok: false, error: (e as z.ZodError).issues?.[0]?.message || "Statement too short." };
  }
  const c = await getCase(caseId);
  role(c, userId);

  await db
    .insert(disputeStatements)
    .values({ caseId: c.id, userId, statement })
    .onConflictDoUpdate({
      target: [disputeStatements.caseId, disputeStatements.userId],
      set: { statement, submittedAt: new Date() },
    });

  // Both submitted? → generate the neutral summary.
  const all = await db.select().from(disputeStatements).where(eq(disputeStatements.caseId, c.id));
  const haveBoth = all.some((s) => s.userId === c.initiatorId) && c.joinerId && all.some((s) => s.userId === c.joinerId);
  if (haveBoth) {
    const parties: PartyStatement[] = [];
    for (const s of all) parties.push({ name: await partyName(s.userId), statement: s.statement });
    const summary = neutralSummary(c.subject, parties);
    await db.update(cases).set({ neutralSummary: summary, status: "summary_review", updatedAt: new Date() }).where(eq(cases.id, c.id));
    await nudgeOther(c, userId, "A neutral summary is ready to review");
  } else {
    await nudgeOther(c, userId, "The other party submitted their account — add yours");
  }
  return { ok: true };
}

/* ── 6. Approve the neutral summary (both parties) ────────────────── */
export async function approveSummary(caseId: string) {
  const userId = await currentUserId();
  const c = await getCase(caseId);
  const { isInitiator, isJoiner } = role(c, userId);
  const now = new Date();
  const iOk = isInitiator && !c.initiatorSummaryOkAt ? now : c.initiatorSummaryOkAt;
  const jOk = isJoiner && !c.joinerSummaryOkAt ? now : c.joinerSummaryOkAt;
  const both = iOk && jOk;

  if (both) {
    // Both approved → produce the AI-assisted proposed resolution.
    const all = await db.select().from(disputeStatements).where(eq(disputeStatements.caseId, c.id));
    const parties: PartyStatement[] = [];
    for (const s of all) parties.push({ name: await partyName(s.userId), statement: s.statement });
    const decision = proposedResolution(c.subject, parties);
    await db.update(cases).set({
      initiatorSummaryOkAt: iOk ?? null, joinerSummaryOkAt: jOk ?? null,
      aiDecision: decision, aiDecisionAt: now, status: "ai_decision", updatedAt: now,
    }).where(eq(cases.id, c.id));
    await nudgeOther(c, userId, "A proposed resolution is ready — accept or decline");
  } else {
    await db.update(cases).set({ initiatorSummaryOkAt: iOk ?? null, joinerSummaryOkAt: jOk ?? null, updatedAt: now }).where(eq(cases.id, c.id));
    await nudgeOther(c, userId, "The other party approved the summary — your turn");
  }
  return getCase(caseId);
}

/* ── 7. Respond to the AI-assisted decision ───────────────────────── */
export async function respondToDecision(caseId: string, choice: "agree" | "disagree") {
  const userId = await currentUserId();
  const meta = await captureRequestMeta();
  const c = await getCase(caseId);
  const { isInitiator } = role(c, userId);
  const now = new Date();

  if (choice === "agree") {
    await appendAgreement({
      caseId: c.id, userId, agreementType: "decision_accepted",
      agreementTextHash: sha256(`ai-decision::${c.aiDecision ?? ""}`),
      ipAddress: meta.ip, userAgent: meta.userAgent,
    });
  }

  const initiatorDecision = isInitiator ? choice : c.initiatorDecision;
  const joinerDecision = !isInitiator ? choice : c.joinerDecision;
  const anyDisagree = initiatorDecision === "disagree" || joinerDecision === "disagree";
  const bothAgree = initiatorDecision === "agree" && joinerDecision === "agree";

  await db.update(cases).set({
    initiatorDecision: initiatorDecision ?? null,
    joinerDecision: joinerDecision ?? null,
    status: bothAgree ? "resolved" : anyDisagree ? "arbitration" : c.status,
    resolvedAt: bothAgree ? now : c.resolvedAt,
    escalatedAt: anyDisagree ? now : c.escalatedAt,
    updatedAt: now,
  }).where(eq(cases.id, c.id));

  await nudgeOther(c, userId, bothAgree ? "Resolved — both parties accepted" : anyDisagree ? "Escalated to a professional arbitrator" : "The other party responded to the proposed resolution");
  return getCase(caseId);
}

/* ── 8. Arbitrator issues a ruling (admin / arbitrator) ───────────── */
export async function arbitratorRule(caseId: string, ruling: string) {
  const s = await auth();
  if ((s?.user as { role?: string } | undefined)?.role !== "admin") throw new Error("forbidden");
  const now = new Date();
  await db.update(cases).set({ arbitratorRuling: ruling.trim(), arbitratorRuledAt: now, status: "arbitration_ruling", updatedAt: now }).where(eq(cases.id, caseId));
  return getCase(caseId);
}

/* ── 9. Respond to the arbitrator's ruling ────────────────────────── */
export async function respondToArbitration(caseId: string, choice: "agree" | "disagree") {
  const userId = await currentUserId();
  const meta = await captureRequestMeta();
  const c = await getCase(caseId);
  const { isInitiator } = role(c, userId);
  const now = new Date();

  if (choice === "agree") {
    await appendAgreement({
      caseId: c.id, userId, agreementType: "decision_accepted",
      agreementTextHash: sha256(`arbitrator-ruling::${c.arbitratorRuling ?? ""}`),
      ipAddress: meta.ip, userAgent: meta.userAgent,
    });
  }
  const iOk = isInitiator ? (choice === "agree" ? now : null) : c.initiatorArbOkAt;
  const jOk = !isInitiator ? (choice === "agree" ? now : null) : c.joinerArbOkAt;
  const disagree = choice === "disagree";
  const bothAgree = iOk && jOk;

  await db.update(cases).set({
    initiatorArbOkAt: iOk, joinerArbOkAt: jOk,
    status: bothAgree ? "resolved" : disagree ? "litigation" : c.status,
    resolvedAt: bothAgree ? now : c.resolvedAt,
    litigationAt: disagree ? now : c.litigationAt,
    updatedAt: now,
  }).where(eq(cases.id, c.id));
  await nudgeOther(c, userId, bothAgree ? "Resolved — both parties accepted the ruling" : disagree ? "Escalated to attorneys" : "The other party responded to the ruling");
  return getCase(caseId);
}
