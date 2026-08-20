/**
 * Referral category taxonomy — the SHARED key between the consumer (who picks
 * the category they're in) and the attorney (who bids on categories).
 *
 * `baseFee` is the user's per-category price ALREADY MULTIPLIED BY 5 — it is the
 * attorney's minimum spend per referral in that category; attorneys may bid higher.
 *
 * `contingency` is the estimated percentage under the Managing Attorney Agreement
 * in Shared Cases. It is BACKEND-ONLY (attorney/God), gated behind the God toggle
 * `attorney_show_percentage`. It must NEVER be rendered on a consumer-facing page.
 */
export const FEE_MULTIPLIER = 5;

export type CategoryGroup = {
  slug: string;
  name: string;
  accent: string;
  monogram: string;
  arbitrable: boolean; // default for the group: is Quick-Resolve a sensible first step?
  intro: string; // 1–2 sentence group framing reused in page intros
};

export type ReferralCategory = {
  id: number;
  slug: string;
  name: string;
  groupSlug: string;
  baseFee: number; // ALREADY ×5 — attorney minimum bid
  contingency: string | null; // backend-only; null = unspecified
  arb?: boolean; // per-category override of the group default
  note?: string; // optional category-specific line for the page intro
};

export const GROUPS: CategoryGroup[] = [
  { slug: "motor-vehicle", name: "Motor Vehicle Accidents", accent: "#b1532c", monogram: "MV", arbitrable: true, intro: "Crash claims turn on fault, insurance, and the true cost of your injuries — and insurers move first, not fairly." },
  { slug: "catastrophic-injury", name: "Catastrophic & Wrongful Death", accent: "#8a4a24", monogram: "CI", arbitrable: false, intro: "Life-altering injury and loss cases carry the highest stakes and demand experienced trial counsel." },
  { slug: "medical-malpractice", name: "Medical Malpractice", accent: "#a34a3a", monogram: "MM", arbitrable: false, intro: "When care falls below the accepted standard and causes harm, proving it takes experts and a careful record review." },
  { slug: "product-mass-tort", name: "Product Liability & Mass Tort", accent: "#7a3f5a", monogram: "PT", arbitrable: false, intro: "Dangerous products, drugs, and toxic exposures often affect many people and require firms with real litigation resources." },
  { slug: "workplace-industrial", name: "Workplace & Industrial", accent: "#5a5a2a", monogram: "WI", arbitrable: true, intro: "On-the-job injuries involve tight deadlines and overlapping systems — workers' comp, federal acts, and third-party claims." },
  { slug: "premises-injury", name: "Premises & Injury", accent: "#b1532c", monogram: "PR", arbitrable: true, intro: "Property owners owe visitors a duty of reasonable safety — when they cut corners, people get hurt." },
  { slug: "civil-rights", name: "Civil Rights & Abuse", accent: "#3a3f68", monogram: "CR", arbitrable: false, intro: "Claims against those who abused power or trust deserve counsel who will hold them accountable." },
  { slug: "insurance", name: "Insurance Disputes", accent: "#2f6d63", monogram: "IN", arbitrable: true, intro: "When an insurer delays, underpays, or denies a valid claim, a fast neutral process can force a fair number." },
  { slug: "consumer-class", name: "Consumer & Class Action", accent: "#4a6a3f", monogram: "CN", arbitrable: true, intro: "Deceptive practices and defective dealings — sometimes for one person, sometimes for thousands." },
  { slug: "whistleblower-securities", name: "Whistleblower & Securities", accent: "#5a4a7a", monogram: "WB", arbitrable: false, intro: "Reporting fraud or recovering investment losses runs on strict rules, deadlines, and specialized counsel." },
  { slug: "employment", name: "Employment", accent: "#5a4a7a", monogram: "EM", arbitrable: true, intro: "Workplace rights — pay, fair treatment, and freedom from retaliation — with disputes that often settle before court." },
  { slug: "criminal-defense", name: "Criminal Defense", accent: "#3a3f68", monogram: "CD", arbitrable: false, intro: "A charge puts your freedom and record at risk; the first move is qualified defense counsel, fast. Criminal matters are not arbitrated." },
  { slug: "family-law", name: "Family Law", accent: "#7a5230", monogram: "FL", arbitrable: true, intro: "The most personal disputes — many resolve faster and cheaper through a neutral process than a courtroom." },
  { slug: "immigration", name: "Immigration", accent: "#2f6d63", monogram: "IM", arbitrable: false, intro: "Federal, technical, and unforgiving — a missed form or deadline can cost years. Handled by attorneys, not arbitration." },
  { slug: "bankruptcy-tax", name: "Bankruptcy & Tax", accent: "#4a6a3f", monogram: "BT", arbitrable: false, intro: "A legal reset for unmanageable debt and disputes with tax authorities — precise, deadline-driven work." },
  { slug: "estate-elder", name: "Estate & Elder", accent: "#4a6a3f", monogram: "ES", arbitrable: true, intro: "Planning what you leave behind — and resolving inheritance disputes privately instead of tearing families apart." },
  { slug: "real-estate", name: "Real Estate & Construction", accent: "#2f6d63", monogram: "RE", arbitrable: true, intro: "Property and building disputes are fact-specific and dollar-bounded — often ideal for a fast neutral resolution." },
  { slug: "business-corporate", name: "Business & Corporate", accent: "#2f6d63", monogram: "BC", arbitrable: true, intro: "Commercial disagreements are better resolved privately than in slow, public litigation." },
  { slug: "intellectual-property", name: "Intellectual Property", accent: "#3a3f68", monogram: "IP", arbitrable: false, intro: "Protecting and enforcing patents, trademarks, and creative work — specialized, high-value counsel." },
];

