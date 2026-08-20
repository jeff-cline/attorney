"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, tosAcceptances, attorneyProfiles } from "@/db/schema";
import { currentTos } from "@/lib/tos";
import { appendAgreement } from "@/lib/audit";
import { sha256 } from "@/lib/hash";
import { captureRequestMeta } from "@/lib/ip";
import { signIn } from "@/lib/auth";
import { getCategory } from "@/content/referral-categories";

const Input = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(12, "Password must be at least 12 characters."),
  displayName: z.string().min(1).max(80),
  firmName: z.string().max(160).optional(),
  barState: z.string().max(2).optional(),
  phone: z.string().max(32).optional(),
  acceptTos: z.literal("on"),
});

/** Register a network attorney with their chosen specialty categories. */
export async function registerAttorney(
  fd: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  let parsed;
  try {
    parsed = Input.parse(Object.fromEntries(fd));
  } catch (e) {
    return { ok: false, error: (e as z.ZodError).issues?.[0]?.message ?? "Please complete every field, including the Terms checkbox." };
  }

  // Free account: specialties are optional here (picked in the portal after signup).
  let specialties: string[] = [];
  try {
    const raw = JSON.parse(String(fd.get("specialties") ?? "[]"));
    if (Array.isArray(raw)) specialties = raw.filter((s) => typeof s === "string" && getCategory(s)).slice(0, 100);
  } catch { /* none */ }

  const existing = await db.query.users.findFirst({ where: eq(users.email, parsed.email) });
  if (existing) return { ok: false, error: "That email already has an account. Log in instead." };

  const meta = await captureRequestMeta();
  const tos = await currentTos();

  const [user] = await db
    .insert(users)
    .values({
      email: parsed.email,
      passwordHash: await bcrypt.hash(parsed.password, 12),
      displayName: parsed.displayName,
      role: "attorney",
      emailVerifiedAt: new Date(),
    })
    .returning();

  await db.insert(attorneyProfiles).values({
    userId: user.id,
    firmName: parsed.firmName || null,
    barState: parsed.barState ? parsed.barState.toUpperCase() : null,
    phone: parsed.phone || null,
    specialties,
    notifyEmail: String(fd.get("notifyEmail") ?? "on") === "on",
    postArbOptIn: String(fd.get("postArbOptIn") ?? "on") === "on",
  });

  await db.insert(tosAcceptances).values({ userId: user.id, tosVersionId: tos.id, ipAddress: meta.ip, userAgent: meta.userAgent });
  await appendAgreement({
    caseId: null,
    userId: user.id,
    agreementType: "platform_tos",
    agreementTextHash: sha256(`${tos.bodyMarkdown}::${tos.version}`),
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  await signIn("credentials", { email: parsed.email, password: parsed.password, redirect: false });
  return { ok: true };
}

/* ── portal: update the attorney's chosen case types ──────────────── */
export async function updateSpecialties(fd: FormData): Promise<{ ok: boolean }> {
  const s = await auth();
  const uid = (s?.user as { id?: string; role?: string } | undefined)?.id;
  const role = (s?.user as { role?: string } | undefined)?.role;
  if (!uid || (role !== "attorney" && role !== "admin")) return { ok: false };
  let specialties: string[] = [];
  try {
    const raw = JSON.parse(String(fd.get("specialties") ?? "[]"));
    if (Array.isArray(raw)) specialties = raw.filter((x) => typeof x === "string" && getCategory(x)).slice(0, 100);
  } catch { /* none */ }
  await db.update(attorneyProfiles).set({ specialties }).where(eq(attorneyProfiles.userId, uid));
  revalidatePath("/portal");
  return { ok: true };
}

/* ── portal: record a Premium Partner exclusivity choice ──────────── */
export async function requestExclusivity(fd: FormData): Promise<{ ok: boolean; error?: string }> {
  const s = await auth();
  const uid = (s?.user as { id?: string } | undefined)?.id;
  const role = (s?.user as { role?: string } | undefined)?.role;
  if (!uid || (role !== "attorney" && role !== "admin")) return { ok: false, error: "Not signed in." };
  const category = String(fd.get("exclusiveCategory") ?? "").trim();
  const state = String(fd.get("exclusiveState") ?? "").trim().toUpperCase().slice(0, 2);
  if (!getCategory(category)) return { ok: false, error: "Pick a valid category." };
  if (state.length !== 2) return { ok: false, error: "Enter your 2-letter state." };
  await db.update(attorneyProfiles).set({ exclusiveCategory: category, exclusiveState: state }).where(eq(attorneyProfiles.userId, uid));
  revalidatePath("/portal");
  return { ok: true };
}
