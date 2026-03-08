"use server";

import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getCurrentUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getNotificationPrefs(): Promise<Record<string, boolean>> {
  const userId = await getCurrentUserId();
  const [row] = await db
    .select({ notificationPrefs: userPreferences.notificationPrefs })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return row?.notificationPrefs ?? {};
}

export async function setNotificationPref(id: string, value: boolean): Promise<void> {
  const userId = await getCurrentUserId();

  // Load existing prefs first so we merge rather than overwrite
  const existing = await getNotificationPrefs();
  const updated = { ...existing, [id]: value };

  await db
    .insert(userPreferences)
    .values({ userId, notificationPrefs: updated, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { notificationPrefs: updated, updatedAt: new Date() },
    });
}
