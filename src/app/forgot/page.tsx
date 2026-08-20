import Link from "next/link";
import { redirect } from "next/navigation";
import { requestReset } from "@/actions/password";

export const dynamic = "force-dynamic";

export default async function ForgotPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams;
  async function action(fd: FormData) {
    "use server";
    await requestReset(fd);
    redirect("/forgot?sent=1");
  }

  return (
    <main className="container" style={{ maxWidth: 440, padding: "56px 24px 80px" }}>
      <div className="mb-7 text-center">
        <div className="eyebrow">Account recovery</div>
        <h1 className="mt-2 text-[clamp(28px,4vw,38px)]">Reset password</h1>
      </div>

      {sp.sent ? (
        <div className="panel text-center">
          <div className="form-msg ok mb-4">Check your email.</div>
          <p className="muted text-[14.5px]">If an account exists for that address, we&apos;ve sent a link to reset your password. It expires in one hour.</p>
          <Link href="/auth/login" className="btn btn-outline btn-block mt-5">Back to log in</Link>
        </div>
      ) : (
        <>
          <div className="panel">
            <form action={action}>
              <div className="field">
                <label>Email</label>
                <input name="email" type="email" required placeholder="you@email.com" />
                <span className="hint">We&apos;ll email you a secure link to choose a new password.</span>
              </div>
              <button className="btn btn-brand btn-block btn-lg">Send reset link</button>
            </form>
          </div>
          <p className="muted mt-5 text-center text-[13.5px]">
            Remembered it? <Link href="/auth/login" className="underline" style={{ color: "var(--brand)" }}>Log in</Link>
          </p>
        </>
      )}
    </main>
  );
}
