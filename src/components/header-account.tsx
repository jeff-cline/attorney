"use client";

import Link from "next/link";
import { SessionProvider, useSession } from "next-auth/react";

/** Session-aware nav rendered on the CLIENT so the header (and every content
 *  page) can prerender as static HTML. Static output shows "Log in"; after
 *  hydration it swaps to Dashboard / My portal / God console for signed-in users. */
function AccountNav() {
  const { data, status } = useSession();
  const role = (data?.user as { role?: string } | undefined)?.role;
  const authed = status === "authenticated";
  const isAdmin = role === "admin";
  const isAttorney = role === "attorney";
  const isArbitrator = role === "arbitrator";
  const home = isArbitrator ? "/arbitrator" : isAttorney ? "/portal" : "/dashboard";
  const homeLabel = isArbitrator ? "Arbitrator" : isAttorney ? "My portal" : "Dashboard";

  return (
    <>
      {isAdmin && (
        <Link href="/admin" className="hidden rounded-full px-3 py-2 font-semibold sm:inline" style={{ color: "var(--seal)" }}>
          God console
        </Link>
      )}
      {authed ? (
        <Link href={home} className="hidden rounded-full px-3 py-2 font-medium hover:text-[var(--brand)] sm:inline">
          {homeLabel}
        </Link>
      ) : (
        <Link href="/auth/login" className="hidden rounded-full px-3 py-2 font-medium hover:text-[var(--brand)] sm:inline">
          Log in
        </Link>
      )}
    </>
  );
}

export function HeaderAccount() {
  return (
    <SessionProvider>
      <AccountNav />
    </SessionProvider>
  );
}
