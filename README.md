# Attorney.plus

A two-party arbitration platform. Slice 1 ships the **two-party consent gate**:
landing page, asynchronous dual-party signup, ToS acceptance, mutual arbitration
consent, tamper-evident audit chain, and a god admin panel.

> Prelaunch. Not a law firm. Not yet accepting payments. Terms of Service must be
> reviewed by counsel before any production launch.

## Stack

- **Next.js 16** (App Router, TypeScript) — `next dev`, server actions
- **Postgres** (Neon, recommended) via **Drizzle ORM**
- **Auth.js v5** — email + password (JWT sessions)
- **Resend** — transactional email (optional in dev)
- **Tailwind 4** — styling
- **Vitest** — unit tests for hash chain + invite codes

## Local development

```bash
# 1. install
npm install

# 2. env
cp .env.example .env.local
#   Fill in DATABASE_URL (Neon connection string), AUTH_SECRET (openssl rand -hex 32),
#   ADMIN_BOOTSTRAP_PASSWORD, etc.

# 3. database
npm run db:migrate
npm run db:seed   # bootstraps admin user + ToS v1

# 4. run
npm run dev
```

Open <http://localhost:3000>.

## Tests

```bash
npm test
```

Covers audit-chain hash determinism + sensitivity, invite-code format, alphabet,
and uniqueness.

## Production build

```bash
npm run build
npm start
```

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel; framework auto-detected.
3. Set env vars from `.env.example` (real values).
4. Add a Postgres database (Neon/Vercel Postgres) and copy `DATABASE_URL` into Vercel env.
5. Run migrations once against prod DB:
   `DATABASE_URL=... npx drizzle-kit migrate`.
   Then `DATABASE_URL=... npm run db:seed` to bootstrap the admin.
6. Add custom domain `attorney.plus`.

## Docs

- Spec: [`docs/superpowers/specs/2026-05-08-slice-1-two-party-consent-gate.md`](./docs/superpowers/specs/2026-05-08-slice-1-two-party-consent-gate.md)
- Plan: [`docs/superpowers/plans/2026-05-08-slice-1-two-party-consent-gate.md`](./docs/superpowers/plans/2026-05-08-slice-1-two-party-consent-gate.md)

## Layout chrome

- Sticky prelaunch banner (top, every page)
- Header with Start / Join / Log in
- Footer with Terms / Privacy / Contact / **Log in**
- Fixed orange `444` link (bottom-right, every page) → <https://jeff-cline.com>
