# Slice 1 — Two-Party Consent Gate

**Date:** 2026-05-08
**Status:** Spec, pending user review
**Project:** Attorney.plus
**Repo:** git@github.com:jeff-cline/attorney.git
**Deploy:** Vercel → custom domain `attorney.plus`

## Goal

Ship the legal foundation of Attorney.plus to a live URL: a public landing page and an asynchronous two-party consent gate where two disputing parties each create an account, both accept the platform Terms of Service, and both explicitly agree to use Attorney.plus arbitration. Every consent is recorded in a tamper-evident audit log. Until both parties have agreed, no case advances. A god admin account can drill into every record.

This slice is the trust spine. Everything later (AI arbitration, attorney marketplace, payments, affiliates) will hang off these consent records.

## Non-Goals (deferred to later slices)

- AI arbitration engine, dispute summarization
- Arbitrator workflow and arbitrator accounts
- Attorney marketplace, blind bidding, auto-assignment
- Affiliate tracking, payouts, link management
- Stripe/PayPal charging (SDK installed, not active)
- Multi-language, mobile apps

Stub pages with "Coming soon" exist where the funnel will eventually go, so the future flow is visible.

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router, TypeScript) | One codebase: marketing, app, admin |
| Hosting | Vercel | Auto-deploy on git push, custom domain |
| Database | Neon Postgres | Free tier, branchable, serverless |
| ORM | Drizzle | Typed, no codegen daemon |
| Auth | Auth.js v5 (credentials + magic-link) | Email+password (god account needs password); magic-link for recovery |
| Email | Resend | Magic links, party-action notifications |
| UI | Tailwind + shadcn/ui | Fast, consistent, accessible |
| Validation | Zod | Server-action input validation |
| Hashing | bcrypt (passwords), SHA-256 (audit chain) | Standard |

## Async-First Principle

The two parties **never need to be online at the same time**. The system is built around asynchronous handoffs:

- Each party has a dashboard showing their case status and what's waiting on whom.
- Resend emails fire on every state-change relevant to the other party ("Party B has joined", "Party A has agreed — your turn", "Both parties agreed — case is ready for intake").
- A case is durable: parties can return days later, log in, and resume from the exact state.

## User Stories

### Initiator (Party A)
1. Lands on `attorney.plus`, clicks "Start a Case."
2. Creates account (email + password) and accepts ToS (recorded with timestamp, IP, user-agent, ToS version hash).
3. System creates a new case, generates an `ATTPLUS-XXXXXX` invite code, and shows a share screen ("Send this code to the other party"). Options: copy link, copy code, send via email (Resend).
4. Sees case dashboard: "Waiting for the other party to join."
5. Receives email when Party B joins: "Party B has joined. Please review and click 'I agree to use Attorney.plus arbitration.'"
6. Logs back in, clicks Agree (recorded with timestamp, IP, UA, agreement-text hash).
7. Receives email when both parties have agreed: "Both parties have agreed. Case advances to intake."

### Joiner (Party B)
1. Receives code/link out-of-band (text, email, etc.) — Slice 1 doesn't manage that channel.
2. Lands on `attorney.plus`, clicks "I have an Attorney.plus code."
3. Enters code → sees minimal case info (initiator name only, case ID, prelaunch notice) → creates account → accepts ToS.
4. Lands on case dashboard, clicks "I agree to use Attorney.plus arbitration."
5. Receives confirmation email; sees "Both parties have agreed" status.

### Admin (God)
1. Logs in as `jeff.cline@me.com` with the seeded password.
2. Admin nav: Users, Cases, Audit Log, ToS Versions.
3. Drills user → cases → agreements (full chain with hashes, timestamps, IPs, UAs).
4. Can deactivate a user, void a case, view audit chain integrity status.

## Data Model

