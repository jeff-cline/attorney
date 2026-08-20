export function PrelaunchBanner() {
  return (
    <div
      className="px-4 py-2 text-center"
      style={{ background: "var(--ink)", color: "rgba(242,239,231,.9)" }}
    >
      <span
        className="text-[12.5px]"
        style={{ fontFamily: "var(--font-geist-sans)", letterSpacing: ".02em" }}
      >
        <span style={{ color: "var(--seal-2)", fontWeight: 600 }}>Prelaunch</span>
        {" · "}payments are not yet processed{" · "}Attorney.plus is not a law firm and does not provide legal advice
      </span>
    </div>
  );
}
