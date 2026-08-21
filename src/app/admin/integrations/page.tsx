import { revalidatePath } from "next/cache";
import { isNotNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/db/schema";
import { checkAiHealth } from "@/lib/ai";
import { getStripeConfig, getAiConfig, aiConfigured, setSetting, paymentsConfigured, SETTING_KEYS, PREMIUM_PRICE_MONTHLY } from "@/lib/settings";

export const dynamic = "force-dynamic";

const mask = (v: string | null) => (v ? `${v.slice(0, 7)}…${v.slice(-4)}` : "not set");
const OPENAI_BILLING = "https://platform.openai.com/settings/organization/billing/overview";
const usd = (micros: number) => `$${(micros / 1_000_000).toFixed(micros < 100_000 ? 4 : 2)}`;

export default async function AdminIntegrations() {
  const cfg = await getStripeConfig();
  const live = await paymentsConfigured();
  const ai = await getAiConfig();
  const aiOn = await aiConfigured();
  const health = aiOn ? await checkAiHealth() : { status: "off" as const };

  // Per-case AI spend so far.
  const decided = aiOn ? await db.select({ c: cases.aiCostMicros }).from(cases).where(isNotNull(cases.aiCostMicros)) : [];
  const totalMicros = decided.reduce((a, r) => a + (r.c ?? 0), 0);
  const nDecisions = decided.length;
  const avgMicros = nDecisions ? Math.round(totalMicros / nDecisions) : 0;
  const healthLabel: Record<string, string> = { active: "Reachable — credits available", no_credits: "OUT OF CREDITS — top up", bad_key: "Invalid API key", error: "Unreachable / error", off: "Not configured" };
  const healthOk = health.status === "active";

  async function save(fd: FormData) {
    "use server";
    const s = await auth();
    if ((s?.user as { role?: string } | undefined)?.role !== "admin") throw new Error("forbidden");
    const pub = String(fd.get("publishable") ?? "").trim();
    const sec = String(fd.get("secret") ?? "").trim();
    const price = String(fd.get("priceId") ?? "").trim();
    // Only overwrite when a new value is provided (blank leaves the stored value).
    if (pub) await setSetting(SETTING_KEYS.stripePublishableKey, pub);
    if (sec) await setSetting(SETTING_KEYS.stripeSecretKey, sec);
    if (price) await setSetting(SETTING_KEYS.stripePremiumPriceId, price);
    revalidatePath("/admin/integrations");
  }

  async function saveAi(fd: FormData) {
    "use server";
    const s = await auth();
    if ((s?.user as { role?: string } | undefined)?.role !== "admin") throw new Error("forbidden");
    const provider = String(fd.get("provider") ?? "").trim();
    const key = String(fd.get("apiKey") ?? "").trim();
    const model = String(fd.get("model") ?? "").trim();
    if (provider) await setSetting(SETTING_KEYS.aiProvider, provider);
    if (key) await setSetting(SETTING_KEYS.aiApiKey, key);
    if (model) await setSetting(SETTING_KEYS.aiModel, model);
    revalidatePath("/admin/integrations");
  }

  return (
    <main className="space-y-6" style={{ maxWidth: 720 }}>
      <header>
        <div className="eyebrow">Integrations</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">Payments — Stripe</h1>
        <p className="muted mt-2 text-[14px]">
          Payments stay <b>off (free)</b> until keys are added. Once a secret key and the Premium Partner price ID are set, attorneys can subscribe to Premium (${PREMIUM_PRICE_MONTHLY.toLocaleString()}/mo).
        </p>
      </header>

      <div className="card flex items-center justify-between" style={{ borderLeft: `3px solid ${live ? "var(--agreed)" : "var(--seal)"}` }}>
        <span className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-geist-sans)" }}>
          {live ? "Payments are LIVE" : "Payments are OFF — add keys to enable"}
        </span>
        <span className={`chip ${live ? "chip-agreed" : "chip-seal"}`}><span className="chip-dot" />{live ? "Configured" : "Not configured"}</span>
      </div>

      <form action={save} className="card space-y-1">
        <div className="field">
          <label>Publishable key <span className="muted">(pk_…)</span></label>
          <input name="publishable" placeholder={cfg.publishable ? `Saved: ${mask(cfg.publishable)}` : "pk_live_…"} autoComplete="off" />
        </div>
        <div className="field">
          <label>Secret key <span className="muted">(sk_…)</span></label>
          <input name="secret" type="password" placeholder={cfg.secret ? `Saved: ${mask(cfg.secret)}` : "sk_live_…"} autoComplete="off" />
          <span className="hint">Stored server-side. Leave blank to keep the current key.</span>
        </div>
        <div className="field">
          <label>Premium Partner price ID <span className="muted">(price_…)</span></label>
          <input name="priceId" placeholder={cfg.priceId ? `Saved: ${cfg.priceId}` : "price_… (the $3,000/mo recurring price)"} autoComplete="off" />
          <span className="hint">Create a ${PREMIUM_PRICE_MONTHLY.toLocaleString()}/month recurring product in Stripe and paste its price ID.</span>
        </div>
        <button className="btn btn-brand btn-lg">Save Stripe settings</button>
      </form>

      <div className="card">
        <h2 className="text-[16px]">Setup steps</h2>
        <ol className="muted mt-2 text-[14px]" style={{ lineHeight: 1.7, paddingLeft: 18, listStyle: "decimal" }}>
          <li>In Stripe, create a recurring Product priced at ${PREMIUM_PRICE_MONTHLY.toLocaleString()}/month.</li>
          <li>Copy its <b>price ID</b> (price_…) and your API keys (Developers → API keys).</li>
          <li>Paste them above and save. Premium checkout turns on automatically.</li>
        </ol>
      </div>

      {/* AI decision engine */}
      <header className="pt-4">
        <div className="eyebrow">Integrations</div>
        <h2 className="mt-2 text-[22px]">AI decision engine</h2>
        <p className="muted mt-2 text-[14px]">When configured, the Quick-Resolve step asks your AI provider for a confident, principle-cited resolution — or, if the accounts present a genuine split, it <b>auto-escalates to a paid arbitrator</b>. Until then a neutral non-citing decision is used.</p>
      </header>

      <div className="card" style={{ borderLeft: `3px solid ${healthOk ? "var(--agreed)" : health.status === "no_credits" ? "var(--escalate)" : "var(--seal)"}` }}>
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {aiOn ? `AI decisions — ${ai.provider} · ${ai.model || "default"}` : "AI decisions OFF — add a provider + key"}
          </span>
          <span className={`chip ${healthOk ? "chip-agreed" : health.status === "no_credits" ? "chip-escalate" : "chip-seal"}`}><span className="chip-dot" />{healthLabel[health.status]}</span>
        </div>

        {aiOn && (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[10px] px-3 py-2.5" style={{ background: "var(--paper-2, #efeadf)" }}>
                <div className="muted text-[12px]">AI decisions run</div>
                <div className="text-[20px] font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{nDecisions}</div>
              </div>
              <div className="rounded-[10px] px-3 py-2.5" style={{ background: "var(--paper-2, #efeadf)" }}>
                <div className="muted text-[12px]">Total spent (this app)</div>
                <div className="text-[20px] font-bold" style={{ fontVariantNumeric: "tabular-nums", color: "var(--seal)" }}>{usd(totalMicros)}</div>
              </div>
              <div className="rounded-[10px] px-3 py-2.5" style={{ background: "var(--paper-2, #efeadf)" }}>
                <div className="muted text-[12px]">Avg cost / case</div>
                <div className="text-[20px] font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{usd(avgMicros)}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a href={OPENAI_BILLING} target="_blank" rel="noopener" className="btn btn-seal">Top up credits ↗</a>
              <span className="muted text-[12.5px]">
                {health.status === "no_credits" ? "Your OpenAI API balance is empty — add credits to resume." : "OpenAI doesn't expose the dollar balance to API keys, so this shows live reachability + your spend here. Add an admin key later for exact balances."}
              </span>
            </div>
          </>
        )}
      </div>

      <form action={saveAi} className="card space-y-1">
        <div className="field">
          <label>Provider</label>
          <select name="provider" defaultValue={ai.provider ?? "xai"} style={{ padding: "10px 12px", borderRadius: 10 }}>
            <option value="xai">xAI (Grok)</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>
        <div className="field">
          <label>API key</label>
          <input name="apiKey" type="password" placeholder={ai.key ? `Saved: ${mask(ai.key)}` : "xai-… or sk-…"} autoComplete="off" />
          <span className="hint">Stored server-side. Leave blank to keep the current key.</span>
        </div>
        <div className="field">
          <label>Model <span className="muted">(optional)</span></label>
          <input name="model" placeholder={ai.model || "grok-2-latest / gpt-4o-mini"} autoComplete="off" />
        </div>
        <button className="btn btn-brand btn-lg">Save AI settings</button>
      </form>
    </main>
  );
}
