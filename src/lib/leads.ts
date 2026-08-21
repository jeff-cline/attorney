import { getCategory } from "@/content/referral-categories";

export const DEFAULT_LEAD_FEE = 250; // fallback when a case has no category

/** The cash referral fee for a lead, derived from its category rate card. */
export function leadFeeFor(category: string | null | undefined): number {
  const c = category ? getCategory(category) : undefined;
  return c?.baseFee ?? DEFAULT_LEAD_FEE;
}
