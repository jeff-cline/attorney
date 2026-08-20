import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const list = await db.select().from(users).orderBy(desc(users.createdAt));
  return (
    <main className="space-y-6">
      <div>
        <div className="eyebrow">Users</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">All users <span className="muted text-[18px]">({list.length})</span></h1>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="w-full text-[14.5px]">
          <thead>
            <tr style={{ background: "var(--paper-2)" }}>
              <Th>Email</Th><Th>Name</Th><Th>Role</Th><Th>Joined</Th><Th />
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} style={{ borderTop: "1px solid var(--line)" }}>
                <Td>{u.email}</Td>
                <Td>{u.displayName ?? "—"}</Td>
                <Td>
                  <span className={`chip ${u.role === "admin" ? "chip-seal" : "chip-pending"}`}>{u.role}</span>
                </Td>
                <Td>{u.createdAt.toISOString().slice(0, 10)}</Td>
                <Td><Link href={`/admin/users/${u.id}`} style={{ color: "var(--brand)" }}>Open →</Link></Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[.06em] muted">{children}</th>;
}
function Td({ children }: { children?: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
