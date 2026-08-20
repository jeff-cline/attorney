import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const sp = await searchParams;
  async function loginAction(fd: FormData) {
    "use server";
    const email = String(fd.get("email") ?? "").toLowerCase();
    const password = String(fd.get("password") ?? "");
    try {
      await signIn("credentials", { email, password, redirect: false });
    } catch {
      redirect("/auth/login?error=1");
    }
    const u = await db.query.users.findFirst({ where: eq(users.email, email) });
    redirect(u?.role === "admin" ? "/admin" : u?.role === "attorney" ? "/portal" : "/dashboard");
  }

  return (
    <main className="container" style={{ maxWidth: 440, padding: "56px 24px 80px" }}>
      <div className="mb-7 text-center">
        <div className="eyebrow">Welcome back</div>
        <h1 className="mt-2 text-[clamp(28px,4vw,38px)]">Log in</h1>
      </div>
      {sp.error && <div className="form-msg err mb-4">Incorrect email or password.</div>}
      {sp.reset && <div className="form-msg ok mb-4">Password updated. Log in with your new password.</div>}
      <div className="panel">
        <form action={loginAction}>
          <div className="field"><label>Email</label><input name="email" type="email" required placeholder="you@email.com" /></div>
          <div className="field">
            <div className="flex items-baseline justify-between">
              <label>Password</label>
              <Link href="/forgot" className="text-[12.5px] underline" style={{ color: "var(--brand)" }}>Forgot password?</Link>
            </div>
            <input name="password" type="password" required placeholder="Your password" />
          </div>
          <button className="btn btn-brand btn-block btn-lg">Log in</button>
        </form>
      </div>
      <p className="muted mt-5 text-center text-[13.5px]">
        No account? <Link href="/start" className="underline" style={{ color: "var(--brand)" }}>Start a case</Link> or <Link href="/join" className="underline" style={{ color: "var(--brand)" }}>join one</Link>.
      </p>
    </main>
  );
}