```
users
  id (uuid)
  email (unique, citext)
  password_hash (bcrypt, nullable for magic-link-only users)
  display_name
  role ('user' | 'admin')
  created_at, updated_at
  email_verified_at

tos_versions
  id (uuid)
  version (e.g. "2026-05-08-v1")
  body_markdown (the actual ToS text shown)
  body_hash (sha256 of body_markdown)
  effective_at
  created_at

tos_acceptances
  id (uuid)
  user_id → users.id
  tos_version_id → tos_versions.id
  accepted_at
  ip_address
  user_agent

cases
  id (uuid)
  invite_code (e.g. "ATTPLUS-XXXXXX", unique)
  initiator_id → users.id
  joiner_id → users.id, nullable until joined
  status ('pending_join' | 'pending_agreements' | 'ready_for_intake' | 'voided')
  initiator_agreed_at (timestamp, nullable)
  joiner_agreed_at (timestamp, nullable)
  created_at, updated_at

agreements (the audit chain — append-only)
  id (uuid)
  case_id → cases.id
  user_id → users.id
  agreement_type ('platform_tos' | 'arbitration_consent')
  agreement_text_hash (sha256)
  ip_address
  user_agent
  created_at
  prev_hash (sha256 of the previous row globally; first row = sha256("genesis"))
  row_hash (sha256 of this row's canonicalized fields incl. prev_hash)

  -- DB trigger or service-layer guard prevents UPDATE/DELETE.

email_log (for debugging async notifications)
  id, to_email, template, payload_json, sent_at, resend_message_id
```

### Audit chain integrity

Every consent action (ToS acceptance, arbitration consent) inserts a row into `agreements`. Each row's `prev_hash` is the previous row's `row_hash` (globally ordered by `created_at, id`). Tampering with any historical row breaks the chain. Admin's audit-log page runs `verifyChain()` on demand and shows a green/red badge. This is a simple, self-auditable scheme; we are not claiming notary-grade evidentiary value, just internal tamper-evidence sufficient to spot accidental or insider modification.

## Routes

```
/                              public landing (hero, how-it-works, prelaunch banner, footer login link)
/start                         initiator: creates account + case
/join                          joiner: enters invite code
/auth/login                    login (email + password, "send me a magic link" fallback)
/auth/signup                   covered by /start and /join entry points
/auth/verify-email             magic-link callback
/dashboard                     party's case list and per-case status
/dashboard/case/[id]           case detail: agreement buttons, status, party list
/admin                         admin home (counts, integrity badge)
/admin/users                   list + drill
/admin/users/[id]              user detail + their cases
/admin/cases                   list + drill
/admin/cases/[id]              case detail + full agreement chain
/admin/audit                   raw chain viewer with verifyChain() runner
/admin/tos                     ToS versions, publish new version

/api/auth/*                    Auth.js
/api/cases/create              server action wrapper (initiator)
/api/cases/join                server action wrapper (joiner)
/api/cases/[id]/agree          server action wrapper (consent)
```

Server actions preferred over REST where Next.js supports them; thin API routes only where needed (Auth.js, webhooks later).

## Auth Flow

- **Email + password** primary. bcrypt cost 12. Min 12 chars, no other rules (NIST modern guidance).
- **Magic link** as fallback / recovery via Resend.
- **Sessions** stored in Postgres (Auth.js Drizzle adapter), 30-day rolling.
- **God admin seeding:** on first deploy/migration, if no admin exists, insert user `jeff.cline@me.com` with role `admin` and the password supplied via `ADMIN_BOOTSTRAP_PASSWORD` env var (set to `F!reHors3` in Vercel; rotated post-launch). One-time bootstrap, idempotent.
- **Authorization:** every admin route checks `session.user.role === 'admin'` server-side.

## Notifications (Resend)

Templates for Slice 1:
1. Magic-link login
2. Email verification
3. "Your code is ready" (initiator after case creation, optional self-send for safekeeping)
4. "Party B has joined your case" → initiator
5. "Party A is waiting for your agreement" → joiner after they create account
6. "The other party has agreed — your turn" → whichever hasn't agreed
7. "Both parties have agreed — case advances to intake" → both

