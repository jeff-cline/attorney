"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestAccess } from "@/actions/investor";
import { PERSONAS, type AccessResult } from "@/lib/personas";

export function InvestorAccessForm() {
  const [state, action, pending] = useActionState<AccessResult, FormData>(requestAccess, null);

  if (state?.ok) {
    return (
      <div className="panel" style={{ background: "var(--ink)", color: "#fff", borderColor: "transparent" }}>
        <div className="eyebrow" style={{ color: "#e0a94b" }}>Access granted</div>
        <h3 className="mt-2 text-[20px]" style={{ color: "#fff" }}>Your data-room account is ready</h3>
        <p className="mt-2 text-[14px]" style={{ color: "rgba(255,255,255,.85)", lineHeight: 1.55 }}>
          We created an account for <b>{state.email}</b>. Log in with the temporary password
          <b> TEMP!234</b> — you&apos;ll be asked to set your own immediately.
        </p>
        <Link href="/auth/login" className="btn btn-seal btn-lg mt-4" style={{ display: "inline-block" }}>Log in to the data room →</Link>
      </div>
    );
  }

  return (
    <form action={action} className="panel" id="request-access">
      <h3 className="text-[20px]">Request access</h3>
      <p className="muted mt-1 mb-4 text-[13.5px]">Create your account to open the executive overview and pitch deck.</p>
      {state?.error && (
        <div className={`form-msg mb-4 ${state.exists ? "" : "err"}`} style={state.exists ? { background: "#f7ecd6", color: "#96631a" } : undefined}>
          {state.error} {state.exists && <Link href="/auth/login" className="underline">Log in →</Link>}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="field" style={{ marginBottom: 0 }}><label>First name</label><input name="firstName" required placeholder="First" /></div>
        <div className="field" style={{ marginBottom: 0 }}><label>Last name</label><input name="lastName" required placeholder="Last" /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 mt-3">
        <div className="field" style={{ marginBottom: 0 }}><label>Email</label><input name="email" type="email" required placeholder="you@firm.com" /></div>
        <div className="field" style={{ marginBottom: 0 }}><label>Phone</label><input name="phone" type="tel" placeholder="(555) 555-5555" /></div>
      </div>
      <div className="field mt-3">
        <label>Who are you?</label>
        <select name="persona" required defaultValue="" style={{ padding: "11px 12px", borderRadius: 10 }}>
          <option value="" disabled>Select one…</option>
          {PERSONAS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      <button className="btn btn-brand btn-block btn-lg mt-4" disabled={pending}>{pending ? "Creating…" : "Request access →"}</button>
      <p className="muted mt-3 text-[11.5px]" style={{ lineHeight: 1.5 }}>
        For information only. Not an offer to sell or a solicitation to buy securities. Figures shown are illustrative estimates for discussion.
      </p>
    </form>
  );
}
