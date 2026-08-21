import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { cases } from "@/db/schema";
import { StatusChip } from "@/components/status-chip";

export const dynamic = "force-dynamic";

const usd = (micros: number) => `$${(micros / 1_000_000).toFixed(micros < 100_000 ? 4 : 2)}`;

export default async function AdminCases() {
  const list = await db.select().from(cases).orderBy(desc(cases.updatedAt));
  const totalMicros = list.reduce((a, c) => a + (c.aiCostMicros ?? 0), 0);
  const totalTokens = list.reduce((a, c) => a + (c.aiPromptTokens ?? 0) + (c.aiCompletionTokens ?? 0), 0);

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Cases</div>
          <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">All cases <span className="muted text-[18px]">({list.length})</span></h1>
        </div>
        {totalMicros > 0 && (
          <div className="text-right">
            <div className="muted text-[12px]">Total AI spend</div>
            <div className="text-[18px] font-bold" style={{ color: "var(--seal)", fontVariantNumeric: "tabular-nums" }}>{usd(totalMicros)} <span className="muted text-[12px] font-normal">· {totalTokens.toLocaleString()} tokens</span></div>
          </div>
        )}
      </div>
      {list.length === 0 ? (
        <div className="card muted">No cases yet.</div>
      ) : (
        <div className="space-y-2">
          {list.map((c) => {
            const tok = (c.aiPromptTokens ?? 0) + (c.aiCompletionTokens ?? 0);
            return (
              <Link key={c.id} href={`/admin/cases/${c.id}`} className="card card-raised flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold" style={{ fontFamily: "var(--font-fraunces)" }}>{c.subject?.trim() || "Dispute"}</div>
                  <div className="muted mt-0.5 text-[13px]">{c.inviteCode} · updated {c.updatedAt.toISOString().slice(0, 16).replace("T", " ")}</div>
                </div>
                <div className="flex items-center gap-4">
                  {c.aiCostMicros != null && (
                    <span className="chip chip-seal" title={`AI decision: ${c.aiPromptTokens ?? 0} in / ${c.aiCompletionTokens ?? 0} out`} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {usd(c.aiCostMicros)} · {tok.toLocaleString()} tok
                    </span>
                  )}
                  <StatusChip status={c.status} />
                  <span className="text-[14px]" style={{ color: "var(--brand)" }}>Open →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
