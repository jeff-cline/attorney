/**
 * One-off migration for the arbitration engine (slice 2).
 * Adds funnel enum values, case columns, and the dispute_statements table.
 * Each statement autocommits (neon-http), so enum ADD VALUE is safe.
 * Run: DATABASE_URL=... npx tsx src/db/migrate-engine.ts
 */
import postgres from "postgres";
import { readFileSync } from "node:fs";

// Load .env from cwd if DATABASE_URL isn't already in the environment.
if (!process.env.DATABASE_URL) {
  try {
    for (const line of readFileSync(".env", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  } catch {}
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const sql = postgres(url, { prepare: false, max: 1 });

const statements: string[] = [
  // ── funnel enum values ──
  "ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'awaiting_initiator_payment'",
  "ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'awaiting_joiner_payment'",
  "ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'pending_disputes'",
  "ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'summary_review'",
  "ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'ai_decision'",
  "ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'resolved'",
  "ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'arbitration'",
  "ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'arbitration_ruling'",
  "ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'litigation'",
  "ALTER TYPE agreement_type ADD VALUE IF NOT EXISTS 'decision_accepted'",
  // ── case columns ──
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS subject text",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS initiator_paid_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS joiner_paid_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS neutral_summary text",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS initiator_summary_ok_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS joiner_summary_ok_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS ai_decision text",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS ai_decision_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS initiator_decision varchar(10)",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS joiner_decision varchar(10)",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS resolved_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS escalated_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS arbitrator_ruling text",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS arbitrator_ruled_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS initiator_arb_ok_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS joiner_arb_ok_at timestamptz",
  "ALTER TABLE cases ADD COLUMN IF NOT EXISTS litigation_at timestamptz",
  "ALTER TABLE cases ALTER COLUMN status SET DEFAULT 'awaiting_initiator_payment'",
  // ── dispute statements ──
  `CREATE TABLE IF NOT EXISTS dispute_statements (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
     user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
     statement text NOT NULL,
     submitted_at timestamptz NOT NULL DEFAULT now()
   )`,
  "CREATE UNIQUE INDEX IF NOT EXISTS dispute_case_user_uq ON dispute_statements (case_id, user_id)",
  "CREATE INDEX IF NOT EXISTS dispute_case_idx ON dispute_statements (case_id)",
];

const run = async () => {
  for (const s of statements) {
    try {
      await sql.unsafe(s);
      console.log("ok  ", s.replace(/\s+/g, " ").slice(0, 68));
    } catch (e) {
      console.error("ERR ", s.replace(/\s+/g, " ").slice(0, 68), "→", (e as Error).message);
    }
  }
  await sql.end();
  console.log("migration complete");
};
run();
