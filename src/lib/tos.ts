import { desc } from "drizzle-orm";
import { db } from "./db";
import { tosVersions } from "@/db/schema";

export async function currentTos() {
  const [v] = await db
    .select()
    .from(tosVersions)
    .orderBy(desc(tosVersions.effectiveAt))
    .limit(1);
  if (!v) throw new Error("No ToS version seeded — run `npm run db:seed`");
  return v;
}
