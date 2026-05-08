import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tosVersions } from "@/db/schema";

export default async function AdminTos() {
  const list = await db
    .select()
    .from(tosVersions)
    .orderBy(desc(tosVersions.effectiveAt));
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">ToS versions</h1>
      <ul className="divide-y divide-black/10 rounded border border-black/10 text-sm">
        {list.map((v) => (
          <li key={v.id} className="space-y-1 p-3">
            <div className="font-mono">{v.version}</div>
            <div className="text-xs text-gray-600">hash: {v.bodyHash}</div>
            <div className="text-xs text-gray-600">
              effective: {v.effectiveAt.toISOString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
