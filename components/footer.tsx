import { siteConfig } from "@/config/site";
import Link from "next/link";
import Logo from "@/assets/logo.svg";
import GitHubIcon from "@/assets/github.svg";
import TwitterIcon from "@/assets/twitter.svg";
import DiscordIcon from "@/assets/discord.svg";

export function Footer() {
  return (
    <footer className="bg-background/95 w-full border-t backdrop-blur-sm">
      <div className="container mx-auto flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 max-w-md space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Logo className="size-6" />
              <span>{siteConfig.name}</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              A production-ready Next.js SaaS starter with auth, billing, AI, admin, and a visual
              theme editor. Ship faster without cutting corners.
            </p>
            <div className="flex gap-4">
              <a
                href={siteConfig.links.github}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <GitHubIcon className="size-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href={siteConfig.links.discord}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <DiscordIcon className="size-5" />
                <span className="sr-only">Discord</span>
              </a>
              <a
                href={siteConfig.links.twitter}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <TwitterIcon className="size-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">Community</Link></li>
              <li><Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">API Docs</Link></li>
              <li><a href={siteConfig.links.github} className="text-muted-foreground hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href={siteConfig.links.contact} className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-border/40 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="text-muted-foreground flex gap-4 text-xs">
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
