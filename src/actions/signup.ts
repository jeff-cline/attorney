"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, tosAcceptances } from "@/db/schema";
import { currentTos } from "@/lib/tos";
import { appendAgreement } from "@/lib/audit";
import { sha256 } from "@/lib/hash";
import { captureRequestMeta } from "@/lib/ip";
import { signIn } from "@/lib/auth";
import { notifyGod } from "@/lib/notify";

const SignupInput = z.object({
  email: z
    .string()
    .email()
    .transform((e) => e.toLowerCase()),
  password: z.string().min(12),
  displayName: z.string().min(1).max(80),
  acceptTos: z.literal("on"),
});

export async function signupAndAcceptTos(
  fd: FormData,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  let parsed;
  try {
    parsed = SignupInput.parse(Object.fromEntries(fd));
  } catch (e: unknown) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "Please complete every field, including the Terms checkbox.",
    };
  }
  const meta = await captureRequestMeta();
  const tos = await currentTos();

  const existing = await db.query.users.findFirst({
    where: eq(users.email, parsed.email),
  });
  if (existing) return { ok: false, error: "Email already in use." };

  const [user] = await db
    .insert(users)
    .values({
      email: parsed.email,
      passwordHash: await bcrypt.hash(parsed.password, 12),
      displayName: parsed.displayName,
      emailVerifiedAt: new Date(),
    })
    .returning();

  await db.insert(tosAcceptances).values({
    userId: user.id,
    tosVersionId: tos.id,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  await appendAgreement({
    caseId: null,
    userId: user.id,
    agreementType: "platform_tos",
    agreementTextHash: sha256(`${tos.bodyMarkdown}::${tos.version}`),
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  await notifyGod("New client account created", [
    `<b>${parsed.displayName}</b> (${parsed.email})`,
    `IP: ${meta.ip ?? "—"}`,
  ]);

  await signIn("credentials", {
    email: parsed.email,
    password: parsed.password,
    redirect: false,
  });

  return { ok: true, userId: user.id };
}
