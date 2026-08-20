import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appSettings } from "@/db/schema";

/** God-controlled toggles. Percentage display defaults OFF while the attorney
 *  agreements are still being finalized. */
export const SETTING_KEYS = {
  attorneyShowPercentage: "attorney_show_percentage",
  arbitrationReferralMultiplier: "arbitration_referral_multiplier",
  stripePublishableKey: "stripe_publishable_key",
  stripeSecretKey: "stripe_secret_key",
  stripePremiumPriceId: "stripe_premium_price_id",
} as const;

/** Monthly price of the Premium Partner tier (exclusive niche per state). */
export const PREMIUM_PRICE_MONTHLY = 3000;

/** Default multiplier (% of base) for referrals that already went through
 *  arbitration — higher-intent leads. 200 = 2× base. God-editable. */
export const DEFAULT_ARB_MULTIPLIER = 200;

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.query.appSettings.findFirst({ where: eq(appSettings.key, key) });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } });
}

/** Whether the estimated Managing-Attorney percentage may be shown on the
 *  attorney/God backend. Defaults to false (OFF) until explicitly enabled. */
export async function attorneyPercentageVisible(): Promise<boolean> {
  return (await getSetting(SETTING_KEYS.attorneyShowPercentage)) === "on";
}

/** Multiplier (% of base fee) for post-arbitration referrals. Returns DEFAULT
 *  when unset or invalid. */
export async function arbitrationMultiplier(): Promise<number> {
  const raw = await getSetting(SETTING_KEYS.arbitrationReferralMultiplier);
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n >= 100 && n <= 1000 ? n : DEFAULT_ARB_MULTIPLIER;
}

export type StripeConfig = { publishable: string | null; secret: string | null; priceId: string | null };
export async function getStripeConfig(): Promise<StripeConfig> {
  const [publishable, secret, priceId] = await Promise.all([
    getSetting(SETTING_KEYS.stripePublishableKey),
    getSetting(SETTING_KEYS.stripeSecretKey),
    getSetting(SETTING_KEYS.stripePremiumPriceId),
  ]);
  return { publishable, secret, priceId };
}

/** Payments are live once a secret key + premium price ID are present. */
export async function paymentsConfigured(): Promise<boolean> {
  const c = await getStripeConfig();
  return Boolean(c.secret && c.priceId);
}
