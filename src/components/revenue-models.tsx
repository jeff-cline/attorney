"use client";

import { useMemo, useState } from "react";
import {
  SLOTS, NICHES, STATES, LEASE_MO, FEE_MIN, FEE_MAX, FEE_AVG, ARB_RETAINER,
  REFERRAL_ATTACH, ARB_ATTACH, COGS_CASE, COGS_LEASE, VAL_MULTIPLES,
  leaseByYear, caseVolume, caseRevenue, caseByYear, combinedByYear, valuation, money,
} from "@/lib/investor-model";

const INK = "#14524f", SEAL = "#c98a2b", ESC = "#7a1f1f", LINE = "#e6e1d5";

/* ── shared mini bar chart ─────────────────────────────────────────────── */
function Bars({ data, color = INK, fmt = money, labelKey = "label", valKey = "v" }:
  { data: Record<string, number | string>[]; color?: string; fmt?: (n: number) => string; labelKey?: string; valKey?: string }) {
  const max = Math.max(...data.map((d) => Number(d[valKey])), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3 text-[13px]">
          <span style={{ width: 42, color: "#6b675e" }}>{d[labelKey]}</span>
          <div style={{ flex: 1, height: 16, background: "#f0ebe0", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ width: `${(Number(d[valKey]) / max) * 100}%`, height: "100%", background: color, borderRadius: 5 }} />
          </div>
          <span style={{ width: 62, textAlign: "right", fontWeight: 700, color: "#3a3730" }}>{fmt(Number(d[valKey]))}</span>
        </div>
      ))}
    </div>
  );
}
function Panel({ title, children, tint }: { title: string; children: React.ReactNode; tint?: string }) {
  return (
    <div className="rounded-[14px] p-5" style={{ background: "#fff", border: `1px solid ${LINE}`, borderTop: `3px solid ${tint ?? INK}` }}>
      <h3 className="text-[17px]" style={{ marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  );
}
function Kv({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return <div className="flex items-baseline justify-between py-1 text-[13.5px]"><span className="muted">{k}</span><b style={{ color: accent }}>{v}</b></div>;
}

/* ── Model A: niche leasing ────────────────────────────────────────────── */
export function LeasingModel() {
  const rows = useMemo(() => leaseByYear(10), []);
  const y5 = rows[4], y10 = rows[9];
  return (
    <Panel title="Model A — Exclusive niche leasing" tint={INK}>
      <p className="muted text-[13.5px]" style={{ lineHeight: 1.5, marginBottom: 12 }}>
        {NICHES} niches × {STATES} states = <b>{SLOTS.toLocaleString()} exclusive slots</b>. Each is leased by one attorney at
        <b> ${LEASE_MO.toLocaleString()}/mo</b> — one niche, one state. Adoption reaches 30% by Year 5, 60% by Year 10.
      </p>
      <Bars data={rows.map((r) => ({ label: `Y${r.year}`, v: r.arr }))} color={INK} />
      <div className="mt-3 grid grid-cols-2 gap-x-6">
        <Kv k="Year 5 (30% · 1,560 slots)" v={`${money(y5.arr)}/yr`} accent={INK} />
        <Kv k="Year 10 (60% · 3,120 slots)" v={`${money(y10.arr)}/yr`} accent={INK} />
      </div>
    </Panel>
  );
}

/* ── Model B/C: the case engine ────────────────────────────────────────── */
export function CaseEngineModel() {
  const monthly = useMemo(() => caseVolume(36, false), []);
  const yearly = useMemo(() => caseByYear(3), []);
  const y3 = yearly[2];
  const m36 = monthly[35];
  return (
    <Panel title="Model B + C — The case engine" tint={SEAL}>
      <p className="muted text-[13.5px]" style={{ lineHeight: 1.5, marginBottom: 6 }}>
        Across {NICHES} niches, referral fees run <b>${FEE_MIN}–${FEE_MAX.toLocaleString()}</b> per case (avg <b>${FEE_AVG.toLocaleString()}</b>).
        Volume starts 25 → 50 → 75 → 100, then <b>+20%/mo</b> for three years.
      </p>
      <ul className="muted text-[12.5px]" style={{ lineHeight: 1.6, marginBottom: 12 }}>
        <li><b>B · Referrals:</b> {Math.round(REFERRAL_ATTACH * 100)}% of cases → paid referral at ${FEE_AVG.toLocaleString()}.</li>
        <li><b>C · Arbitration retainer:</b> {Math.round(ARB_ATTACH * 100)}% of cases → ${ARB_RETAINER.toLocaleString()} retainer (platform keeps 30%).</li>
      </ul>
      <Bars data={yearly.map((r) => ({ label: `Y${r.year}`, v: r.gross }))} color={SEAL} />
      <div className="mt-3 grid grid-cols-2 gap-x-6">
        <Kv k="Month 36 volume" v={`${m36.cases.toLocaleString()} cases`} accent={SEAL} />
        <Kv k="Year 3 gross" v={`${money(y3.gross)}/yr`} accent={SEAL} />
      </div>
    </Panel>
  );
}

/* ── Combined slider ───────────────────────────────────────────────────── */
export function CombinedSlider() {
  const [w, setW] = useState(50); // % emphasis on leasing
  const rows = useMemo(() => combinedByYear(w / 100, 5), [w]);
  const y5 = rows[4];
  const leaseWins = y5.leaseGross >= y5.caseGross;
  return (
    <Panel title="Combined model — tune the mix" tint={ESC}>
      <p className="muted text-[13.5px]" style={{ lineHeight: 1.5, marginBottom: 14 }}>
        Slide to weight go-to-market emphasis between leasing and the case engine. Default is a 50/50 split.
      </p>
      <div className="flex items-center gap-3 text-[12.5px]">
        <span style={{ color: INK, fontWeight: 700 }}>Leasing {w}%</span>
        <input type="range" min={0} max={100} value={w} onChange={(e) => setW(Number(e.target.value))} style={{ flex: 1, accentColor: ESC }} />
        <span style={{ color: SEAL, fontWeight: 700 }}>Cases {100 - w}%</span>
      </div>
      <div className="mt-4">
        <Bars data={rows.map((r) => ({ label: `Y${r.year}`, v: Math.round(r.blendGross) }))} color={ESC} />
      </div>
      <div className="mt-4 rounded-[10px] p-3" style={{ background: "var(--paper-2)" }}>
        <Kv k="Year 5 blended gross" v={`${money(y5.blendGross)}/yr`} accent={ESC} />
        <Kv k="Leasing contribution (Y5)" v={money(w / 100 * y5.leaseGross)} accent={INK} />
        <Kv k="Case engine contribution (Y5)" v={money((1 - w / 100) * y5.caseGross)} accent={SEAL} />
        <div className="mt-2 text-[12.5px]" style={{ color: leaseWins ? INK : SEAL, fontWeight: 600 }}>
          At this mix, {leaseWins ? "leasing" : "the case engine"} is the larger engine.
        </div>
      </div>
    </Panel>
  );
}

/* ── 5-year net projection at 50/50 with COGS ──────────────────────────── */
export function FiveYearProjection() {
  const rows = useMemo(() => combinedByYear(0.5, 5), []);
  // 50/50 blend already halves each; show total company view = both engines summed.
  const totals = rows.map((r) => ({
    year: r.year,
    gross: r.leaseGross + r.caseGross,
    net: r.leaseNet + r.caseNet,
  }));
  const y5 = totals[4];
  const cum = totals.reduce((a, r) => a + r.net, 0);
  return (
    <Panel title="Five-year projection — 50/50, after COGS" tint={INK}>
      <p className="muted text-[13.5px]" style={{ lineHeight: 1.5, marginBottom: 12 }}>
        Both engines running (leasing + case engine), COGS applied per stream:
        <b> {Math.round(COGS_CASE * 100)}%</b> on referrals &amp; arbitration, <b>{Math.round(COGS_LEASE * 100)}%</b> on leasing.
      </p>
      <div className="space-y-2">
        {totals.map((r) => {
          const max = Math.max(...totals.map((t) => t.gross));
          return (
            <div key={r.year} className="text-[12.5px]">
              <div className="flex justify-between"><span className="muted">Year {r.year}</span><span><b style={{ color: INK }}>{money(r.net)}</b> net <span className="muted">/ {money(r.gross)} gross</span></span></div>
              <div style={{ height: 14, background: "#f0ebe0", borderRadius: 5, overflow: "hidden", marginTop: 3, position: "relative" }}>
                <div style={{ width: `${(r.gross / max) * 100}%`, height: "100%", background: "#dfe8e2" }} />
                <div style={{ width: `${(r.net / max) * 100}%`, height: "100%", background: INK, borderRadius: 5, position: "absolute", top: 0, left: 0 }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-6">
        <Kv k="Year 5 net revenue" v={`${money(y5.net)}/yr`} accent={INK} />
        <Kv k="5-yr cumulative net" v={money(cum)} accent={INK} />
      </div>
    </Panel>
  );
}

/* ── Valuation ─────────────────────────────────────────────────────────── */
export function ValuationBox() {
  const rows = useMemo(() => combinedByYear(0.5, 5), []);
  const y5Net = rows[4].leaseNet + rows[4].caseNet;
  const v = valuation(y5Net);
  return (
    <div className="rounded-[14px] p-6" style={{ background: "var(--ink)", color: "#fff" }}>
      <div className="eyebrow" style={{ color: "#e0a94b" }}>Valuation — SaaS / legal-fee multiple</div>
      <p className="mt-2 text-[13.5px]" style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
        Applying a revenue multiple to Year-5 net revenue of <b style={{ color: "#fff" }}>{money(y5Net)}</b>.
        Legal-tech SaaS trades at roughly {VAL_MULTIPLES.low}–{VAL_MULTIPLES.high}× revenue.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {([["Conservative", VAL_MULTIPLES.low, v.low], ["Base", VAL_MULTIPLES.mid, v.mid], ["Upside", VAL_MULTIPLES.high, v.high]] as const).map(([lbl, mult, val]) => (
          <div key={lbl} className="rounded-[10px] p-3" style={{ background: "rgba(255,255,255,.06)" }}>
            <div style={{ fontFamily: "var(--font-fraunces)", fontSize: 26, color: "#e0a94b" }}>{money(val)}</div>
            <div className="text-[11.5px]" style={{ color: "rgba(255,255,255,.65)" }}>{lbl} · {mult}×</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px]" style={{ color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>
        Illustrative only. Multiples vary with growth, margin, and market. Not a valuation opinion or an offer of securities.
      </p>
    </div>
  );
}
