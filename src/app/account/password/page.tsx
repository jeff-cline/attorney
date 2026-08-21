import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { changePassword } from "@/actions/account";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  short: "Password must be at least 12 characters.",
  match: "The two passwords don't match.",
  temp: "Please choose a new password — not the temporary one.",
};

export default async function ChangePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const s = await auth();
  if (!s?.user) redirect("/auth/login");
  const mustChange = (s.user as { mustChangePassword?: boolean }).mustChangePassword;

  return (
    <main className="container" style={{ maxWidth: 440, padding: "56px 24px 80px" }}>
      <div className="mb-6 text-center">
        <div className="eyebrow">Account security</div>
        <h1 className="mt-2 text-[clamp(26px,4vw,34px)]">Set a new password</h1>
        {mustChange && <p className="muted mt-2 text-[14px]">You&apos;re signed in with a temporary password. Choose your own to continue.</p>}
      </div>
      {sp.error && <div className="form-msg err mb-4">{ERRORS[sp.error] ?? "Please try again."}</div>}
      <div className="panel">
        <form action={changePassword}>
          <div className="field"><label>New password</label><input name="password" type="password" required minLength={12} placeholder="At least 12 characters" /></div>
          <div className="field"><label>Confirm new password</label><input name="confirm" type="password" required minLength={12} placeholder="Re-enter it" /></div>
          <button className="btn btn-brand btn-block btn-lg">Save password</button>
        </form>
      </div>
      <p className="muted mt-5 text-center text-[13px]">You&apos;ll log in again with your new password.</p>
    </main>
  );
}
