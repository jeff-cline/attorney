import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signupAndAcceptTos } from "@/actions/signup";
import { createCase } from "@/actions/cases";

export const dynamic = "force-dynamic";

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (session?.user) {
    const c = await createCase();
    redirect(`/dashboard/case/${c.id}`);
  }

  async function action(fd: FormData) {
    "use server";
    const r = await signupAndAcceptTos(fd);
    if (!r.ok) redirect(`/start?error=${encodeURIComponent(r.error)}`);
    redirect("/start");
  }

  return (
    <main className="mx-auto max-w-md space-y-6 p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Start a case</h1>
        <p className="text-sm text-gray-600">
          Create an account, accept the Terms, and you&apos;ll get a code to share with the other party.
          They can join now or later — you don&apos;t need to be online together.
        </p>
      </header>

      {sp.error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {sp.error}
        </div>
      )}

      <form action={action} className="space-y-3">
        <input
          name="displayName"
          required
          placeholder="Your name"
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          minLength={12}
          placeholder="Password (12+ characters)"
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="acceptTos" required className="mt-1" />
          <span>
            I have read and accept the{" "}
            <a href="/tos" className="underline">
              Terms of Service
            </a>
            .
          </span>
        </label>
        <button className="w-full rounded bg-black py-2 text-white">
          Create account
        </button>
      </form>

      <p className="text-xs text-gray-500">
        Already have an account?{" "}
        <a href="/auth/login" className="underline">
          Log in
        </a>
        .
      </p>
    </main>
  );
}
