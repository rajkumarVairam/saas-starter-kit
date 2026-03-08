import { siteConfig } from "@/config/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "motion/react";

const faqs = [
  {
    question: `What is ${siteConfig.name}?`,
    answer: `${siteConfig.name} is a production-ready Next.js SaaS starter kit. It ships with authentication, billing, AI, admin dashboard, visual theme editor, OAuth 2.0 server, audit logging, and more — all wired together and ready to deploy.`,
  },
  {
    question: "Is it really free to use?",
    answer:
      "Yes. The starter kit is MIT licensed. You pay only for the third-party services you connect (Neon for DB, Polar for billing, Resend for email, etc.). Most have generous free tiers.",
  },
  {
    question: "What can I build with it?",
    answer:
      "Any developer-facing SaaS product. The theme editor is a built-in example feature you can keep, repurpose, or replace entirely with your own product domain.",
  },
  {
    question: "How is the theme editor useful in a SaaS context?",
    answer:
      "Any SaaS built on shadcn/ui needs a theme. Instead of hardcoding colors, you or your users can use the built-in editor to customize the look and export the result — no extra tooling required.",
  },
  {
    question: "What's included out of the box?",
    answer:
      "GitHub + Google OAuth, Polar subscription billing with webhooks, transactional email via Resend, AI with multi-provider support, admin panel, OAuth 2.0 API server, rate limiting, audit logging, Sentry error tracking, PostHog analytics, and a full visual theme editor.",
  },
  {
    question: "Can I deploy this on Vercel?",
    answer:
      "Yes — it's built for Vercel. Push to GitHub, import the project, add your environment variables, and you're live. The SETUP.md walks through every step.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="w-full py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              FAQ
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Got questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re looking for, feel free to reach out.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Contact us at <a href={`mailto:${siteConfig.email}`} className="text-primary underline">{siteConfig.email}</a></p>
            </div>
          </motion.div>

          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <AccordionItem value={`item-${i}`} className="border rounded-lg px-4 bg-muted/20">
                    <AccordionTrigger className="hover:no-underline text-lg font-medium py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
