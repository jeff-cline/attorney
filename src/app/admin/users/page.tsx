import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export default async function AdminUsers() {
  const list = await db.select().from(users).orderBy(desc(users.createdAt));
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Users ({list.length})</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left">
            <th className="py-2">Email</th>
            <th>Role</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id} className="border-b border-black/10">
              <td className="py-2">{u.email}</td>
              <td>{u.role}</td>
              <td>{u.createdAt.toISOString().slice(0, 10)}</td>
              <td>
                <Link className="underline" href={`/admin/users/${u.id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
