/**
 * Site-wide brand and product configuration.
 *
 * ─────────────────────────────────────────────────────────────────
 *  CLONING THIS REPO FOR A NEW PRODUCT?
 *  Update the values below. Everything else follows automatically.
 *  Also update:
 *    - .env.local  (secrets, BASE_URL, EMAIL_FROM, etc.)
 *    - public/live-preview.js  ALLOWED_ORIGINS array
 *    - public/live-preview.min.js  same array (minified copy)
 * ─────────────────────────────────────────────────────────────────
 */
export const siteConfig = {
  /** Short product name — used in titles, emails, UI copy */
  name: "LaunchKit",

  /** Canonical production URL — no trailing slash */
  url: "https://launchkit.dev",

  /** Default OpenGraph image (absolute URL) */
  ogImage: "https://launchkit.dev/og-image.png",

  /** One-line tagline */
  tagline: "Ship your SaaS in days, not months",

  /** Full product description used in metadata */
  description:
    "LaunchKit is a production-ready Next.js SaaS starter with auth, billing, AI, admin, theming, and everything else you need to go from idea to launch fast.",

  /** Author / team name shown in metadata */
  creator: "LaunchKit",

  /** Contact / support email */
  email: "hello@launchkit.dev",

  /** External social / community links */
  links: {
    github: "https://github.com/your-org/launchkit",
    discord: "https://discord.gg/your-invite",
    twitter: "https://x.com/your-handle",
    contact: "mailto:hello@launchkit.dev",
  },

  /** Paid tier display name */
  proTier: "Pro",
} as const;