All sends logged to `email_log`. In dev, send to Resend test inbox.

## UI Specifics

- **Footer (every page):** prelaunch disclaimer, links (Terms, Privacy, Contact, **Log in**), copyright.
- **Fixed bottom-right element (every page):** small orange link reading `444` linking to `https://jeff-cline.com`. Fixed position, `bottom: 16px; right: 16px`, `text-orange-500`, hover underline, `aria-label="444"`. Z-index above content but below modals.
- **Prelaunch banner:** sticky top, amber/yellow, "Prelaunch — not yet accepting payments. For demonstration only."
- **Mobile responsive** by default (Tailwind).

## Security & Compliance Notes

- HTTPS only (Vercel default).
- `secure`, `httpOnly`, `sameSite=lax` cookies.
- CSRF protection via Auth.js + Next.js server-action origin checks.
- Rate-limit `/auth/*` and code-entry on `/join` via Vercel KV or upstash (3rd-party, can defer to Slice 2 — Slice 1 ships without rate limit but logs IP).
- Passwords never logged.
- ToS acceptance is durable: even if a user deletes their account later, the `tos_acceptances` row is retained (anonymized by setting user_id null) for legal record.
- **Disclaimer copy on every page:** "Attorney.plus is not a law firm and does not provide legal advice. Use of this platform does not create an attorney-client relationship."

## Acceptance Criteria

Before declaring Slice 1 done, these must all pass:

1. `https://attorney.plus` loads the landing page over HTTPS with a valid certificate.
2. Open two separate browsers (or incognito + normal). Browser 1: create case as Party A, get an `ATTPLUS-XXXXXX` code. Browser 2: enter that code, create Party B account. Both create succeeds.
3. Both parties click "I agree to use Attorney.plus arbitration." Case status transitions: `pending_join` → `pending_agreements` → `ready_for_intake`.
4. Each agreement appears in `agreements` table with valid hash chain. `verifyChain()` returns OK.
5. Resend emails are logged in `email_log` for each notification trigger.
6. Admin login as `jeff.cline@me.com` works; `/admin` shows correct counts; drill into user → case → agreement chain works.
7. Footer login link present on `/`. Orange `444` link present at bottom-right of `/`, `/dashboard`, `/admin`, links to `https://jeff-cline.com`, opens in new tab with `rel="noopener"`.
8. Prelaunch banner visible on every page.
9. Lighthouse on `/`: Performance ≥ 90, Accessibility ≥ 95.
10. `git push` to `git@github.com:jeff-cline/attorney.git` triggers a Vercel deploy that goes green.
11. Custom domain `attorney.plus` resolves to the Vercel deployment.

## Out of Scope (Explicit)

- Building the AI arbitration engine
- Arbitrator/attorney/affiliate roles (DB has only `user` and `admin`)
- Any payment processing
- File uploads (no document upload yet)
- Mobile push notifications
- SMS

## Open Items the User Owns

- Domain `attorney.plus` registration & DNS pointing at Vercel (I'll provide the exact records).
- Vercel account creation, GitHub auth to repo.
- Neon Postgres account creation, paste connection string into Vercel env.
- Resend account, API key into Vercel env.
- Confirming bootstrap admin password before first deploy (default `F!reHors3` per chat).
- A real lawyer reviews the Terms of Service before any production launch.

## Risk Register

| Risk | Mitigation |
|---|---|
| ToS legality (UPL, lawyer-referral rules) | Prelaunch banner; no payments; legal review before Slice 4 |
| Hash-chain misuse (claimed as forensic evidence) | Doc explicitly says "internal tamper-evidence", not notary-grade |
| Email deliverability | Resend with verified domain; magic-link is the only email-dependent flow in Slice 1 |
| Code-collision on `ATTPLUS-XXXXXX` | 6-char base32 (~1B combos), uniqueness check on insert with retry |
| Admin password bootstrap leaked in env | Rotate immediately after first login; document in admin settings |
