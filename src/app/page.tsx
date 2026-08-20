import Link from "next/link";
import { landing } from "@/content/landing";

export default function Home() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 460px at 78% -8%, rgba(20,82,79,.10), transparent 60%), radial-gradient(700px 400px at 10% 108%, rgba(193,133,42,.09), transparent 60%)",
          }}
        />
        <div className="container relative grid items-center gap-12 pt-6 md:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="eyebrow">{landing.hero.eyebrow}</span>
            <h1 className="mt-4 text-[clamp(38px,5.4vw,60px)]">
              {landing.hero.title}
            </h1>
            <p className="mt-5 max-w-[52ch] text-[18px] leading-relaxed muted">
              {landing.hero.sub}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={landing.hero.ctaPrimary.href} className="btn btn-brand btn-lg">
                {landing.hero.ctaPrimary.label} →
              </Link>
              <Link href={landing.hero.ctaSecondary.href} className="btn btn-outline btn-lg">
                {landing.hero.ctaSecondary.label}
              </Link>
            </div>
            <p className="mt-5 text-[13px] muted">
              No obligation to advance · Both parties must agree · Prelaunch — no charges yet
            </p>
          </div>

          {/* Progress-spine preview card */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <span className="eyebrow">Your case</span>
              <span className="chip chip-active"><span className="chip-dot" />In progress</span>
            </div>
            <div className="spine">
              <div className="spine-step done">
                <span className="spine-node">✓</span>
                <h4>Both sides opt in</h4>
                <p>Case started · code shared · both accepted the terms</p>
              </div>
              <div className="spine-step current">
                <span className="spine-node">2</span>
                <h4>Quick decision</h4>
                <p>Neutral summary approved — awaiting both signatures</p>
              </div>
              <div className="spine-step">
                <span className="spine-node">3</span>
                <h4>Professional arbitration</h4>
                <p>Only if either side disagrees · fee capped at $1,500</p>
              </div>
              <div className="spine-step">
                <span className="spine-node">4</span>
                <h4>Attorneys, if needed</h4>
                <p>Independent counsel for each side · no conflicts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="section-tight">
        <div className="container">
          <div className="mb-10 max-w-[46ch]">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-3 text-[clamp(28px,3.6vw,40px)]">
              Four steps. You only go as far as you need to.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {landing.steps.map((s) => (
              <article key={s.n} className="card card-raised">
                <div
                  className="mb-3 font-[var(--font-fraunces)] text-[15px] font-semibold"
                  style={{ color: "var(--seal)", letterSpacing: ".1em" }}
                >
                  {s.n}
                </div>
                <h3 className="text-[22px]">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed muted">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────── */}
      <section className="dark-section">
        <div className="container">
          <div className="mb-10 max-w-[44ch]">
            <span className="eyebrow on-dark">Why it holds up</span>
            <h2 className="mt-3 text-[clamp(28px,3.6vw,42px)]">{landing.trust.title}</h2>
          </div>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {landing.trust.points.map((p) => (
              <div key={p.title} className="border-t pt-5" style={{ borderColor: "rgba(255,255,255,.14)" }}>
                <h3 className="text-[20px]">{p.title}</h3>
                <p className="muted mt-2 text-[15px] leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="section-tight">
        <div className="container-tight">
          <div className="mb-8 text-center">
            <span className="eyebrow">Questions</span>
            <h2 className="mt-3 text-[clamp(26px,3.4vw,38px)]">Fair is also clear.</h2>
          </div>
          <div className="space-y-3">
            {landing.faq.map((f) => (
              <details key={f.q} className="card">
                <summary className="cursor-pointer list-none font-semibold" style={{ fontFamily: "var(--font-geist-sans)" }}>
                  {f.q}
                </summary>
                <p className="muted mt-3 text-[15.5px] leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="pb-24 pt-0">
        <div className="container">
          <div
            className="panel text-center"
            style={{ background: "linear-gradient(140deg, var(--brand), var(--brand-700))", border: "none", color: "#fff" }}
          >
            <h2 className="mx-auto max-w-[20ch] text-[clamp(28px,4vw,44px)]" style={{ color: "#fff" }}>
              Start with agreement. Keep the rest in reserve.
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[16.5px]" style={{ color: "rgba(255,255,255,.82)" }}>
              Open a case in minutes. Share your code. Resolve it — or let the process
              carry you fairly to the next step.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="btn btn-seal btn-lg">Start a case →</Link>
              <Link href="/join" className="btn btn-ghost-light btn-lg">I have a code</Link>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-[62ch] text-center text-[12.5px] muted">
            {landing.notice}
          </p>
        </div>
      </section>
    </main>
  );
}
