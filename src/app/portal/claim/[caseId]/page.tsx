import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, leadClaims } from "@/db/schema";
import { getCategory } from "@/content/referral-categories";
import { coinBalance } from "@/lib/coins";
import { leadFeeFor } from "@/lib/leads";
import { claimLead } from "@/actions/leads";

export const dynamic = "force-dynamic";
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default async function ClaimCheckout({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const s = await auth();
  const su = s?.user as { id?: string; role?: string } | undefined;
  if (!su?.id) redirect("/auth/login");
  if (su.role !== "attorney" && su.role !== "admin") redirect("/dashboard");

  const c = await db.query.cases.findFirst({ where: eq(cases.id, caseId) });
  if (!c) notFound();

  const already = await db.query.leadClaims.findFirst({ where: and(eq(leadClaims.attorneyId, su.id), eq(leadClaims.caseId, caseId)) });
  const isReserved = c.referredByAttorneyId === su.id;
  const available = c.status === "litigation" && !isReserved;

  const fee = leadFeeFor(c.category);
  const balance = await coinBalance(su.id);
  const coinsApplied = Math.max(0, Math.min(balance, fee));
  const cashDue = Math.max(0, fee - coinsApplied);
  const cat = c.category ? getCategory(c.category) : undefined;

  async function confirm() {
    "use server";
    await claimLead(caseId);
    redirect(`/portal?claimed=1`);
  }

  return (
    <main className="container" style={{ maxWidth: 620, padding: "44px 24px 80px" }}>
      <Link href="/portal" className="text-[14px] muted hover:text-[var(--brand)]">← Back to portal</Link>
      <div className="mt-4 mb-6">
        <div className="eyebrow">Claim a lead</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,30px)]">Checkout</h1>
      </div>

      <div className="panel">
        <div className="mb-4">
          <div className="text-[13px] muted">Lead</div>
          <div className="text-[17px] font-semibold">{c.subject || "Dispute"} <span className="muted text-[14px]">· {c.inviteCode}</span></div>
          <div className="muted mt-1 text-[13.5px]">{cat ? cat.name : "General"}{c.jurisdiction ? ` · ${c.jurisdiction}` : ""} · post-arbitration (pre-qualified)</div>
        </div>

        {already ? (
          <div className="form-msg ok">You already claimed this lead — {already.coinsUsed} A+COINS applied{already.chargedUsd > 0 ? `, ${usd(already.chargedUsd)} cash due` : ", fully covered"}.</div>
        ) : isReserved ? (
          <div className="form-msg ok">This is <b>your referred party</b> — it&apos;s reserved to you <b>free</b>. No fee, no coins needed. It won&apos;t be offered to anyone else.</div>
        ) : !available ? (
          <div className="form-msg" style={{ background: "#f7ecd6", color: "#96631a" }}>This case isn&apos;t an available lead right now.</div>
        ) : (
          <>
            <div className="rounded-[12px] p-4" style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }}>
              <Line label="Referral fee" value={usd(fee)} />
              <Line label={`A+COINS applied (${coinsApplied} × $1)`} value={`– ${usd(coinsApplied)}`} accent="var(--seal)" />
              <div className="my-2" style={{ borderTop: "1px solid var(--line)" }} />
              <Line label="Cash due today" value={usd(cashDue)} bold />
            </div>
            <p className="muted mt-3 text-[13px]">
              You have <b>{balance.toLocaleString("en-US")} A+COINS</b> ({usd(balance)}). They apply automatically at $1 each.
              {cashDue > 0 ? " The remaining cash fee is billed when card payments are enabled." : " This lead is fully covered by your coins."}
            </p>
            <form action={confirm} className="mt-5">
              <button className="btn btn-brand btn-block btn-lg">
                {cashDue > 0 ? `Claim lead — apply ${coinsApplied} coins, ${usd(cashDue)} due` : `Claim lead — ${coinsApplied} coins, free`}
              </button>
            </form>
          </>
        )}
      </div>
      <p className="muted mt-6 text-[12px]">Attorney.plus is not a law firm; referral fees are marketing fees.</p>
    </main>
  );
}

function Line({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-[14.5px]">
      <span className={bold ? "font-semibold" : "muted"}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: accent }}>{value}</span>
    </div>
  );
}
