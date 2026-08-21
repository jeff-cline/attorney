import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Gate for the investor data room. Requires a logged-in investor (or admin);
 *  forces a password change first when the temporary one is still in place. */
export async function requireInvestor(): Promise<{ email: string; role: string }> {
  const s = await auth();
  const su = s?.user as { email?: string; role?: string; mustChangePassword?: boolean } | undefined;
  if (!su) redirect("/auth/login?next=/investor/overview");
  if (su.mustChangePassword) redirect("/account/password");
  if (su.role !== "investor" && su.role !== "admin") redirect("/investor");
  return { email: su.email ?? "", role: su.role ?? "investor" };
}
