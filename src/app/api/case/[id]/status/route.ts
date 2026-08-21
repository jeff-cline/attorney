import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cases } from "@/db/schema";

// Lightweight status probe for the case-page poller.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await auth();
  const uid = (s?.user as { id?: string } | undefined)?.id;
  if (!uid) return Response.json({ error: "unauth" }, { status: 401 });
  const c = await db.query.cases.findFirst({ where: eq(cases.id, id) });
  if (!c || (c.initiatorId !== uid && c.joinerId !== uid)) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ status: c.status, updatedAt: c.updatedAt.toISOString() }, { headers: { "cache-control": "no-store" } });
}
