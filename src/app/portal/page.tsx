import Link from "next/link";
import { redirect } from "next/navigation";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attorneyProfiles, cases } from "@/db/schema";
import { CATEGORIES, GROUPS, getCategory } from "@/content/referral-categories";
import { arbitrationMultiplier, getStripeConfig, paymentsConfigured, PREMIUM_PRICE_MONTHLY } from "@/lib/settings";
import { createCheckoutSession } from "@/lib/stripe";
import { updateSpecialties } from "@/actions/attorney";
import { FeePicker } from "@/components/fee-picker";
import { CopyLink } from "@/components/copy-link";
import { ensureRefCode, coinBalance, coinHistory, COINS_REFERRAL_SIGNUP, COINS_REFERRAL_PAID } from "@/lib/coins";

export const dynamic = "force-dynamic";
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
const fmtDate = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "—");
type Result = { ok: boolean; error?: string } | null;

export default async function Portal({ searchParams }: { searchParams: Promise<{ upgraded?: string; premium?: string; canceled?: string }> }) {
  const sp = await searchParams;
  const s = await auth();
  const role = (s?.user as { role?: string } | undefined)?.role;
  if (!s?.user) redirect("/auth/login");
  if (role !== "attorney" && role !== "admin") redirect("/dashboard");

  const userId = (s.user as { id: string }).id;
  const email = s.user.email ?? undefined;
  const profile = await db.query.attorneyProfiles.findFirst({ where: eq(attorneyProfiles.userId, userId) });
  const mult = await arbitrationMultiplier();
  const payOn = await paymentsConfigured();
  const isPremium = profile?.tier === "premium";

  const cats = CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, groupSlug: c.groupSlug, baseFee: c.baseFee }));
  const grps = GROUPS.map((g) => ({ slug: g.slug, name: g.name, accent: g.accent, monogram: g.monogram }));

  async function saveSpecialties(_prev: Result, fd: FormData): Promise<Result> {
    "use server";
    return updateSpecialties(fd);
  }

  async function startPremium(fd: FormData) {
    "use server";
    const ses = await auth();
    const uid = (ses?.user as { id?: string } | undefined)?.id;
    const em = ses?.user?.email ?? undefined;
    if (!uid) redirect("/auth/login");
    const category = String(fd.get("exclusiveCategory") ?? "").trim();
    const state = String(fd.get("exclusiveState") ?? "").trim().toUpperCase().slice(0, 2);
    if (!getCategory(category) || state.length !== 2) redirect("/portal?premium=invalid");
    await db.update(attorneyProfiles).set({ exclusiveCategory: category, exclusiveState: state }).where(eq(attorneyProfiles.userId, uid!));
    const cfg = await getStripeConfig();
    if (cfg.secret && cfg.priceId) {
      const origin = process.env.APP_URL || "https://attorney.plus";
      const session = await createCheckoutSession(cfg.secret, {
        priceId: cfg.priceId,
        successUrl: `${origin}/portal/activate?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/portal?canceled=1`,
        email: em,
        uid: uid!,
        category,
        state,
      });
      if (session?.url) redirect(session.url);
      redirect("/portal?premium=error");
    }
    redirect("/portal?premium=requested");
  }

  const exCat = profile?.exclusiveCategory ? getCategory(profile.exclusiveCategory) : undefined;

  // A+COIN referral program
  const refCode = profile ? await ensureRefCode(userId) : "";
  const origin = process.env.APP_URL || "https://attorney.plus";
  const refLink = refCode ? `${origin}/start?ref=${refCode}` : "";
  const coins = await coinBalance(userId);
  const ledger = await coinHistory(userId, 12);
  const reservedLeads = await db
    .select({ id: cases.id, code: cases.inviteCode, subject: cases.subject, at: cases.litigationAt })
    .from(cases)
    .where(and(eq(cases.referredByAttorneyId, userId), eq(cases.status, "litigation")))
    .orderBy(desc(cases.litigationAt));
  const reasonLabel: Record<string, string> = {
    referral_signup: `Referral started a case (+${COINS_REFERRAL_SIGNUP})`,
    referral_paid: `Referred party paid (+${COINS_REFERRAL_PAID})`,
    redeemed: "Redeemed toward a lead",
    adjust: "Adjustment",
  };

  return (
    <main className="container" style={{ maxWidth: 1040, padding: "44px 24px 80px" }}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Attorney portal</div>
          <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">Welcome{s.user.name ? `, ${s.user.name}` : ""}</h1>
          <p className="muted mt-1 text-[13.5px]">
            {profile?.firmName ? `${profile.firmName} · ` : ""}{profile?.barState ? `${profile.barState} bar · ` : ""}
            <span className={`chip ${isPremium ? "chip-seal" : "chip-pending"}`} style={{ fontSize: 11 }}>{isPremium ? "Premium Partner" : "Free"}</span>
          </p>
        </div>
      </header>

      {sp.upgraded && <div className="form-msg ok mt-5">🎉 You&apos;re a Premium Partner. Your exclusive niche is being reserved in your state.</div>}
      {sp.premium === "requested" && <div className="form-msg ok mt-5">Thanks — your exclusivity request is saved. We&apos;ll be in touch to activate it.</div>}
      {sp.canceled && <div className="form-msg mt-5" style={{ background: "#f7ecd6", color: "#96631a" }}>Checkout canceled — no charge was made.</div>}

      {/* referral streams */}
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between"><h2 style={{ fontSize: 18 }}>Direct referrals</h2><span className="chip chip-pending">0 new</span></div>
          <p className="muted mt-2 text-[14px]" style={{ lineHeight: 1.55 }}>Matches straight from the finder in your categories. New referrals appear here — you&apos;ll {profile?.notifyEmail ? "also get an email" : "see them on login"}.</p>
        </div>
        <div className="card" style={{ borderLeft: "3px solid var(--seal)" }}>
          <div className="flex items-center justify-between"><h2 style={{ fontSize: 18 }}>Post-arbitration referrals</h2><span className="chip chip-seal">{mult}% base</span></div>
          <p className="muted mt-2 text-[14px]" style={{ lineHeight: 1.55 }}>Higher-intent, pre-qualified leads that completed the dispute funnel.</p>
        </div>
      </div>

      {/* A+COINS referral program */}
      <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 style={{ fontSize: 18 }}>Your referral link · earn A+COINS</h2>
            <span className="chip chip-seal" style={{ fontSize: 11 }}>1 A+COIN = $1 credit</span>
          </div>
          <p className="muted mt-2 text-[14px]" style={{ lineHeight: 1.55 }}>
            Sending a client to arbitration because their case is too small? Share this link. You earn
            <b> {COINS_REFERRAL_SIGNUP} A+COINS</b> when they start a case and <b>{COINS_REFERRAL_PAID} A+COINS</b> when they pay —
            spendable as $1-per-coin credit toward your future leads.
          </p>
          {refLink ? <CopyLink url={refLink} label="Copy" /> : <p className="muted mt-3 text-[13px]">Your referral code is being set up — refresh in a moment.</p>}

          {/* the path */}
          <div className="mt-5 rounded-[12px] p-4" style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }}>
            <div className="eyebrow mb-2">How a referral pays you back</div>
            <ol className="space-y-2 text-[13.5px]" style={{ lineHeight: 1.5 }}>
              <li><b>1.</b> You share your link → they start a case &nbsp;<span className="chip chip-seal" style={{ fontSize: 10.5 }}>+{COINS_REFERRAL_SIGNUP}</span></li>
              <li><b>2.</b> They pay their share &nbsp;<span className="chip chip-seal" style={{ fontSize: 10.5 }}>+{COINS_REFERRAL_PAID}</span></li>
              <li><b>3.</b> AI proposes a resolution → if both accept, it&apos;s resolved.</li>
              <li><b>4.</b> If it doesn&apos;t settle, a professional arbitrator rules.</li>
              <li><b>5.</b> Still unresolved? It goes to attorneys — and <b style={{ color: "var(--seal)" }}>your referred party comes back to you, free</b>. It&apos;s never shared with another attorney. The <i>opposing</i> party&apos;s attorney pays their full referral fee.</li>
            </ol>
          </div>

          {reservedLeads.length > 0 && (
            <div className="mt-4">
              <div className="eyebrow mb-2" style={{ color: "var(--seal)" }}>Reserved for you — free ({reservedLeads.length})</div>
              <ul className="space-y-2">
                {reservedLeads.map((r) => (
                  <li key={r.id} className="flex items-center justify-between rounded-[10px] px-3 py-2.5 text-[13.5px]" style={{ background: "#fbf7ec", border: "1px solid var(--seal)" }}>
                    <span><b>{r.code}</b>{r.subject ? ` — ${r.subject}` : ""} <span className="muted">· reached attorneys {fmtDate(r.at)}</span></span>
                    <span className="chip chip-seal" style={{ fontSize: 10.5 }}>Free lead</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* balance + ledger */}
        <div className="card" style={{ background: "var(--ink)", color: "#fff", borderColor: "transparent" }}>
          <div className="eyebrow" style={{ color: "#e0a94b" }}>A+COIN balance</div>
          <div style={{ fontFamily: "var(--font-fraunces)", fontSize: 46, color: "#e0a94b", lineHeight: 1.05, marginTop: 6 }}>{coins.toLocaleString("en-US")}</div>
          <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>= {usd(coins)} credit toward future leads</div>
          <div className="mt-4" style={{ borderTop: "1px solid rgba(255,255,255,.15)", paddingTop: 12 }}>
            <div className="text-[11px] uppercase tracking-[.08em]" style={{ color: "rgba(255,255,255,.55)" }}>Recent activity</div>
            {ledger.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginTop: 8 }}>No coins yet — share your link to start earning.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {ledger.map((l) => (
                  <li key={l.id} className="flex items-center justify-between text-[12.5px]" style={{ color: "rgba(255,255,255,.85)" }}>
                    <span>{reasonLabel[l.reason] ?? l.reason}<span style={{ color: "rgba(255,255,255,.45)" }}> · {fmtDate(l.createdAt)}</span></span>
                    <b style={{ color: l.delta >= 0 ? "#7fd1a8" : "#f0a1a1" }}>{l.delta >= 0 ? "+" : ""}{l.delta}</b>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p style={{ color: "rgba(255,255,255,.5)", fontSize: 11.5, marginTop: 12 }}>Coins apply automatically as $1-per-coin credit when you&apos;re billed for a lead.</p>
        </div>
      </section>

      {/* premium partner */}
      <section className="mt-6">
        <div className="card" style={{ background: "var(--ink)", color: "#fff", borderColor: "transparent" }}>
          {isPremium && exCat ? (
            <>
              <div className="eyebrow" style={{ color: "#e0a94b" }}>Premium Partner — active</div>
              <h2 style={{ color: "#fff", fontSize: 22, marginTop: 8 }}>Exclusive: {exCat.name} in {profile?.exclusiveState}</h2>
              <p style={{ color: "rgba(255,255,255,.8)", fontSize: 14.5, marginTop: 8 }}>Every {exCat.name.toLowerCase()} referral in {profile?.exclusiveState} comes to you. Manage billing from your receipts.</p>
            </>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div style={{ maxWidth: 540 }}>
                <div className="eyebrow" style={{ color: "#e0a94b" }}>Premium Partner · {usd(PREMIUM_PRICE_MONTHLY)}/mo</div>
                <h2 style={{ color: "#fff", fontSize: 24, marginTop: 8 }}>Own your niche in your state.</h2>
                <p style={{ color: "rgba(255,255,255,.82)", fontSize: 15, marginTop: 8, lineHeight: 1.6 }}>Lock a single practice niche in your state — we remove every other attorney from that category in your market, so those referrals come only to you.</p>
                <form action={startPremium} className="mt-4 flex flex-wrap items-end gap-2">
                  <label className="field" style={{ marginBottom: 0, minWidth: 220 }}>
                    <span className="text-[12px]" style={{ color: "rgba(255,255,255,.7)" }}>Niche (category)</span>
                    <select name="exclusiveCategory" required defaultValue={profile?.exclusiveCategory ?? ""} style={{ padding: "10px 12px", borderRadius: 10 }}>
                      <option value="" disabled>Choose a category…</option>
                      {GROUPS.map((g) => (
                        <optgroup key={g.slug} label={g.name}>
                          {CATEGORIES.filter((c) => c.groupSlug === g.slug).map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </label>
                  <label className="field" style={{ marginBottom: 0, width: 90 }}>
                    <span className="text-[12px]" style={{ color: "rgba(255,255,255,.7)" }}>State</span>
                    <input name="exclusiveState" required maxLength={2} defaultValue={profile?.exclusiveState ?? profile?.barState ?? ""} placeholder="TX" style={{ textTransform: "uppercase", padding: "10px 12px", borderRadius: 10 }} />
                  </label>
                  <button className="btn btn-seal btn-lg">{payOn ? `Upgrade — ${usd(PREMIUM_PRICE_MONTHLY)}/mo →` : "Request this niche"}</button>
                </form>
                {!payOn && <p style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 8 }}>Card payments are being enabled — we&apos;ll reserve your niche and confirm.</p>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-fraunces)", fontSize: 40, color: "#e0a94b", lineHeight: 1 }}>{usd(PREMIUM_PRICE_MONTHLY)}</div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13 }}>per month · per niche</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* specialty editor with fees */}
      <section className="mt-8 card">
        <FeePicker groups={grps} categories={cats} multiplier={mult} action={saveSpecialties} mode="edit" initialSelected={profile?.specialties ?? []} />
      </section>

      <p className="muted mt-8 text-[12.5px]">Need help? <Link href="/contact" className="underline" style={{ color: "var(--brand)" }}>Contact us</Link>. Attorney.plus is not a law firm; referral fees are marketing fees.</p>
    </main>
  );
}
