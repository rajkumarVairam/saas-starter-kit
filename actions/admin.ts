"use server";

import { db } from "@/db";
import {
  user,
  theme,
  communityTheme,
  communityThemeTag,
  themeLike,
  auditLog,
  subscription,
} from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

// ─── Community themes ──────────────────────────────────────────────────────────

export async function adminGetCommunityThemes() {
  await requireAdmin();
  const rows = await db
    .select({
      id: communityTheme.id,
      themeId: communityTheme.themeId,
      publishedAt: communityTheme.publishedAt,
      likeCount: communityTheme.likeCount,
      themeName: theme.name,
      authorId: user.id,
      authorName: user.name,
      authorEmail: user.email,
    })
    .from(communityTheme)
    .innerJoin(theme, eq(communityTheme.themeId, theme.id))
    .innerJoin(user, eq(communityTheme.userId, user.id))
    .orderBy(desc(communityTheme.publishedAt));
  return rows;
}

export async function adminUnpublishTheme(communityThemeId: string) {
  await requireAdmin();
  if (!communityThemeId) throw new Error("communityThemeId required");

  // Remove tags first (FK), then the community theme row
  await db
    .delete(communityThemeTag)
    .where(eq(communityThemeTag.communityThemeId, communityThemeId));
  await db.delete(themeLike).where(eq(themeLike.themeId, communityThemeId));
  const [deleted] = await db
    .delete(communityTheme)
    .where(eq(communityTheme.id, communityThemeId))
    .returning({ id: communityTheme.id, themeId: communityTheme.themeId });

  if (!deleted) throw new Error("Community theme not found");
  return deleted;
}

// ─── Users ─────────────────────────────────────────────────────────────────────

export async function adminGetUsers() {
  await requireAdmin();
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      createdAt: user.createdAt,
      themeCount: count(theme.id),
    })
    .from(user)
    .leftJoin(theme, eq(theme.userId, user.id))
    .groupBy(user.id)
    .orderBy(desc(user.createdAt));
  return rows;
}

export async function adminBanUser(userId: string, reason?: string) {
  await requireAdmin();
  if (!userId) throw new Error("userId required");
  await db
    .update(user)
    .set({ banned: true, banReason: reason ?? "Banned by admin", updatedAt: new Date() })
    .where(eq(user.id, userId));
  db
    .insert(auditLog)
    .values({
      id: crypto.randomUUID(),
      userId: null,
      action: "admin.user.banned",
      metadata: JSON.stringify({ targetUserId: userId, reason }),
      ipAddress: null,
      userAgent: null,
      createdAt: new Date(),
    })
    .catch(console.error);
}

export async function adminUnbanUser(userId: string) {
  await requireAdmin();
  if (!userId) throw new Error("userId required");
  await db
    .update(user)
    .set({ banned: false, banReason: null, updatedAt: new Date() })
    .where(eq(user.id, userId));
}

export async function adminDeleteUser(userId: string) {
  await requireAdmin();
  if (!userId) throw new Error("userId required");
  // Cascade will handle related rows via FK onDelete: cascade
  await db.delete(user).where(eq(user.id, userId));
}

// ─── Audit log ─────────────────────────────────────────────────────────────────

export async function adminGetAuditLog(limit = 100) {
  await requireAdmin();
  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      metadata: auditLog.metadata,
      ipAddress: auditLog.ipAddress,
      createdAt: auditLog.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(auditLog)
    .leftJoin(user, eq(auditLog.userId, user.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
  return rows;
}

// ─── Analytics (30-day daily signups + theme creations) ────────────────────────

export async function adminGetDailyStats() {
  await requireAdmin();

  // Last 30 days bucketed by date (UTC)
  const usersPerDay = await db.execute<{ day: string; count: string }>(
    sql`
      SELECT date_trunc('day', created_at AT TIME ZONE 'UTC') AS day, count(*) AS count
      FROM "user"
      WHERE created_at >= now() - interval '30 days'
      GROUP BY 1
      ORDER BY 1
    `
  );

  const themesPerDay = await db.execute<{ day: string; count: string }>(
    sql`
      SELECT date_trunc('day', created_at AT TIME ZONE 'UTC') AS day, count(*) AS count
      FROM "theme"
      WHERE created_at >= now() - interval '30 days'
      GROUP BY 1
      ORDER BY 1
    `
  );

  // Build a map for the last 30 days
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const userMap = Object.fromEntries(
    usersPerDay.rows.map((r) => [new Date(r.day).toISOString().slice(0, 10), Number(r.count)])
  );
  const themeMap = Object.fromEntries(
    themesPerDay.rows.map((r) => [new Date(r.day).toISOString().slice(0, 10), Number(r.count)])
  );

  return days.map((day) => ({
    day,
    users: userMap[day] ?? 0,
    themes: themeMap[day] ?? 0,
  }));
}

// ─── Stats (for overview) ──────────────────────────────────────────────────────

export async function adminGetStats() {
  await requireAdmin();
  const [[userCount], [themeCount], [communityCount], [subCount]] =
    await Promise.all([
      db.select({ n: count() }).from(user),
      db.select({ n: count() }).from(theme),
      db.select({ n: count() }).from(communityTheme),
      db
        .select({ n: count() })
        .from(subscription)
        .where(sql`${subscription.status} = 'active'`),
    ]);
  return {
    users: userCount.n,
    themes: themeCount.n,
    communityThemes: communityCount.n,
    activeSubscriptions: subCount.n,
  };
}
