/* Illustrative investor model — pure functions, importable by client components.
   All figures are discussion-only estimates, not audited or reliable projections. */

// ── Model A: exclusive niche leasing ─────────────────────────────────────
export const NICHES = 100;
export const STATES = 52;
export const SLOTS = NICHES * STATES; // 5,200 exclusive niche×state slots
export const LEASE_MO = 3000; // $/month per slot
export const LEASE_YR = LEASE_MO * 12; // $36,000/yr per slot

/** Adoption ramps 6%/yr → 30% by Y5, 60% by Y10. */
export function leaseByYear(years = 10) {
  const out = [];
  for (let y = 1; y <= years; y++) {
    const adoption = Math.min(0.06 * y, 0.6);
    const slots = Math.round(adoption * SLOTS);
    out.push({ year: y, adoption, slots, arr: slots * LEASE_YR });
  }
  return out;
}

// ── Model B/C: the case engine (referrals + arbitration retainers) ───────
export const FEE_MIN = 375; // lowest niche referral fee ($)
export const FEE_MAX = 5000; // highest niche referral fee ($)
export const FEE_AVG = 1650; // avg referral fee across the 100 niches ($)
export const ARB_RETAINER = 1500; // arbitration retainer per case ($)
export const REFERRAL_ATTACH = 0.6; // share of cases that produce a paid referral
export const ARB_ATTACH = 0.2; // share of cases that pay an arbitration retainer

export const COGS_CASE = 0.7; // 70% COGS on referrals + arbitration (network/arbitrator share)
export const COGS_LEASE = 0.2; // ~20% COGS on leasing (software infra/support)

/** Monthly case volume. Starts 25 / 50 / 75 / 100, then +20% MoM.
 *  `taper` decays the growth rate after month 18 so multi-year runs stay sane. */
export function caseVolume(months: number, taper = false) {
  const out: { m: number; cases: number }[] = [];
  let c = 0;
  for (let m = 1; m <= months; m++) {
    if (m === 1) c = 25;
    else if (m === 2) c = 50;
    else if (m === 3) c = 75;
    else if (m === 4) c = 100;
    else {
      const g = !taper ? 1.2 : m <= 18 ? 1.2 : m <= 36 ? 1.1 : 1.05;
      c = c * g;
    }
    out.push({ m, cases: Math.round(c) });
  }
  return out;
}

/** Gross revenue for a month's case volume, split by stream. */
export function caseRevenue(cases: number) {
  const referral = cases * REFERRAL_ATTACH * FEE_AVG;
  const arbitration = cases * ARB_ATTACH * ARB_RETAINER;
  return { referral, arbitration, gross: referral + arbitration };
}

/** Annual aggregation of the case engine (gross + net after 70% COGS). */
export function caseByYear(years = 5) {
  const series = caseVolume(years * 12, true);
  const out = [];
  for (let y = 1; y <= years; y++) {
    const slice = series.filter((s) => s.m > (y - 1) * 12 && s.m <= y * 12);
    const gross = slice.reduce((a, s) => a + caseRevenue(s.cases).gross, 0);
    const cases = slice.reduce((a, s) => a + s.cases, 0);
    out.push({ year: y, cases, gross, net: gross * (1 - COGS_CASE) });
  }
  return out;
}

// ── Combined 5-year model with a leasing↔cases weight ────────────────────
/** weight w in [0,1]: fraction of emphasis on leasing (1-w on the case engine).
 *  Returns per-year gross + net for lease, cases, and the weighted blend. */
export function combinedByYear(w = 0.5, years = 5) {
  const lease = leaseByYear(years);
  const cases = caseByYear(years);
  return lease.map((L, i) => {
    const C = cases[i];
    const leaseGross = L.arr, leaseNet = L.arr * (1 - COGS_LEASE);
    const caseGross = C.gross, caseNet = C.net;
    const blendGross = w * leaseGross + (1 - w) * caseGross;
    const blendNet = w * leaseNet + (1 - w) * caseNet;
    return { year: L.year, leaseGross, leaseNet, caseGross, caseNet, blendGross, blendNet };
  });
}

// ── Valuation: SaaS / legal-fee revenue multiple on Y5 net revenue ───────
export const VAL_MULTIPLES = { low: 6, mid: 8, high: 10 };
export function valuation(y5Net: number) {
  return {
    low: y5Net * VAL_MULTIPLES.low,
    mid: y5Net * VAL_MULTIPLES.mid,
    high: y5Net * VAL_MULTIPLES.high,
  };
}

// ── formatting ───────────────────────────────────────────────────────────
export function money(n: number): string {
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}
