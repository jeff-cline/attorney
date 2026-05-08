import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-black/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-gray-600 sm:flex-row sm:justify-between">
        <div>
          © {new Date().getFullYear()} Attorney.plus — not a law firm.
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/tos">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/auth/login" className="font-medium">
            Log in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
