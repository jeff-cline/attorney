/**
 * Practice-area silo content — the seed for the attorney-referral SEO/AEO pages.
 * Derived from the keyword list in the original attorney.plus spec.
 * Each area renders a pillar page at /attorneys/[slug] with FAQ (AEO JSON-LD)
 * and the dual CTA (find an attorney / try Quick-Resolve arbitration first).
 */
export type FAQ = { q: string; a: string };

export type PracticeArea = {
  slug: string;
  name: string; // display, e.g. "Personal Injury"
  keyword: string; // primary keyword, e.g. "personal injury attorney"
  accent: string; // hex for the branded hero
  monogram: string; // letterform shown in the branded hero
  blurb: string; // meta description / card subtitle
  intro: string[]; // pillar paragraphs
  subtypes: string[]; // keyword cluster shown as chips + internal-link fodder
  faqs: FAQ[];
  related: string[]; // slugs
};

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    slug: "personal-injury",
    name: "Personal Injury",
    keyword: "personal injury attorney",
    accent: "#b1532c",
    monogram: "PI",
    blurb: "Hurt by someone else's negligence? Understand your claim, then get matched with a personal injury attorney — or resolve smaller disputes fast with Quick-Resolve.",
    intro: [
      "A personal injury claim exists when someone else's carelessness causes you harm — a driver who ran a light, a store that left a hazard, a doctor who missed the obvious. The law lets you recover medical bills, lost income, and the toll the injury took on your life.",
      "Most injury attorneys work on contingency, meaning no fee unless they recover for you. But not every dispute needs litigation. If the disagreement is about a modest amount or a clear-cut liability, Attorney.plus Quick-Resolve can settle it in days for a flat fee — and if it can't, we match you with the right attorney for your specific injury.",
    ],
    subtypes: ["Car accidents", "Truck accidents", "Motorcycle accidents", "Slip and fall", "Premises liability", "Rideshare (Uber/Lyft)", "Pedestrian & bicycle", "Brain & spinal injury", "Dog bites", "Nursing home abuse", "Medical malpractice", "Wrongful death"],
    faqs: [
      { q: "How much does a personal injury attorney cost?", a: "Most work on contingency — typically 33–40% of the recovery — so you pay nothing up front and nothing unless they win. Attorney.plus never adds a separate fee to you; any amount routed to a matched attorney is disclosed as a marketing fee paid by the firm." },
      { q: "How long do I have to file a personal injury claim?", a: "It depends on your state's statute of limitations, often two to three years from the injury, but some claims (against government entities, for example) have much shorter deadlines. Don't wait — evidence and witnesses fade quickly." },
      { q: "Do I need a lawyer, or can I settle it myself?", a: "For a clear, smaller dispute, Quick-Resolve arbitration can reach a binding resolution in days without a lawyer. For serious injuries, disputed liability, or large damages, a personal injury attorney almost always recovers more than you would alone." },
      { q: "What is my personal injury claim worth?", a: "It combines economic damages (medical bills, lost wages) and non-economic damages (pain, limitation, disfigurement). No honest lawyer quotes a number before reviewing the facts, but documenting everything early raises the value." },
    ],
    related: ["car-accident", "medical-malpractice", "wrongful-death"],
  },
  {
    slug: "car-accident",
    name: "Car Accidents",
    keyword: "car accident attorney",
    accent: "#b1532c",
    monogram: "CA",
    blurb: "After a crash: what to do, how fault works, and when to get a car accident attorney — or use Quick-Resolve for a fast, binding settlement.",
    intro: [
      "In the days after a car accident the insurance company moves fast — and not in your favor. Their first offer is almost always low, made before you know the full extent of your injuries or vehicle damage.",
      "Whether you need an attorney depends on the severity. A fender-bender with disputed fault or a lowball repair estimate is exactly what Quick-Resolve arbitration was built for. Serious injuries, commercial trucks, or a denied claim call for a car accident attorney, and we'll match you with one who handles your crash type in your area.",
    ],
    subtypes: ["Auto accidents", "Rear-end collisions", "Truck accidents", "Uber & Lyft crashes", "Hit and run", "Uninsured motorist", "Car injury claims", "Total-loss disputes"],
    faqs: [
      { q: "Should I accept the insurance company's first offer?", a: "Rarely. First offers are calculated to close the claim cheaply before you understand your total losses. Have the offer reviewed — Quick-Resolve can arbitrate a fair number, or an attorney can negotiate for you." },
      { q: "Who pays if the other driver was at fault?", a: "Generally the at-fault driver's liability insurer, but comparative-fault rules in your state can reduce recovery if you were partly responsible. Documentation of the scene is decisive." },
      { q: "How fast can Quick-Resolve settle a car accident dispute?", a: "Once both parties join and submit their accounts, a neutral summary and proposed resolution are generated within the process; most disputes reach a binding outcome in days, not the months litigation takes." },
      { q: "What if I was partially at fault?", a: "You may still recover in most states, reduced by your share of fault. This is often the exact point in dispute — and a good candidate for neutral arbitration before anyone hires a lawyer." },
    ],
    related: ["personal-injury", "truck-accident", "motorcycle-accident"],
  },
  {
    slug: "truck-accident",
    name: "Truck Accidents",
    keyword: "truck accident attorney",
    accent: "#8a4a24",
    monogram: "TA",
    blurb: "Commercial truck crashes involve more insurance, more rules, and more at stake. Learn how liability works and get matched with a truck accident attorney.",
    intro: [
      "Truck accidents are not just bigger car accidents. Federal safety regulations, electronic logging data, and multiple potentially liable parties — driver, carrier, broker, maintenance contractor — make these among the most complex injury claims.",
      "Because the damages and the insurance policies are large, these cases usually warrant an experienced truck accident attorney. Quick-Resolve can still help with narrower disputes (a property-damage disagreement, say), but for serious collisions we'll match you with a firm that has the resources to take on a commercial carrier.",
    ],
    subtypes: ["18-wheeler crashes", "Semi-truck accidents", "Jackknife collisions", "Delivery truck injuries", "Driver fatigue claims", "Cargo & maintenance liability"],
    faqs: [
      { q: "Why are truck accident claims more complicated?", a: "Multiple parties can share liability, federal trucking regulations apply, and critical evidence (logbooks, black-box data) can be lost if not preserved quickly through a legal hold." },
      { q: "How soon should I act after a truck accident?", a: "Immediately. An attorney can send a spoliation letter to preserve the truck's data and logs before the carrier's insurer does anything with them." },
      { q: "Can arbitration handle a truck accident dispute?", a: "For limited-scope disagreements, yes. For serious-injury or wrongful-death cases against a commercial carrier, an attorney match is the right path — start with us and we'll route you correctly." },
    ],
    related: ["car-accident", "personal-injury", "wrongful-death"],
  },
  {
    slug: "motorcycle-accident",
    name: "Motorcycle Accidents",
    keyword: "motorcycle accident attorney",
    accent: "#8a4a24",
    monogram: "MA",
    blurb: "Motorcyclists face worse injuries and unfair bias from insurers. Understand your rights and get matched with a motorcycle accident attorney.",
    intro: [
      "Motorcycle riders are more exposed in a crash and often face an unfair assumption that they were reckless. Insurers lean on that bias to discount valid claims.",
      "Countering it takes evidence and, frequently, an attorney who handles motorcycle cases specifically. For a straightforward liability or damages dispute, Quick-Resolve offers a neutral, fast alternative before you commit to litigation.",
    ],
    subtypes: ["Rider injury claims", "Lane-splitting disputes", "Left-turn collisions", "Helmet-law defenses", "Uninsured motorist claims"],
    faqs: [
      { q: "Does not wearing a helmet hurt my claim?", a: "It can affect head-injury damages in some states, but it does not automatically bar recovery for a crash someone else caused. The other driver's negligence is still the core issue." },
      { q: "Why do insurers undervalue motorcycle claims?", a: "They rely on juror and adjuster bias against riders. Strong scene documentation and, when needed, an experienced attorney neutralize that tactic." },
    ],
    related: ["car-accident", "personal-injury"],
  },
  {
    slug: "criminal-defense",
    name: "Criminal Defense",
    keyword: "criminal defense attorney",
    accent: "#3a3f68",
    monogram: "CD",
    blurb: "Charged with a crime? Your rights, the process, and how to get a criminal defense attorney fast. (Criminal matters are not handled by arbitration.)",
    intro: [
      "A criminal charge — from a DUI to a felony — puts your freedom, record, and livelihood at risk. The single most important early decision is getting qualified defense counsel before you talk to investigators.",
      "Criminal cases are not something arbitration can resolve; they require a defense attorney. Attorney.plus focuses here on matching you quickly with a criminal defense attorney in your jurisdiction who handles your specific charge.",
    ],
    subtypes: ["DUI / DWI", "Misdemeanors", "Felonies", "Drug charges", "Sex crimes", "Assault", "Theft & property crimes", "Expungement"],
    faqs: [
      { q: "Should I talk to police before getting a lawyer?", a: "No. You have the right to remain silent and to counsel. Politely decline to answer questions and ask for a criminal defense attorney immediately." },
      { q: "Can Attorney.plus arbitrate a criminal charge?", a: "No. Criminal matters are between you and the state and require a defense attorney. We match you with one — we do not arbitrate criminal cases." },
      { q: "What's the difference between a misdemeanor and a felony?", a: "Broadly, misdemeanors carry up to a year in jail while felonies carry longer prison terms and heavier lifelong consequences. Both deserve counsel." },
    ],
    related: ["dui", "family-law"],
  },
  {
    slug: "dui",
    name: "DUI Defense",
    keyword: "dui attorney",
    accent: "#3a3f68",
    monogram: "DU",
    blurb: "A DUI arrest triggers both a court case and a license fight, often on tight deadlines. Get matched with a DUI attorney right away.",
    intro: [
      "A DUI or DWI arrest starts two separate clocks: the criminal case and an administrative license suspension that can take effect within days unless you request a hearing.",
      "Because of those deadlines and the technical defenses involved — breathalyzer calibration, stop legality, field-test conditions — a DUI attorney is essential. We match you fast so you don't miss the license-hearing window.",
    ],
    subtypes: ["First-offense DUI", "Repeat DUI", "DUI with injury", "License suspension hearings", "Breathalyzer challenges", "Underage DUI"],
    faqs: [
      { q: "How quickly do I need a DUI attorney?", a: "Within days. Many states give you only about ten days to request a hearing to protect your license after a DUI arrest — miss it and the suspension is automatic." },
      { q: "Can a DUI be reduced or dismissed?", a: "Sometimes, depending on the stop's legality, testing accuracy, and procedure. An attorney evaluates whether the evidence holds up." },
    ],
    related: ["criminal-defense"],
  },
  {
    slug: "family-law",
    name: "Family Law",
    keyword: "family law attorney",
    accent: "#7a5230",
    monogram: "FL",
    blurb: "Divorce, custody, support. Understand your options — and use Quick-Resolve mediation for the disputes that don't need a courtroom.",
    intro: [
      "Family law touches the most personal parts of life: ending a marriage, dividing what you built, and deciding how children are raised. Emotions run high and litigation makes them higher.",
      "Many family disputes are ideal for neutral resolution — parenting-schedule disagreements, property splits, support adjustments. Quick-Resolve gives both sides a fair, documented process before anyone lawyers up. When a matter genuinely needs court (contested custody, safety concerns), we match you with a family law attorney.",
    ],
    subtypes: ["Divorce", "Child custody", "Child support", "Spousal support", "Property division", "Prenuptial agreements", "Modifications", "Mediation"],
    faqs: [
      { q: "Do we both need lawyers to divorce?", a: "Not always. When spouses mostly agree, a neutral process like Quick-Resolve can document terms fairly and cheaply. Contested issues — custody disputes, hidden assets, safety — call for a family law attorney." },
      { q: "How is custody decided?", a: "Courts apply the child's best interests, weighing stability, each parent's involvement, and the child's needs. Parents who resolve a schedule themselves through mediation usually get a better, faster outcome." },
      { q: "Can arbitration handle child support?", a: "It can help both sides reach a fair, documented agreement, but support is ultimately governed by state guidelines and court approval. We'll flag when an attorney is required." },
    ],
    related: ["divorce", "estate-planning"],
  },
  {
    slug: "divorce",
    name: "Divorce",
    keyword: "divorce attorney",
    accent: "#7a5230",
    monogram: "DV",
    blurb: "Contested or amicable, here's how divorce works — and how Quick-Resolve mediation settles the terms without a courtroom war.",
    intro: [
      "Divorce ranges from a paperwork formality to a years-long battle. The difference is usually how the couple handles a handful of disputes: the house, the retirement accounts, the parenting schedule.",
      "Resolving those points through a neutral process keeps costs down and control in your hands. Quick-Resolve is built for exactly this. When one side won't engage fairly, or complex assets and custody are involved, a divorce attorney match is the right move.",
    ],
    subtypes: ["Uncontested divorce", "Contested divorce", "Asset division", "Alimony", "Custody & visitation", "Divorce mediation"],
    faqs: [
      { q: "How much does divorce cost?", a: "An uncontested, mediated divorce can cost a fraction of a litigated one. Every dispute you resolve neutrally instead of in court saves money — which is what Quick-Resolve is designed to do." },
      { q: "Is mediation better than litigation?", a: "For most couples, yes: it's faster, cheaper, private, and keeps decisions with the two of you rather than a judge. Litigation is the fallback when mediation fails or isn't safe." },
    ],
    related: ["family-law"],
  },
  {
    slug: "estate-planning",
    name: "Estate Planning & Probate",
    keyword: "estate planning attorney",
    accent: "#4a6a3f",
    monogram: "EP",
    blurb: "Wills, trusts, power of attorney, and probate. Plan ahead — and resolve inheritance disputes with a neutral process instead of a family rift.",
    intro: [
      "Estate planning decides who receives what you've built and who speaks for you if you can't. A will, a trust, and a durable power of attorney together prevent confusion, taxes, and court fights later.",
      "When disputes do arise — a contested will, a disagreement among heirs, a probate conflict — they tear families apart in litigation. A neutral Quick-Resolve process can settle many of them privately. For drafting documents or contested probate, we match you with an estate planning or probate attorney.",
    ],
    subtypes: ["Wills", "Living trusts", "Power of attorney", "Durable power of attorney", "Medical power of attorney", "Probate", "Estate administration", "Inheritance disputes"],
    faqs: [
      { q: "What is a power of attorney?", a: "A power of attorney is a document authorizing someone to act on your behalf. A durable power of attorney stays in effect if you become incapacitated; a medical power of attorney covers healthcare decisions specifically." },
      { q: "Do I need a lawyer for a simple will?", a: "For a straightforward estate, guided documents may suffice, but a mistake can be costly and only discovered after death. An estate planning attorney is worth it for anything beyond the simplest situation." },
      { q: "Can heirs resolve an inheritance dispute without probate court?", a: "Often, yes — a neutral arbitration can settle who gets what far faster and more privately than a probate fight, preserving both the estate and the family." },
    ],
    related: ["family-law", "real-estate"],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    keyword: "real estate attorney",
    accent: "#2f6d63",
    monogram: "RE",
    blurb: "Buying, selling, leasing, or in a property dispute? Understand the risks and resolve deposit, boundary, and contract disputes with Quick-Resolve.",
    intro: [
      "Real estate is the largest transaction most people make, and small print carries big consequences — title defects, undisclosed problems, boundary lines, security deposits.",
      "Property disputes are among the best fits for Quick-Resolve: a withheld deposit, a contractor disagreement, a boundary or lease conflict can be settled neutrally in days for a flat fee. For closings, title litigation, or complex transactions, we match you with a real estate attorney.",
    ],
    subtypes: ["Purchase & sale", "Landlord–tenant", "Security deposits", "Boundary disputes", "Title issues", "Lease disputes", "Contractor disputes", "HOA conflicts"],
    faqs: [
      { q: "My landlord kept my security deposit — what can I do?", a: "Most states require an itemized list of deductions within a set window. If the withholding looks improper, Quick-Resolve can arbitrate a fast, binding outcome without small-claims court." },
      { q: "Do I need a real estate attorney to buy a home?", a: "Some states require one at closing; others don't. For disputes after the deal — defects, boundaries, contract breaches — a neutral process or an attorney can resolve it depending on complexity." },
      { q: "Can a boundary or contractor dispute be arbitrated?", a: "Yes. These fact-specific, dollar-bounded disputes are ideal for Quick-Resolve, which produces a documented, binding resolution both sides agree to up front." },
    ],
    related: ["estate-planning", "business-law"],
  },
  {
    slug: "employment",
    name: "Employment",
    keyword: "employment attorney",
    accent: "#5a4a7a",
    monogram: "EM",
    blurb: "Wrongful termination, unpaid wages, discrimination, workers' comp. Know your rights and get matched — or resolve a pay dispute fast.",
    intro: [
      "The workplace is governed by a dense web of rights: protection from discrimination and retaliation, rules on wages and overtime, and workers' compensation for on-the-job injuries.",
      "Some employment disputes — a disagreement over final pay or a bonus — can be resolved neutrally and quickly. Others, like discrimination or a workers' comp denial, need an employment attorney who knows the agencies and deadlines. We route you to the right one.",
    ],
    subtypes: ["Wrongful termination", "Workers' compensation", "Discrimination", "Harassment", "Unpaid wages & overtime", "Retaliation", "Severance disputes"],
    faqs: [
      { q: "Was I wrongfully terminated?", a: "Most employment is at-will, but firing you for an illegal reason — discrimination, retaliation for a protected complaint, taking legally protected leave — is unlawful. An attorney can assess whether your firing crossed that line." },
      { q: "How do workers' compensation claims work?", a: "Workers' comp covers job injuries regardless of fault, but insurers deny valid claims often. Tight deadlines apply, so a workers' compensation attorney match is time-sensitive." },
      { q: "Can a pay or severance dispute be arbitrated?", a: "Yes — a bounded disagreement over wages, commissions, or severance terms is a strong Quick-Resolve candidate before escalating to a lawsuit." },
    ],
    related: ["business-law", "social-security-disability"],
  },
  {
    slug: "bankruptcy",
    name: "Bankruptcy",
    keyword: "bankruptcy attorney",
    accent: "#4a6a3f",
    monogram: "BK",
    blurb: "Overwhelmed by debt? Understand Chapter 7 vs 13, what's protected, and get matched with a bankruptcy attorney.",
    intro: [
      "Bankruptcy is a legal reset for unmanageable debt. Chapter 7 discharges most unsecured debt quickly; Chapter 13 reorganizes it into a payment plan that can save a home or car.",
      "Which chapter fits depends on your income, assets, and goals — and the paperwork is unforgiving. A bankruptcy attorney prevents costly mistakes, and we match you with one who practices in your district.",
    ],
    subtypes: ["Chapter 7", "Chapter 13", "Debt discharge", "Foreclosure defense", "Creditor harassment", "Means test"],
    faqs: [
      { q: "Will I lose everything if I file bankruptcy?", a: "Usually not. Exemptions protect essentials — often your home, car, and retirement accounts — up to state limits. An attorney maximizes what you keep." },
      { q: "Chapter 7 or Chapter 13 — which is right?", a: "Chapter 7 suits lower-income filers seeking a fast discharge; Chapter 13 helps those with income who want to catch up on secured debts. The means test and your goals decide." },
    ],
    related: ["employment", "real-estate"],
  },
  {
    slug: "immigration",
    name: "Immigration",
    keyword: "immigration attorney",
    accent: "#2f6d63",
    monogram: "IM",
    blurb: "Visas, green cards, citizenship, and removal defense. Understand the process and get matched with an immigration attorney.",
    intro: [
      "Immigration law is federal, technical, and high-stakes — a single missed form or deadline can derail a case for years. Whether you're pursuing a visa, a green card, citizenship, or defending against removal, precision matters.",
      "These matters are handled by attorneys, not arbitration. Attorney.plus matches you with an immigration attorney suited to your specific need and status.",
    ],
    subtypes: ["Family visas", "Employment visas", "Green cards", "Citizenship & naturalization", "Removal defense", "Asylum", "DACA"],
    faqs: [
      { q: "Do I need an immigration attorney or can I file myself?", a: "Simple applications can be self-filed, but errors are common and consequential. For anything contested, time-sensitive, or involving prior issues, an attorney dramatically improves outcomes." },
      { q: "Can Attorney.plus arbitrate an immigration matter?", a: "No — immigration is federal and adjudicated by government agencies and courts. We match you with an immigration attorney." },
    ],
    related: ["employment", "criminal-defense"],
  },
  {
    slug: "social-security-disability",
    name: "Social Security Disability",
    keyword: "social security disability attorney",
    accent: "#5a4a7a",
    monogram: "SS",
    blurb: "Denied disability benefits? Most first applications are. Learn the appeals process and get matched with an SSD attorney.",
    intro: [
      "Social Security Disability benefits are notoriously hard to win — most initial applications are denied, and the appeals process is layered and deadline-driven.",
      "A disability attorney knows how to build the medical record the administration wants to see, and typically only gets paid a capped fee out of back benefits if you win. We match you with one experienced in your condition.",
    ],
    subtypes: ["SSDI", "SSI", "Application denials", "Appeals & hearings", "Continuing disability reviews"],
    faqs: [
      { q: "Why was my disability claim denied?", a: "Often for insufficient medical evidence or technical errors, not because you don't qualify. Most approvals happen on appeal with better documentation — which is where an attorney helps most." },
      { q: "How much does an SSD attorney cost?", a: "Fees are federally capped and contingent — typically a percentage of back pay up to a legal limit, paid only if you win. There's little downside to a match." },
    ],
    related: ["employment"],
  },
  {
    slug: "medical-malpractice",
    name: "Medical Malpractice",
    keyword: "medical malpractice attorney",
    accent: "#b1532c",
    monogram: "MM",
    blurb: "Harmed by a medical error? These cases are complex and time-limited. Understand your claim and get matched with a medical malpractice attorney.",
    intro: [
      "Medical malpractice means a provider's care fell below the accepted standard and injured you. Proving it requires expert testimony and a careful review of records — these are among the most demanding injury cases.",
      "Because of the expense, expert requirements, and short deadlines, malpractice claims warrant a specialized attorney. We match you with one who handles your type of injury; Quick-Resolve is not suited to these complex, expert-driven cases.",
    ],
    subtypes: ["Surgical errors", "Misdiagnosis", "Birth injury", "Medication errors", "Hospital negligence", "Wrongful death"],
    faqs: [
      { q: "How do I know if I have a malpractice case?", a: "You need more than a bad outcome — you need a breach of the standard of care that caused harm. An attorney's expert review is the only reliable way to know." },
      { q: "How long do I have to file?", a: "Malpractice statutes of limitations are often shorter than ordinary injury claims and can start from when you discovered the harm. Act promptly to preserve the claim." },
    ],
    related: ["personal-injury", "wrongful-death"],
  },
  {
    slug: "wrongful-death",
    name: "Wrongful Death",
    keyword: "wrongful death attorney",
    accent: "#8a4a24",
    monogram: "WD",
    blurb: "Lost a loved one to negligence? Learn who can file, what's recoverable, and get matched with a wrongful death attorney.",
    intro: [
      "A wrongful death claim lets a family recover when a loved one is killed by another's negligence or misconduct — a crash, a defective product, malpractice, or a workplace failure.",
      "These claims carry both financial and profound personal weight, and the rules on who may file and what's recoverable vary by state. We match you with a wrongful death attorney who will handle the case with the care it deserves.",
    ],
    subtypes: ["Fatal car & truck accidents", "Medical wrongful death", "Workplace deaths", "Product liability deaths", "Survival actions"],
    faqs: [
      { q: "Who can file a wrongful death claim?", a: "Usually the spouse, children, or estate representative, depending on state law. An attorney confirms standing and the filing deadline for your state." },
      { q: "What can a wrongful death claim recover?", a: "Typically funeral costs, lost financial support, lost companionship, and sometimes punitive damages. The specifics depend on your jurisdiction." },
    ],
    related: ["personal-injury", "medical-malpractice", "truck-accident"],
  },
  {
    slug: "business-law",
    name: "Business Law",
    keyword: "business law attorney",
    accent: "#2f6d63",
    monogram: "BL",
    blurb: "Contracts, partnerships, and commercial disputes. Resolve business disagreements fast with Quick-Resolve — or match with a business attorney.",
    intro: [
      "Every business runs on agreements — with partners, vendors, customers, and employees — and disputes over those agreements are inevitable. Litigation is slow and public; most commercial disputes are better resolved privately.",
      "Quick-Resolve is well suited to contract and payment disputes between businesses: a bounded, documented, binding process that protects the relationship. For formation, complex litigation, or high-value matters, we match you with a business attorney.",
    ],
    subtypes: ["Contract disputes", "Unpaid invoices", "Partnership disputes", "Breach of contract", "Vendor & supplier conflicts", "Business formation", "Non-compete disputes"],
    faqs: [
      { q: "Can a business contract dispute be arbitrated?", a: "Yes — contract and payment disputes are core Quick-Resolve territory. Both sides agree to the process up front and reach a binding resolution in days, keeping the matter private and the relationship intact." },
      { q: "When do I need a business attorney instead?", a: "For entity formation, financing, intellectual property, or high-value or complex litigation, an attorney is the right call. We match you with one who fits your industry and need." },
    ],
    related: ["real-estate", "employment"],
  },
];

export function getArea(slug: string): PracticeArea | undefined {
  return PRACTICE_AREAS.find((a) => a.slug === slug);
}
