import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await auth();
  const role = (s?.user as { role?: string } | undefined)?.role;
  if (!s?.user) redirect("/auth/login");
  if (role !== "admin") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-6xl p-6">
      <nav className="mb-6 flex gap-4 border-b border-black/10 pb-3 text-sm">
        <Link href="/admin">Home</Link>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/cases">Cases</Link>
        <Link href="/admin/audit">Audit</Link>
        <Link href="/admin/tos">ToS</Link>
        <span className="ml-auto text-xs text-gray-500">
          Signed in as {s.user.email}
        </span>
      </nav>
      {children}
    </div>
  );
}
