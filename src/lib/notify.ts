import { sendTemplated } from "@/lib/email";

/** Email the God/admin account on key events (signups, case activity). */
export async function notifyGod(subject: string, lines: string[]): Promise<void> {
  const to = process.env.ADMIN_BOOTSTRAP_EMAIL || "jeff.cline@me.com";
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#0f2a2d;line-height:1.6">
    <h2 style="font-family:Georgia,serif;color:#14524f;margin:0 0 10px">${subject}</h2>
    ${lines.map((l) => `<p style="margin:3px 0">${l}</p>`).join("")}
    <p style="color:#9a958a;font-size:12px;margin-top:16px;border-top:1px solid #eee;padding-top:8px">Attorney.plus system notification · <a href="https://attorney.plus/admin" style="color:#14524f">God console</a></p>
  </div>`;
  await sendTemplated({ to, subject: `[Attorney.plus] ${subject}`, html, template: "god-notify", payload: {} }).catch(() => {});
}

/** Email an attorney (referral rewards, reserved leads). Best-effort. */
export async function notifyAttorney(to: string, subject: string, lines: string[], cta?: { label: string; href: string }): Promise<void> {
  if (!to) return;
  const button = cta
    ? `<p style="margin:18px 0 4px"><a href="${cta.href}" style="background:#14524f;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;display:inline-block">${cta.label}</a></p>`
    : "";
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#0f2a2d;line-height:1.6">
    <h2 style="font-family:Georgia,serif;color:#14524f;margin:0 0 10px">${subject}</h2>
    ${lines.map((l) => `<p style="margin:3px 0">${l}</p>`).join("")}
    ${button}
    <p style="color:#9a958a;font-size:12px;margin-top:16px;border-top:1px solid #eee;padding-top:8px">Attorney.plus referral network · <a href="https://attorney.plus/portal" style="color:#14524f">Your portal</a></p>
  </div>`;
  await sendTemplated({ to, subject: `[Attorney.plus] ${subject}`, html, template: "attorney-notify", payload: {} }).catch(() => {});
}
