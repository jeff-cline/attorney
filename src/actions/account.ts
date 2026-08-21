"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { auth, signOut } from "@/lib/auth";

/** Set a new password and clear the forced-change flag. We sign the user out
 *  afterward so their next login mints a fresh token without the flag. */
export async function changePassword(fd: FormData): Promise<void> {
  const s = await auth();
  const uid = (s?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/auth/login");

  const pw = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  if (pw.length < 12) redirect("/account/password?error=short");
  if (pw !== confirm) redirect("/account/password?error=match");
  if (pw === "TEMP!234") redirect("/account/password?error=temp");

  const hash = await bcrypt.hash(pw, 10);
  await db.update(users).set({ passwordHash: hash, mustChangePassword: false, updatedAt: new Date() }).where(eq(users.id, uid!));
  await signOut({ redirect: false });
  redirect("/auth/login?reset=1");
}
