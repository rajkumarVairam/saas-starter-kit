/**
 * API rate limiting for custom REST routes (/api/v1/*, /api/oauth/*).
 *
 * Uses Upstash Ratelimit when KV_REST_API_URL is configured (production).
 * Falls back to in-memory limiting in development / when KV is not set.
 *
 * Usage in a route handler:
 *   const limited = await checkApiRateLimit(req, "60 per minute");
 *   if (limited) return limited; // 429 response
 */
import { NextRequest } from "next/server";

// In-memory fallback for local dev (per-process, resets on restart)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

type Limit = "60/min" | "600/hour";

const LIMIT_CONFIG: Record<Limit, { max: number; windowMs: number }> = {
  "60/min": { max: 60, windowMs: 60_000 },
  "600/hour": { max: 600, windowMs: 3_600_000 },
};

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return ip;
}

async function checkUpstash(
  key: string,
  limit: Limit
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  const { max, windowMs } = LIMIT_CONFIG[limit];
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, `${windowMs / 1000} s`),
  });

  const { success, remaining, reset } = await ratelimit.limit(key);
  return { success, remaining, reset };
}

function checkMemory(
  key: string,
  limit: Limit
): { success: boolean; remaining: number; reset: number } {
  const { max, windowMs } = LIMIT_CONFIG[limit];
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1, reset: now + windowMs };
  }

  entry.count++;
  if (entry.count > max) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  return { success: true, remaining: max - entry.count, reset: entry.resetAt };
}

/**
 * Returns a 429 Response if the request exceeds the rate limit, otherwise null.
 *
 * @param req - The incoming NextRequest
 * @param limit - Rate limit preset: "60/min" (default) or "600/hour"
 * @param keyPrefix - Optional prefix to namespace limits per endpoint group
 */
export async function checkApiRateLimit(
  req: NextRequest,
  limit: Limit = "60/min",
  keyPrefix = "api"
): Promise<Response | null> {
  const clientKey = getClientKey(req);
  const storeKey = `${keyPrefix}:${limit}:${clientKey}`;

  let result: { success: boolean; remaining: number; reset: number };

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    result = await checkUpstash(storeKey, limit);
  } else {
    result = checkMemory(storeKey, limit);
  }

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "too_many_requests",
        error_description: "Rate limit exceeded. Please slow down.",
        retry_after: Math.ceil((result.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(LIMIT_CONFIG[limit].max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
        },
      }
    );
  }

  return null;
}
