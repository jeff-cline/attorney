import { db } from "@/lib/db";
import { agreements } from "@/db/schema";
import { verifyChain } from "@/lib/audit";

export default async function AdminAudit() {
  const result = await verifyChain();
  const rows = await db.select().from(agreements).orderBy(agreements.seq);
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Audit chain</h1>
      <div
        className={`rounded border p-3 text-sm ${
          result.ok
            ? "border-green-300 bg-green-50 text-green-800"
            : "border-red-300 bg-red-50 text-red-800"
        }`}
      >
        {result.ok
          ? `OK · ${result.checked} rows`
          : `BROKEN at ${result.brokenAtId}`}
      </div>
      <ul className="divide-y divide-black/10 rounded border border-black/10 font-mono text-xs">
        {rows.map((r) => (
          <li key={r.id} className="break-all p-2">
            <div>
              #{r.seq} · {r.createdAt.toISOString()} · {r.agreementType} · case=
              {r.caseId ?? "—"}
            </div>
            <div className="text-gray-600">row : {r.rowHash}</div>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="p-2 text-gray-500">No agreements yet.</li>
        )}
      </ul>
    </main>
  );
}
