"use client";
import { useState } from "react";

/** Copy a referral URL. Shows the full link in a monospace field + a copy button. */
export function CopyLink({ url, label = "Copy link" }: { url: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex items-stretch gap-2">
      <code
        className="flex-1 overflow-x-auto whitespace-nowrap rounded-[10px] px-3 py-2.5 text-[13.5px]"
        style={{ background: "var(--paper-2)", border: "1px solid var(--line)", fontFamily: "ui-monospace, monospace", color: "var(--ink)" }}
      >
        {url}
      </code>
      <button
        type="button"
        className="btn btn-ink"
        style={{ whiteSpace: "nowrap", padding: "0 16px" }}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {}
        }}
      >
        {copied ? "Copied ✓" : label}
      </button>
    </div>
  );
}
