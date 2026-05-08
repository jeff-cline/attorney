import { redirect } from "next/navigation";
import Link from "next/link";
import { or, eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  if (!uid) redirect("/auth/login");

  const myCases = await db
    .select()
    .from(cases)
    .where(or(eq(cases.initiatorId, uid), eq(cases.joinerId, uid)))
    .orderBy(desc(cases.updatedAt));

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your cases</h1>
        <Link
          href="/start"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          + New case
        </Link>
      </header>

      <ul className="divide-y divide-black/10 rounded border border-black/10">
        {myCases.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-4">
            <div>
              <div className="font-mono text-sm">{c.inviteCode}</div>
              <div className="text-xs text-gray-600">{c.status}</div>
            </div>
            <Link
              href={`/dashboard/case/${c.id}`}
              className="text-sm underline"
            >
              Open
            </Link>
          </li>
        ))}
        {myCases.length === 0 && (
          <li className="p-4 text-sm text-gray-600">
            No cases yet.{" "}
            <Link className="underline" href="/start">
              Start one
            </Link>
            .
          </li>
        )}
      </ul>
    </main>
  );
}
