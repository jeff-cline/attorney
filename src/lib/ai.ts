/**
 * AI-assisted mediation helpers.
 *
 * These produce a NEUTRAL SUMMARY of both parties' positions and a PROPOSED
 * RESOLUTION both sides can accept or reject. They are intentionally isolated
 * here so a real LLM (e.g. Grok via the Core API, or OpenAI) can be swapped in
 * without touching the funnel logic — just make these two functions async calls.
 *
 * Nothing here decides a winner or gives legal advice; it structures what both
 * parties said and proposes a middle path for them to agree to.
 */

export type PartyStatement = { name: string; statement: string };

function firstSentences(text: string, n: number): string {
  const parts = text.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/);
  return parts.slice(0, n).join(" ");
}

export function neutralSummary(subject: string | null, parties: PartyStatement[]): string {
  const [a, b] = parties;
  const topic = subject?.trim() ? subject.trim() : "the matter in dispute";
  const lines: string[] = [];
  lines.push(`This is a neutral summary of ${topic}, prepared from each party's own account. It takes no side.`);
  lines.push("");
  if (a) lines.push(`${a.name}'s position: ${firstSentences(a.statement, 3)}`);
  if (b) lines.push(`${b.name}'s position: ${firstSentences(b.statement, 3)}`);
  lines.push("");
  lines.push("Both parties are asked to confirm this summary fairly reflects their positions before a proposed resolution is offered.");
  return lines.join("\n");
}

export function proposedResolution(subject: string | null, parties: PartyStatement[]): string {
  const names = parties.map((p) => p.name);
  const who = names.length === 2 ? `${names[0]} and ${names[1]}` : "both parties";
  const topic = subject?.trim() ? subject.trim() : "the dispute";
  const lines: string[] = [];
  lines.push("Quick decision (AI-assisted · not legal advice)");
  lines.push("");
  lines.push(`Matter: ${topic}.`);
  lines.push("");
  lines.push(
    "Reasoning: Weighing both accounts, neither version is complete on its own. Applying the general principles of good-faith dealing, proportionality, and each party's duty to mitigate, a balanced outcome is warranted rather than an all-or-nothing result.",
  );
  lines.push("");
  lines.push(`Proposed decision for ${who}:`);
  lines.push("• Each party's good-faith account of events is acknowledged.");
  lines.push("• The parties adopt a fair, proportionate outcome that reasonably splits the difference between their stated positions.");
  lines.push("• On mutual acceptance, the matter is fully and finally settled, with terms and timestamps recorded in the audit chain.");
  lines.push("");
  lines.push("If both parties accept, this becomes the binding resolution. If either declines, an independent professional arbitrator is assigned to review both accounts and issue a ruling.");
  // NOTE: To cite actual case law, swap this for a real LLM call (Grok via the
  // Core API). Any AI-surfaced citations MUST be verified by a licensed attorney
  // before being shown as authoritative — never present unverified case cites.
  return lines.join("\n");
}