// baseFee values below are ALREADY the user's number × 5.
export const CATEGORIES: ReferralCategory[] = [
  { id: 1, slug: "auto-accident", name: "Auto Accident", groupSlug: "motor-vehicle", baseFee: 750, contingency: null },
  { id: 2, slug: "serious-auto-injury", name: "Serious Auto Injury", groupSlug: "motor-vehicle", baseFee: 1500, contingency: null },
  { id: 3, slug: "truck-accident", name: "Truck / 18-Wheeler Accident", groupSlug: "motor-vehicle", baseFee: 2500, contingency: null, arb: false },
  { id: 4, slug: "motorcycle-accident", name: "Motorcycle Accident", groupSlug: "motor-vehicle", baseFee: 1250, contingency: null },
  { id: 5, slug: "pedestrian-accident", name: "Pedestrian Accident", groupSlug: "motor-vehicle", baseFee: 1250, contingency: null },
  { id: 6, slug: "bicycle-accident", name: "Bicycle Accident", groupSlug: "motor-vehicle", baseFee: 1000, contingency: null },
  { id: 7, slug: "rideshare-accident", name: "Rideshare Accident", groupSlug: "motor-vehicle", baseFee: 1000, contingency: null },
  { id: 8, slug: "drunk-driver-injury", name: "Drunk Driver Injury", groupSlug: "motor-vehicle", baseFee: 1250, contingency: null },
  { id: 9, slug: "catastrophic-injury", name: "Catastrophic Injury", groupSlug: "catastrophic-injury", baseFee: 3750, contingency: null },
  { id: 10, slug: "traumatic-brain-injury", name: "Traumatic Brain Injury", groupSlug: "catastrophic-injury", baseFee: 3750, contingency: null },
  { id: 11, slug: "spinal-cord-injury", name: "Spinal Cord Injury", groupSlug: "catastrophic-injury", baseFee: 3750, contingency: null },
  { id: 12, slug: "wrongful-death", name: "Wrongful Death", groupSlug: "catastrophic-injury", baseFee: 3750, contingency: null },
  { id: 13, slug: "medical-malpractice", name: "Medical Malpractice", groupSlug: "medical-malpractice", baseFee: 2500, contingency: null },
  { id: 14, slug: "birth-injury", name: "Birth Injury", groupSlug: "medical-malpractice", baseFee: 3750, contingency: null },
  { id: 15, slug: "surgical-malpractice", name: "Surgical Malpractice", groupSlug: "medical-malpractice", baseFee: 2500, contingency: null },
  { id: 16, slug: "failure-to-diagnose", name: "Failure to Diagnose", groupSlug: "medical-malpractice", baseFee: 2000, contingency: null },
  { id: 17, slug: "nursing-home-abuse", name: "Nursing Home Abuse", groupSlug: "medical-malpractice", baseFee: 2000, contingency: null },
  { id: 18, slug: "product-liability", name: "Product Liability", groupSlug: "product-mass-tort", baseFee: 2500, contingency: null },
  { id: 19, slug: "defective-medical-device", name: "Defective Medical Device", groupSlug: "product-mass-tort", baseFee: 2500, contingency: null },
  { id: 20, slug: "dangerous-drug", name: "Dangerous Drug", groupSlug: "product-mass-tort", baseFee: 2000, contingency: null },
  { id: 21, slug: "mass-tort", name: "Mass Tort", groupSlug: "product-mass-tort", baseFee: 1500, contingency: null },
  { id: 22, slug: "toxic-exposure", name: "Toxic Exposure", groupSlug: "product-mass-tort", baseFee: 2500, contingency: null },
  { id: 23, slug: "mesothelioma-asbestos", name: "Mesothelioma / Asbestos", groupSlug: "product-mass-tort", baseFee: 3750, contingency: null },
  { id: 24, slug: "construction-accident", name: "Construction Accident", groupSlug: "workplace-industrial", baseFee: 1750, contingency: null },
  { id: 25, slug: "workplace-injury", name: "Workplace Injury", groupSlug: "workplace-industrial", baseFee: 1000, contingency: null },
  { id: 26, slug: "workers-compensation", name: "Workers' Compensation", groupSlug: "workplace-industrial", baseFee: 625, contingency: null },
  { id: 27, slug: "maritime-jones-act", name: "Maritime / Jones Act", groupSlug: "workplace-industrial", baseFee: 2500, contingency: null, arb: false },
  { id: 28, slug: "aviation-accident", name: "Aviation Accident", groupSlug: "workplace-industrial", baseFee: 5000, contingency: null, arb: false },
  { id: 29, slug: "railroad-fela", name: "Railroad / FELA", groupSlug: "workplace-industrial", baseFee: 2000, contingency: null, arb: false },
  { id: 30, slug: "premises-liability", name: "Premises Liability", groupSlug: "premises-injury", baseFee: 875, contingency: null },
  { id: 31, slug: "slip-and-fall", name: "Slip & Fall", groupSlug: "premises-injury", baseFee: 500, contingency: null },
  { id: 32, slug: "dog-bite", name: "Dog Bite", groupSlug: "premises-injury", baseFee: 500, contingency: null },
  { id: 33, slug: "sexual-abuse-civil-claim", name: "Sexual Abuse Civil Claim", groupSlug: "civil-rights", baseFee: 2000, contingency: null },
  { id: 34, slug: "civil-rights", name: "Civil Rights", groupSlug: "civil-rights", baseFee: 2000, contingency: null },
  { id: 35, slug: "police-misconduct", name: "Police Misconduct", groupSlug: "civil-rights", baseFee: 2000, contingency: null },
  { id: 36, slug: "excessive-force", name: "Excessive Force", groupSlug: "civil-rights", baseFee: 2000, contingency: null },
  { id: 37, slug: "insurance-bad-faith", name: "Insurance Bad Faith", groupSlug: "insurance", baseFee: 1500, contingency: null },
  { id: 38, slug: "property-insurance-claim", name: "Property Insurance Claim", groupSlug: "insurance", baseFee: 1000, contingency: null },
  { id: 39, slug: "hurricane-storm-claim", name: "Hurricane / Storm Claim", groupSlug: "insurance", baseFee: 750, contingency: null },
  { id: 40, slug: "consumer-fraud", name: "Consumer Fraud", groupSlug: "consumer-class", baseFee: 625, contingency: null },
  { id: 41, slug: "class-action-plaintiff", name: "Class Action Plaintiff", groupSlug: "consumer-class", baseFee: 1500, contingency: null, arb: false },
  { id: 42, slug: "whistleblower-qui-tam", name: "Whistleblower / Qui Tam", groupSlug: "whistleblower-securities", baseFee: 3750, contingency: null },
  { id: 43, slug: "securities-fraud-plaintiff", name: "Securities Fraud Plaintiff", groupSlug: "whistleblower-securities", baseFee: 2500, contingency: null },
  { id: 44, slug: "investment-fraud", name: "Investment Fraud", groupSlug: "whistleblower-securities", baseFee: 2000, contingency: null },
  { id: 45, slug: "wrongful-termination", name: "Wrongful Termination", groupSlug: "employment", baseFee: 750, contingency: null },
  { id: 46, slug: "employment-discrimination", name: "Employment Discrimination", groupSlug: "employment", baseFee: 750, contingency: null },
  { id: 47, slug: "sexual-harassment", name: "Sexual Harassment", groupSlug: "employment", baseFee: 875, contingency: null },
  { id: 48, slug: "wage-and-hour", name: "Wage & Hour", groupSlug: "employment", baseFee: 500, contingency: null },
  { id: 49, slug: "executive-employment-dispute", name: "Executive Employment Dispute", groupSlug: "employment", baseFee: 1750, contingency: null },
  { id: 50, slug: "noncompete-trade-secrets", name: "Noncompete / Trade Secrets", groupSlug: "employment", baseFee: 2000, contingency: null },
  { id: 51, slug: "dui-dwi-defense", name: "DUI / DWI Defense", groupSlug: "criminal-defense", baseFee: 500, contingency: "N/A contingency" },
  { id: 52, slug: "misdemeanor-defense", name: "Misdemeanor Defense", groupSlug: "criminal-defense", baseFee: 375, contingency: "N/A contingency" },
  { id: 53, slug: "felony-defense", name: "Felony Defense", groupSlug: "criminal-defense", baseFee: 1000, contingency: "N/A contingency" },
  { id: 54, slug: "drug-crime-defense", name: "Drug Crime Defense", groupSlug: "criminal-defense", baseFee: 750, contingency: "N/A contingency" },
  { id: 55, slug: "domestic-violence-defense", name: "Domestic Violence Defense", groupSlug: "criminal-defense", baseFee: 750, contingency: "N/A contingency" },
  { id: 56, slug: "sex-crime-defense", name: "Sex Crime Defense", groupSlug: "criminal-defense", baseFee: 1250, contingency: "N/A contingency" },
  { id: 57, slug: "federal-criminal-defense", name: "Federal Criminal Defense", groupSlug: "criminal-defense", baseFee: 2500, contingency: "N/A contingency" },
  { id: 58, slug: "white-collar-defense", name: "White-Collar Defense", groupSlug: "criminal-defense", baseFee: 3750, contingency: "N/A contingency" },
  { id: 59, slug: "expungement", name: "Expungement", groupSlug: "criminal-defense", baseFee: 375, contingency: "N/A contingency" },
  { id: 60, slug: "criminal-appeals", name: "Criminal Appeals", groupSlug: "criminal-defense", baseFee: 1250, contingency: "Fee-sharing subject to rules" },
  { id: 61, slug: "uncontested-divorce", name: "Uncontested Divorce", groupSlug: "family-law", baseFee: 375, contingency: "No outcome-contingent fee" },
  { id: 62, slug: "contested-divorce", name: "Contested Divorce", groupSlug: "family-law", baseFee: 875, contingency: "No outcome-contingent fee" },
  { id: 63, slug: "high-net-worth-divorce", name: "High-Net-Worth Divorce", groupSlug: "family-law", baseFee: 2500, contingency: "No outcome-contingent fee" },
  { id: 64, slug: "child-custody", name: "Child Custody", groupSlug: "family-law", baseFee: 750, contingency: "No outcome-contingent fee" },
  { id: 65, slug: "child-support", name: "Child Support", groupSlug: "family-law", baseFee: 500, contingency: "No outcome-contingent fee" },
  { id: 66, slug: "adoption", name: "Adoption", groupSlug: "family-law", baseFee: 625, contingency: "Fee division subject to rules" },
  { id: 67, slug: "prenuptial-agreement", name: "Prenuptial Agreement", groupSlug: "family-law", baseFee: 625, contingency: "Fee division subject to rules" },
  { id: 68, slug: "family-law-appeal", name: "Family-Law Appeal", groupSlug: "family-law", baseFee: 1250, contingency: "Fee division subject to rules" },
  { id: 69, slug: "immigration-family", name: "Immigration – Family", groupSlug: "immigration", baseFee: 500, contingency: "15–25% attorney fee" },
  { id: 70, slug: "employment-immigration", name: "Employment Immigration", groupSlug: "immigration", baseFee: 1000, contingency: "15–25%" },
  { id: 71, slug: "investor-eb5-immigration", name: "Investor / EB-5 Immigration", groupSlug: "immigration", baseFee: 2500, contingency: "20–25%" },
  { id: 72, slug: "deportation-removal", name: "Deportation / Removal", groupSlug: "immigration", baseFee: 1000, contingency: "15–25%" },
  { id: 73, slug: "asylum", name: "Asylum", groupSlug: "immigration", baseFee: 625, contingency: "15–25%" },
  { id: 74, slug: "chapter-7-bankruptcy", name: "Chapter 7 Bankruptcy", groupSlug: "bankruptcy-tax", baseFee: 375, contingency: "10–20%" },
  { id: 75, slug: "chapter-13-bankruptcy", name: "Chapter 13 Bankruptcy", groupSlug: "bankruptcy-tax", baseFee: 500, contingency: "10–20%" },
  { id: 76, slug: "business-bankruptcy", name: "Business Bankruptcy", groupSlug: "bankruptcy-tax", baseFee: 2000, contingency: "20–25%" },
  { id: 77, slug: "chapter-11", name: "Chapter 11", groupSlug: "bankruptcy-tax", baseFee: 3750, contingency: "20–25%" },
  { id: 78, slug: "irs-tax-debt", name: "IRS Tax Debt", groupSlug: "bankruptcy-tax", baseFee: 750, contingency: "15–25%" },
  { id: 79, slug: "tax-controversy", name: "Tax Controversy", groupSlug: "bankruptcy-tax", baseFee: 1500, contingency: "20–25%" },
  { id: 80, slug: "estate-planning", name: "Estate Planning", groupSlug: "estate-elder", baseFee: 500, contingency: "15–20%", arb: false },
  { id: 81, slug: "high-net-worth-estate-planning", name: "High-Net-Worth Estate Planning", groupSlug: "estate-elder", baseFee: 1750, contingency: "20–25%", arb: false },
  { id: 82, slug: "probate", name: "Probate", groupSlug: "estate-elder", baseFee: 750, contingency: "20–25%" },
  { id: 83, slug: "probate-litigation", name: "Probate Litigation", groupSlug: "estate-elder", baseFee: 2000, contingency: "20–25%" },
  { id: 84, slug: "will-contest", name: "Will Contest", groupSlug: "estate-elder", baseFee: 1750, contingency: "20–25%" },
  { id: 85, slug: "trust-litigation", name: "Trust Litigation", groupSlug: "estate-elder", baseFee: 2500, contingency: "20–25%" },
  { id: 86, slug: "elder-law", name: "Elder Law", groupSlug: "estate-elder", baseFee: 750, contingency: "15–25%", arb: false },
  { id: 87, slug: "medicaid-planning", name: "Medicaid Planning", groupSlug: "estate-elder", baseFee: 875, contingency: "15–25%", arb: false },
  { id: 88, slug: "residential-real-estate-dispute", name: "Residential Real Estate Dispute", groupSlug: "real-estate", baseFee: 750, contingency: "15–25%" },
  { id: 89, slug: "commercial-real-estate", name: "Commercial Real Estate", groupSlug: "real-estate", baseFee: 1750, contingency: "20–25%" },
  { id: 90, slug: "construction-litigation", name: "Construction Litigation", groupSlug: "real-estate", baseFee: 1750, contingency: "20–25%" },
  { id: 91, slug: "foreclosure-defense", name: "Foreclosure Defense", groupSlug: "real-estate", baseFee: 625, contingency: "15–20%" },
  { id: 92, slug: "business-formation", name: "Business Formation", groupSlug: "business-corporate", baseFee: 500, contingency: "15–20%", arb: false },
  { id: 93, slug: "contract-dispute", name: "Contract Dispute", groupSlug: "business-corporate", baseFee: 1250, contingency: "20–25%" },
  { id: 94, slug: "business-litigation", name: "Business Litigation", groupSlug: "business-corporate", baseFee: 2500, contingency: "20–25%" },
  { id: 95, slug: "partnership-shareholder-dispute", name: "Partnership / Shareholder Dispute", groupSlug: "business-corporate", baseFee: 2500, contingency: "20–25%" },
  { id: 96, slug: "ma-business-sale", name: "M&A / Business Sale", groupSlug: "business-corporate", baseFee: 3750, contingency: "20–25%", arb: false },
  { id: 97, slug: "securities-corporate", name: "Securities / Corporate", groupSlug: "business-corporate", baseFee: 3750, contingency: "20–25%", arb: false },
  { id: 98, slug: "patent", name: "Patent", groupSlug: "intellectual-property", baseFee: 1500, contingency: "15–25%" },
  { id: 99, slug: "trademark", name: "Trademark", groupSlug: "intellectual-property", baseFee: 500, contingency: "15–20%" },
  { id: 100, slug: "ip-litigation", name: "IP Litigation", groupSlug: "intellectual-property", baseFee: 2500, contingency: null },
];

