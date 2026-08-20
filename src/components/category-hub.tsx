import Link from "next/link";
import { GROUPS, categoriesInGroup } from "@/content/referral-categories";
import { VARIANT, twin, type Variant } from "@/content/silo-copy";
import { DualCTA } from "@/components/dual-cta";

/** Shared grouped category picker for /attorneys and /lawyers. */
export function CategoryHub({ variant }: { variant: Variant }) {
  const v = VARIANT[variant];
  const tw = VARIANT[twin(variant)];
  return (
    <main className="container" style={{ maxWidth: 1040, padding: "48px 24px 88px" }}>
      <header className="max-w-[720px]">
        <div className="eyebrow">Find your category</div>
        <h1 className="mt-2 text-[clamp(30px,5vw,46px)]">
          {v.word === "lawyer" ? "Find a lawyer for your situation" : "Find an attorney for your need"}
        </h1>
        <p className="muted mt-4" style={{ fontSize: 17, lineHeight: 1.6 }}>
          Choose the category that fits your matter. That&apos;s the same category {v.plural} in our network sign up to handle — so you&apos;re connected to a {v.word} who does exactly this. Many disputes can be resolved even faster with Quick-Resolve arbitration first.
        </p>
        <p className="mt-3 text-[14px]">
          Also searching for a <Link href={tw.path} className="underline font-semibold" style={{ color: "var(--brand)" }}>{tw.word}</Link>? Browse the {tw.word} directory →
        </p>
      </header>

      <div className="mt-9 space-y-9">
        {GROUPS.map((g) => {
          const cats = categoriesInGroup(g.slug);
          if (cats.length === 0) return null;
          return (
            <section key={g.slug} aria-labelledby={`h-${g.slug}`}>
              <div className="flex items-center gap-3">
                <span aria-hidden style={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 9, background: g.accent, color: "#fff", fontFamily: "var(--font-fraunces)", fontSize: 13, fontWeight: 600 }}>{g.monogram}</span>
                <h2 id={`h-${g.slug}`} style={{ fontSize: 21, margin: 0 }}>{g.name}</h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {cats.map((c) => (
                  <Link key={c.slug} href={`${v.path}/${c.slug}`} className="chip chip-pending" style={{ fontSize: 13.5, padding: "7px 13px" }}>
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-11"><DualCTA /></div>
    </main>
  );
}
