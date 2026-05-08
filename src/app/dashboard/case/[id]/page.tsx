import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases, users } from "@/db/schema";
import { agreeToArbitration } from "@/actions/cases";

export const dynamic = "force-dynamic";

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/auth/login");

  const c = await db.query.cases.findFirst({ where: eq(cases.id, id) });
  if (!c) notFound();
  if (c.initiatorId !== uid && c.joinerId !== uid) notFound();

  const initiator = await db.query.users.findFirst({
    where: eq(users.id, c.initiatorId),
  });
  const joiner = c.joinerId
    ? await db.query.users.findFirst({ where: eq(users.id, c.joinerId) })
    : null;

  const myAgreed = Boolean(
    (c.initiatorId === uid && c.initiatorAgreedAt) ||
      (c.joinerId === uid && c.joinerAgreedAt),
  );
  const otherAgreed = Boolean(
    c.initiatorId === uid ? c.joinerAgreedAt : c.initiatorAgreedAt,
  );

  async function agree() {
    "use server";
    await agreeToArbitration(id);
    redirect(`/dashboard/case/${id}`);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-8">
      <header className="space-y-1">
        <div className="font-mono text-sm text-gray-600">{c.inviteCode}</div>
        <h1 className="text-2xl font-semibold">Case</h1>
        <p className="text-sm">
          Status: <strong>{c.status}</strong>
        </p>
      </header>

      <section className="space-y-2 rounded border border-black/10 p-4">
        <h2 className="font-medium">Parties</h2>
        <div className="text-sm">
          Initiator: {initiator?.displayName ?? initiator?.email}
        </div>
        <div className="text-sm">
          Joiner:{" "}
          {joiner ? (
            (joiner.displayName ?? joiner.email)
          ) : (
            <em className="text-gray-500">waiting…</em>
          )}
        </div>
      </section>

      {c.status === "pending_join" && c.initiatorId === uid && (
        <section className="space-y-2 rounded border border-black/10 p-4">
          <h2 className="font-medium">Share this code</h2>
          <div className="font-mono text-xl">{c.inviteCode}</div>
          <p className="text-xs text-gray-600">
            Send via text or email. They go to{" "}
            <code className="font-mono">/join</code> and enter the code.
          </p>
        </section>
      )}

      {c.status === "pending_agreements" && (
        <section className="space-y-3 rounded border border-black/10 p-4">
          <h2 className="font-medium">Both parties must agree</h2>
          <p className="text-sm">
            By clicking below you confirm:{" "}
            <em>
              &ldquo;I agree to use Attorney.plus arbitration as defined in the
              current Terms.&rdquo;
            </em>
          </p>
          {myAgreed ? (
            <div className="text-sm text-green-700">
              You agreed.{" "}
              {otherAgreed
                ? "Both parties have agreed — case is ready."
                : "Waiting on the other party."}
            </div>
          ) : (
            <form action={agree}>
              <button className="rounded bg-black px-4 py-2 text-white">
                I agree
              </button>
            </form>
          )}
        </section>
      )}

      {c.status === "ready_for_intake" && (
        <section className="rounded border border-green-300 bg-green-50 p-4">
          <p className="text-sm text-green-800">
            Both parties have agreed. Case advances to intake. (Intake — Slice 2
            — coming soon.)
          </p>
        </section>
      )}
    </main>
  );
}