/* ── lookups ──────────────────────────────────────────────────────── */
export function getGroup(slug: string): CategoryGroup | undefined {
  return GROUPS.find((g) => g.slug === slug);
}
export function getCategory(slug: string): ReferralCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
export function categoriesInGroup(groupSlug: string): ReferralCategory[] {
  return CATEGORIES.filter((c) => c.groupSlug === groupSlug);
}
export function isArbitrable(c: ReferralCategory): boolean {
  const g = getGroup(c.groupSlug);
  return c.arb ?? g?.arbitrable ?? false;
}

/* ── consumer-safe content generators (NO fee, NO percentage) ─────── */
export function categoryBlurb(c: ReferralCategory): string {
  const arb = isArbitrable(c);
  return arb
    ? `${c.name}: understand your options, then resolve it fast with Quick-Resolve or get matched with a ${c.name.toLowerCase()} attorney.`
    : `${c.name}: understand what's at stake and get matched with an attorney who handles ${c.name.toLowerCase()} cases.`;
}

export function categoryIntro(c: ReferralCategory): string[] {
  const g = getGroup(c.groupSlug);
  const arb = isArbitrable(c);
  const p1 = `${g?.intro ?? ""} A ${c.name} matter is exactly the kind of situation where knowing your options early changes the outcome — what you can recover or avoid, the deadlines that apply, and who to trust with it.`;
  const p2 = arb
    ? `Not every ${c.name} dispute needs a lawyer and a lawsuit. When the disagreement is bounded and the facts are clear, Attorney.plus Quick-Resolve can reach a binding resolution in days for a flat fee — and when it isn't the right fit, we match you with a ${c.name.toLowerCase()} attorney suited to your specific need.`
    : `A ${c.name} matter is handled by an attorney, not arbitration. Attorney.plus matches you quickly with counsel who handles ${c.name.toLowerCase()} cases in your area and is best suited to your specific need.`;
  return [p1, p2];
}

