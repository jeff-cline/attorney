import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="dark-section" style={{ padding: "56px 0 34px" }}>
      <div className="container">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="grid h-8 w-8 place-items-center rounded-[9px] text-[15px] font-semibold text-white"
                style={{ background: "var(--brand)", fontFamily: "var(--font-fraunces)" }}
              >
                A
              </span>
              <span className="text-[19px] font-semibold text-white" style={{ fontFamily: "var(--font-fraunces)" }}>
                Attorney<span style={{ color: "var(--seal-2)" }}>.plus</span>
              </span>
            </div>
            <p className="muted mt-4 max-w-[34ch] text-[14.5px] leading-relaxed">
              A neutral platform for resolving disputes by agreement — with professional
              arbitration and attorney referrals if you need them.
            </p>
          </div>

          <FooterCol title="Resolve" links={[
            { label: "Start a case", href: "/start" },
            { label: "I have a code", href: "/join" },
            { label: "Log in", href: "/auth/login" },
          ]} />
          <FooterCol title="Company" links={[
            { label: "Terms", href: "/tos" },
            { label: "Privacy", href: "/privacy" },
            { label: "Contact", href: "/contact" },
          ]} />
          <FooterCol title="Partners" links={[
            { label: "Attorneys — join our referral program", href: "/contact" },
            { label: "Advertise with us", href: "/contact" },
          ]} />
        </div>

        <div
          className="mt-10 flex flex-col justify-between gap-2 border-t pt-6 text-[13px] sm:flex-row"
          style={{ borderColor: "rgba(255,255,255,.14)", color: "rgba(242,239,231,.55)" }}
        >
          <span>© {new Date().getFullYear()} Attorney.plus — not a law firm. Not legal advice.</span>
          <span>Resolve disputes fairly — by agreement first.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold uppercase tracking-[.1em] text-white" style={{ fontFamily: "var(--font-geist-sans)" }}>
        {title}
      </h4>
      <nav className="mt-3 flex flex-col gap-2">
        {links.map((l) => (
          <Link key={l.label} href={l.href} className="muted text-[14px] hover:text-[var(--seal-2)]">
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
