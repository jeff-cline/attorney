import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { cases } from "@/db/schema";

export default async function AdminCases() {
  const list = await db.select().from(cases).orderBy(desc(cases.updatedAt));
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Cases ({list.length})</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left">
            <th className="py-2">Code</th>
            <th>Status</th>
            <th>Updated</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id} className="border-b border-black/10">
              <td className="py-2 font-mono">{c.inviteCode}</td>
              <td>{c.status}</td>
              <td>
                {c.updatedAt.toISOString().slice(0, 16).replace("T", " ")}
              </td>
              <td>
                <Link className="underline" href={`/admin/cases/${c.id}`}>
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
