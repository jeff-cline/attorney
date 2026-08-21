"use client";

/** "Download PDF" via the browser's print-to-PDF. Keeps the deck/overview a
 *  single source of truth (no separate binary to regenerate). */
export function PrintButton({ label = "Download PDF", className = "btn btn-outline" }: { label?: string; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      {label} ↓
    </button>
  );
}
