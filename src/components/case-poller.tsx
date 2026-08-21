"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Polls the case status; when the OTHER party moves, soft-refreshes the page
 *  and shows a brief "updated" toast — so both browsers stay in sync without a
 *  manual reload. */
export function CasePoller({ caseId, updatedAt }: { caseId: string; updatedAt: string }) {
  const router = useRouter();
  const base = useRef(updatedAt);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    base.current = updatedAt; // re-baseline after each soft refresh
  }, [updatedAt]);

  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`/api/case/${caseId}/status`, { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as { updatedAt?: string };
        if (j.updatedAt && j.updatedAt !== base.current) {
          base.current = j.updatedAt;
          setFlash(true);
          router.refresh();
          setTimeout(() => setFlash(false), 4500);
        }
      } catch {
        /* offline / transient — ignore */
      }
    }, 10000);
    return () => clearInterval(iv);
  }, [caseId, router]);

  if (!flash) return null;
  return (
    <div
      role="status"
      style={{
        position: "fixed", right: 20, bottom: 20, zIndex: 60,
        background: "var(--brand)", color: "#fff", borderRadius: 12,
        padding: "12px 16px", fontSize: 14, fontWeight: 600,
        boxShadow: "0 12px 30px -12px rgba(15,42,45,.5)",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      ↻ The other party made a move — updated.
    </div>
  );
}
