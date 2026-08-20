import Link from "next/link";
import { auth } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();
  const authed = !!session?.user;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  return (
    <header
      className="sticky top-0 z-40 hairline"
      style={{ background: "rgba(246,243,236,.86)", backdropFilter: "saturate(1.4) blur(10px)" }}
    >
      <div className="container flex h-[68px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="relative grid h-8 w-8 place-items-center rounded-[9px] text-[15px] font-semibold text-white"
            style={{ background: "var(--brand)", fontFamily: "var(--font-fraunces)" }}
          >
            A
            <span
              className="absolute font-bold leading-none"
              style={{ top: 3, right: 4, fontSize: 10, color: "var(--seal)", fontFamily: "var(--font-geist-sans)" }}
            >
              +
            </span>
          </span>
          <span className="text-[19px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-fraunces)" }}>
            Attorney<span style={{ color: "var(--seal)" }}>.plus</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 text-[15px]" style={{ fontFamily: "var(--font-geist-sans)" }}>
          <Link href="/join" className="hidden rounded-full px-3 py-2 font-medium hover:text-[var(--brand)] sm:inline">
            I have a code
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hidden rounded-full px-3 py-2 font-semibold sm:inline" style={{ color: "var(--seal)" }}>
              God console
            </Link>
          )}
          {authed ? (
            <Link href="/dashboard" className="hidden rounded-full px-3 py-2 font-medium hover:text-[var(--brand)] sm:inline">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="hidden rounded-full px-3 py-2 font-medium hover:text-[var(--brand)] sm:inline">
              Log in
            </Link>
          )}
          <Link href="/start" className="btn btn-brand" style={{ padding: "10px 18px", fontSize: "14.5px" }}>
            Start a case
          </Link>
        </nav>
      </div>
    </header>
  );
}
