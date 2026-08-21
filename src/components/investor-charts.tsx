"use client";

import { useState } from "react";

/* Illustrative, discussion-only figures. Dependency-free interactive SVG so it
   stays inside our stack (no chart library) and prints cleanly to PDF. */

const INK = "#14524f";
const SEAL = "#c98a2b";
const ESC = "#7a1f1f";
const LINE = "#e6e1d5";

// ── Problem growth: pending US civil cases (millions, est.) ──────────────
const PROBLEM = [
  { year: "'12", v: 14.0 }, { year: "'14", v: 15.4 }, { year: "'16", v: 17.1 },
  { year: "'18", v: 18.9 }, { year: "'20", v: 22.3 }, { year: "'22", v: 24.4 },
  { year: "'24", v: 26.1 }, { year: "'26e", v: 28.6 },
];

export function ProblemChart() {
  const [hi, setHi] = useState<number | null>(null);
  const W = 560, H = 260, PAD = 34;
  const max = 30, min = 10;
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (PROBLEM.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
  const pts = PROBLEM.map((d, i) => `${x(i)},${y(d.v)}`).join(" ");
  const area = `${PAD},${H - PAD} ${pts} ${W - PAD},${H - PAD}`;
  return (
    <Figure caption="Pending US civil cases that could be settled or arbitrated — climbing every year (millions, illustrative estimate).">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Rising pending civil cases">
        <defs>
          <linearGradient id="pg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={ESC} stopOpacity="0.28" />
            <stop offset="100%" stopColor={ESC} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[10, 15, 20, 25, 30].map((g) => (
          <g key={g}>
            <line x1={PAD} x2={W - PAD} y1={y(g)} y2={y(g)} stroke={LINE} />
            <text x={8} y={y(g) + 4} fontSize="10" fill="#9a958a">{g}M</text>
          </g>
        ))}
        <polygon points={area} fill="url(#pg)" />
        <polyline points={pts} fill="none" stroke={ESC} strokeWidth="2.5" />
        {PROBLEM.map((d, i) => (
          <g key={i} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)} style={{ cursor: "pointer" }}>
            <rect x={x(i) - 18} y={0} width={36} height={H} fill="transparent" />
            <circle cx={x(i)} cy={y(d.v)} r={hi === i ? 6 : 3.5} fill={ESC} />
            <text x={x(i)} y={H - 12} fontSize="10.5" fill="#6b675e" textAnchor="middle">{d.year}</text>
            {hi === i && (
              <g>
                <rect x={x(i) - 30} y={y(d.v) - 34} width={60} height={22} rx={5} fill={INK} />
                <text x={x(i)} y={y(d.v) - 19} fontSize="11" fill="#fff" textAnchor="middle" fontWeight="600">{d.v.toFixed(1)}M</text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </Figure>
  );
}

// ── Cost to the ecosystem (US$ billions/yr, est.) ────────────────────────
const COST = [
  { k: "Business litigation", v: 180 },
  { k: "Court system operating cost", v: 65 },
  { k: "Consumer time & lost wages", v: 96 },
  { k: "Unresolved small claims", v: 41 },
];
export function CostChart() {
  const [hi, setHi] = useState<number | null>(null);
  const max = 200;
  const total = COST.reduce((a, c) => a + c.v, 0);
  return (
    <Figure caption={`~$${total}B drained from the ecosystem every year by disputes that never needed a courtroom (illustrative estimate).`}>
      <div className="space-y-3">
        {COST.map((c, i) => (
          <div key={c.k} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)}>
            <div className="flex items-baseline justify-between text-[13px]">
              <span style={{ color: "#3a3730" }}>{c.k}</span>
              <span style={{ fontWeight: 700, color: hi === i ? SEAL : "#6b675e" }}>${c.v}B</span>
            </div>
            <div style={{ height: 12, background: "#f0ebe0", borderRadius: 6, overflow: "hidden", marginTop: 4 }}>
              <div style={{ width: `${(c.v / max) * 100}%`, height: "100%", background: hi === i ? SEAL : INK, borderRadius: 6, transition: "background .15s" }} />
            </div>
          </div>
        ))}
      </div>
    </Figure>
  );
}

// ── Revenue engine: service fees (shown) vs. attorney-network upside ─────
const REV = [
  { y: "Y1", fee: 4, net: 11 }, { y: "Y2", fee: 12, net: 38 },
  { y: "Y3", fee: 31, net: 104 }, { y: "Y4", fee: 68, net: 246 },
  { y: "Y5", fee: 121, net: 470 },
];
export function RevenueChart() {
  const [hi, setHi] = useState<number | null>(REV.length - 1);
  const W = 560, H = 280, PAD = 40;
  const max = 500;
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (REV.length - 1);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const feeLine = REV.map((d, i) => `${x(i)},${y(d.fee)}`).join(" ");
  const netLine = REV.map((d, i) => `${x(i)},${y(d.net)}`).join(" ");
  const d = hi != null ? REV[hi] : REV[REV.length - 1];
  return (
    <Figure caption="Service fees alone build a durable business (teal). Attorney-network commissions & splits (gold) are a multiple of that — the real upside.">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Revenue projection">
        {[0, 125, 250, 375, 500].map((g) => (
          <g key={g}>
            <line x1={PAD} x2={W - PAD} y1={y(g)} y2={y(g)} stroke={LINE} />
            <text x={6} y={y(g) + 4} fontSize="10" fill="#9a958a">${g}M</text>
          </g>
        ))}
        <polyline points={netLine} fill="none" stroke={SEAL} strokeWidth="2.5" strokeDasharray="6 4" />
        <polyline points={feeLine} fill="none" stroke={INK} strokeWidth="2.5" />
        {REV.map((r, i) => (
          <g key={i} onMouseEnter={() => setHi(i)} style={{ cursor: "pointer" }}>
            <rect x={x(i) - 20} y={0} width={40} height={H} fill="transparent" />
            <circle cx={x(i)} cy={y(r.net)} r={hi === i ? 5.5 : 3} fill={SEAL} />
            <circle cx={x(i)} cy={y(r.fee)} r={hi === i ? 5.5 : 3} fill={INK} />
            <text x={x(i)} y={H - 12} fontSize="10.5" fill="#6b675e" textAnchor="middle">{r.y}</text>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px]">
        <Legend color={INK} label={`Service fees — $${d.fee}M`} solid />
        <Legend color={SEAL} label={`+ Attorney network — $${d.net}M`} />
        <span className="muted">{d.y} · {d.fee > 0 ? `${(d.net / d.fee).toFixed(1)}× on top of service fees` : ""}</span>
      </div>
    </Figure>
  );
}

function Legend({ color, label, solid }: { color: string; label: string; solid?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span style={{ width: 20, height: 0, borderTop: `3px ${solid ? "solid" : "dashed"} ${color}` }} />
      <b style={{ color }}>{label}</b>
    </span>
  );
}

function Figure({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <figure style={{ margin: 0 }}>
      <div className="rounded-[14px] p-4" style={{ background: "#fff", border: `1px solid ${LINE}` }}>{children}</div>
      <figcaption className="muted mt-2 text-[12.5px]" style={{ lineHeight: 1.5 }}>{caption}</figcaption>
    </figure>
  );
}
