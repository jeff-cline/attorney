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

import { getAiConfig } from "@/lib/settings";

export type PartyStatement = { name: string; statement: string };
export type AiResolution = { decidable: boolean; resolution: string; citations: string[] };

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
  return lines.join("\n");
}

/**
 * Decide-or-escalate. When a God-configured AI provider is present, ask the model
 * for a confident, principle-cited resolution — OR to declare the matter not
 * decidable (a genuine factual split / missing info), which the caller uses to
 * auto-escalate to a paid professional arbitrator. Without a provider, falls back
 * to the deterministic stub (always decidable, no citations).
 */
export async function aiResolve(subject: string | null, parties: PartyStatement[], jurisdiction?: string | null): Promise<AiResolution> {
  const cfg = await getAiConfig();
  if (cfg.provider && cfg.key) {
    const base = cfg.provider === "openai" ? "https://api.openai.com/v1" : "https://api.x.ai/v1";
    const model = cfg.model || (cfg.provider === "openai" ? "gpt-4o" : "grok-2-latest");
    const jurLine = jurisdiction?.trim()
      ? `The governing jurisdiction is ${jurisdiction.trim()}. Apply that state's law and any clearly-applicable federal law.`
      : "Determine the governing US jurisdiction from the facts (where the parties are and where the events occurred), name it explicitly, and apply that state's law plus any clearly-applicable federal law.";
    const system =
      "You are an experienced neutral arbitrator for a US dispute-resolution platform. Read BOTH parties' accounts and issue a CONCRETE, REASONED DECISION — not a vague 'split the difference' compromise. State plainly what each party should do and the legal basis for it. " +
      jurLine +
      " Cite SPECIFIC statutes or code sections by their real number when you are confident they exist (for example a state property, consumer-protection, or civil-practice code section). You MAY reference well-established legal doctrines or principles, but you MUST NOT invent case names, numbers, reporters, or citations you are not certain exist — if unsure of an exact cite, describe the principle instead. " +
      "If the accounts present a genuine factual dispute or credibility contest that cannot be fairly decided on the written record alone, set decidable=false so a human arbitrator takes over. " +
      "Respond ONLY as compact JSON: {\"decidable\": boolean, \"resolution\": string, \"citations\": string[]}. In 'resolution' give the reasoned ruling (the jurisdiction applied, what each party must do, and why). In 'citations' list the specific statutes/authorities you actually relied on. This is informational, not legal advice.";
    const userMsg = `Governing jurisdiction: ${jurisdiction?.trim() || "not specified — infer from the facts"}.\nSubject: ${subject ?? "n/a"}\n\n${parties.map((p) => `${p.name}:\n${p.statement}`).join("\n\n")}`;
    try {
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cfg.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: userMsg }] }),
      });
      if (res.ok) {
        const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
        const raw = j.choices?.[0]?.message?.content;
        if (raw) {
          const p = JSON.parse(raw) as { decidable?: boolean; resolution?: string; citations?: unknown };
          // Only a genuine model verdict of decidable=false escalates. A successful,
          // decidable response returns the cited resolution.
          return {
            decidable: Boolean(p.decidable),
            resolution: String(p.resolution ?? "").slice(0, 6000),
            citations: Array.isArray(p.citations) ? p.citations.map(String).slice(0, 10) : [],
          };
        }
      }
    } catch {
      /* fall through to graceful fallback */
    }
    // Provider configured but the call FAILED (quota, outage, bad response). Do NOT
    // force paid arbitration on an infrastructure error — fall back to the neutral
    // non-citing decision so the flow continues; God is notified separately.
    return { decidable: true, resolution: proposedResolution(subject, parties), citations: [] };
  }
  // No AI provider configured → deterministic stub.
  return { decidable: true, resolution: proposedResolution(subject, parties), citations: [] };
}
