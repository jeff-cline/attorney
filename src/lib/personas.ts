export const PERSONAS: { value: string; label: string }[] = [
  { value: "attorney", label: "I am an attorney" },
  { value: "consumer", label: "I am a consumer" },
  { value: "investor", label: "I am an investor" },
  { value: "accredited", label: "I am an accredited investor" },
  { value: "fund", label: "I'm a fund" },
  { value: "private_equity", label: "I'm a private equity firm" },
];

export const PERSONA_VALUES = new Set(PERSONAS.map((p) => p.value));

export type AccessResult = { ok: boolean; error?: string; exists?: boolean; email?: string } | null;
