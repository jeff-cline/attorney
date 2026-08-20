/**
 * Two parallel content voices over the SAME category data — "attorney" and
 * "lawyer" — so we rank for both high-value keywords WITHOUT duplicate content.
 * The lawyer copy is deliberately distinct in wording, framing, and FAQ set.
 * Neither voice ever renders a fee or percentage (backend-only).
 */
import {
  getGroup,
  isArbitrable,
  an,
  An,
  categoryIntro as attorneyIntro,
  categoryFaqs as attorneyFaqs,
  type ReferralCategory,
} from "./referral-categories";

export type Variant = "attorney" | "lawyer";

export const VARIANT = {
  attorney: { word: "attorney", Word: "Attorney", plural: "attorneys", path: "/attorneys", hubTitle: "Find an attorney", landing: "/attorney" },
  lawyer: { word: "lawyer", Word: "Lawyer", plural: "lawyers", path: "/lawyers", hubTitle: "Find a lawyer", landing: "/lawyer" },
} as const;

export function twin(v: Variant): Variant {
  return v === "attorney" ? "lawyer" : "attorney";
}

/* ── lawyer voice (unique) ────────────────────────────────────────── */
function lawyerIntro(c: ReferralCategory): string[] {
  const g = getGroup(c.groupSlug);
  const arb = isArbitrable(c);
  const lc = c.name.toLowerCase();
  const p1 = `Looking for ${an(c.name)} ${lc} lawyer? Before you pick one, it helps to know what actually drives ${an(c.name)} ${lc} matter — the clock you're on, what a strong result looks like, and the questions any good lawyer should answer on the first call. ${g?.intro ?? ""}`;
  const p2 = arb
    ? `You may not even need to hire a lawyer for a clear-cut ${lc} dispute. Attorney.plus can settle eligible cases through Quick-Resolve — a fast, binding process — and when you genuinely need one, we connect you directly with ${an(c.name)} ${lc} lawyer who fits your situation. No call-center runaround, and you approve the lawyer before anything moves.`
    : `${An(c.name)} ${lc} case belongs with a lawyer who handles it day in and day out. We connect you with ${an(c.name)} ${lc} lawyer matched to your matter and your area — you choose who represents you and stay in control the whole way.`;
  return [p1, p2];
}

function lawyerFaqs(c: ReferralCategory): Array<{ q: string; a: string }> {
  const arb = isArbitrable(c);
  const lc = c.name.toLowerCase();
  const out: Array<{ q: string; a: string }> = [
    {
      q: `What should I look for in ${an(c.name)} ${c.name} lawyer?`,
      a: `Real experience with ${lc} specifically, clear and honest fees, straight answers, and someone who actually returns your calls. Attorney.plus pre-filters for lawyers who focus on this area, so you're not starting from a blank search box.`,
    },
    {
      q: `How fast can I talk to ${an(c.name)} ${c.name} lawyer?`,
      a: `Usually quickly. Tell us your category and location and we route you to a lawyer who handles ${lc} matters near you. You review and approve the match before anything proceeds.`,
    },
  ];
  out.push(
    arb
      ? {
          q: `Do I even need a lawyer for ${an(c.name)} ${c.name} dispute?`,
          a: `Not always. For a bounded, clear ${lc} dispute, Quick-Resolve reaches a binding result in days without hiring anyone. For a larger or contested matter, a lawyer is worth it — and we'll connect you with the right one.`,
        }
      : {
          q: `Why use a specialist lawyer for ${an(c.name)} ${c.name} case?`,
          a: `${c.name} cases turn on technical rules and hard deadlines where experience changes the result. We connect you with a lawyer who concentrates on this, not a generalist learning on your case.`,
        },
  );
  out.push({
    q: `What does it cost to get matched with ${an(c.name)} ${c.name} lawyer?`,
    a: `Nothing to you. Attorney.plus is supported by its lawyer network — you are never charged a separate fee for a match, and the lawyer discusses their own fees with you directly.`,
  });
  return out;
}

/* ── dispatch ─────────────────────────────────────────────────────── */
export function copyFor(v: Variant) {
  return v === "attorney"
    ? { intro: attorneyIntro, faqs: attorneyFaqs }
    : { intro: lawyerIntro, faqs: lawyerFaqs };
}
