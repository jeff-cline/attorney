import { sha256 } from "./hash";

export const GENESIS_HASH = sha256("attorney.plus:genesis");

export type AgreementKind = "platform_tos" | "arbitration_consent" | "decision_accepted";

export type ChainRow = {
  id: string;
  caseId: string | null;
  userId: string;
  agreementType: AgreementKind;
  agreementTextHash: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  prevHash: string;
};

export function canonicalize(row: ChainRow): string {
  return JSON.stringify({
    id: row.id,
    caseId: row.caseId,
    userId: row.userId,
    agreementType: row.agreementType,
    agreementTextHash: row.agreementTextHash,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    createdAt: row.createdAt.toISOString(),
    prevHash: row.prevHash,
  });
}

export function computeRowHash(row: ChainRow): string {
  return sha256(canonicalize(row));
}

export async function appendAgreement(
  input: Omit<ChainRow, "id" | "createdAt" | "prevHash">,
) {
  const { db } = await import("./db");
  const { agreements } = await import("@/db/schema");
  const { desc } = await import("drizzle-orm");

  return db.transaction(async (tx) => {
    const [tail] = await tx
      .select({ rowHash: agreements.rowHash })
      .from(agreements)
      .orderBy(desc(agreements.seq))
      .limit(1);
    const prevHash = tail?.rowHash ?? GENESIS_HASH;
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const rowHash = computeRowHash({ ...input, id, createdAt, prevHash });
    await tx.insert(agreements).values({
      id,
      caseId: input.caseId,
      userId: input.userId,
      agreementType: input.agreementType,
      agreementTextHash: input.agreementTextHash,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      prevHash,
      rowHash,
      createdAt,
    });
    return { id, rowHash, prevHash, createdAt };
  });
}

export async function verifyChain(): Promise<{
  ok: boolean;
  brokenAtId?: string;
  checked: number;
}> {
  const { db } = await import("./db");
  const { agreements } = await import("@/db/schema");

  const rows = await db.select().from(agreements).orderBy(agreements.seq);
  let prev = GENESIS_HASH;
  for (const r of rows) {
    if (r.prevHash !== prev) {
      return { ok: false, brokenAtId: r.id, checked: rows.length };
    }
    const expected = computeRowHash({
      id: r.id,
      caseId: r.caseId,
      userId: r.userId,
      agreementType: r.agreementType,
      agreementTextHash: r.agreementTextHash,
      ipAddress: r.ipAddress,
      userAgent: r.userAgent,
      createdAt: r.createdAt,
      prevHash: r.prevHash,
    });
    if (expected !== r.rowHash) {
      return { ok: false, brokenAtId: r.id, checked: rows.length };
    }
    prev = r.rowHash;
  }
  return { ok: true, checked: rows.length };
}
