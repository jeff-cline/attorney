import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attorneyProfiles } from "@/db/schema";
import { getStripeConfig } from "@/lib/settings";
import { retrieveCheckoutSession } from "@/lib/stripe";
import { getCategory } from "@/content/referral-categories";

/** Stripe success_url lands here. Verify the session, then flip to Premium. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const s = await auth();
  const uid = (s?.user as { id?: string } | undefined)?.id;
  const done = (q: string) => Response.redirect(new URL(`/portal?${q}`, req.url), 303);

  if (!uid) return Response.redirect(new URL("/auth/login", req.url), 303);
  if (!sessionId) return done("premium=error");

  const cfg = await getStripeConfig();
  if (!cfg.secret) return done("premium=error");

  const sess = await retrieveCheckoutSession(cfg.secret, sessionId);
  const paid = sess && (sess.payment_status === "paid" || sess.status === "complete");
  // Only activate for the signed-in attorney who initiated it.
  if (paid && sess?.metadata?.uid === uid) {
    const category = sess.metadata?.category && getCategory(sess.metadata.category) ? sess.metadata.category : null;
    const state = sess.metadata?.state ?? null;
    await db
      .update(attorneyProfiles)
      .set({ tier: "premium", premiumSince: new Date(), exclusiveCategory: category, exclusiveState: state })
      .where(eq(attorneyProfiles.userId, uid));
    return done("upgraded=1");
  }
  return done("premium=error");
}
