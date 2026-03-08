"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

const highlights = [
  "Auth ready in minutes",
  "Billing pre-wired",
  "Visual theme editor built-in",
];

const techBadges = ["Next.js 15", "Tailwind v4", "Drizzle ORM", "Better Auth", "Polar", "AI SDK"];

export function Hero() {
  return (
    <section className="relative isolate w-full overflow-hidden bg-background pt-20 pb-32 md:pt-32 md:pb-40">
      {/* Grid background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container relative z-20 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="outline" className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium">
              Production-ready · Open Source · MIT
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Ship Your{" "}
            <span className="font-serif italic font-light text-foreground">SaaS</span>{" "}
            <span className="relative inline-block">
              <span className="absolute -inset-1 rounded-lg bg-primary/10 blur-xl opacity-50" />
              <span className="relative text-primary">in Days</span>
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
          >
            {siteConfig.name} gives you auth, billing, AI, admin, and a visual theme editor —
            all wired together and production-ready. Clone it, configure it, ship it.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/editor/theme">
              <Button
                size="lg"
                className="h-12 min-w-[180px] rounded-full px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/40"
              >
                Try the Theme Editor
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href={siteConfig.links.github} target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="h-12 min-w-[180px] rounded-full border-primary/20 bg-background/50 px-8 text-base backdrop-blur-sm transition-all hover:bg-accent/50 hover:border-primary/50"
              >
                View on GitHub
              </Button>
            </Link>
          </motion.div>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground"
          >
            {highlights.map((h) => (
              <div key={h} className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-1">
                  <Check className="size-3 text-primary" />
                </div>
                <span>{h}</span>
              </div>
            ))}
          </motion.div>

          {/* Tech stack badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-16 flex flex-wrap justify-center gap-2"
          >
            {techBadges.map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="rounded-full px-3 py-1 text-xs font-medium"
              >
                {tech}
              </Badge>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
