import Link from "next/link";
import { redirect } from "next/navigation";
import { resetPassword } from "@/actions/password";

export const dynamic = "force-dynamic";

export default async function ResetPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const sp = await searchParams;

  async function action(fd: FormData) {
    "use server";
    const res = await resetPassword(token, fd);
    if (!res.ok) redirect(`/reset/${token}?error=${encodeURIComponent(res.error)}`);
    redirect("/auth/login?reset=1");
  }

  return (
    <main className="container" style={{ maxWidth: 440, padding: "56px 24px 80px" }}>
      <div className="mb-7 text-center">
        <div className="eyebrow">Account recovery</div>
        <h1 className="mt-2 text-[clamp(28px,4vw,38px)]">Choose a new password</h1>
      </div>
      {sp.error && <div className="form-msg err mb-4">{sp.error}</div>}
      <div className="panel">
        <form action={action}>
          <div className="field">
            <label>New password</label>
            <input name="password" type="password" required minLength={12} placeholder="At least 12 characters" />
            <span className="hint">Use at least 12 characters. A passphrase works well.</span>
          </div>
          <button className="btn btn-brand btn-block btn-lg">Update password</button>
        </form>
      </div>
      <p className="muted mt-5 text-center text-[13.5px]">
        <Link href="/auth/login" className="underline" style={{ color: "var(--brand)" }}>Back to log in</Link>
      </p>
    </main>
  );
}
