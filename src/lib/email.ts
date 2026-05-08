import { Resend } from "resend";
import { db } from "./db";
import { emailLog } from "@/db/schema";
import { env } from "./env";

let _client: Resend | null | undefined;
function getClient(): Resend | null {
  if (_client !== undefined) return _client;
  _client = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
  return _client;
}

export type EmailParams = {
  to: string;
  subject: string;
  html: string;
  template: string;
  payload: object;
};

export async function sendTemplated(params: EmailParams): Promise<void> {
  const client = getClient();
  if (!client) {
    await db.insert(emailLog).values({
      toEmail: params.to,
      template: params.template,
      payload: JSON.stringify(params.payload),
      error: "RESEND_API_KEY not set; skipped",
    });
    return;
  }
  try {
    const r = await client.emails.send({
      from: env.RESEND_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    await db.insert(emailLog).values({
      toEmail: params.to,
      template: params.template,
      payload: JSON.stringify(params.payload),
      resendMessageId: r.data?.id ?? null,
      error: r.error ? JSON.stringify(r.error) : null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await db.insert(emailLog).values({
      toEmail: params.to,
      template: params.template,
      payload: JSON.stringify(params.payload),
      error: msg,
    });
  }
}
