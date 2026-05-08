import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight">
          Attorney.plus
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/start">Start a case</Link>
          <Link href="/join">I have a code</Link>
          <Link href="/auth/login">Log in</Link>
        </nav>
      </div>
    </header>
  );
}
