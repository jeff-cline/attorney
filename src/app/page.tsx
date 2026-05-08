import Link from "next/link";
import { landing } from "@/content/landing";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl space-y-16 px-6 py-16">
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {landing.hero.title}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          {landing.hero.sub}
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href={landing.hero.ctaPrimary.href}
            className="rounded bg-black px-5 py-2.5 text-white"
          >
            {landing.hero.ctaPrimary.label}
          </Link>
          <Link
            href={landing.hero.ctaSecondary.href}
            className="rounded border border-black/20 px-5 py-2.5"
          >
            {landing.hero.ctaSecondary.label}
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {landing.steps.map((s) => (
          <article
            key={s.title}
            className="rounded border border-black/10 p-5"
          >
            <h3 className="mb-2 font-medium">{s.title}</h3>
            <p className="text-sm text-gray-600">{s.body}</p>
          </article>
        ))}
      </section>

      <p className="mx-auto max-w-xl text-center text-xs text-gray-500">
        {landing.notice}
      </p>
    </main>
  );
}
