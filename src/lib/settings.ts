import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appSettings } from "@/db/schema";

/** God-controlled toggles. Percentage display defaults OFF while the attorney
 *  agreements are still being finalized. */
export const SETTING_KEYS = {
  attorneyShowPercentage: "attorney_show_percentage",
} as const;

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.query.appSettings.findFirst({ where: eq(appSettings.key, key) });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: appSettings.key, set: { value, updatedAt: new Date() } });
}

/** Whether the estimated Managing-Attorney percentage may be shown on the
 *  attorney/God backend. Defaults to false (OFF) until explicitly enabled. */
export async function attorneyPercentageVisible(): Promise<boolean> {
  return (await getSetting(SETTING_KEYS.attorneyShowPercentage)) === "on";
}
