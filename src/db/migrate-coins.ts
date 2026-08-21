/** One-off: A+COIN referral program — attorney ref codes, case attribution,
 *  and the coin ledger. Idempotent. */
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
  `ALTER TABLE attorney_profiles ADD COLUMN IF NOT EXISTS ref_code varchar(16)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS attorney_profiles_ref_code_uq ON attorney_profiles(ref_code)`,
  `ALTER TABLE cases ADD COLUMN IF NOT EXISTS referred_by_attorney_id uuid REFERENCES users(id) ON DELETE SET NULL`,
  `CREATE TABLE IF NOT EXISTS coin_ledger (
     id bigserial PRIMARY KEY,
     attorney_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     delta integer NOT NULL,
     reason varchar(40) NOT NULL,
     case_id uuid REFERENCES cases(id) ON DELETE SET NULL,
     note text,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS coin_ledger_event_uq ON coin_ledger(attorney_id, case_id, reason)`,
];

(async () => {
  for (const s of statements) {
    await sql.unsafe(s);
    console.log("ok:", s.split("\n")[0].slice(0, 58));
  }
  await sql.end();
  console.log("migrate-coins complete");
})();
