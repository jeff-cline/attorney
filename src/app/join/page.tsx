import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { signupAndAcceptTos } from "@/actions/signup";
import { joinCase } from "@/actions/cases";

export const dynamic = "force-dynamic";

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ error?: string; code?: string }> }) {
  const sp = await searchParams;
  const session = await auth();

  async function signupAction(fd: FormData) {
    "use server";
    const r = await signupAndAcceptTos(fd);
    if (!r.ok) redirect(`/join?error=${encodeURIComponent(r.error)}`);
    redirect("/join");
  }
  async function joinAction(fd: FormData) {
    "use server";
    const r = await joinCase(fd);
    if (!r.ok) redirect(`/join?error=${encodeURIComponent(r.error)}`);
    redirect(`/dashboard/case/${r.caseId}`);
  }

  return (
    <main className="container" style={{ maxWidth: 520, padding: "48px 24px 80px" }}>
      <div className="mb-7">
        <div className="eyebrow">Join a case</div>
        <h1 className="mt-2 text-[clamp(28px,4vw,40px)]">Enter your code</h1>
        <p className="muted mt-2 text-[15.5px]">Use the <code style={{ fontFamily: "var(--font-geist-sans)" }}>ATTPLUS-XXXXXX</code> code the other party sent you.</p>
      </div>

      {sp.error && <div className="form-msg err mb-4">{decodeURIComponent(sp.error)}</div>}

      <div className="panel">
        {session?.user ? (
          <form action={joinAction}>
            <div className="field">
              <label>Your code</label>
              <input name="inviteCode" required defaultValue={sp.code ?? ""} placeholder="ATTPLUS-XXXXXX" style={{ textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }} />
            </div>
            <button className="btn btn-brand btn-block btn-lg">Join case</button>
          </form>
        ) : (
          <>
            <p className="muted mb-4 text-[14.5px]">Create an account first, then enter your code.</p>
            <form action={signupAction}>
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
