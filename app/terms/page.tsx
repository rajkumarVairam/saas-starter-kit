import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: `Terms of Service — ${siteConfig.name}`,
  robots: "noindex",
};

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm mb-10">Last updated: {updated}</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using {siteConfig.name} (the &ldquo;Service&rdquo;), you agree to be
              bound by these Terms of Service. If you do not agree, do not use the Service. These
              terms apply to all users, including visitors, registered users, and paying customers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              {siteConfig.name} provides a SaaS platform with authentication, billing, theme
              management, and AI-powered features. We reserve the right to modify, suspend, or
              discontinue the Service at any time with reasonable notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must provide accurate and complete information when creating an account. You are
              responsible for maintaining the confidentiality of your credentials and for all
              activities that occur under your account. Notify us immediately of any unauthorized
              use at{" "}
              <a href={`mailto:${siteConfig.email}`} className="text-primary underline underline-offset-2">
                {siteConfig.email}
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain
              unauthorized access to any part of the Service; (c) transmit malware or harmful code;
              (d) abuse the API or AI generation features in ways that degrade service for other
              users; (e) resell or sublicense access to the Service without written consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Subscriptions and Billing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Paid plans are billed in advance on a monthly or annual basis. All fees are
              non-refundable except as required by law or as stated in our 7-day money-back
              guarantee for first-time subscribers. You may cancel your subscription at any time;
              cancellation takes effect at the end of the current billing period.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are and will remain
              the exclusive property of {siteConfig.name} and its licensors. Content you create
              using the Service (e.g., themes, configurations) remains yours. You grant us a
              limited license to host, display, and transmit your content solely to operate the
              Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. AI-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service includes AI-powered features. AI outputs are generated automatically and
              may not always be accurate or appropriate. You are responsible for reviewing and using
              AI-generated content at your own risk. We do not claim ownership of AI outputs
              generated from your prompts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
              warranties of any kind, express or implied. We do not warrant that the Service will
              be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, {siteConfig.name} shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising from
              your use of or inability to use the Service, even if we have been advised of the
              possibility of such damages. Our total liability shall not exceed the amount paid by
              you to us in the twelve months preceding the claim.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">10. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your account at our discretion if you violate these
              Terms. You may delete your account at any time from the Account settings page. Upon
              termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">11. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms at any time. We will notify you of material changes by
              email or by posting a notice in the Service at least 14 days before they take effect.
              Continued use after changes take effect constitutes acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by applicable law. Any disputes shall be resolved by binding
              arbitration, except where prohibited by law. You waive your right to participate in a
              class-action lawsuit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these Terms? Contact us at{" "}
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
