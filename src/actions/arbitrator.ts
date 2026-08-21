"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users, cases, arbitratorProfiles, caseMessages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { notifyGod } from "@/lib/notify";

async function requireAdmin() {
  const s = await auth();
  if ((s?.user as { role?: string } | undefined)?.role !== "admin") throw new Error("forbidden");
}
async function currentUser() {
  const s = await auth();
  return s?.user as { id?: string; role?: string; email?: string; name?: string } | undefined;
}

/* ── God: create an arbitrator account ────────────────────────────── */
export async function createArbitrator(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const email = String(fd.get("email") ?? "").toLowerCase().trim();
  const password = String(fd.get("password") ?? "");
  const displayName = String(fd.get("displayName") ?? "").trim();
  if (!/.+@.+\..+/.test(email) || password.length < 12 || !displayName) return { ok: false, error: "Name, valid email, and a 12+ char password are required." };
  const national = String(fd.get("national") ?? "") === "on";
  const states = String(fd.get("states") ?? "").split(",").map((s) => s.trim().toUpperCase()).filter((s) => s.length === 2).slice(0, 60);
  const feePerCase = Math.max(0, parseInt(String(fd.get("feePerCase") ?? "0"), 10) || 0);
  const systemCutPct = Math.min(100, Math.max(0, parseInt(String(fd.get("systemCutPct") ?? "30"), 10) || 30));

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return { ok: false, error: "That email already has an account." };

  const [u] = await db.insert(users).values({ email, passwordHash: await bcrypt.hash(password, 12), displayName, role: "arbitrator", emailVerifiedAt: new Date() }).returning();
  await db.insert(arbitratorProfiles).values({ userId: u.id, states, national, feePerCase, systemCutPct });
  revalidatePath("/admin/arbitrators");
  return { ok: true };
}

/* ── God: assign an arbitrator to an escalated case + set the fee ──── */
export async function assignArbitrator(fd: FormData): Promise<{ ok: boolean }> {
  await requireAdmin();
  const caseId = String(fd.get("caseId") ?? "");
  const arbitratorId = String(fd.get("arbitratorId") ?? "");
  const fee = Math.max(0, parseInt(String(fd.get("fee") ?? "0"), 10) || 0);
  if (!caseId || !arbitratorId) return { ok: false };
  await db.update(cases).set({ arbitratorId, arbitratorFee: fee, updatedAt: new Date() }).where(eq(cases.id, caseId));
  revalidatePath(`/admin/cases/${caseId}`);
  return { ok: true };
}

/* ── Party: pay your part of the arbitration fee (stubbed free) ────── */
export async function payArbitrationFee(caseId: string): Promise<{ ok: boolean }> {
  const u = await currentUser();
  if (!u?.id) return { ok: false };
  const c = await db.query.cases.findFirst({ where: eq(cases.id, caseId) });
  if (!c) return { ok: false };
  const now = new Date();
  if (c.initiatorId === u.id && !c.initiatorArbFeePaidAt) await db.update(cases).set({ initiatorArbFeePaidAt: now }).where(eq(cases.id, caseId));
  else if (c.joinerId === u.id && !c.joinerArbFeePaidAt) await db.update(cases).set({ joinerArbFeePaidAt: now }).where(eq(cases.id, caseId));
  revalidatePath(`/dashboard/case/${caseId}`);
  return { ok: true };
}

/* ── Follow-up Q&A: arbitrator asks, parties answer ───────────────── */
export async function postCaseMessage(caseId: string, body: string): Promise<{ ok: boolean }> {
  const u = await currentUser();
  const text = body.trim().slice(0, 4000);
  if (!u?.id || text.length < 2) return { ok: false };
  const c = await db.query.cases.findFirst({ where: eq(cases.id, caseId) });
  if (!c) return { ok: false };
  const isArb = c.arbitratorId === u.id || u.role === "arbitrator" || u.role === "admin";
  const isParty = c.initiatorId === u.id || c.joinerId === u.id;
  if (!isArb && !isParty) return { ok: false };
  await db.insert(caseMessages).values({ caseId, authorId: u.id, authorRole: isArb && !isParty ? "arbitrator" : "party", body: text });
  if (isArb && !isParty) await notifyGod("Arbitrator asked a follow-up question", [`Case ${c.inviteCode}`]);
  revalidatePath(`/dashboard/case/${caseId}`);
  revalidatePath(`/arbitrator/case/${caseId}`);
  return { ok: true };
}
