const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const INVITE_CODE_REGEX =
  /^ATTPLUS-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

export function generateInviteCode(): string {
  const buf = new Uint32Array(6);
  crypto.getRandomValues(buf);
  let s = "";
  for (const v of buf) s += ALPHABET[v % ALPHABET.length];
  return `ATTPLUS-${s}`;
}
