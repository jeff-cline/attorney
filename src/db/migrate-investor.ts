/** One-off: investor role + forced-password-change flag + investor_profiles,
 *  and seed a preview investor account. Idempotent. */
import postgres from "postgres";
import { readFileSync } from "node:fs";
import bcrypt from "bcryptjs";

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
  `ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'investor'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false`,
  `CREATE TABLE IF NOT EXISTS investor_profiles (
     user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
     first_name text,
     last_name text,
     phone varchar(32),
     persona varchar(32) NOT NULL DEFAULT 'investor',
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
];

(async () => {
  for (const s of statements) {
    await sql.unsafe(s);
    console.log("ok:", s.split("\n")[0].slice(0, 58));
  }
  // Seed a preview investor login (forced to change password on first login).
  const email = "jeff.cline+investor@me.com";
  const hash = await bcrypt.hash("TEMP!234", 10);
  const existing = await sql`select id from users where email = ${email}`;
  let uid: string;
  if (existing.length) {
    uid = existing[0].id as string;
    await sql`update users set password_hash = ${hash}, role = 'investor', must_change_password = true where id = ${uid}`;
  } else {
    const rows = await sql`insert into users (email, password_hash, display_name, role, must_change_password)
      values (${email}, ${hash}, 'Jeff Cline (Investor preview)', 'investor', true) returning id`;
    uid = rows[0].id as string;
  }
  await sql`insert into investor_profiles (user_id, first_name, last_name, persona)
    values (${uid}, 'Jeff', 'Cline', 'investor')
    on conflict (user_id) do update set persona = 'investor'`;
  console.log("seeded investor preview:", email, "/ TEMP!234 (must change)");

  await sql.end();
  console.log("migrate-investor complete");
})();
