/** One-off: arbitrator role + profiles + case assignment fields + case_messages. Idempotent. */
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
  `ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'arbitrator'`,
  `CREATE TABLE IF NOT EXISTS arbitrator_profiles (
     user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     states jsonb NOT NULL DEFAULT '[]'::jsonb,
     national boolean NOT NULL DEFAULT false,
     fee_per_case integer NOT NULL DEFAULT 0,
     system_cut_pct integer NOT NULL DEFAULT 30,
     bio text,
     active boolean NOT NULL DEFAULT true,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  `ALTER TABLE cases ADD COLUMN IF NOT EXISTS arbitrator_id uuid REFERENCES users(id) ON DELETE SET NULL`,
  `ALTER TABLE cases ADD COLUMN IF NOT EXISTS arbitrator_fee integer`,
  `ALTER TABLE cases ADD COLUMN IF NOT EXISTS initiator_arb_fee_paid_at timestamptz`,
  `ALTER TABLE cases ADD COLUMN IF NOT EXISTS joiner_arb_fee_paid_at timestamptz`,
  `CREATE TABLE IF NOT EXISTS case_messages (
     id bigserial PRIMARY KEY,
     case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
     author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     author_role varchar(16) NOT NULL,
     body text NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
];

(async () => {
  for (const s of statements) {
    await sql.unsafe(s);
    console.log("ok:", s.split("\n")[0].slice(0, 58));
  }
  await sql.end();
  console.log("migrate-arbitrator complete");
})();
