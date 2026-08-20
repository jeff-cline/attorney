/** One-off: add app_settings table + cases.category column. Idempotent. */
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
  `CREATE TABLE IF NOT EXISTS app_settings (
     key varchar(80) PRIMARY KEY,
     value text NOT NULL,
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `ALTER TABLE cases ADD COLUMN IF NOT EXISTS category varchar(120)`,
];

(async () => {
  for (const s of statements) {
    await sql.unsafe(s);
    console.log("ok:", s.split("\n")[0].slice(0, 60));
  }
  await sql.end();
  console.log("migrate-categories complete");
})();
