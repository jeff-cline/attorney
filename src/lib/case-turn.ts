import type { cases } from "@/db/schema";

type CaseRow = typeof cases.$inferSelect;

export type Turn = {
  mine: boolean; // is it THIS user's move?
  waiting: boolean; // are we waiting on the other party / a third party?
  terminal: boolean; // resolved / litigation
  label: string; // short banner headline
  detail: string; // one-line explanation of the next step
};

/**
 * Whose move is it, from `uid`'s perspective, and what exactly should they do?
 * `hasMyStatement` is only needed for the pending_disputes stage (the one turn
 * signal not stored on the case row itself).
 */
export function caseTurn(c: CaseRow, uid: string, hasMyStatement?: boolean): Turn {
  const isI = c.initiatorId === uid;
  const myAgreed = isI ? c.initiatorAgreedAt : c.joinerAgreedAt;
  const mySummaryOk = isI ? c.initiatorSummaryOkAt : c.joinerSummaryOkAt;
  const myDecision = isI ? c.initiatorDecision : c.joinerDecision;
  const myArbOk = isI ? c.initiatorArbOkAt : c.joinerArbOkAt;
  const myArbFeePaid = isI ? c.initiatorArbFeePaidAt : c.joinerArbFeePaidAt;

  const mine = (label: string, detail: string): Turn => ({ mine: true, waiting: false, terminal: false, label, detail });
  const wait = (label: string, detail: string): Turn => ({ mine: false, waiting: true, terminal: false, label, detail });
  const end = (label: string, detail: string): Turn => ({ mine: false, waiting: false, terminal: true, label, detail });

  switch (c.status) {
    case "resolved":
      return end("Resolved", "Both parties accepted a decision. Nothing more to do — the terms are recorded.");
    case "litigation":
      return end("Moving to attorneys", "Each side is being matched with independent counsel. We'll be in touch.");
    case "awaiting_initiator_payment":
      return isI ? mine("Your move: pay your share", "Pay your share to unlock your private invite code.") : wait("Not started", "The case opener hasn't paid yet.");
    case "pending_join":
      return isI ? mine("Your move: send your code", "Copy your invite code and send it to the other party so they can join.") : wait("Waiting", "The other party is setting up.");
    case "awaiting_joiner_payment":
      return isI ? wait("Waiting on the other party", "They've joined and need to pay their half before you both accept the terms.") : mine("Your move: pay your half", "Pay your half so both sides can accept the terms and begin.");
    case "pending_agreements":
      return myAgreed ? wait("Waiting on the other party", "You've accepted the terms. Waiting for them to accept too.") : mine("Your move: accept the terms", "Review and accept the arbitration terms to continue.");
    case "pending_disputes":
      return hasMyStatement ? wait("Waiting on the other party", "Your account is submitted. Waiting for them to submit theirs.") : mine("Your move: submit your account", "Tell us, in your own words, what happened.");
    case "summary_review":
      return mySummaryOk ? wait("Waiting on the other party", "You approved the summary. Waiting for them to approve.") : mine("Your move: review the summary", "Confirm the neutral summary fairly reflects your position.");
    case "ai_decision":
      return myDecision ? wait("Waiting on the other party", "Your response is recorded. Waiting for theirs.") : mine("Your move: respond to the decision", "Accept the proposed resolution — or decline to escalate to an arbitrator.");
    case "arbitration":
      if (!c.arbitratorId) return wait("Assigning an arbitrator", "An independent arbitrator is being assigned. We'll email you when it's your turn.");
      if (!myArbFeePaid) return mine("Your move: pay the arbitration fee", "Pay your share of the arbitration fee so the arbitrator can rule.");
      return wait("With the arbitrator", "You're paid up. The arbitrator is reviewing and will issue a ruling.");
    case "arbitration_ruling":
      return myArbOk ? wait("Waiting on the other party", "You responded to the ruling. Waiting for them.") : mine("Your move: respond to the ruling", "Accept the arbitrator's ruling — or decline to go to attorneys.");
    default:
      return wait("In progress", "Check back for the next step.");
  }
}
