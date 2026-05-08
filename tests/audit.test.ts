import { describe, it, expect } from "vitest";
import { computeRowHash, GENESIS_HASH, canonicalize } from "@/lib/audit";

describe("audit chain", () => {
  it("produces a 64-char hex hash deterministically", () => {
    const row = {
      id: "00000000-0000-0000-0000-000000000001",
      caseId: "00000000-0000-0000-0000-000000000002",
      userId: "00000000-0000-0000-0000-000000000003",
      agreementType: "arbitration_consent" as const,
      agreementTextHash: "a".repeat(64),
      ipAddress: "127.0.0.1",
      userAgent: "vitest",
      createdAt: new Date("2026-05-08T00:00:00Z"),
      prevHash: GENESIS_HASH,
    };
    const a = computeRowHash(row);
    const b = computeRowHash(row);
    expect(a).toEqual(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("changes when any field changes", () => {
    const base = {
      id: "x",
      caseId: "y",
      userId: "z",
      agreementType: "platform_tos" as const,
      agreementTextHash: "h",
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(0),
      prevHash: GENESIS_HASH,
    };
    const baseHash = computeRowHash(base);
    expect(computeRowHash({ ...base, agreementTextHash: "h2" })).not.toEqual(
      baseHash,
    );
    expect(computeRowHash({ ...base, prevHash: "f".repeat(64) })).not.toEqual(
      baseHash,
    );
    expect(computeRowHash({ ...base, caseId: null })).not.toEqual(baseHash);
  });

  it("canonicalize is stable JSON", () => {
    const row = {
      id: "1",
      caseId: null,
      userId: "u",
      agreementType: "platform_tos" as const,
      agreementTextHash: "h",
      ipAddress: null,
      userAgent: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      prevHash: GENESIS_HASH,
    };
    expect(canonicalize(row)).toEqual(
      JSON.stringify({
        id: "1",
        caseId: null,
        userId: "u",
        agreementType: "platform_tos",
        agreementTextHash: "h",
        ipAddress: null,
        userAgent: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        prevHash: GENESIS_HASH,
      }),
    );
  });
});
