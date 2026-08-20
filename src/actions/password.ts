"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/db/schema";
import { sendTemplated } from "@/lib/email";
import { env } from "@/lib/env";

function resetHtml(url: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#0f2a2d;line-height:1.6">
    <h2 style="font-family:Georgia,serif;color:#14524f;margin:0 0 10px">Reset your password</h2>
    <p>We received a request to reset the password for your Attorney.plus account. Click below to choose a new one. This link expires in one hour.</p>
    <p style="margin:22px 0"><a href="${url}" style="display:inline-block;background:#14524f;color:#fff;padding:13px 24px;border-radius:999px;text-decoration:none;font-weight:600">Reset my password</a></p>
    <p style="color:#5c6763;font-size:13px">If you didn't request this, you can safely ignore this email — your password won't change.</p>
  </div>`;
}

/** Request a reset link. Always returns ok (never reveals whether an email exists). */
export async function requestReset(fd: FormData): Promise<{ ok: true }> {
  const email = String(fd.get("email") ?? "").toLowerCase().trim();
  if (email) {
    const u = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (u) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await db.insert(verificationTokens).values({ identifier: email, token, expires });
      const url = `${env.APP_URL}/reset/${token}`;
      await sendTemplated({
        to: email,
        subject: "Reset your Attorney.plus password",
        html: resetHtml(url),
        template: "password-reset",
        payload: { email },
      }).catch(() => {});
    }
  }
  return { ok: true };
}

const ResetInput = z.object({ password: z.string().min(12, "Password must be at least 12 characters.") });

export async function resetPassword(
  token: string,
  fd: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  let password: string;
  try {
    password = ResetInput.parse({ password: String(fd.get("password") ?? "") }).password;
  } catch (e) {
    return { ok: false, error: (e as z.ZodError).issues?.[0]?.message ?? "Invalid password." };
  }
  const row = await db.query.verificationTokens.findFirst({ where: eq(verificationTokens.token, token) });
  if (!row) return { ok: false, error: "This reset link is invalid or has already been used." };
  if (row.expires < new Date()) {
    await db.delete(verificationTokens).where(and(eq(verificationTokens.identifier, row.identifier), eq(verificationTokens.token, token)));
    return { ok: false, error: "This reset link has expired. Request a new one." };
  }
  const hash = await bcrypt.hash(password, 12);
  await db.update(users).set({ passwordHash: hash, updatedAt: new Date() }).where(eq(users.email, row.identifier));
  await db.delete(verificationTokens).where(and(eq(verificationTokens.identifier, row.identifier), eq(verificationTokens.token, token)));
  return { ok: true };
}
