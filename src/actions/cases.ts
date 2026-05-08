"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cases, users } from "@/db/schema";
import { generateInviteCode, INVITE_CODE_REGEX } from "@/lib/codes";
import { auth } from "@/lib/auth";
import { appendAgreement } from "@/lib/audit";
import { sha256 } from "@/lib/hash";
import { captureRequestMeta } from "@/lib/ip";
import { currentTos } from "@/lib/tos";
import { sendTemplated } from "@/lib/email";
import {
  partyJoinedHtml,
  pleaseAgreeHtml,
  bothAgreedHtml,
} from "@/emails/templates";
import { env } from "@/lib/env";

const ARBITRATION_TEXT =
  "I agree to use Attorney.plus arbitration as defined in the current Terms of Service.";

async function currentUserId(): Promise<string> {
  const s = await auth();
  const id = (s?.user as { id?: string } | undefined)?.id;
  if (!id) throw new Error("unauthenticated");
  return id;
}

export async function createCase() {
  const userId = await currentUserId();
  for (let i = 0; i < 6; i++) {
    const code = generateInviteCode();
    try {
      const [c] = await db
        .insert(cases)
        .values({ inviteCode: code, initiatorId: userId })
        .returning();
      return c;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("cases_invite_code_uq")) throw e;
    }
  }
  throw new Error("could not generate unique invite code after 6 attempts");
}

const JoinInput = z.object({
  inviteCode: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => INVITE_CODE_REGEX.test(v), "Invalid invite code format"),
});

export async function joinCase(
  fd: FormData,
): Promise<{ ok: true; caseId: string } | { ok: false; error: string }> {
  let parsed;
  try {
    parsed = JoinInput.parse(Object.fromEntries(fd));
  } catch {
    return { ok: false, error: "Invalid code format. Expected ATTPLUS-XXXXXX." };
  }
  const userId = await currentUserId();

  const c = await db.query.cases.findFirst({
    where: eq(cases.inviteCode, parsed.inviteCode),
  });
  if (!c) return { ok: false, error: "Code not found." };
  if (c.initiatorId === userId)
    return { ok: false, error: "You can't join your own case." };
  if (c.joinerId && c.joinerId !== userId)
    return { ok: false, error: "This case has already been joined." };

  const [updated] = await db
    .update(cases)
    .set({
      joinerId: userId,
      status: "pending_agreements",
      updatedAt: new Date(),
    })
    .where(eq(cases.id, c.id))
    .returning();

  // Notify the initiator that the joiner is in; nudge the joiner to agree.
  const initiator = await db.query.users.findFirst({
    where: eq(users.id, updated.initiatorId),
  });
  const joiner = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  const caseUrl = `${env.APP_URL}/dashboard/case/${updated.id}`;
  if (initiator)
    await sendTemplated({
      to: initiator.email,
      subject: "The other party has joined your case",
      html: partyJoinedHtml({ caseUrl }),
      template: "party-joined",
      payload: { caseId: updated.id },
    });
  if (joiner)
    await sendTemplated({
      to: joiner.email,
      subject: "Action needed: agree to use Attorney.plus arbitration",
      html: pleaseAgreeHtml({ caseUrl }),
      template: "please-agree",
      payload: { caseId: updated.id },
    });

  return { ok: true, caseId: updated.id };
}

export async function agreeToArbitration(caseId: string) {
  const userId = await currentUserId();
  const meta = await captureRequestMeta();
  const tos = await currentTos();

  const c = await db.query.cases.findFirst({ where: eq(cases.id, caseId) });
  if (!c) throw new Error("case not found");
  const isInitiator = c.initiatorId === userId;
  const isJoiner = c.joinerId === userId;
  if (!isInitiator && !isJoiner) throw new Error("not a party to this case");

  await appendAgreement({
    caseId: c.id,
    userId,
    agreementType: "arbitration_consent",
    agreementTextHash: sha256(`${ARBITRATION_TEXT}::${tos.version}`),
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  const now = new Date();
  const initiatorAgreedAt =
    isInitiator && !c.initiatorAgreedAt ? now : c.initiatorAgreedAt;
  const joinerAgreedAt =
    isJoiner && !c.joinerAgreedAt ? now : c.joinerAgreedAt;

  const both = initiatorAgreedAt && joinerAgreedAt;
  const status: typeof c.status = both ? "ready_for_intake" : c.status;

  const [updated] = await db
    .update(cases)
    .set({
      initiatorAgreedAt: initiatorAgreedAt ?? null,
      joinerAgreedAt: joinerAgreedAt ?? null,
      status,
      updatedAt: now,
    })
    .where(eq(cases.id, c.id))
    .returning();

  const init = await db.query.users.findFirst({
    where: eq(users.id, updated.initiatorId),
  });
  const join = updated.joinerId
    ? await db.query.users.findFirst({ where: eq(users.id, updated.joinerId) })
    : null;
  const caseUrl = `${env.APP_URL}/dashboard/case/${updated.id}`;
  if (updated.status === "ready_for_intake") {
    if (init)
      await sendTemplated({
        to: init.email,
        subject: "Both parties have agreed",
        html: bothAgreedHtml({ caseUrl }),
        template: "both-agreed",
        payload: { caseId: updated.id },
      });
    if (join)
      await sendTemplated({
        to: join.email,
        subject: "Both parties have agreed",
        html: bothAgreedHtml({ caseUrl }),
        template: "both-agreed",
        payload: { caseId: updated.id },
      });
  } else {
    const target = isInitiator ? join : init;
    if (target)
      await sendTemplated({
        to: target.email,
        subject: "Action needed: agree to use Attorney.plus arbitration",
        html: pleaseAgreeHtml({ caseUrl }),
        template: "please-agree",
        payload: { caseId: updated.id },
      });
  }

  return updated;
}
