"use client";

import { siteConfig } from "@/config/site";
import Logo from "@/assets/logo.svg";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="flex items-center justify-between gap-2 p-4">
        <Link href="/settings/themes" className="flex items-center gap-2">
          <Logo className="size-6" title={siteConfig.name} />
          <span className="hidden font-bold md:block">{siteConfig.name}</span>
        </Link>

        <UserProfileDropdown />
      </div>
    </header>
  );
}
