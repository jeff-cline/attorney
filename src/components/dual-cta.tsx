import Link from "next/link";

/**
 * The two calls to action every content page carries:
 *  1) Find an attorney best suited to the visitor's need
 *  2) Try the Quick-Resolve arbitration process first
 * `intent` query params let us branch the /start intake later + feed tracking.
 */
export function DualCTA({ area }: { area?: string }) {
  const q = area ? `?area=${encodeURIComponent(area)}` : "";
  return (
    <div className="card" style={{ background: "var(--ink)", color: "#fff", borderColor: "transparent" }}>
      <div className="eyebrow" style={{ color: "#e0a94b" }}>Two ways forward</div>
      <h2 style={{ color: "#fff", marginTop: 8, fontSize: 24 }}>Resolve it fast, or get the right attorney.</h2>
      <p style={{ color: "rgba(255,255,255,.82)", marginTop: 8, fontSize: 15.5, maxWidth: 620 }}>
        Many disputes settle in days without a lawyer. Try Quick-Resolve arbitration first — and if it isn&apos;t the right fit, we&apos;ll match you with an attorney best suited to your need.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
        <Link href={`/start${q}`} className="btn btn-seal btn-lg">Try Quick-Resolve arbitration first</Link>
        <Link href={`/start${q}${q ? "&" : "?"}intent=attorney`} className="btn btn-ghost-light btn-lg">Find an attorney for your need</Link>
      </div>
    </div>
  );
}
