import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { GROUPS, categoriesInGroup, FEE_MULTIPLIER } from "@/content/referral-categories";
import { attorneyPercentageVisible, setSetting, SETTING_KEYS } from "@/lib/settings";

export const dynamic = "force-dynamic";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default async function AdminRateCard() {
  const showPct = await attorneyPercentageVisible();

  async function toggle(fd: FormData) {
    "use server";
    const s = await auth();
    if ((s?.user as { role?: string } | undefined)?.role !== "admin") throw new Error("forbidden");
    const next = String(fd.get("next") ?? "off");
    await setSetting(SETTING_KEYS.attorneyShowPercentage, next === "on" ? "on" : "off");
    revalidatePath("/admin/categories");
  }

  const totalCats = GROUPS.reduce((n, g) => n + categoriesInGroup(g.slug).length, 0);

  return (
    <main className="space-y-6">
      <header>
        <div className="eyebrow">Attorney backend</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">Referral rate card</h1>
        <p className="muted mt-2 text-[14px]" style={{ maxWidth: 720 }}>
          {totalCats} categories. <b>Base fee</b> is the attorney&apos;s minimum spend per referral (already ×{FEE_MULTIPLIER} of the source price) — attorneys may bid higher. These figures are attorney/God-facing only and never appear on consumer pages.
        </p>
      </header>

      {/* God toggle: estimated Managing-Attorney percentage */}
      <div className="card flex flex-wrap items-center justify-between gap-4" style={{ borderLeft: `3px solid ${showPct ? "var(--agreed)" : "var(--seal)"}` }}>
        <div>
          <div className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-geist-sans)" }}>
            Estimated percentage (Managing Attorney Agreement, Shared Cases)
          </div>
          <div className="muted mt-1 text-[13px]">
            {showPct
              ? "Currently VISIBLE to attorneys/God. Shown as the estimated % column below."
              : "Currently HIDDEN. Turn on once the attorney-owner agreements are finalized."}
          </div>
        </div>
        <form action={toggle}>
          <input type="hidden" name="next" value={showPct ? "off" : "on"} />
          <button className={`btn ${showPct ? "btn-outline" : "btn-seal"}`}>
            {showPct ? "Turn percentage OFF" : "Turn percentage ON"}
          </button>
        </form>
      </div>

      {GROUPS.map((g) => {
        const cats = categoriesInGroup(g.slug);
        if (!cats.length) return null;
        return (
          <section key={g.slug} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="flex items-center gap-2.5 px-5 py-3" style={{ borderBottom: "1px solid var(--line)" }}>
              <span aria-hidden style={{ width: 26, height: 26, display: "grid", placeItems: "center", borderRadius: 7, background: g.accent, color: "#fff", fontFamily: "var(--font-fraunces)", fontSize: 11, fontWeight: 600 }}>{g.monogram}</span>
              <h2 style={{ fontSize: 17, margin: 0 }}>{g.name}</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-geist-sans)", fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    <th style={{ padding: "8px 20px", width: 44 }}>#</th>
                    <th style={{ padding: "8px 20px" }}>Category</th>
                    <th style={{ padding: "8px 20px", textAlign: "right" }}>Base fee (min bid)</th>
                    {showPct && <th style={{ padding: "8px 20px", textAlign: "right" }}>Est. %</th>}
                  </tr>
                </thead>
                <tbody>
                  {cats.map((c) => (
                    <tr key={c.slug} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "9px 20px", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{c.id}</td>
                      <td style={{ padding: "9px 20px", fontFamily: "var(--font-fraunces)" }}>{c.name}</td>
                      <td style={{ padding: "9px 20px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{usd(c.baseFee)}</td>
                      {showPct && (
                        <td style={{ padding: "9px 20px", textAlign: "right", color: c.contingency ? "var(--ink)" : "var(--muted)" }}>
                          {c.contingency ?? "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </main>
  );
}
