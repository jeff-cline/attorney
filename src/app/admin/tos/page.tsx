import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tosVersions } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminTos() {
  const list = await db.select().from(tosVersions).orderBy(desc(tosVersions.effectiveAt));
  return (
    <main className="space-y-6">
      <div>
        <div className="eyebrow">Terms</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">Terms of Service versions</h1>
      </div>
      <div className="space-y-3">
        {list.map((v, i) => (
          <div key={v.id} className="card flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>{v.version}</span>
                {i === 0 && <span className="chip chip-agreed">Current</span>}
              </div>
              <div className="muted mt-1 text-[12.5px]" style={{ fontFamily: "ui-monospace, monospace" }}>hash: {v.bodyHash}</div>
            </div>
            <div className="muted text-[13px]">effective {v.effectiveAt.toISOString().slice(0, 10)}</div>
          </div>
        ))}
        {list.length === 0 && <div className="card muted">No versions.</div>}
      </div>
    </main>
  );
}
