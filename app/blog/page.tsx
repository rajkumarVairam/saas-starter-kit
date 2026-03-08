import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: `Blog — ${siteConfig.name}`,
  description: `Articles, guides, and updates from the ${siteConfig.name} team.`,
};

interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  tag: string;
  readTime: string;
}

// Add your blog posts here — or replace this with a CMS/MDX source
const posts: Post[] = [
  {
    slug: "why-we-built-launchkit",
    title: "Why we built LaunchKit",
    description:
      "Every SaaS project starts by rebuilding the same foundation. Auth, billing, admin, email — we decided to build it once, properly, and open-source it.",
    date: "2026-03-08",
    tag: "Company",
    readTime: "4 min read",
  },
  {
    slug: "theme-editor-as-a-feature",
    title: "Why your SaaS should ship with a theme editor",
    description:
      "Developers and power users want control over how their tools look. Building theming into your product from day one pays dividends in retention and word-of-mouth.",
    date: "2026-02-20",
    tag: "Product",
    readTime: "6 min read",
  },
  {
    slug: "multi-provider-ai",
    title: "Switching AI providers with one environment variable",
    description:
      "How we architected the AI integration in LaunchKit so you can swap between Gemini, OpenAI, Anthropic, and Groq without changing any code.",
    date: "2026-02-01",
    tag: "Technical",
    readTime: "8 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            Articles, guides, and updates from the {siteConfig.name} team.
          </p>
        </div>

        <div className="space-y-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-xl border p-6 transition-all hover:bg-muted/40 hover:border-primary/30"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-xs">{post.tag}</Badge>
                <span className="text-xs text-muted-foreground">{post.date}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{post.readTime}</span>
              </div>
              <h2 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.description}</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-primary font-medium">
                Read more <ArrowRight className="size-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
