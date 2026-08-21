"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { stopImpersonating } from "@/actions/impersonate";

/** Sticky top bar shown whenever an admin is viewing the app as another user.
 *  Client-rendered via useSession so content pages still prerender static. */
function Banner() {
  const { data } = useSession();
  const su = data?.user as
    | { impersonating?: boolean; email?: string; role?: string; impersonatorEmail?: string }
    | undefined;
  if (!su?.impersonating) return null;
  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 60,
        background: "#7a1f1f", color: "#fff",
        fontFamily: "var(--font-geist-sans)", fontSize: 13.5,
      }}
    >
      <div className="container flex flex-wrap items-center justify-between gap-2" style={{ padding: "9px 24px" }}>
        <span>
          👁️ <b>God view</b> — you are seeing the app as <b>{su.email}</b>
          <span style={{ opacity: 0.8 }}> ({su.role})</span>
          {su.impersonatorEmail ? <span style={{ opacity: 0.7 }}> · admin: {su.impersonatorEmail}</span> : null}
        </span>
        <form action={stopImpersonating}>
          <button
            type="submit"
            style={{ background: "#fff", color: "#7a1f1f", border: "none", borderRadius: 8, padding: "5px 14px", fontWeight: 600, cursor: "pointer" }}
          >
            Return to God console →
          </button>
        </form>
      </div>
    </div>
  );
}

export function ImpersonationBanner() {
  return (
    <SessionProvider>
      <Banner />
    </SessionProvider>
  );
}
