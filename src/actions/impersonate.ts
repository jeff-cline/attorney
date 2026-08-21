"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { IMP_COOKIE, signImp } from "@/lib/impersonation";
import { notifyGod } from "@/lib/notify";

const HOME_FOR: Record<string, string> = {
  admin: "/admin",
  attorney: "/portal",
  arbitrator: "/arbitrator",
  user: "/dashboard",
};

/** Admin-only: start viewing the app AS another user. */
export async function impersonate(uid: string): Promise<void> {
  const s = await auth();
  const su = s?.user as { role?: string; impersonating?: boolean; id?: string } | undefined;
  // Must be a genuine admin (not already impersonating someone).
  if (!su || su.role !== "admin" || su.impersonating) throw new Error("forbidden");
  const target = await db.query.users.findFirst({ where: eq(users.id, uid) });
  if (!target) throw new Error("no such user");

  const jar = await cookies();
  jar.set(IMP_COOKIE, signImp(target.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60, // 1 hour, then auto-expires back to admin
  });
  await notifyGod("God impersonation started", [
    `Admin ${su.id ? "" : ""}${s?.user?.email ?? ""} is now viewing as <b>${target.email}</b> (${target.role}).`,
  ]);
  redirect(HOME_FOR[target.role] ?? "/dashboard");
}

/** Stop impersonating and return to the God console. Safe for anyone to call
 *  (it only clears the cookie — the real JWT still governs who you are). */
export async function stopImpersonating(): Promise<void> {
  const jar = await cookies();
  jar.delete(IMP_COOKIE);
  redirect("/admin");
}
