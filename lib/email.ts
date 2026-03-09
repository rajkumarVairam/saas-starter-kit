import { siteConfig } from "@/config/site";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM ?? `${siteConfig.name} <${siteConfig.email}>`;
const APP_URL = process.env.BASE_URL ?? siteConfig.url;

export async function sendWelcomeEmail(to: string, name: string, idempotencyKey?: string) {
  if (!process.env.RESEND_API_KEY) return;
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to ${siteConfig.name}`,
    headers: idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : undefined,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #111;">Welcome, ${name}!</h1>
        <p>Thanks for signing up for ${siteConfig.name}. You're all set to start building beautiful themes.</p>
        <p>
          <a href="${APP_URL}/settings/themes" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Get Started
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          If you have any questions, reply to this email or contact us at
          <a href="mailto:${siteConfig.email}">${siteConfig.email}</a>.
        </p>
      </div>
    `,
  });
}

export async function sendSubscriptionConfirmationEmail(to: string, name: string, idempotencyKey?: string) {
  if (!process.env.RESEND_API_KEY) return;
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `You're now on ${siteConfig.name} ${siteConfig.proTier}!`,
    headers: idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : undefined,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #111;">Welcome to Pro, ${name}!</h1>
        <p>Your ${siteConfig.name} ${siteConfig.proTier} subscription is now active. You have unlimited AI theme generation and all Pro features unlocked.</p>
        <p>
          <a href="${APP_URL}/settings/themes" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Go to Appearance
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Manage your subscription anytime in your
          <a href="${APP_URL}/settings/portal">account settings</a>.
        </p>
        <p style="color: #666; font-size: 14px;">
          Questions? Contact us at <a href="mailto:${siteConfig.email}">${siteConfig.email}</a>.
        </p>
      </div>
    `,
  });
}

export async function sendSubscriptionCancelledEmail(to: string, name: string, endsAt: Date | null, idempotencyKey?: string) {
  if (!process.env.RESEND_API_KEY) return;
  const endDate = endsAt ? endsAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "end of current period";
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your ${siteConfig.name} ${siteConfig.proTier} subscription has been cancelled`,
    headers: idempotencyKey ? { "X-Idempotency-Key": idempotencyKey } : undefined,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #111;">Subscription Cancelled</h1>
        <p>Hi ${name}, your ${siteConfig.name} ${siteConfig.proTier} subscription has been cancelled.</p>
        <p>You'll retain Pro access until <strong>${endDate}</strong>. After that, your account will revert to the free tier.</p>
        <p>
          <a href="${APP_URL}/settings/billing" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Resubscribe
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          We're sorry to see you go. If you have feedback, please reach out at
          <a href="mailto:${siteConfig.email}">${siteConfig.email}</a>.
        </p>
      </div>
    `,
  });
}
