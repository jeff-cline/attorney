"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, investorProfiles } from "@/db/schema";
import { notifyGod } from "@/lib/notify";
import { PERSONAS, PERSONA_VALUES, type AccessResult } from "@/lib/personas";

/** Create a gated investor/data-room account. Temp password TEMP!234, forced
 *  to change on first login. Never clobbers an existing account. */
export async function requestAccess(_prev: AccessResult, fd: FormData): Promise<AccessResult> {
  const firstName = String(fd.get("firstName") ?? "").trim().slice(0, 80);
  const lastName = String(fd.get("lastName") ?? "").trim().slice(0, 80);
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 160);
  const phone = String(fd.get("phone") ?? "").trim().slice(0, 32);
  const persona = String(fd.get("persona") ?? "").trim();

  if (!firstName || !lastName) return { ok: false, error: "Please enter your first and last name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (!PERSONA_VALUES.has(persona)) return { ok: false, error: "Please tell us who you are." };

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return { ok: false, exists: true, email, error: "An account with that email already exists — please log in." };

  const hash = await bcrypt.hash("TEMP!234", 10);
  const [u] = await db
    .insert(users)
    .values({ email, passwordHash: hash, displayName: `${firstName} ${lastName}`.trim(), role: "investor", mustChangePassword: true })
    .returning();
  await db.insert(investorProfiles).values({ userId: u.id, firstName, lastName, phone, persona });

  await notifyGod("New investor access request", [
    `<b>${firstName} ${lastName}</b> — ${email}`,
    `Phone: ${phone || "—"}`,
    `Identifies as: <b>${PERSONAS.find((p) => p.value === persona)?.label ?? persona}</b>`,
    `Account created (investor role, temp password, must change on first login).`,
  ]);
  return { ok: true, email };
}
