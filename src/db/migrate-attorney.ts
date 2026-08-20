/** One-off: add 'attorney' user role + attorney_profiles table. Idempotent. */
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
  `ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'attorney'`,
  `CREATE TABLE IF NOT EXISTS attorney_profiles (
     user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     firm_name text,
     bar_state varchar(2),
     phone varchar(32),
     specialties jsonb NOT NULL DEFAULT '[]'::jsonb,
     notify_email boolean NOT NULL DEFAULT true,
     post_arb_opt_in boolean NOT NULL DEFAULT true,
     approved boolean NOT NULL DEFAULT false,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
];

(async () => {
  for (const s of statements) {
    await sql.unsafe(s);
    console.log("ok:", s.split("\n")[0].slice(0, 56));
  }
  await sql.end();
  console.log("migrate-attorney complete");
})();
