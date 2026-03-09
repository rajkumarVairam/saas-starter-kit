"use client";

import { siteConfig } from "@/config/site";
import Logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";

export function LandingNav() {
  const { openAuthDialog } = useAuthStore();

  return (
    <nav className="border-b px-4 md:px-8 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="size-6" title={siteConfig.name} />
        <span className="font-bold">{siteConfig.name}</span>
      </Link>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => openAuthDialog("signin")}>
          Sign in
        </Button>
        <Button size="sm" onClick={() => openAuthDialog("signup")}>
          Get started free
        </Button>
      </div>
    </nav>
  );
}
