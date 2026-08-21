/** Clickable legal citations/references. Each links out to a lookup so the
 *  reader can see the source wherever it's published. AI-suggested — not authority. */
export function CitationList({ citations }: { citations: string[] }) {
  if (!citations || citations.length === 0) {
    return (
      <div>
        <div className="eyebrow mb-2">Legal references</div>
        <p className="muted text-[13px]">No citations on this decision — a neutral (non-cited) resolution was used, likely because the AI engine hadn&apos;t run for this case. Regenerate it from the God console to get cited authorities.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="eyebrow mb-2">Legal citations & references</div>
      <ul className="space-y-2">
        {citations.map((c, i) => (
          <li key={i} className="text-[13.5px]" style={{ lineHeight: 1.4 }}>
            <a href={`https://www.google.com/search?q=${encodeURIComponent(c)}`} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--brand)" }}>
              {c} <span aria-hidden>↗</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="muted mt-3 text-[12px]">AI-suggested — click to look up the source. Verify with a licensed attorney before relying on any authority.</p>
    </div>
  );
}
