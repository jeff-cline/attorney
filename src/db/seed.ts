import { eq } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sha256 } from "@/lib/hash";
import { tosVersions, users } from "./schema";

async function main() {
  const tosBody = readFileSync(
    join(process.cwd(), "src/content/tos/2026-05-08-v1.md"),
    "utf8",
  );

  const existingTos = await db.query.tosVersions.findFirst({
    where: (v, { eq }) => eq(v.version, "2026-05-08-v1"),
  });
  if (!existingTos) {
    await db.insert(tosVersions).values({
      version: "2026-05-08-v1",
      bodyMarkdown: tosBody,
      bodyHash: sha256(tosBody),
    });
    console.log("Seeded ToS version 2026-05-08-v1");
  } else {
    console.log("ToS already seeded");
  }

  const adminEmail = env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });
  if (!existing) {
    await db.insert(users).values({
      email: adminEmail,
      displayName: "Admin",
      role: "admin",
      passwordHash: await bcrypt.hash(env.ADMIN_BOOTSTRAP_PASSWORD, 12),
      emailVerifiedAt: new Date(),
    });
    console.log(`Bootstrapped admin: ${adminEmail}`);
  } else if (existing.role !== "admin") {
    await db.update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
    console.log(`Promoted ${adminEmail} to admin`);
  } else {
    console.log(`Admin ${adminEmail} already exists`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
