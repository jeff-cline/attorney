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
  const lines: string[] = [];
  lines.push("Proposed resolution (AI-assisted · not legal advice)");
  lines.push("");
  lines.push(`Having reviewed both accounts, the following middle-ground resolution is proposed for ${who} to accept:`);
  lines.push("");
  lines.push("• Each party acknowledges the other's good-faith account of events.");
  lines.push("• The parties agree to a fair, proportionate outcome that splits the difference between their positions rather than an all-or-nothing result.");
  lines.push("• Both parties consider the matter fully and finally settled upon mutual acceptance below, with the terms and timestamps recorded.");
  lines.push("");
  lines.push("If both parties accept, this becomes the binding resolution. If either party declines, the case escalates to a professional arbitrator (fee capped at $1,500).");
  return lines.join("\n");
}
