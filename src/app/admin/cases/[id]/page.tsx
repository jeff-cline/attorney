import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cases, agreements, users } from "@/db/schema";

export default async function AdminCaseDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await db.query.cases.findFirst({ where: eq(cases.id, id) });
  if (!c) notFound();
  const initiator = await db.query.users.findFirst({
    where: eq(users.id, c.initiatorId),
  });
  const joiner = c.joinerId
    ? await db.query.users.findFirst({ where: eq(users.id, c.joinerId) })
    : null;
  const ags = await db.select().from(agreements).where(eq(agreements.caseId, id));

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold font-mono">{c.inviteCode}</h1>
        <div className="text-sm">Status: {c.status}</div>
      </header>

      <section className="space-y-1 text-sm">
        <div>
          Initiator: {initiator?.email} · agreed:{" "}
          {c.initiatorAgreedAt?.toISOString() ?? "—"}
        </div>
        <div>
          Joiner: {joiner?.email ?? "—"} · agreed:{" "}
          {c.joinerAgreedAt?.toISOString() ?? "—"}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Audit chain rows ({ags.length})</h2>
        <ul className="divide-y divide-black/10 rounded border border-black/10 font-mono text-xs">
          {ags.map((a) => (
            <li key={a.id} className="break-all p-2">
              <div>
                {a.createdAt.toISOString()} · {a.agreementType}
              </div>
              <div className="text-gray-600">prev: {a.prevHash}</div>
              <div className="text-gray-600">row : {a.rowHash}</div>
            </li>
          ))}
          {ags.length === 0 && (
            <li className="p-2 text-gray-500">No agreements yet.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
