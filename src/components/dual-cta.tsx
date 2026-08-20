import Link from "next/link";

/**
 * The consumer's two ways forward. `category` is the referral-category slug the
 * consumer is looking at — it rides along to /start so the case is tagged with
 * the category that attorneys/lawyers bid on (connect-the-dots). NEVER renders a
 * fee or %. When `arbitrable` is false (criminal, immigration, etc.) we lead with
 * the match and do not offer arbitration. `word` matches the page's keyword voice.
 */
export function DualCTA({
  category,
  arbitrable = true,
  word = "attorney",
}: {
  category?: string;
  arbitrable?: boolean;
  word?: "attorney" | "lawyer";
}) {
  const base = category ? `/start?category=${encodeURIComponent(category)}` : "/start";
  const matchHref = category ? `${base}&intent=attorney` : `/start?intent=attorney`;
  const article = "an"; // both "attorney" and (via "a lawyer") handled inline below
  return (
    <div className="card" style={{ background: "var(--ink)", color: "#fff", borderColor: "transparent" }}>
      <div className="eyebrow" style={{ color: "#e0a94b" }}>{arbitrable ? "Two ways forward" : "Get matched"}</div>
      <h2 style={{ color: "#fff", marginTop: 8, fontSize: 24 }}>
        {arbitrable ? `Resolve it fast, or get the right ${word}.` : `Get matched with the right ${word}.`}
      </h2>
      <p style={{ color: "rgba(255,255,255,.82)", marginTop: 8, fontSize: 15.5, maxWidth: 620 }}>
        {arbitrable
          ? `Many disputes settle in days without a ${word}. Try Quick-Resolve arbitration first — and if it isn't the right fit, we'll match you with ${word === "attorney" ? article : "a"} ${word} best suited to your need.`
          : `We'll connect you with ${word === "attorney" ? article : "a"} ${word} who handles your exact matter in your area. You approve the match before anything moves forward.`}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
        {arbitrable ? (
          <>
            <Link href={base} className="btn btn-seal btn-lg">Try Quick-Resolve arbitration first</Link>
            <Link href={matchHref} className="btn btn-ghost-light btn-lg">Find {word === "attorney" ? "an" : "a"} {word} for your need</Link>
          </>
        ) : (
          <Link href={matchHref} className="btn btn-seal btn-lg">Find {word === "attorney" ? "an" : "a"} {word} best suited to your need</Link>
        )}
      </div>
    </div>
  );
}
