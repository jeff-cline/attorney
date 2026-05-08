import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, cases, agreements } from "@/db/schema";
import { verifyChain } from "@/lib/audit";

export default async function AdminHome() {
  const [u] = await db.select({ n: sql<number>`count(*)::int` }).from(users);
  const [c] = await db.select({ n: sql<number>`count(*)::int` }).from(cases);
  const [a] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(agreements);
  const integrity = await verifyChain();

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Users" value={u.n} />
        <Stat label="Cases" value={c.n} />
        <Stat label="Agreements" value={a.n} />
      </div>

      <div
        className={`rounded border p-3 text-sm ${
          integrity.ok
            ? "border-green-300 bg-green-50 text-green-800"
            : "border-red-300 bg-red-50 text-red-800"
        }`}
      >
        Audit chain:{" "}
        {integrity.ok
          ? `OK (${integrity.checked} rows)`
          : `BROKEN at ${integrity.brokenAtId} (after ${integrity.checked} rows)`}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-black/10 p-4">
      <div className="text-xs uppercase text-gray-600">{label}</div>
      <div className="text-2xl">{value}</div>
    </div>
  );
}
