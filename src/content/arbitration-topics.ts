/**
 * Arbitration content silo — educational + AEO pages that also funnel to
 * Quick-Resolve (Attorney.plus IS an arbitration platform) and to the
 * attorney/lawyer directories. Buckets the legal-arbitration keyword universe
 * into topic clusters. (Off-topic senses — the Honkai/Warframe game mode,
 * CAN-bus/I2C electronics, and MLB/NHL salary arbitration — are excluded except
 * one clearly-scoped sports page.)
 */
export type FAQ = { q: string; a: string };

export type ArbitrationTopic = {
  slug: string;
  name: string;
  keyword: string; // primary keyword
  section: string; // hub grouping
  accent: string;
  monogram: string;
  blurb: string;
  intro: string[];
  clusters: string[]; // keyword-cluster chips
  faqs: FAQ[];
  related: string[];
};

export const ARBITRATION_SECTIONS = [
  "Arbitration basics",
  "Agreements & clauses",
  "By situation",
  "Institutions & help",
] as const;

export const ARBITRATION_TOPICS: ArbitrationTopic[] = [
  {
    slug: "what-is-arbitration",
    name: "What Is Arbitration?",
    keyword: "what is arbitration",
    section: "Arbitration basics",
    accent: "#14524f",
    monogram: "AR",
    blurb: "A plain-English definition of arbitration — what it means, how it works, and when it's used to resolve a dispute without going to court.",
    intro: [
      "Arbitration is a private way to resolve a dispute: instead of a judge and jury, a neutral third party — the arbitrator — hears both sides and issues a decision called an award. It's one of the main forms of alternative dispute resolution (ADR), alongside mediation.",
      "Arbitration can be binding (the decision is final and enforceable like a court judgment) or non-binding, and it can be agreed to before a dispute arises (through an arbitration clause in a contract) or after. Attorney.plus runs a modern arbitration process — Quick-Resolve — that reaches a binding result in days for a flat fee.",
    ],
    clusters: ["arbitration definition", "arbitration meaning", "define arbitration", "how does arbitration work", "arbitration examples", "arbitration process", "what does arbitration mean", "arbitration in law"],
    faqs: [
      { q: "What is arbitration in simple terms?", a: "Arbitration is a private alternative to a lawsuit: both sides present their case to a neutral arbitrator who makes a decision (an award). It's usually faster, cheaper, and more private than court." },
      { q: "How does arbitration work?", a: "The parties agree to arbitrate, each presents evidence and arguments to the arbitrator, and the arbitrator issues an award. In a binding arbitration the award is final and enforceable in court. Attorney.plus Quick-Resolve runs this process online in days." },
      { q: "Is arbitration legally binding?", a: "It can be. Binding arbitration produces a final, enforceable award. Non-binding arbitration produces an advisory decision the parties can accept or reject. The arbitration agreement or clause says which applies." },
      { q: "What is the purpose of arbitration?", a: "To resolve disputes faster, more privately, and at lower cost than litigation, with a decision-maker the parties trust and a process they control." },
    ],
    related: ["arbitration-vs-mediation", "binding-arbitration", "arbitration-process", "arbitration-cost"],
  },
  {
    slug: "arbitration-vs-mediation",
    name: "Arbitration vs. Mediation vs. Litigation",
    keyword: "arbitration vs mediation",
    section: "Arbitration basics",
    accent: "#2f6d63",
    monogram: "VM",
    blurb: "The difference between arbitration, mediation, and going to court — who decides, whether it's binding, and which is right for your dispute.",
    intro: [
      "The key difference: in mediation a neutral helps the parties reach their own agreement (no decision is imposed); in arbitration a neutral hears the case and decides for them (an award); in litigation a judge or jury decides in public court. Mediation is for negotiating a compromise; arbitration and litigation are for getting a ruling.",
      "Arbitration sits between mediation and litigation — more structured than mediation, faster and more private than court. Many disputes resolve best by trying a neutral process first, then escalating only if needed.",
    ],
    clusters: ["mediation vs arbitration", "arbitration vs litigation", "difference between mediation and arbitration", "arbitration vs mediation vs litigation", "conciliation vs arbitration", "adjudication vs arbitration", "arbitration vs court"],
    faqs: [
      { q: "What is the difference between arbitration and mediation?", a: "In mediation, a neutral mediator helps both sides negotiate their own settlement — they can walk away. In arbitration, a neutral arbitrator hears the dispute and issues a decision (an award) that is usually binding." },
      { q: "Is arbitration better than going to court?", a: "Often — arbitration is typically faster, cheaper, and private, and you help pick the decision-maker. Court offers broader appeal rights and public precedent. The best choice depends on the dispute." },
      { q: "What is the difference between arbitration and litigation?", a: "Litigation is a public lawsuit decided by a court with full appeal rights. Arbitration is a private process decided by an arbitrator, usually faster and cheaper but with very limited appeal." },
      { q: "Which is cheaper, mediation or arbitration?", a: "Mediation is usually the cheapest because it's shorter and non-binding, but it only works if both sides compromise. Arbitration costs more but guarantees a decision." },
    ],
    related: ["what-is-arbitration", "binding-arbitration", "divorce-family-arbitration", "arbitration-cost"],
  },
  {
    slug: "binding-arbitration",
    name: "Binding vs. Non-Binding Arbitration",
    keyword: "binding arbitration",
    section: "Arbitration basics",
    accent: "#4a6a3f",
    monogram: "BA",
    blurb: "What binding arbitration means, how it differs from non-binding, whether you can appeal, and how an award is enforced.",
    intro: [
      "In binding arbitration, the arbitrator's award is final: it resolves the dispute and can be confirmed by a court and enforced like any judgment. In non-binding arbitration, the decision is advisory — the parties can accept it or move on to court.",
      "Binding awards are hard to appeal; courts only overturn them in narrow cases like fraud or arbitrator misconduct. That finality is a feature — it delivers certainty quickly — which is exactly what a flat-fee process like Quick-Resolve provides.",
    ],
    clusters: ["binding arbitration meaning", "non binding arbitration", "is arbitration binding", "binding vs non binding arbitration", "can you appeal arbitration", "binding arbitration definition", "final and binding arbitration"],
    faqs: [
      { q: "What does binding arbitration mean?", a: "It means the arbitrator's decision (the award) is final and enforceable. A court can confirm it and it carries the force of a judgment. You generally cannot re-litigate the dispute." },
      { q: "Can you appeal a binding arbitration decision?", a: "Rarely. Courts vacate binding awards only on narrow grounds — such as fraud, corruption, arbitrator bias, or exceeding authority — not simply because the arbitrator got the facts or law wrong." },
      { q: "What is non-binding arbitration?", a: "A process where the arbitrator issues an advisory decision the parties are free to accept or reject. If rejected, the dispute can proceed to court. It's often used to preview how a case might come out." },
      { q: "How is an arbitration award enforced?", a: "The winning party asks a court to confirm the award, turning it into an enforceable judgment. Under the New York Convention, awards are also enforceable across most countries." },
    ],
    related: ["what-is-arbitration", "arbitration-process", "forced-mandatory-arbitration", "arbitration-agreement"],
  },
  {
    slug: "arbitration-process",
    name: "The Arbitration Process & Hearing",
    keyword: "arbitration process",
    section: "Arbitration basics",
    accent: "#3a3f68",
    monogram: "PR",
    blurb: "Step by step: demand for arbitration, selecting an arbitrator, the hearing, evidence, and the award — plus how long it takes.",
    intro: [
      "A typical arbitration runs: a demand (or notice) for arbitration, selection of the arbitrator, a preliminary/scheduling conference, exchange of documents, the hearing where each side presents evidence and witnesses, and finally the arbitrator's written award. It's more streamlined than a lawsuit — lighter discovery, no jury, flexible scheduling.",
      "Timelines vary from weeks to many months depending on complexity and the rules used. Attorney.plus Quick-Resolve compresses this into a fast online flow: both sides submit their account, a neutral summary is generated, and a binding resolution follows in days.",
    ],
    clusters: ["arbitration hearing", "demand for arbitration", "notice of arbitration", "arbitration award", "how long does arbitration take", "arbitration process step by step", "statement of claim arbitration", "arbitration timeline"],
    faqs: [
      { q: "What are the steps in the arbitration process?", a: "Generally: file a demand/notice for arbitration, select the arbitrator, hold a preliminary conference, exchange documents, hold the hearing (evidence and witnesses), and receive the arbitrator's written award." },
      { q: "How long does arbitration take?", a: "Anywhere from a few weeks to over a year depending on complexity and rules. Streamlined and online processes like Quick-Resolve reach a binding result in days once both sides participate." },
      { q: "What is a demand for arbitration?", a: "The document that starts arbitration — it names the parties, describes the dispute and relief sought, and cites the arbitration agreement. The other side responds with an answer." },
      { q: "Is there discovery in arbitration?", a: "Usually limited compared to court. Parties typically exchange key documents, but broad depositions and interrogatories are the exception, which is part of why arbitration is faster." },
    ],
    related: ["what-is-arbitration", "arbitration-cost", "binding-arbitration", "arbitration-organizations"],
  },
  {
    slug: "arbitration-cost",
    name: "Arbitration Cost — How Much & Who Pays",
    keyword: "how much does arbitration cost",
    section: "Arbitration basics",
    accent: "#7a5230",
    monogram: "$$",
    blurb: "What arbitration costs, who pays the arbitrator and filing fees, and how it compares to the cost of litigation.",
    intro: [
      "Arbitration costs usually include a filing fee, the arbitrator's hourly or daily fee, and administrative fees charged by the institution (like the AAA or JAMS). Who pays depends on the agreement and rules — often the parties split fees, or the loser pays, and consumer/employment rules frequently shift most costs to the company.",
      "Total cost ranges widely with the size of the dispute and number of arbitrators. A flat-fee model removes the guesswork: Quick-Resolve gives both sides one predictable price to reach a binding outcome.",
    ],
    clusters: ["how much does arbitration cost", "who pays for arbitration", "arbitration fees", "cost of arbitration vs litigation", "is arbitration cheaper than court", "aaa arbitration fees", "jams arbitration fees", "arbitration filing fee"],
    faqs: [
      { q: "How much does arbitration cost?", a: "It varies with the dispute size and rules, but typically includes a filing fee, the arbitrator's fee (hourly or daily), and administrative fees. Small consumer cases can be a few hundred dollars in filing fees; complex commercial cases cost far more." },
      { q: "Who pays for arbitration?", a: "It depends on the agreement and the rules. Parties often split the arbitrator's fees, sometimes the loser pays, and many consumer and employment rules require the company to cover most of the cost." },
      { q: "Is arbitration cheaper than litigation?", a: "Frequently, because it's faster and has limited discovery — but arbitrator fees can make small disputes proportionally expensive. Flat-fee arbitration removes that uncertainty." },
    ],
    related: ["arbitration-process", "consumer-arbitration", "arbitration-vs-mediation", "arbitration-organizations"],
  },
  {
    slug: "arbitration-agreement",
    name: "Arbitration Agreements & Clauses",
    keyword: "arbitration agreement",
    section: "Agreements & clauses",
    accent: "#5a4a7a",
    monogram: "AG",
    blurb: "What an arbitration agreement or clause is, whether you should sign one, whether they're enforceable, and how to opt out.",
    intro: [
      "An arbitration agreement is a contract to resolve disputes by arbitration instead of court. It often appears as an arbitration clause buried in a bigger contract — an employment offer, a credit card agreement, a terms-of-service. Signing one usually means giving up your right to sue in court and to a jury.",
      "These clauses are generally enforceable under the Federal Arbitration Act, though courts won't enforce ones that are unconscionable. Many contracts include an opt-out window — you can reject the clause within a set period without losing the deal.",
    ],
    clusters: ["arbitration clause", "should i sign an arbitration agreement", "mutual arbitration agreement", "arbitration provision", "can i sue if i signed an arbitration agreement", "opt out of arbitration", "are arbitration agreements enforceable", "arbitration agreement meaning"],
    faqs: [
      { q: "Should I sign an arbitration agreement?", a: "It depends. Signing usually waives your right to sue in court or join a class action. Read whether it's mutual, whether it caps your remedies, and whether there's an opt-out window. When unsure, ask a lawyer before signing." },
      { q: "Can I sue if I signed an arbitration agreement?", a: "Usually not for covered disputes — a court will typically send the case to arbitration. But you may still sue if the clause is unconscionable, was fraudulently induced, or doesn't cover your specific claim." },
      { q: "How do I opt out of an arbitration agreement?", a: "Many agreements (credit cards, apps, employers) let you opt out by sending written notice within a set window — often 30–60 days. Follow the exact method and deadline in the agreement." },
      { q: "Are arbitration agreements enforceable?", a: "Generally yes, under the Federal Arbitration Act, unless the agreement is unconscionable or another contract defense applies. State laws that single out arbitration for disfavor are usually preempted." },
    ],
    related: ["forced-mandatory-arbitration", "binding-arbitration", "employment-arbitration", "consumer-arbitration"],
  },
  {
    slug: "forced-mandatory-arbitration",
    name: "Forced & Mandatory Arbitration",
    keyword: "forced arbitration",
    section: "Agreements & clauses",
    accent: "#b1532c",
    monogram: "FM",
    blurb: "What forced and mandatory arbitration mean, whether they're legal, the debate around them, and recent law changes.",
    intro: [
      "Forced (or mandatory) arbitration means a company requires you to arbitrate future disputes as a condition of a job, product, or service — you can't sue in court. Critics say it favors repeat-player companies and hides claims; supporters say it's faster and cheaper than litigation.",
      "Mandatory arbitration is generally legal under the Federal Arbitration Act, but the law is shifting: the 2022 Ending Forced Arbitration of Sexual Assault and Sexual Harassment Act lets those claims go to court despite a clause, and more reforms are debated.",
    ],
    clusters: ["mandatory arbitration", "what is forced arbitration", "is forced arbitration legal", "why is mandatory arbitration bad", "forced arbitration clause", "ending forced arbitration act", "mandatory arbitration clause", "forced arbitration meaning"],
    faqs: [
      { q: "What is forced arbitration?", a: "It's when a company requires you to give up the right to sue and instead arbitrate disputes, usually via a clause you accept to get a job, loan, or service." },
      { q: "Is mandatory arbitration legal?", a: "Generally yes under the Federal Arbitration Act. But a 2022 federal law carves out sexual assault and harassment claims, letting them proceed in court despite an arbitration clause." },
      { q: "Why do people say forced arbitration is unfair?", a: "Because the company often picks the forum and rules, class actions may be barred, proceedings are private, and 'repeat-player' companies appear before the same arbitrators, which critics argue tilts outcomes." },
      { q: "Can I get out of mandatory arbitration?", a: "Sometimes — through an opt-out window, if the clause is unconscionable, if a statute exempts your claim (like sexual harassment), or if the clause doesn't cover the dispute." },
    ],
    related: ["arbitration-agreement", "consumer-arbitration", "employment-arbitration", "binding-arbitration"],
  },
  {
    slug: "employment-arbitration",
    name: "Employment Arbitration",
    keyword: "employment arbitration agreement",
    section: "By situation",
    accent: "#5a4a24",
    monogram: "EM",
    blurb: "Arbitration in the workplace — employment arbitration agreements, what they cover, whether you must sign, and your rights.",
    intro: [
      "Many employers ask new hires to sign an employment arbitration agreement, routing disputes like wrongful termination, discrimination, and wage claims to arbitration instead of court — often with a class-action waiver. These are usually enforceable, though some states limit them.",
      "You can often negotiate or, occasionally, decline — but declining may cost the job. Note the 2022 federal law: claims of sexual assault or harassment can go to court regardless of the clause.",
    ],
    clusters: ["employment arbitration", "arbitration agreement for employment", "should i sign an arbitration agreement with my employer", "wrongful termination arbitration", "employment arbitration news", "can i be fired for not signing an arbitration agreement", "workplace arbitration"],
    faqs: [
      { q: "Do I have to sign an employment arbitration agreement?", a: "Usually it's presented as a condition of employment. You can try to negotiate or decline, but the employer may withdraw the offer. Some states restrict mandatory workplace arbitration." },
      { q: "What does employment arbitration cover?", a: "Typically disputes like wrongful termination, discrimination, harassment, retaliation, and wage-and-hour claims — though sexual assault and harassment claims can now go to court under federal law." },
      { q: "Can I be fired for not signing an arbitration agreement?", a: "In many states, at-will employers can condition employment on signing. Protections vary by state, so check local law or ask an employment lawyer." },
    ],
    related: ["arbitration-agreement", "forced-mandatory-arbitration", "consumer-arbitration", "arbitration-lawyer"],
  },
  {
    slug: "consumer-arbitration",
    name: "Consumer & Mass Arbitration",
    keyword: "consumer arbitration",
    section: "By situation",
    accent: "#4a6a3f",
    monogram: "CO",
    blurb: "Arbitration clauses in consumer contracts, class-action waivers, mass arbitration, and how to opt out (banks, apps, telecom).",
    intro: [
      "Consumer contracts — credit cards, phone plans, apps, streaming — routinely include arbitration clauses with class-action waivers, so disputes are handled one-on-one in arbitration. In response, plaintiffs' firms use 'mass arbitration,' filing thousands of individual claims at once to pressure companies with the fees.",
      "Most of these clauses let you opt out within a short window (often by email or mail). If you didn't opt out, you can still bring an individual arbitration — and small, bounded disputes are exactly what Quick-Resolve resolves fast.",
    ],
    clusters: ["mass arbitration", "class action waiver", "arbitration opt out", "bank of america arbitration opt out", "discord arbitration opt out", "consumer arbitration rules", "credit card arbitration", "how to opt out of arbitration"],
    faqs: [
      { q: "What is mass arbitration?", a: "A strategy where a law firm files thousands of individual arbitration demands against one company at the same time, so the company faces enormous filing and arbitrator fees — used to counter class-action waivers." },
      { q: "How do I opt out of a consumer arbitration clause?", a: "Look for the opt-out section in the terms — many companies (banks, apps, carriers) let you opt out by sending written notice within about 30–60 days of accepting the agreement. Keep proof you sent it." },
      { q: "Can I still arbitrate if I didn't opt out?", a: "Yes — you can bring an individual arbitration for a covered dispute. For a clear, bounded consumer dispute, a flat-fee process like Quick-Resolve can resolve it quickly." },
      { q: "What is a class-action waiver?", a: "A term in an arbitration clause barring you from joining a class action, requiring you to arbitrate individually. The Supreme Court has generally upheld these under the Federal Arbitration Act." },
    ],
    related: ["arbitration-agreement", "forced-mandatory-arbitration", "arbitration-cost", "finra-securities-arbitration"],
  },
  {
    slug: "finra-securities-arbitration",
    name: "FINRA & Securities Arbitration",
    keyword: "finra arbitration",
    section: "By situation",
    accent: "#3a3f68",
    monogram: "FI",
    blurb: "How FINRA arbitration works for investors and brokers — recovering investment losses, the process, and finding a securities arbitration lawyer.",
    intro: [
      "Most disputes between investors and brokerage firms are resolved through FINRA arbitration, the securities industry's forum. Because customer agreements require it, investors bring claims like unsuitable investments, misrepresentation, or broker misconduct before a FINRA panel rather than in court.",
      "The process has its own rules — statement of claim, arbitrator selection, hearing, and award — and awards are binding with very limited appeal. A securities arbitration lawyer typically works on contingency to pursue investment-loss recovery.",
    ],
    clusters: ["securities arbitration", "finra arbitration attorney", "securities arbitration lawyer", "finra arbitration process", "broker misconduct arbitration", "investment loss recovery", "finra arbitration rules", "finra arbitration awards"],
    faqs: [
      { q: "What is FINRA arbitration?", a: "It's the mandatory forum for most disputes between investors and brokerage firms, run by FINRA. Investors file claims like unsuitability, misrepresentation, or churning, and a panel of arbitrators issues a binding award." },
      { q: "Do I need a lawyer for FINRA arbitration?", a: "You can appear on your own, but securities arbitration is technical. Most investors hire a securities arbitration lawyer — usually on contingency — to improve recovery." },
      { q: "How long does FINRA arbitration take?", a: "Often around a year to eighteen months for a full hearing, though simplified cases for smaller amounts resolve faster on the papers." },
    ],
    related: ["consumer-arbitration", "arbitration-process", "arbitration-lawyer", "arbitration-organizations"],
  },
  {
    slug: "divorce-family-arbitration",
    name: "Divorce & Family Arbitration",
    keyword: "divorce arbitration",
    section: "By situation",
    accent: "#7a5230",
    monogram: "DF",
    blurb: "Using arbitration to resolve divorce and family disputes — property, support, and custody — privately and faster than court.",
    intro: [
      "Divorce and family arbitration lets separating couples have a neutral arbitrator decide contested issues — property division, support, and sometimes parenting schedules — privately and on their own timeline, instead of waiting for a public court date.",
      "It's especially useful for financial disputes; custody arbitration is allowed in some states but usually remains subject to court review of the child's best interests. Many couples resolve the money issues through a neutral process and reserve court only for what truly needs it.",
    ],
    clusters: ["family arbitration", "divorce arbitration vs mediation", "child custody arbitration", "divorce arbitration cost", "family law arbitration", "divorce arbitration lawyer", "divorce arbitration near me", "arbitration in divorce"],
    faqs: [
      { q: "How does divorce arbitration work?", a: "Both spouses agree to let a neutral arbitrator decide contested issues after hearing each side. The arbitrator's award resolves those issues; for financial matters it's typically binding, while custody decisions often remain subject to court review." },
      { q: "Is divorce arbitration better than mediation?", a: "Mediation helps you craft your own agreement but can't force a resolution; arbitration guarantees a decision. Many couples mediate first and arbitrate only the issues they can't settle." },
      { q: "Can custody be decided by arbitration?", a: "In some states, yes — but courts retain authority over a child's best interests and can review the arbitrator's custody decision. Rules vary by state." },
    ],
    related: ["arbitration-vs-mediation", "arbitration-agreement", "arbitration-cost", "arbitration-lawyer"],
  },
  {
    slug: "construction-arbitration",
    name: "Construction Arbitration",
    keyword: "construction arbitration",
    section: "By situation",
    accent: "#8a4a24",
    monogram: "CN",
    blurb: "Arbitration of construction disputes — contract, delay, and defect claims — under AAA construction rules and industry contracts.",
    intro: [
      "Construction contracts (AIA, ConsensusDocs, and others) frequently require arbitration for disputes over payment, delay, defects, and change orders. Arbitrators with construction expertise decide these technical cases under specialized rules like the AAA Construction Industry Arbitration Rules.",
      "Arbitration keeps complex, document-heavy construction fights out of crowded courts and lets the parties pick a decision-maker who understands the industry — valuable when schedules and liens are on the line.",
    ],
    clusters: ["construction arbitration news", "construction arbitration lawyer", "aaa construction arbitration rules", "construction defect arbitration", "construction arbitration attorney", "construction dispute arbitration", "construction arbitration expert"],
    faqs: [
      { q: "How does construction arbitration work?", a: "A construction dispute is submitted to an arbitrator (often with industry expertise) under rules like the AAA Construction Industry Arbitration Rules. The arbitrator hears evidence on the contract, delays, or defects and issues a binding award." },
      { q: "Why is arbitration common in construction?", a: "Construction disputes are technical and document-heavy; arbitration lets parties choose an expert decision-maker, keep the matter private, and resolve it faster than crowded court dockets." },
      { q: "Do construction contracts require arbitration?", a: "Many standard forms (AIA, ConsensusDocs) include arbitration clauses, though parties can negotiate them. Check the dispute-resolution section of your contract." },
    ],
    related: ["arbitration-process", "international-arbitration", "arbitration-organizations", "arbitration-lawyer"],
  },
  {
    slug: "insurance-arbitration",
    name: "Insurance & Auto Accident Arbitration",
    keyword: "insurance arbitration",
    section: "By situation",
    accent: "#2f6d63",
    monogram: "IN",
    blurb: "How arbitration resolves insurance claims and car-accident disputes — bad faith, appraisal vs. arbitration, and inter-company claims.",
    intro: [
      "Insurance policies often use arbitration (or appraisal) to resolve coverage and valuation disputes — uninsured/underinsured motorist claims, property damage, and bad-faith fights. Insurers also arbitrate claims against each other through inter-company arbitration.",
      "Appraisal decides only the amount of loss; arbitration can decide liability and coverage too. If your car-accident or insurance claim is headed to arbitration, understanding which process applies — and its deadlines — is critical.",
    ],
    clusters: ["car accident arbitration", "auto insurance arbitration", "insurance claim arbitration", "appraisal vs arbitration", "insurance bad faith arbitration", "arbitration between insurance companies", "insurance arbitration process", "uim arbitration"],
    faqs: [
      { q: "How does insurance arbitration work?", a: "The policyholder and insurer (or two insurers) submit a coverage or valuation dispute to a neutral arbitrator, who hears evidence and issues a decision. Many auto policies require it for uninsured/underinsured motorist claims." },
      { q: "What's the difference between appraisal and arbitration?", a: "Appraisal resolves only the amount of a loss, using appraisers and an umpire. Arbitration is broader — it can decide liability and coverage, not just value." },
      { q: "Why is my car accident claim going to arbitration?", a: "Because your policy or the parties' agreement requires disputed claims — often uninsured/underinsured motorist or damage valuation — to be arbitrated instead of litigated." },
    ],
    related: ["arbitration-process", "arbitration-agreement", "arbitration-vs-mediation", "arbitration-lawyer"],
  },
  {
    slug: "international-arbitration",
    name: "International Arbitration",
    keyword: "international arbitration",
    section: "By situation",
    accent: "#14524f",
    monogram: "IA",
    blurb: "Cross-border dispute resolution — ICC, LCIA, SIAC, and ICSID rules, investment treaty arbitration, and enforcing awards worldwide.",
    intro: [
      "International arbitration is the default way to resolve cross-border commercial and investment disputes, because it offers a neutral forum and awards enforceable in ~170 countries under the New York Convention. Leading institutions include the ICC, LCIA, SIAC, HKIAC, and — for investor-state cases — ICSID.",
      "Parties choose a seat, rules, and language, and specialized counsel handle everything from the arbitration clause to enforcement. It's the backbone of global commerce dispute resolution.",
    ],
    clusters: ["icc arbitration", "lcia arbitration", "siac arbitration", "icsid arbitration", "investment treaty arbitration", "international arbitration law firm", "international commercial arbitration", "international arbitration lawyer"],
    faqs: [
      { q: "What is international arbitration?", a: "A private process for resolving cross-border disputes before a neutral tribunal under institutional rules (ICC, LCIA, SIAC, ICSID) or ad hoc. Awards are enforceable in most countries under the New York Convention." },
      { q: "What is the seat of arbitration?", a: "The legal home of the arbitration — the jurisdiction whose courts supervise it and whose law governs the procedure. It's distinct from the physical venue where hearings happen." },
      { q: "How are international arbitration awards enforced?", a: "Through the 1958 New York Convention, which requires courts in ~170 member states to recognize and enforce foreign arbitral awards, with only narrow exceptions." },
    ],
    related: ["arbitration-organizations", "construction-arbitration", "arbitration-process", "arbitration-lawyer"],
  },
  {
    slug: "arbitration-organizations",
    name: "Arbitration Institutions & Rules",
    keyword: "american arbitration association",
    section: "Institutions & help",
    accent: "#5a4a7a",
    monogram: "OR",
    blurb: "The major arbitration organizations — AAA, JAMS, FINRA, ICC — and the rules that govern how a case is run.",
    intro: [
      "Most arbitrations are administered by an institution that supplies rules, arbitrator rosters, and case management. In the U.S. the big names are the American Arbitration Association (AAA) and JAMS; FINRA runs securities cases; and internationally the ICC, LCIA, and SIAC lead. Parties can also arbitrate 'ad hoc' under rules like UNCITRAL.",
      "The chosen rules shape everything — filing fees, discovery, arbitrator selection, and timelines — so the institution named in your arbitration clause matters as much as the decision to arbitrate.",
    ],
    clusters: ["aaa arbitration", "jams arbitration", "american arbitration association rules", "aaa commercial arbitration rules", "jams arbitration rules", "uncitral arbitration rules", "icc arbitration rules", "arbitration rules"],
    faqs: [
      { q: "What is the American Arbitration Association (AAA)?", a: "A leading U.S. nonprofit that administers arbitrations and mediations, providing rules (commercial, consumer, employment, construction), arbitrator panels, and case administration." },
      { q: "What is the difference between AAA and JAMS arbitration?", a: "Both are major U.S. providers. AAA is a nonprofit with broad rule sets and consumer/employment protocols; JAMS uses primarily retired judges and its own comprehensive rules. Which applies depends on the contract." },
      { q: "What does JAMS stand for in arbitration?", a: "JAMS originally stood for Judicial Arbitration and Mediation Services; today it operates simply as JAMS, a private ADR provider." },
    ],
    related: ["arbitration-process", "finra-securities-arbitration", "international-arbitration", "arbitration-cost"],
  },
  {
    slug: "arbitration-lawyer",
    name: "Find an Arbitration Lawyer",
    keyword: "arbitration lawyer",
    section: "Institutions & help",
    accent: "#14524f",
    monogram: "LW",
    blurb: "When you need an arbitration attorney, what they do, and how to get matched with the right one for your dispute.",
    intro: [
      "An arbitration lawyer represents you in the arbitration process — drafting the demand, selecting the arbitrator, building evidence, and arguing the case — and advises whether to arbitrate at all. For technical forums like FINRA or international arbitration, specialized counsel makes a real difference.",
      "Not every dispute needs a lawyer up front: a bounded, clear dispute can often be resolved through Quick-Resolve arbitration first. When you do need representation, Attorney.plus matches you with an attorney suited to your matter.",
    ],
    clusters: ["arbitration attorney", "arbitration lawyer near me", "arbitration attorneys near me", "do i need a lawyer for arbitration", "arbitration lawyer definition", "what does an arbitration lawyer do", "arbitration attorney for construction disputes"],
    faqs: [
      { q: "Do I need a lawyer for arbitration?", a: "Not always — for a small, clear dispute you can self-represent or use a flat-fee process like Quick-Resolve. For complex, high-value, or technical matters (securities, international, construction), an arbitration lawyer is worth it." },
      { q: "What does an arbitration lawyer do?", a: "They advise whether to arbitrate, draft the demand and submissions, help pick the arbitrator, gather and present evidence, argue the hearing, and pursue or challenge enforcement of the award." },
      { q: "How do I find the right arbitration attorney?", a: "Match on the type of dispute (employment, securities, construction, international) and forum. Attorney.plus connects you with an attorney who handles your exact matter — and you approve the match." },
    ],
    related: ["what-is-arbitration", "finra-securities-arbitration", "international-arbitration", "construction-arbitration"],
  },
  {
    slug: "salary-arbitration-sports",
    name: "Salary Arbitration in Sports (MLB & NHL)",
    keyword: "salary arbitration",
    section: "Institutions & help",
    accent: "#8a4a24",
    monogram: "SP",
    blurb: "How salary arbitration works in Major League Baseball and the NHL — eligibility, the hearing, and why it's different from legal arbitration.",
    intro: [
      "In pro sports, 'arbitration' usually means salary arbitration — a process in MLB and the NHL where an arbitrator sets a player's pay when the player and team can't agree. It's a distinct, contract-based system, not the legal dispute-resolution arbitration used in courts and businesses.",
      "In MLB's version, each side submits a figure and the arbitrator must pick one (final-offer or 'baseball' arbitration); the NHL uses a bracketed model. Eligibility depends on service time, and most cases settle before the hearing.",
    ],
    clusters: ["mlb arbitration", "baseball arbitration", "nhl arbitration", "what is baseball arbitration", "how does mlb arbitration work", "arbitration eligible", "salary arbitration nhl", "pre arbitration"],
    faqs: [
      { q: "What is salary arbitration in baseball?", a: "A process where an eligible MLB player and team each submit a salary figure and an arbitration panel picks one of the two (final-offer or 'baseball' arbitration). It sets the player's pay for the coming season." },
      { q: "How does MLB arbitration work?", a: "Players with the required service time who aren't yet free agents can file. Player and team exchange figures; if they don't settle, a panel hears the case and must choose one of the two numbers." },
      { q: "Is sports salary arbitration the same as legal arbitration?", a: "No. Salary arbitration is a labor/contract mechanism to set pay under a collective bargaining agreement. Legal arbitration resolves disputes as an alternative to a lawsuit. They share the name and a neutral decision-maker, but little else." },
    ],
    related: ["what-is-arbitration", "arbitration-process", "arbitration-organizations", "binding-arbitration"],
  },
];

