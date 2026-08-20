import { PRACTICE_AREAS } from "@/content/practice-areas";

const BASE = "https://attorney.plus";

// AEO: a plain-text map for answer engines / LLMs.
export function GET() {
  const lines = [
    "# Attorney.plus",
    "",
    "> Attorney referral + two-party arbitration platform. Resolve disputes fast with Quick-Resolve arbitration, or get matched with an attorney best suited to your need. Not a law firm; not legal advice.",
    "",
    "## How it works",
    "- Quick-Resolve: both parties agree, pay a flat fee, and reach a binding resolution in days (neutral summary -> AI-assisted proposal -> professional arbitrator if needed).",
    "- Attorney matching: when a matter needs a lawyer, we match you with one who handles your specific issue in your area.",
    "",
    "## Practice areas",
    ...PRACTICE_AREAS.map((a) => `- [${a.name} attorney](${BASE}/attorneys/${a.slug}): ${a.blurb}`),
    "",
    "## Key pages",
    `- [Find an attorney](${BASE}/attorneys)`,
    `- [Start a case](${BASE}/start)`,
    `- [Join with a code](${BASE}/join)`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
