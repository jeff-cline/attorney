"use client";
import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 flex items-center gap-3">
      <code
        className="flex-1 rounded-[10px] px-4 py-3 text-center text-[22px] font-semibold tracking-[.12em]"
        style={{ background: "var(--ink)", color: "#fff", fontFamily: "var(--font-geist-sans)" }}
      >
        {code}
      </code>
      <button
        type="button"
        className="btn btn-outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {}
        }}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
