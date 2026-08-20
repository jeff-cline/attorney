/**
 * Branded generative "image" for SEO/AEO pages — no external assets, no licensing.
 * Deterministic from the accent + monogram, so every silo page gets a distinct,
 * on-brand graphic that scales to hundreds of pages for free.
 */
export function SiloHero({ accent, monogram, label }: { accent: string; monogram: string; label: string }) {
  // Deterministic scatter of "seal" dots from the monogram char codes.
  const seed = monogram.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const dots = Array.from({ length: 7 }, (_, i) => {
    const a = ((seed * (i + 3)) % 100) / 100;
    const b = ((seed * (i + 7)) % 100) / 100;
    return { cx: 60 + a * 380, cy: 30 + b * 180, r: 3 + ((seed + i) % 4) };
  });
  return (
    <div
      role="img"
      aria-label={`${label} — Attorney.plus`}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${accent} 0%, var(--ink) 100%)`,
        aspectRatio: "5 / 2",
        boxShadow: "0 18px 40px -22px rgba(15,42,45,.55)",
      }}
    >
      <svg viewBox="0 0 500 200" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
        <defs>
          <linearGradient id={`g-${monogram}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="500" height="200" fill={`url(#g-${monogram})`} />
        {dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill="#c1852a" opacity={0.5} />
        ))}
        <circle cx="430" cy="150" r="120" fill="#ffffff" opacity="0.05" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 22, padding: "0 34px" }}>
        <div
          aria-hidden
          style={{
            flex: "0 0 auto",
            width: 84,
            height: 84,
            display: "grid",
            placeItems: "center",
            borderRadius: 18,
            background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(255,255,255,.22)",
            color: "#fff",
            fontFamily: "var(--font-fraunces)",
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: "-1px",
          }}
        >
          {monogram}
        </div>
        <div style={{ color: "#fff" }}>
          <div style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.8, fontFamily: "var(--font-geist-sans)" }}>
            Attorney<span style={{ color: "#e0a94b" }}>.plus</span>
          </div>
          <div style={{ fontFamily: "var(--font-fraunces)", fontSize: 26, lineHeight: 1.1, marginTop: 4, textWrap: "balance", maxWidth: 320 } as React.CSSProperties}>
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
