import { GROUPS, categoriesInGroup } from "@/content/referral-categories";

const BASE = "https://attorney.plus";

// AEO: a plain-text map for answer engines / LLMs. No fees or percentages.
export function GET() {
  const lines: string[] = [
    "# Attorney.plus",
    "",
    "> Attorney referral + two-party arbitration platform. Pick your legal category to get matched with an attorney who handles exactly that, or resolve eligible disputes fast with Quick-Resolve arbitration. Not a law firm; not legal advice.",
    "",
    "## How it works",
    "- Quick-Resolve: both parties agree, pay a flat fee, and reach a binding resolution in days (neutral summary -> AI-assisted proposal -> professional arbitrator if needed).",
    "- Attorney matching: pick your category; we match you with an attorney who handles it in your area; you approve the match.",
    "",
    "## Categories by area",
  ];
  for (const g of GROUPS) {
    const cats = categoriesInGroup(g.slug);
    if (!cats.length) continue;
    lines.push("", `### ${g.name}`);
    for (const c of cats) lines.push(`- [${c.name}](${BASE}/attorneys/${c.slug})`);
  }
  lines.push("", "## Key pages", `- [Find your category](${BASE}/attorneys)`, `- [Start a case](${BASE}/start)`, `- [Join with a code](${BASE}/join)`, "");
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
