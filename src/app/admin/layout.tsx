import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/cases", label: "Cases" },
  { href: "/admin/categories", label: "Rate card" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/audit", label: "Audit chain" },
  { href: "/admin/tos", label: "Terms" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await auth();
  const role = (s?.user as { role?: string } | undefined)?.role;
  if (!s?.user) redirect("/auth/login");
  if (role !== "admin") redirect("/dashboard");

  return (
    <div style={{ minHeight: "100%" }}>
      <div className="dark-section" style={{ padding: "0" }}>
        <div className="container flex items-center justify-between" style={{ height: 60 }}>
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-[8px] text-[13px] font-semibold text-white" style={{ background: "var(--brand)", fontFamily: "var(--font-fraunces)" }}>A</span>
            <span className="text-[15px] font-semibold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>God console</span>
          </div>
          <nav className="flex items-center gap-1 text-[13.5px]">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href} className="rounded-full px-3 py-1.5 text-[rgba(242,239,231,.75)] hover:text-white hover:bg-[rgba(255,255,255,.08)]">
                {t.label}
              </Link>
            ))}
            <Link href="/dashboard" className="ml-2 rounded-full px-3 py-1.5 text-[13px]" style={{ color: "var(--seal-2)" }}>Exit ↗</Link>
          </nav>
        </div>
      </div>
      <div className="container" style={{ padding: "36px 24px 80px" }}>
        <div className="mb-6 text-[12.5px] muted">Signed in as {s.user.email}</div>
        {children}
      </div>
    </div>
  );
}
