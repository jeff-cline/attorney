import { cookies } from "next/headers";
import crypto from "node:crypto";
import { env } from "@/lib/env";

/** God-mode impersonation. An admin sets a signed cookie naming the user to
 *  "view as"; the Auth.js session callback swaps the effective user ONLY when
 *  the real signed-in user is an admin — so a forged cookie is inert. */
export const IMP_COOKIE = "att_imp";

function mac(uid: string): string {
  return crypto.createHmac("sha256", env.AUTH_SECRET).update(uid).digest("base64url");
}

export function signImp(uid: string): string {
  return `${uid}.${mac(uid)}`;
}

export function verifyImp(value: string | undefined | null): string | null {
  if (!value) return null;
  const i = value.lastIndexOf(".");
  if (i <= 0) return null;
  const uid = value.slice(0, i);
  const sig = value.slice(i + 1);
  const expected = mac(uid);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return uid;
}

/** Read + verify the impersonation cookie. Returns the target user id or null. */
export async function getImpersonatedUserId(): Promise<string | null> {
  try {
    const c = (await cookies()).get(IMP_COOKIE)?.value;
    return verifyImp(c);
  } catch {
    return null;
  }
}
