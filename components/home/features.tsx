import { BrainCircuit, CreditCard, Gem, LayoutDashboard, Lock, Paintbrush, ShieldCheck, Webhook } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    title: "Authentication",
    description:
      "GitHub and Google OAuth wired in via Better Auth. Sessions, DB tables, and middleware handled.",
    icon: <Lock className="size-6" />,
  },
  {
    title: "Billing & Subscriptions",
    description:
      "Polar.sh integration with webhook handler, free-tier gating, and customer portal out of the box.",
    icon: <CreditCard className="size-6" />,
  },
  {
    title: "Visual Theme Editor",
    description:
      "Built-in real-time theme editor with 150+ presets, color control, typography, and export to Tailwind CSS.",
    icon: <Paintbrush className="size-6" />,
  },
  {
    title: "AI Integration",
    description:
      "Multi-provider AI (Gemini, OpenAI, Anthropic, Groq) with rate limiting and subscription gating ready to go.",
    icon: <BrainCircuit className="size-6" />,
    pro: true,
  },
  {
    title: "Admin Dashboard",
    description:
      "User management, audit log, community moderation, and analytics. Email-based admin access control.",
    icon: <LayoutDashboard className="size-6" />,
  },
  {
    title: "OAuth 2.0 API",
    description:
      "Full RFC-compliant OAuth 2.0 server with PKCE so third-party apps can integrate with your product.",
    icon: <Webhook className="size-6" />,
  },
  {
    title: "Security Built-in",
    description:
      "Rate limiting (Upstash), audit logging, CSP headers, Sentry error monitoring, and Zod env validation.",
    icon: <ShieldCheck className="size-6" />,
  },
  {
    title: "Community Gallery",
    description:
      "Users publish, browse, and like themes. A ready-made user-generated content system you can repurpose.",
    icon: <Gem className="size-6" />,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Features() {
  return (
    <section id="features" className="relative isolate w-full py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(from_var(--primary)_r_g_b_/_0.03),transparent_70%)]"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center space-y-4"
          >
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-left">
              Everything <br className="hidden lg:block" />
              <span className="text-muted-foreground">Already Built</span>
            </h2>
            <p className="text-muted-foreground max-w-[400px] text-lg">
              The hard SaaS infrastructure that takes weeks to build right — done, tested, and production-ready.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="group h-full rounded-2xl border border-border/40 bg-card/50 p-6 transition-all hover:bg-card hover:shadow-lg">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 flex items-center gap-2 text-xl font-bold">
                      {feature.title}
                      {feature.pro && (
                        <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold">
                          <Gem className="size-3" />
                          Pro
                        </span>
                      )}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