export function categoryFaqs(c: ReferralCategory): Array<{ q: string; a: string }> {
  const arb = isArbitrable(c);
  const faqs: Array<{ q: string; a: string }> = [
    {
      q: `How much does a ${c.name} attorney cost?`,
      a: `It depends on the matter. Many ${c.name.toLowerCase()} cases are handled on a contingency or flat-fee basis, so you often pay nothing up front. Attorney.plus never charges you a separate fee — we're supported by our attorney network, not by you.`,
    },
    {
      q: `How quickly should I act on a ${c.name} matter?`,
      a: `Sooner is always better. Deadlines (statutes of limitation and filing windows) vary by state and situation, and evidence fades. Starting now preserves your options — whether that's Quick-Resolve or an attorney match.`,
    },
  ];
  if (arb) {
    faqs.push({
      q: `Can I resolve a ${c.name} dispute without hiring a lawyer?`,
      a: `Often, yes. For a bounded, clear ${c.name.toLowerCase()} dispute, Quick-Resolve arbitration produces a binding resolution in days for a flat fee — both sides agree to the process up front. If it isn't the right fit, we match you with an attorney.`,
    });
  } else {
    faqs.push({
      q: `Why does a ${c.name} matter need a specialized attorney?`,
      a: `${c.name} cases carry technical rules, strict deadlines, and high stakes that reward experience. Attorney.plus matches you with counsel who focuses on this exact area rather than a generalist.`,
    });
  }
  faqs.push({
    q: `How does Attorney.plus choose which attorney I'm matched with?`,
    a: `We match on your location and the specific category of your matter, then you approve the attorney before anything moves forward. You're always in control of who represents you.`,
  });
  return faqs;
}
