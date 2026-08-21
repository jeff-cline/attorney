"use server";

import { and, eq, desc, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { cases, leadClaims } from "@/db/schema";
import { auth } from "@/lib/auth";
import { redeemCoins } from "@/lib/coins";
import { leadFeeFor } from "@/lib/leads";
import { paymentsConfigured } from "@/lib/settings";
import { notifyGod } from "@/lib/notify";

type Attorney = { id: string; role: string };
async function requireAttorney(): Promise<Attorney> {
  const s = await auth();
  const su = s?.user as { id?: string; role?: string } | undefined;
  if (!su?.id || (su.role !== "attorney" && su.role !== "admin")) throw new Error("forbidden");
  return { id: su.id, role: su.role! };
}

/** Post-arbitration leads this attorney can claim: cases in litigation they did
 *  NOT refer (their referred party is reserved to them free) and haven't claimed. */
export async function claimableLeads(attorneyId: string) {
  const mine = await db.select({ caseId: leadClaims.caseId }).from(leadClaims).where(eq(leadClaims.attorneyId, attorneyId));
  const claimedIds = mine.map((m) => m.caseId);
  const rows = await db
    .select({ id: cases.id, code: cases.inviteCode, subject: cases.subject, category: cases.category, jurisdiction: cases.jurisdiction, at: cases.litigationAt, referredBy: cases.referredByAttorneyId })
    .from(cases)
    .where(and(eq(cases.status, "litigation"), claimedIds.length ? notInArray(cases.id, claimedIds) : undefined))
    .orderBy(desc(cases.litigationAt));
  // Exclude the attorney's own referred cases (those are the free reserved leads).
  return rows.filter((r) => r.referredBy !== attorneyId).map((r) => ({ ...r, fee: leadFeeFor(r.category) }));
}

/** Claim a lead: A+COINS auto-apply at $1/coin, remainder is the cash fee. */
export async function claimLead(caseId: string): Promise<{ ok: boolean; error?: string; coinsUsed?: number; charged?: number; code?: string }> {
  const att = await requireAttorney();
  const c = await db.query.cases.findFirst({ where: eq(cases.id, caseId) });
  if (!c) return { ok: false, error: "Lead not found." };
  if (c.status !== "litigation") return { ok: false, error: "This case is not an available lead." };
  if (c.referredByAttorneyId === att.id) return { ok: false, error: "This is your reserved lead — it's already free to you." };

  const existing = await db.query.leadClaims.findFirst({ where: and(eq(leadClaims.attorneyId, att.id), eq(leadClaims.caseId, caseId)) });
  if (existing) return { ok: true, coinsUsed: existing.coinsUsed, charged: existing.chargedUsd, code: c.inviteCode };

  const fee = leadFeeFor(c.category);
  const { coinsUsed, remainderUsd } = await redeemCoins(att.id, fee, caseId);
  const payOn = await paymentsConfigured();
  // Fully covered by coins → paid. Otherwise the cash remainder is billed when
  // card payments are enabled (Stripe not yet configured → pending_payment).
  const status = remainderUsd <= 0 ? "paid" : payOn ? "pending_payment" : "pending_payment";

  await db.insert(leadClaims).values({ attorneyId: att.id, caseId, feeUsd: fee, coinsUsed, chargedUsd: remainderUsd, status }).onConflictDoNothing();

  await notifyGod("Attorney claimed a lead", [
    `Case <b>${c.inviteCode}</b>${c.subject ? ` — ${c.subject}` : ""}`,
    `Fee $${fee} · A+COINS applied: ${coinsUsed} ($${coinsUsed}) · cash due: $${remainderUsd}`,
  ]);
  return { ok: true, coinsUsed, charged: remainderUsd, code: c.inviteCode };
}
