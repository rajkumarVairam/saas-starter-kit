import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  robots: "noindex",
};

export default function PrivacyPolicyPage() {
  const updated = "March 9, 2026";

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Button variant="ghost" size="sm" asChild className="mb-8 -ml-2">
          <Link href="/">
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Link>
        </Button>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: {updated}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly, such as your name, email address, and
              payment information when you create an account or subscribe. We also collect usage data
              and technical information (browser type, IP address, pages visited) to operate and
              improve the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information to provide and operate the service, process payments, send
              transactional emails (account verification, billing receipts), respond to support
              requests, and improve our product. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Cookies & Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies for authentication and session management. With your consent,
              we also use analytics cookies (PostHog) to understand how users interact with the
              service. You can decline non-essential cookies via the cookie consent banner.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We share data with trusted service providers who help us operate the service: payment
              processing (Polar), email delivery (Resend), error monitoring (Sentry), and product
              analytics (PostHog). These providers are contractually bound to protect your data and
              may not use it for their own purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account data for as long as your account is active. You may request
              deletion of your account and associated data at any time from the Account settings
              page. Some data may be retained for legal compliance purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you may have the right to access, correct, or delete your
              personal data, object to processing, or request data portability. To exercise these
              rights, contact us at{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-primary underline underline-offset-2">
                {siteConfig.email}
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including encrypted connections
              (HTTPS), hashed passwords, and rate limiting. No system is 100% secure; we encourage
              you to use a strong, unique password and enable two-factor authentication.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. We will notify you of significant changes
              by email or by posting a notice on the service. Continued use after changes take
              effect constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about this policy? Contact us at{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-primary underline underline-offset-2">
                {siteConfig.email}
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
