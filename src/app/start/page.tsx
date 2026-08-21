import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { signupAndAcceptTos } from "@/actions/signup";
import { createCase } from "@/actions/cases";
import { getCategory } from "@/content/referral-categories";

export const dynamic = "force-dynamic";

export default async function StartPage({ searchParams }: { searchParams: Promise<{ error?: string; category?: string; intent?: string }> }) {
  const sp = await searchParams;
  const session = await auth();
  const loggedIn = Boolean(session?.user);
  const cat = sp.category ? getCategory(sp.category) : undefined;
  const catQs = cat ? `?category=${encodeURIComponent(cat.slug)}${sp.intent ? `&intent=${encodeURIComponent(sp.intent)}` : ""}` : "";

  async function signupAction(fd: FormData) {
    "use server";
    const r = await signupAndAcceptTos(fd);
    const carry = String(fd.get("category") ?? "");
    const q = carry ? `?category=${encodeURIComponent(carry)}` : "";
    if (!r.ok) redirect(`/start${q}${q ? "&" : "?"}error=${encodeURIComponent(r.error)}`);
    redirect(`/start${q}`);
  }
  async function startAction(fd: FormData) {
    "use server";
    const subject = String(fd.get("subject") ?? "").trim().slice(0, 160);
    const category = String(fd.get("category") ?? "").trim().slice(0, 120) || undefined;
    const jurisdiction = String(fd.get("jurisdiction") ?? "").trim().slice(0, 40) || undefined;
    const c = await createCase(subject || undefined, category, jurisdiction);
    redirect(`/dashboard/case/${c.id}`);
  }

  return (
    <main className="container" style={{ maxWidth: 520, padding: "48px 24px 80px" }}>
      <div className="mb-7">
        <div className="eyebrow">Start a case</div>
        <h1 className="mt-2 text-[clamp(28px,4vw,40px)]">Open your case</h1>
        <p className="muted mt-2 text-[15.5px]">
          {loggedIn
            ? "Describe the dispute in a line. You'll pay your share, then get a private code to send to the other party."
            : "Create an account and accept the terms. You'll get a code to share — the other party can join now or later."}
        </p>
      </div>

      {sp.error && <div className="form-msg err mb-4">{decodeURIComponent(sp.error)}</div>}
      {cat && (
        <div className="chip chip-seal mb-4" style={{ fontSize: 13.5 }}>
          {sp.intent === "attorney" ? "Attorney match" : "Category"}: {cat.name}
        </div>
      )}

      <div className="panel">
        {loggedIn ? (
          <form action={startAction}>
            {cat && <input type="hidden" name="category" value={cat.slug} />}
            <div className="field">
              <label>What&apos;s the dispute about?</label>
              <input name="subject" required maxLength={160} placeholder="e.g. Security deposit not returned" defaultValue={cat ? cat.name : undefined} />
              <span className="hint">A short title — you&apos;ll give the full account after both parties join.</span>
            </div>
            <div className="field">
              <label>State where this happened <span className="muted">(optional)</span></label>
              <input name="jurisdiction" maxLength={40} placeholder="e.g. Texas" />
              <span className="hint">Helps the AI apply the correct state law when proposing a resolution.</span>
            </div>
            <button className="btn btn-brand btn-block btn-lg">Continue →</button>
          </form>
        ) : (
          <>
            <form action={signupAction}>
              {cat && <input type="hidden" name="category" value={cat.slug} />}
              <div className="field"><label>Your name</label><input name="displayName" required placeholder="Full name" /></div>
              <div className="field"><label>Email</label><input name="email" type="email" required placeholder="you@email.com" /></div>
              <div className="field"><label>Password</label><input name="password" type="password" required minLength={12} placeholder="At least 12 characters" /></div>
              <label className="mb-4 flex items-start gap-2.5 text-[14px]">
                <input type="checkbox" name="acceptTos" required className="mt-1" style={{ width: "auto" }} />
                <span>I have read and accept the <Link href="/tos" className="underline" style={{ color: "var(--brand)" }}>Terms of Service</Link>.</span>
              </label>
              <button className="btn btn-brand btn-block btn-lg">Create account</button>
            </form>
            <p className="muted mt-4 text-center text-[13.5px]">
              Already have an account? <Link href="/auth/login" className="underline" style={{ color: "var(--brand)" }}>Log in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
