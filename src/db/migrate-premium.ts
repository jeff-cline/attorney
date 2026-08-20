/** One-off: attorney premium tier + exclusivity columns. Idempotent. */
import postgres from "postgres";
import { readFileSync } from "node:fs";

if (!process.env.DATABASE_URL) {
  for (const l of readFileSync(".env", "utf8").split("\n")) {
    const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) {
      let v = m[2].trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
}

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });

const statements = [
  `ALTER TABLE attorney_profiles ADD COLUMN IF NOT EXISTS tier varchar(16) NOT NULL DEFAULT 'free'`,
  `ALTER TABLE attorney_profiles ADD COLUMN IF NOT EXISTS exclusive_category varchar(120)`,
  `ALTER TABLE attorney_profiles ADD COLUMN IF NOT EXISTS exclusive_state varchar(2)`,
  `ALTER TABLE attorney_profiles ADD COLUMN IF NOT EXISTS premium_since timestamptz`,
];

(async () => {
  for (const s of statements) {
    await sql.unsafe(s);
    console.log("ok:", s.slice(0, 62));
  }
  await sql.end();
  console.log("migrate-premium complete");
})();
