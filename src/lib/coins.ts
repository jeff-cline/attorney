import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { coinLedger, attorneyProfiles } from "@/db/schema";

/** 1 A+COIN = $1.00 credit toward future lead-referral fees. */
export const COIN_USD = 1;
export const COINS_REFERRAL_SIGNUP = 25; // referred person starts a case
export const COINS_REFERRAL_PAID = 200; // referred person actually pays

/** Award coins to an attorney. Idempotent per (attorney, case, reason) — the
 *  unique index makes a repeat of the same event a no-op, so callers can fire
 *  freely without tracking whether they've already paid out. */
export async function awardCoins(
  attorneyId: string,
  delta: number,
  reason: string,
  caseId?: string | null,
  note?: string
): Promise<void> {
  await db
    .insert(coinLedger)
    .values({ attorneyId, delta, reason, caseId: caseId ?? null, note: note ?? null })
    .onConflictDoNothing({ target: [coinLedger.attorneyId, coinLedger.caseId, coinLedger.reason] });
}

/** Current coin balance (sum of ledger deltas). */
export async function coinBalance(attorneyId: string): Promise<number> {
  const rows = await db
    .select({ d: coinLedger.delta })
    .from(coinLedger)
    .where(eq(coinLedger.attorneyId, attorneyId));
  return rows.reduce((a, r) => a + (r.d ?? 0), 0);
}

/** Redeem coins against a dollar fee at $1/coin, capped at the balance and the
 *  fee. Writes a negative ledger row (idempotent per attorney+case). Returns how
 *  many coins were applied and the remaining dollars still owed. */
export async function redeemCoins(
  attorneyId: string,
  feeUsd: number,
  caseId: string
): Promise<{ coinsUsed: number; remainderUsd: number }> {
  const bal = await coinBalance(attorneyId);
  const use = Math.max(0, Math.min(bal, Math.round(feeUsd)));
  if (use > 0) {
    await db
      .insert(coinLedger)
      .values({ attorneyId, delta: -use, reason: "redeemed", caseId, note: `Applied to lead ${caseId}` })
      .onConflictDoNothing({ target: [coinLedger.attorneyId, coinLedger.caseId, coinLedger.reason] });
  }
  return { coinsUsed: use, remainderUsd: Math.max(0, Math.round(feeUsd) - use) };
}

/** Recent ledger rows, newest first. */
export async function coinHistory(attorneyId: string, limit = 30) {
  return db
    .select()
    .from(coinLedger)
    .where(eq(coinLedger.attorneyId, attorneyId))
    .orderBy(desc(coinLedger.createdAt))
    .limit(limit);
}

/** Resolve a referral code to the owning attorney's user id (null if unknown). */
export async function attorneyIdForRefCode(code: string): Promise<string | null> {
  const clean = code.trim().toUpperCase();
  if (!clean) return null;
  const row = await db.query.attorneyProfiles.findFirst({
    where: eq(attorneyProfiles.refCode, clean),
    columns: { userId: true },
  });
  return row?.userId ?? null;
}

/** Ensure an attorney has a referral code; generate + persist one if missing. */
export async function ensureRefCode(attorneyId: string): Promise<string> {
  const row = await db.query.attorneyProfiles.findFirst({
    where: eq(attorneyProfiles.userId, attorneyId),
    columns: { refCode: true },
  });
  if (row?.refCode) return row.refCode;
  const code = genRefCode();
  await db.update(attorneyProfiles).set({ refCode: code }).where(eq(attorneyProfiles.userId, attorneyId));
  return code;
}

// Ambiguity-free alphabet (no O/0/I/1) for a spoken/typed code.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function genRefCode(): string {
  // 8 chars from a 32-char alphabet. Uniqueness enforced by the DB index;
  // callers regenerate on the (astronomically rare) conflict.
  let out = "";
  for (let i = 0; i < 8; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}
