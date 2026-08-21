import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  pgEnum,
  index,
  uniqueIndex,
  primaryKey,
  integer,
  bigserial,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["user", "admin", "attorney", "arbitrator"]);
export const caseStatus = pgEnum("case_status", [
  // legacy values kept so existing rows remain valid
  "pending_join",
  "pending_agreements",
  "ready_for_intake",
  "voided",
  // arbitration funnel
  "awaiting_initiator_payment", // plaintiff started — must pay their share to unlock the code
  "awaiting_joiner_payment",    // respondent joined — must pay their half
  "pending_disputes",           // both agreed to terms — each submits their account
  "summary_review",             // neutral summary generated — both approve
  "ai_decision",                // AI-assisted proposed resolution — both accept or one disagrees
  "resolved",                   // both accepted a decision (AI or arbitrator)
  "arbitration",                // escalated — awaiting professional arbitrator's ruling
  "arbitration_ruling",         // arbitrator ruled — both accept or one disagrees
  "litigation",                 // escalated to attorneys — independent counsel per side
]);
export const agreementType = pgEnum("agreement_type", [
  "platform_tos",
  "arbitration_consent",
  "decision_accepted", // binding acceptance of an AI or arbitrator decision
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  displayName: text("display_name"),
  role: userRole("role").notNull().default("user"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tosVersions = pgTable("tos_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  version: text("version").notNull().unique(),
  bodyMarkdown: text("body_markdown").notNull(),
  bodyHash: varchar("body_hash", { length: 64 }).notNull(),
  effectiveAt: timestamp("effective_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tosAcceptances = pgTable(
  "tos_acceptances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    tosVersionId: uuid("tos_version_id")
      .notNull()
      .references(() => tosVersions.id),
    acceptedAt: timestamp("accepted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (t) => [index("tos_acc_user_idx").on(t.userId)],
);

export const cases = pgTable(
  "cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    inviteCode: varchar("invite_code", { length: 16 }).notNull(),
    initiatorId: uuid("initiator_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    joinerId: uuid("joiner_id").references(() => users.id, {
      onDelete: "restrict",
    }),
    status: caseStatus("status").notNull().default("awaiting_initiator_payment"),
    subject: text("subject"), // short description of the dispute
    category: varchar("category", { length: 120 }), // referral-category slug the consumer picked (connects to attorney bidding)
    jurisdiction: varchar("jurisdiction", { length: 40 }), // US state where the dispute arose (for AI to apply the right law)
    referredByAttorneyId: uuid("referred_by_attorney_id").references(() => users.id, { onDelete: "set null" }), // attorney whose referral link started this case
    initiatorAgreedAt: timestamp("initiator_agreed_at", { withTimezone: true }),
    joinerAgreedAt: timestamp("joiner_agreed_at", { withTimezone: true }),
    // payment gates (stubbed free until Stripe; timestamp = paid/confirmed)
    initiatorPaidAt: timestamp("initiator_paid_at", { withTimezone: true }),
    joinerPaidAt: timestamp("joiner_paid_at", { withTimezone: true }),
    // neutral summary of both positions
    neutralSummary: text("neutral_summary"),
    initiatorSummaryOkAt: timestamp("initiator_summary_ok_at", { withTimezone: true }),
    joinerSummaryOkAt: timestamp("joiner_summary_ok_at", { withTimezone: true }),
    // AI-assisted proposed resolution
    aiDecision: text("ai_decision"),
    aiCitations: jsonb("ai_citations").$type<string[]>().notNull().default([]),
    aiDecisionAt: timestamp("ai_decision_at", { withTimezone: true }),
    aiPromptTokens: integer("ai_prompt_tokens"),
    aiCompletionTokens: integer("ai_completion_tokens"),
    aiCostMicros: integer("ai_cost_micros"), // cost of the AI decision in USD millionths
    initiatorDecision: varchar("initiator_decision", { length: 10 }), // 'agree' | 'disagree'
    joinerDecision: varchar("joiner_decision", { length: 10 }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    // escalation → professional arbitrator
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),
    arbitratorId: uuid("arbitrator_id").references(() => users.id, { onDelete: "set null" }),
    arbitratorFee: integer("arbitrator_fee"), // total $ set by God for this case
    initiatorArbFeePaidAt: timestamp("initiator_arb_fee_paid_at", { withTimezone: true }),
    joinerArbFeePaidAt: timestamp("joiner_arb_fee_paid_at", { withTimezone: true }),
    arbitratorRuling: text("arbitrator_ruling"),
    arbitratorRuledAt: timestamp("arbitrator_ruled_at", { withTimezone: true }),
    initiatorArbOkAt: timestamp("initiator_arb_ok_at", { withTimezone: true }),
    joinerArbOkAt: timestamp("joiner_arb_ok_at", { withTimezone: true }),
    // escalation → litigation
    litigationAt: timestamp("litigation_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("cases_invite_code_uq").on(t.inviteCode),
    index("cases_initiator_idx").on(t.initiatorId),
    index("cases_joiner_idx").on(t.joinerId),
  ],
);

export const agreements = pgTable(
  "agreements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    seq: bigserial("seq", { mode: "number" }).notNull(),
    caseId: uuid("case_id").references(() => cases.id, {
      onDelete: "restrict",
    }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    agreementType: agreementType("agreement_type").notNull(),
    agreementTextHash: varchar("agreement_text_hash", { length: 64 }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    prevHash: varchar("prev_hash", { length: 64 }).notNull(),
    rowHash: varchar("row_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("agreements_seq_uq").on(t.seq),
    index("agreements_case_idx").on(t.caseId),
    index("agreements_user_idx").on(t.userId),
  ],
);

export const disputeStatements = pgTable(
  "dispute_statements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    statement: text("statement").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("dispute_case_user_uq").on(t.caseId, t.userId),
    index("dispute_case_idx").on(t.caseId),
  ],
);

export const emailLog = pgTable("email_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  toEmail: text("to_email").notNull(),
  template: text("template").notNull(),
  payload: text("payload").notNull(),
  resendMessageId: text("resend_message_id"),
  error: text("error"),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Auth.js Drizzle adapter tables ---

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// Simple key/value store for God-controlled toggles (e.g. attorney_show_percentage).
export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 80 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Professional arbitrator profile (role = 'arbitrator'). God sets fee + coverage.
export const arbitratorProfiles = pgTable("arbitrator_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  states: jsonb("states").$type<string[]>().notNull().default([]), // 2-letter codes; empty + national=false = none
  national: boolean("national").notNull().default(false),
  feePerCase: integer("fee_per_case").notNull().default(0), // God-set default fee ($)
  systemCutPct: integer("system_cut_pct").notNull().default(30), // platform keeps this %; arbitrator gets the rest
  bio: text("bio"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Follow-up Q&A thread on a case (arbitrator asks; parties answer).
export const caseMessages = pgTable("case_messages", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  caseId: uuid("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  authorRole: varchar("author_role", { length: 16 }).notNull(), // 'arbitrator' | 'party'
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Referral-network attorney profile (role = 'attorney'). specialties = category slugs.
export const attorneyProfiles = pgTable("attorney_profiles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  firmName: text("firm_name"),
  barState: varchar("bar_state", { length: 2 }),
  phone: varchar("phone", { length: 32 }),
  specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
  notifyEmail: boolean("notify_email").notNull().default(true),
  postArbOptIn: boolean("post_arb_opt_in").notNull().default(true),
  approved: boolean("approved").notNull().default(false),
  // Premium Partner: $/mo for exclusive rights to one niche (category) in one state.
  tier: varchar("tier", { length: 16 }).notNull().default("free"), // 'free' | 'premium'
  exclusiveCategory: varchar("exclusive_category", { length: 120 }),
  exclusiveState: varchar("exclusive_state", { length: 2 }),
  premiumSince: timestamp("premium_since", { withTimezone: true }),
  refCode: varchar("ref_code", { length: 16 }).unique(), // personal referral code -> /start?ref=<code>
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// A+COIN loyalty ledger. 1 coin = $1 credit toward future lead-referral fees.
// Positive = earned (referral signup / paid), negative = redeemed.
// Unique (attorneyId, caseId, reason) prevents double-awarding for the same event.
export const coinLedger = pgTable(
  "coin_ledger",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    attorneyId: uuid("attorney_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(), // coins +/-
    reason: varchar("reason", { length: 40 }).notNull(), // 'referral_signup' | 'referral_paid' | 'redeemed' | 'adjust'
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ uniqEvent: uniqueIndex("coin_ledger_event_uq").on(t.attorneyId, t.caseId, t.reason) })
);
