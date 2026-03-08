import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── Post content ──────────────────────────────────────────────────────────────
// For a real blog, replace this with MDX file loading via next-mdx-remote or
// a CMS (Contentlayer, Sanity, etc.). This is a static placeholder.

interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tag: string;
  readTime: string;
}

const posts: Record<string, PostMeta & { content: string }> = {
  "why-we-built-launchkit": {
    slug: "why-we-built-launchkit",
    title: "Why we built LaunchKit",
    description:
      "Every SaaS project starts by rebuilding the same foundation. Auth, billing, admin, email — we decided to build it once, properly, and open-source it.",
    date: "2026-03-08",
    tag: "Company",
    readTime: "4 min read",
    content: `
Every time we started a new SaaS project, we spent the first two to four weeks building the same things.

Authentication. Billing. Email. Admin panel. Rate limiting. Audit logs.

None of it was the actual product. All of it was table stakes. And every time we built it from scratch, we made slightly different decisions, introduced slightly different bugs, and forgot to wire up slightly different things.

**The decision to extract it**

After the third project in a row, we sat down and asked: what if we built this once, properly, with all the edge cases handled? What if we open-sourced it so that the pressure of public scrutiny would force us to do it right?

LaunchKit is the result. It's not a framework or a library — it's a complete Next.js application that you clone and build on top of. Everything is in plain TypeScript. Nothing is magic.

**What "properly" means**

- Auth that handles session expiry, concurrent logins, and OAuth edge cases
- A billing webhook handler that's idempotent (Polar retries webhooks; your handler needs to handle duplicates)
- Email that uses idempotency keys so welcome emails don't send twice
- Rate limiting that's per-user, not per-IP (IPs can be shared; user IDs can't be spoofed)
- An OAuth 2.0 server with PKCE so external tools can connect to your product without you building a proprietary API auth system
- An audit log so you know what happened when a user complains something changed

Each of these has a gotcha. LaunchKit has the gotchas already handled.

**The theme editor**

One unexpected thing: the visual theme editor turned out to be genuinely useful as a product feature, not just an internal tool. Developers using apps built on LaunchKit can customize the look of their workspace without you writing a settings UI from scratch. It became a differentiator, not just a nice demo.

We kept it. You can keep it, repurpose it, or remove it entirely.

**What's next**

LaunchKit will keep getting improvements — more billing providers, team support, more AI provider options. Follow the changelog. If you build something on top of it, let us know.
    `.trim(),
  },
  "theme-editor-as-a-feature": {
    slug: "theme-editor-as-a-feature",
    title: "Why your SaaS should ship with a theme editor",
    description:
      "Developers and power users want control over how their tools look. Building theming into your product from day one pays dividends in retention and word-of-mouth.",
    date: "2026-02-20",
    tag: "Product",
    readTime: "6 min read",
    content: `
The default assumption in most SaaS products is that theming is a nice-to-have. Ship the dark mode toggle, call it done.

LaunchKit ships with a full visual theme editor as a core feature. Here's why we think that's the right call.

**Power users want control**

The users who stick around longest — who advocate for your product, who pay for annual plans — are the ones who've made it their own. They've customized their workspace, their sidebar, their color scheme.

A visual theme editor is one of the lowest-effort ways to give them that ownership.

**Tailwind CSS makes it tractable**

Before Tailwind v4 and the CSS variable model in shadcn/ui, building a theme editor meant parsing your CSS bundle and hacking around framework internals.

Now, all of shadcn/ui's visual properties are exposed as CSS custom properties. You can change all 40+ of them at runtime by injecting a style tag. The editor just manages those properties and generates the resulting CSS.

**It's a reference implementation**

If you're building a developer-focused tool, showing users how to customize your product's theme is a form of documentation. They can see which properties map to which UI elements. They understand what they're configuring.

**The mechanics**

LaunchKit's theme editor works like this: the user adjusts sliders and color pickers, those values are stored as a ThemeStyles object in the database, and the editor generates the @layer base CSS block that gets injected into the page.

Themes can be saved to the user's account, exported as CSS, or published to the community gallery. The AI integration can generate a complete theme from a text prompt or an image.

You can repurpose all of this for your own domain — imagine a "brand kit" feature where users set their company colors and have them applied everywhere.
    `.trim(),
  },
  "multi-provider-ai": {
    slug: "multi-provider-ai",
    title: "Switching AI providers with one environment variable",
    description:
      "How we architected the AI integration in LaunchKit so you can swap between Gemini, OpenAI, Anthropic, and Groq without changing any code.",
    date: "2026-02-01",
    tag: "Technical",
    readTime: "8 min read",
    content: `
When we first shipped AI theme generation, it was hardcoded to Google Gemini. The API key was in the env, the model was in the code.

That worked until someone asked: can I use GPT-4o instead? What about Claude?

Rather than adding a config option as an afterthought, we rebuilt the AI integration around Vercel's AI SDK and its provider abstraction.

**The AI SDK provider model**

The AI SDK has a concept of a "model" object that any provider can implement. You call \`generateText({ model, prompt })\` and it doesn't matter whether \`model\` comes from \`createGoogleGenerativeAI\`, \`createOpenAI\`, or \`createAnthropic\`.

This means switching providers is a matter of changing which model object you pass — not restructuring your code.

**How LaunchKit does it**

\`lib/ai/providers.ts\` reads \`AI_PROVIDER\` from the environment and returns a \`customProvider\` that maps human-readable model aliases to the right underlying model:

\`\`\`ts
// AI_PROVIDER=google
export const myProvider = customProvider({
  languageModels: {
    "chat-model": google("gemini-2.5-flash"),
    "chat-model-small": google("gemini-2.0-flash"),
  },
});

// AI_PROVIDER=openai
export const myProvider = customProvider({
  languageModels: {
    "chat-model": openai("gpt-4o"),
    "chat-model-small": openai("gpt-4o-mini"),
  },
});
\`\`\`

The rest of the codebase only ever references \`"chat-model"\` — it never knows which provider is underneath.

**What you need to change to swap providers**

1. Set \`AI_PROVIDER=openai\` in \`.env.local\`
2. Set \`OPENAI_API_KEY=sk-...\`
3. Restart the dev server

That's it. No code changes.

**Provider-specific options**

Some providers have options that others don't — Gemini has thinking budget, OpenAI has structured output modes. LaunchKit exports a \`baseProviderOptions\` object that's populated based on the active provider, so you can pass provider-specific config without hard-coding checks throughout the codebase.

**Cost considerations**

Gemini 2.5 Flash is currently the most cost-efficient for theme generation (the prompt is large — it includes the full design system spec). Groq's Llama models are the fastest if you need low latency. OpenAI's GPT-4o gives the most consistent output quality.

We default to Gemini because it has the most generous free tier. Swap to whatever makes sense for your use case.
    `.trim(),
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return {};
  return {
    title: `${post.title} — ${siteConfig.name}`,
    description: post.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-6">
            <Link href="/blog">
              <ArrowLeft className="size-4 mr-1" />
              All posts
            </Link>
          </Button>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary">{post.tag}</Badge>
            <span className="text-sm text-muted-foreground">{post.date}</span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{post.readTime}</span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground">{post.description}</p>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {post.content.split("\n\n").map((para, i) => {
            if (para.startsWith("**") && para.endsWith("**")) {
              return (
                <h2 key={i} className="text-xl font-semibold mt-8 mb-3">
                  {para.slice(2, -2)}
                </h2>
              );
            }
            if (para.startsWith("```")) {
              const lines = para.split("\n");
              const code = lines.slice(1, -1).join("\n");
              return (
                <pre key={i} className="rounded-lg bg-muted p-4 text-sm overflow-x-auto my-4">
                  <code>{code}</code>
                </pre>
              );
            }
            return (
              <p key={i} className="text-muted-foreground leading-relaxed mb-4">
                {para}
              </p>
            );
          })}
        </div>
      </main>
    </div>
  );
}