export function getArbitrationTopic(slug: string): ArbitrationTopic | undefined {
  return ARBITRATION_TOPICS.find((t) => t.slug === slug);
}
export function arbitrationTopicsInSection(section: string): ArbitrationTopic[] {
  return ARBITRATION_TOPICS.filter((t) => t.section === section);
}

/* ── cross-silo internal linking ──────────────────────────────────── */
/** Practice-area group (referral-categories) → the most relevant arbitration topic. */
const GROUP_TO_ARBITRATION: Record<string, string> = {
  "motor-vehicle": "insurance-arbitration",
  "catastrophic-injury": "insurance-arbitration",
  "medical-malpractice": "what-is-arbitration",
  "product-mass-tort": "consumer-arbitration",
  "workplace-industrial": "employment-arbitration",
  "premises-injury": "insurance-arbitration",
  "civil-rights": "what-is-arbitration",
  insurance: "insurance-arbitration",
  "consumer-class": "consumer-arbitration",
  "whistleblower-securities": "finra-securities-arbitration",
  employment: "employment-arbitration",
  "criminal-defense": "arbitration-vs-mediation",
  "family-law": "divorce-family-arbitration",
  immigration: "what-is-arbitration",
  "bankruptcy-tax": "what-is-arbitration",
  "estate-elder": "arbitration-agreement",
  "real-estate": "construction-arbitration",
  "business-corporate": "arbitration-agreement",
  "intellectual-property": "international-arbitration",
};

export function arbitrationTopicForGroup(groupSlug: string): ArbitrationTopic | undefined {
  const slug = GROUP_TO_ARBITRATION[groupSlug];
  return slug ? getArbitrationTopic(slug) : undefined;
}

/** Arbitration topic → related practice-area category slugs (for the reverse link). */
const TOPIC_TO_CATEGORIES: Record<string, string[]> = {
  "employment-arbitration": ["wrongful-termination", "employment-discrimination", "wage-and-hour"],
  "finra-securities-arbitration": ["securities-fraud-plaintiff", "investment-fraud"],
  "divorce-family-arbitration": ["contested-divorce", "child-custody"],
  "construction-arbitration": ["construction-litigation", "construction-accident"],
  "insurance-arbitration": ["auto-accident", "property-insurance-claim"],
  "consumer-arbitration": ["consumer-fraud", "class-action-plaintiff"],
  "international-arbitration": ["business-litigation", "contract-dispute"],
  "arbitration-agreement": ["contract-dispute", "business-litigation"],
  "arbitration-lawyer": ["contract-dispute", "business-litigation"],
};

export function relatedCategorySlugs(topicSlug: string): string[] {
  return TOPIC_TO_CATEGORIES[topicSlug] ?? [];
}
