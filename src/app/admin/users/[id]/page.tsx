import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, or, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, cases, agreements } from "@/db/schema";

export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const u = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!u) notFound();
  const myCases = await db
    .select()
    .from(cases)
    .where(or(eq(cases.initiatorId, id), eq(cases.joinerId, id)))
    .orderBy(desc(cases.updatedAt));
  const myAgs = await db
    .select()
    .from(agreements)
    .where(eq(agreements.userId, id))
    .orderBy(desc(agreements.createdAt));

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">{u.email}</h1>
        <div className="text-xs text-gray-600">
          {u.role} · since {u.createdAt.toISOString()}
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="font-medium">Cases ({myCases.length})</h2>
        <ul className="divide-y divide-black/10 rounded border border-black/10">
          {myCases.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between p-3 text-sm"
            >
              <span className="font-mono">{c.inviteCode}</span>
              <span className="text-gray-600">{c.status}</span>
              <Link className="underline" href={`/admin/cases/${c.id}`}>
                Open
              </Link>
            </li>
          ))}
          {myCases.length === 0 && (
            <li className="p-3 text-sm text-gray-500">No cases.</li>
          )}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Agreements ({myAgs.length})</h2>
        <ul className="divide-y divide-black/10 rounded border border-black/10 font-mono text-xs">
          {myAgs.map((a) => (
            <li key={a.id} className="p-2">
              {a.createdAt.toISOString()} · {a.agreementType} ·{" "}
              {a.rowHash.slice(0, 12)}…
            </li>
          ))}
          {myAgs.length === 0 && (
            <li className="p-2 text-gray-500">No agreements.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
