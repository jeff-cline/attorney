"use client";

import { useActionState, useState } from "react";

type Cat = { slug: string; name: string; groupSlug: string; baseFee: number };
type Grp = { slug: string; name: string; accent: string; monogram: string };
type Result = { ok: boolean; error?: string } | null;

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export function FeePicker({
  groups,
  categories,
  multiplier,
  action,
  mode = "signup",
  initialSelected = [],
}: {
  groups: Grp[];
  categories: Cat[];
  multiplier: number;
  action: (prev: Result, fd: FormData) => Promise<Result>;
  mode?: "signup" | "edit";
  initialSelected?: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [state, formAction, pending] = useActionState(action, null);

  const toggle = (slug: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });
  const selectGroup = (groupSlug: string, on: boolean) =>
    setSelected((prev) => {
      const n = new Set(prev);
      for (const c of categories) if (c.groupSlug === groupSlug) (on ? n.add(c.slug) : n.delete(c.slug));
      return n;
    });

  const sel = categories.filter((c) => selected.has(c.slug));
  const totalBase = sel.reduce((s, c) => s + c.baseFee, 0);
  const totalArb = Math.round((totalBase * multiplier) / 100);

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
      {/* left: category picker */}
      <div>
        <div className="eyebrow">{mode === "edit" ? "Your case types" : "Step 1 — pick your case types"}</div>
        <h2 className="mt-2 text-[24px]">Choose the referrals you want</h2>
        <p className="muted mt-2 text-[14.5px]">Each figure is the base referral fee per matched case. You only ever pay for referrals you accept.</p>

        <div className="mt-5 space-y-6">
          {groups.map((g) => {
            const cats = categories.filter((c) => c.groupSlug === g.slug);
            if (!cats.length) return null;
            const allOn = cats.every((c) => selected.has(c.slug));
            return (
              <div key={g.slug}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span aria-hidden style={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: 8, background: g.accent, color: "#fff", fontFamily: "var(--font-fraunces)", fontSize: 12, fontWeight: 600 }}>{g.monogram}</span>
                    <h3 style={{ fontSize: 16, margin: 0 }}>{g.name}</h3>
                  </div>
                  <button type="button" onClick={() => selectGroup(g.slug, !allOn)} className="text-[12.5px] font-semibold" style={{ color: "var(--brand)" }}>
                    {allOn ? "Clear" : "Select all"}
                  </button>
                </div>
                <div className="mt-2 grid gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
                  {cats.map((c) => {
                    const on = selected.has(c.slug);
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => toggle(c.slug)}
                        aria-pressed={on}
                        className="flex items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-left text-[13.5px]"
                        style={{ border: `1px solid ${on ? "var(--brand)" : "var(--line)"}`, background: on ? "var(--brand-100, #e6f0ee)" : "#fff" }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span aria-hidden style={{ width: 16, height: 16, borderRadius: 4, border: `1px solid ${on ? "var(--brand)" : "var(--line)"}`, background: on ? "var(--brand)" : "transparent", color: "#fff", display: "grid", placeItems: "center", fontSize: 11 }}>{on ? "✓" : ""}</span>
                          {c.name}
                        </span>
                        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--ink)" }}>{usd(c.baseFee)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* right: live tally + (signup) account or (edit) save */}
      <div className="lg:sticky lg:top-[88px]">
        <div className="card" style={{ background: "var(--ink)", color: "#fff", borderColor: "transparent" }}>
          <div className="eyebrow" style={{ color: "#e0a94b" }}>Your referral plan</div>
          <div className="mt-3 flex items-end justify-between">
            <span className="text-[14px]" style={{ color: "rgba(255,255,255,.8)" }}>Case types</span>
            <span className="text-[22px] font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{sel.length}</span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-[14px]" style={{ color: "rgba(255,255,255,.8)" }}>Base fee / referral</span>
            <span className="text-[22px] font-bold" style={{ fontVariantNumeric: "tabular-nums", color: "#e0a94b" }}>{usd(totalBase)}</span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <span className="text-[13.5px]" style={{ color: "rgba(255,255,255,.7)" }}>Post-arbitration ({multiplier}%)</span>
            <span className="text-[16px] font-semibold" style={{ fontVariantNumeric: "tabular-nums" }}>{usd(totalArb)}</span>
          </div>
          <p className="mt-3 text-[12px]" style={{ color: "rgba(255,255,255,.6)" }}>Base = a direct referral from the finder. Post-arbitration referrals are pre-qualified leads that completed the dispute funnel.</p>
        </div>

        <input type="hidden" name="specialties" value={JSON.stringify([...selected])} />

        {mode === "edit" ? (
          <div className="card mt-4">
            {state?.ok && <div className="form-msg ok mb-3">Saved ✓</div>}
            <button className="btn btn-brand btn-block btn-lg" disabled={pending}>{pending ? "Saving…" : "Save my case types"}</button>
          </div>
        ) : (
          <div className="card mt-4">
            <div className="eyebrow">Step 2 — create your account</div>
            <div className="field mt-3"><label>Your name</label><input name="displayName" required placeholder="Full name" /></div>
            <div className="field"><label>Firm (optional)</label><input name="firmName" placeholder="Firm name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field"><label>Bar state</label><input name="barState" maxLength={2} placeholder="TX" style={{ textTransform: "uppercase" }} /></div>
              <div className="field"><label>Phone</label><input name="phone" placeholder="(555) 555-5555" /></div>
            </div>
            <div className="field"><label>Email</label><input name="email" type="email" required placeholder="you@firm.com" /></div>
            <div className="field"><label>Password</label><input name="password" type="password" required minLength={12} placeholder="At least 12 characters" /></div>
            <label className="mb-2 flex items-start gap-2.5 text-[13.5px]"><input type="checkbox" name="notifyEmail" defaultChecked className="mt-1" style={{ width: "auto" }} /><span>Email me when a matching referral is available.</span></label>
            <label className="mb-3 flex items-start gap-2.5 text-[13.5px]"><input type="checkbox" name="acceptTos" required className="mt-1" style={{ width: "auto" }} /><span>I agree to the <a href="/tos" className="underline" style={{ color: "var(--brand)" }}>Terms</a>.</span></label>
            {state && !state.ok && <div className="form-msg err mb-3">{state.error}</div>}
            <button className="btn btn-brand btn-block btn-lg" disabled={pending}>{pending ? "Creating…" : "Create my account"}</button>
          </div>
        )}
      </div>
    </form>
  );
}
