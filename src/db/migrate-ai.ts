/** One-off: cases.ai_citations column. Idempotent. */
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

(async () => {
  await sql.unsafe(`ALTER TABLE cases ADD COLUMN IF NOT EXISTS ai_citations jsonb NOT NULL DEFAULT '[]'::jsonb`);
  console.log("ok: cases.ai_citations");
  await sql.end();
  console.log("migrate-ai complete");
})();
