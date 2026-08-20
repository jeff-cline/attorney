"use client";

import { useActionState, useState } from "react";

type Result = { ok: true } | { ok: false; error: string } | null;
const STEPS = ["Your account", "Your firm", "Confirm"];

export function AttorneyJoin({ action }: { action: (prev: Result, fd: FormData) => Promise<Result> }) {
  const [step, setStep] = useState(0);
  const [state, formAction, pending] = useActionState(action, null);
  // Track required step-1 fields so we can gate "Next".
  const [f, setF] = useState({ displayName: "", email: "", password: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const step1ok = f.displayName.trim() && /.+@.+\..+/.test(f.email) && f.password.length >= 12;

  return (
    <div className="panel" style={{ maxWidth: 480 }}>
      {/* progress */}
      <div className="mb-5 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              style={{
                width: 24, height: 24, borderRadius: 999, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700,
                fontFamily: "var(--font-geist-sans)",
                background: i <= step ? "var(--brand)" : "var(--line)",
                color: i <= step ? "#fff" : "var(--muted)",
              }}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className="text-[12px] font-semibold" style={{ color: i === step ? "var(--ink)" : "var(--muted)" }}>{label}</span>
          </div>
        ))}
      </div>

      <form action={formAction}>
        {/* Step 1 */}
        <div style={{ display: step === 0 ? "block" : "none" }}>
          <div className="field"><label>Your name</label><input name="displayName" value={f.displayName} onChange={(e) => set("displayName", e.target.value)} placeholder="Full name" /></div>
          <div className="field"><label>Work email</label><input name="email" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="you@firm.com" /></div>
          <div className="field"><label>Password</label><input name="password" type="password" value={f.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 12 characters" /><span className="hint">Minimum 12 characters.</span></div>
          <button type="button" className="btn btn-brand btn-block btn-lg" disabled={!step1ok} onClick={() => setStep(1)}>
            {step1ok ? "Continue →" : "Fill in your details"}
          </button>
        </div>

        {/* Step 2 */}
        <div style={{ display: step === 1 ? "block" : "none" }}>
          <div className="field"><label>Firm <span className="muted">(optional)</span></label><input name="firmName" placeholder="Firm name" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Bar state</label><input name="barState" maxLength={2} placeholder="TX" style={{ textTransform: "uppercase" }} /></div>
            <div className="field"><label>Phone</label><input name="phone" placeholder="(555) 555-5555" /></div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline" onClick={() => setStep(0)}>← Back</button>
            <button type="button" className="btn btn-brand" style={{ flex: 1 }} onClick={() => setStep(2)}>Continue →</button>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ display: step === 2 ? "block" : "none" }}>
          <div className="card mb-4" style={{ background: "var(--paper-2, #efeadf)" }}>
            <div className="text-[13.5px]" style={{ fontFamily: "var(--font-geist-sans)" }}>
              <div><b>{f.displayName || "—"}</b></div>
              <div className="muted">{f.email || "—"}</div>
            </div>
            <p className="muted mt-2 text-[13px]">Free account — no card required. You&apos;ll pick your case types and see referral fees inside your portal.</p>
          </div>
          <label className="mb-3 flex items-start gap-2.5 text-[13.5px]">
            <input type="checkbox" name="acceptTos" required className="mt-1" style={{ width: "auto" }} />
            <span>I agree to the <a href="/tos" className="underline" style={{ color: "var(--brand)" }}>Terms</a> and that any referral fee is a marketing fee.</span>
          </label>
          {state && !state.ok && <div className="form-msg err mb-3">{state.error}</div>}
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-brand btn-lg" style={{ flex: 1 }} disabled={pending}>
              {pending ? "Creating…" : "Create free account"}
            </button>
          </div>
        </div>
      </form>

      <p className="muted mt-4 text-center text-[13px]">Already a member? <a href="/auth/login" className="underline" style={{ color: "var(--brand)" }}>Log in</a></p>
    </div>
  );
}
