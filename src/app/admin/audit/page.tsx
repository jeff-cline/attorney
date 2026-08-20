import { db } from "@/lib/db";
import { agreements } from "@/db/schema";
import { verifyChain } from "@/lib/audit";

export const dynamic = "force-dynamic";

export default async function AdminAudit() {
  const result = await verifyChain();
  const rows = await db.select().from(agreements).orderBy(agreements.seq);
  return (
    <main className="space-y-6">
      <div>
        <div className="eyebrow">Integrity</div>
        <h1 className="mt-2 text-[clamp(24px,3vw,32px)]">Audit chain</h1>
      </div>
      <div className="card flex items-center justify-between" style={{ borderLeft: `3px solid ${result.ok ? "var(--agreed)" : "var(--escalate)"}` }}>
        <span className="text-[15px] font-semibold" style={{ fontFamily: "var(--font-geist-sans)" }}>
          {result.ok ? `Verified · ${result.checked} rows, hash chain intact` : `⚠ BROKEN at ${result.brokenAtId}`}
        </span>
        <span className={`chip ${result.ok ? "chip-agreed" : "chip-escalate"}`}><span className="chip-dot" />{result.ok ? "Intact" : "Broken"}</span>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
          {rows.map((r) => (
            <li key={r.id} className="break-all px-4 py-3 text-[12px]" style={{ fontFamily: "ui-monospace, monospace" }}>
              <div className="text-[13px]" style={{ fontFamily: "var(--font-geist-sans)" }}>
                #{r.seq} · {r.createdAt.toISOString().slice(0, 19).replace("T", " ")} · <b>{r.agreementType}</b> · case={r.caseId?.slice(0, 8) ?? "—"}
              </div>
              <div className="muted">row: {r.rowHash}</div>
            </li>
          ))}
          {rows.length === 0 && <li className="px-4 py-3 text-[14px] muted">No agreements yet.</li>}
        </ul>
      </div>
    </main>
  );
}
