/**
 * Site-wide brand and product configuration.
 *
 * ─────────────────────────────────────────────────────────────────
 *  Update these values when deploying for your product.
 *  Also update:
 *    - .env.local  (secrets, BASE_URL, EMAIL_FROM, etc.)
 * ─────────────────────────────────────────────────────────────────
 */
export const siteConfig = {
  /** Short product name — used in titles, emails, UI copy */
  name: "LaunchKit",

  /** Canonical production URL — no trailing slash */
  url: "https://launchkit.dev",

  /** Default OpenGraph image (absolute URL) */
  ogImage: "https://launchkit.dev/og-image.png",

  /** One-line tagline used in page metadata */
  tagline: "Your SaaS app",

  /** Full product description used in metadata */
  description: "A production-ready SaaS starter with auth, billing, theming, and everything you need to launch fast.",

  /** Author / team name shown in metadata */
  creator: "LaunchKit",

  /** Contact / support email */
  email: "hello@launchkit.dev",

  /** Paid tier display name */
  proTier: "Pro",
} as const;
