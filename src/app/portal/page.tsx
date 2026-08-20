import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attorneyProfiles } from "@/db/schema";
import { getCategory } from "@/content/referral-categories";
import { arbitrationMultiplier } from "@/lib/settings";

export const dynamic = "force-dynamic";
const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default async function Portal() {
  const s = await auth();
  const role = (s?.user as { role?: string } | undefined)?.role;
  if (!s?.user) redirect("/auth/login");
  if (role !== "attorney" && role !== "admin") redirect("/dashboard");

  const userId = (s.user as { id: string }).id;
  const profile = await db.query.attorneyProfiles.findFirst({ where: eq(attorneyProfiles.userId, userId) });
  const mult = await arbitrationMultiplier();
  const specs = (profile?.specialties ?? []).map(getCategory).filter(Boolean) as NonNullable<ReturnType<typeof getCategory>>[];

  return (
    <main className="container" style={{ maxWidth: 960, padding: "44px 24px 80px" }}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Attorney portal</div>
          <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">Welcome{s.user.name ? `, ${s.user.name}` : ""}</h1>
          <p className="muted mt-1 text-[13.5px]">{profile?.firmName ? `${profile.firmName} · ` : ""}{profile?.barState ? `${profile.barState} bar · ` : ""}{profile?.approved ? "Approved" : "Pending review"}</p>
        </div>
        <Link href="/for-attorneys#join" className="btn btn-outline">Edit case types</Link>
      </header>

      {/* referral streams */}
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: 18 }}>Direct referrals</h2>
            <span className="chip chip-pending">0 new</span>
          </div>
          <p className="muted mt-2 text-[14px]" style={{ lineHeight: 1.55 }}>Matches straight from the finder in your categories. New referrals will appear here — you&apos;ll {profile?.notifyEmail ? "also get an email" : "see them on login"}.</p>
        </div>
        <div className="card" style={{ borderLeft: "3px solid var(--seal)" }}>
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: 18 }}>Post-arbitration referrals</h2>
            <span className="chip chip-seal">{mult}% base</span>
          </div>
          <p className="muted mt-2 text-[14px]" style={{ lineHeight: 1.55 }}>{profile?.postArbOptIn ? "You're opted in to" : "Opt in for"} higher-intent, pre-qualified leads that completed the dispute funnel.</p>
        </div>
      </div>

      {/* specialties */}
      <section className="mt-8 card">
        <div className="flex items-center justify-between">
          <h2 style={{ fontSize: 18 }}>Your case types ({specs.length})</h2>
        </div>
        {specs.length === 0 ? (
          <p className="muted mt-2 text-[14px]">You haven&apos;t picked any categories yet. <Link href="/for-attorneys#join" className="underline" style={{ color: "var(--brand)" }}>Choose your case types →</Link></p>
        ) : (
          <div style={{ overflowX: "auto" }} className="mt-3">
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-geist-sans)", fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  <th style={{ padding: "7px 8px" }}>Category</th>
                  <th style={{ padding: "7px 8px", textAlign: "right" }}>Direct fee</th>
                  <th style={{ padding: "7px 8px", textAlign: "right" }}>Post-arb ({mult}%)</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((c) => (
                  <tr key={c.slug} style={{ borderTop: "1px solid var(--line)" }}>
                    <td style={{ padding: "8px", fontFamily: "var(--font-fraunces)" }}>{c.name}</td>
                    <td style={{ padding: "8px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{usd(c.baseFee)}</td>
                    <td style={{ padding: "8px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "var(--seal)" }}>{usd(Math.round((c.baseFee * mult) / 100))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
