/**
 * GET /api/user/export
 *
 * GDPR data portability — returns a JSON file containing all data
 * associated with the authenticated user's account.
 *
 * The response is streamed as an attachment so the browser downloads it.
 */
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  user as userTable,
  session,
  account,
  theme,
  aiUsage,
  subscription,
  auditLog,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { checkApiRateLimit } from "@/lib/api-rate-limit";

export async function GET(req: NextRequest) {
  // Rate limit to prevent abuse
  const limited = await checkApiRateLimit(req, "60/min", "user-export");
  if (limited) return limited;

  const sessionData = await auth.api.getSession({ headers: await headers() });
  if (!sessionData?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = sessionData.user.id;

  // Fetch all user data in parallel
  const [
    userData,
    sessions,
    accounts,
    themes,
    aiUsageRecords,
    subscriptions,
    auditLogs,
  ] = await Promise.all([
    db.select().from(userTable).where(eq(userTable.id, userId)).limit(1),
    db
      .select({ id: session.id, createdAt: session.createdAt, expiresAt: session.expiresAt, ipAddress: session.ipAddress, userAgent: session.userAgent })
      .from(session)
      .where(eq(session.userId, userId)),
    db
      .select({ id: account.id, providerId: account.providerId, createdAt: account.createdAt })
      .from(account)
      .where(eq(account.userId, userId)),
    db
      .select({ id: theme.id, name: theme.name, createdAt: theme.createdAt, updatedAt: theme.updatedAt })
      .from(theme)
      .where(eq(theme.userId, userId)),
    db
      .select({ id: aiUsage.id, modelId: aiUsage.modelId, promptTokens: aiUsage.promptTokens, completionTokens: aiUsage.completionTokens, createdAt: aiUsage.createdAt })
      .from(aiUsage)
      .where(eq(aiUsage.userId, userId)),
    db
      .select({ id: subscription.id, status: subscription.status, productId: subscription.productId, amount: subscription.amount, currency: subscription.currency, startedAt: subscription.startedAt, currentPeriodEnd: subscription.currentPeriodEnd })
      .from(subscription)
      .where(eq(subscription.userId, userId)),
    db
      .select({ id: auditLog.id, action: auditLog.action, ipAddress: auditLog.ipAddress, createdAt: auditLog.createdAt })
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .limit(500),
  ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exportVersion: "1.0",
    user: userData[0]
      ? {
          id: userData[0].id,
          name: userData[0].name,
          email: userData[0].email,
          emailVerified: userData[0].emailVerified,
          createdAt: userData[0].createdAt,
          updatedAt: userData[0].updatedAt,
        }
      : null,
    linkedAccounts: accounts,
    sessions: sessions,
    themes: themes,
    aiUsage: aiUsageRecords,
    subscriptions: subscriptions,
    auditLog: auditLogs,
  };

  const filename = `${siteConfig_name}-data-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new Response(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

// Minimal inline constant to avoid importing siteConfig in an edge-compatible way
const siteConfig_name = process.env.NEXT_PUBLIC_SITE_NAME ?? "launchkit";
