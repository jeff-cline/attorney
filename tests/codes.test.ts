import { describe, it, expect } from "vitest";
import { generateInviteCode, INVITE_CODE_REGEX } from "@/lib/codes";

describe("invite codes", () => {
  it("matches ATTPLUS-XXXXXX format", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCode();
      expect(code).toMatch(INVITE_CODE_REGEX);
    }
  });

  it("uses unambiguous alphabet (no 0/O/1/I)", () => {
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCode();
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  it("is reasonably random across 200 samples", () => {
    const set = new Set<string>();
    for (let i = 0; i < 200; i++) set.add(generateInviteCode());
    expect(set.size).toBe(200);
  });
});
