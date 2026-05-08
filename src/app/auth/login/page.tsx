import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  async function loginAction(fd: FormData) {
    "use server";
    const email = String(fd.get("email") ?? "").toLowerCase();
    const password = String(fd.get("password") ?? "");
    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
    } catch {
      redirect("/auth/login?error=1");
    }
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-sm space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form action={loginAction} className="space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="email"
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="password"
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <button className="w-full rounded bg-black py-2 text-white">
          Log in
        </button>
      </form>
      <p className="text-xs text-gray-500">
        Don&apos;t have an account? <a href="/start" className="underline">Start a case</a> or{" "}
        <a href="/join" className="underline">join one</a>.
      </p>
    </main>
  );
}
