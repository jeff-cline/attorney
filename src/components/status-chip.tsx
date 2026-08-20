const MAP: Record<string, { label: string; cls: string }> = {
  awaiting_initiator_payment: { label: "Awaiting your payment", cls: "chip-seal" },
  awaiting_joiner_payment: { label: "Awaiting payment", cls: "chip-seal" },
  pending_join: { label: "Awaiting the other party", cls: "chip-active" },
  pending_agreements: { label: "Accepting terms", cls: "chip-active" },
  pending_disputes: { label: "Statements", cls: "chip-active" },
  summary_review: { label: "Summary review", cls: "chip-active" },
  ai_decision: { label: "Proposed resolution", cls: "chip-seal" },
  resolved: { label: "Resolved", cls: "chip-agreed" },
  arbitration: { label: "In arbitration", cls: "chip-escalate" },
  arbitration_ruling: { label: "Ruling issued", cls: "chip-active" },
  litigation: { label: "With attorneys", cls: "chip-escalate" },
  ready_for_intake: { label: "In progress", cls: "chip-active" },
  voided: { label: "Voided", cls: "chip-pending" },
};

export function StatusChip({ status }: { status: string }) {
  const m = MAP[status] ?? { label: status.replace(/_/g, " "), cls: "chip-pending" };
  return (
    <span className={`chip ${m.cls}`}>
      <span className="chip-dot" />
      {m.label}
    </span>
  );
}
