"use client";

import { siteConfig } from "@/config/site";
import Logo from "@/assets/logo.svg";
import { FigmaExportDialog } from "@/components/figma-export-dialog";
import { Button } from "@/components/ui/button";
import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import Link from "next/link";
import { useState } from "react";
import { GetProCTA } from "./get-pro-cta";
import FigmaIcon from "@/assets/figma.svg";

export function Header() {
  const [figmaDialogOpen, setFigmaDialogOpen] = useState(false);

  return (
    <header className="border-b">
      <div className="flex items-center justify-between gap-2 p-4">
        <Link href="/settings/themes" className="flex items-center gap-2">
          <Logo className="size-6" title={siteConfig.name} />
          <span className="hidden font-bold md:block">{siteConfig.name}</span>
        </Link>

        <div className="flex items-center gap-3">
          <GetProCTA className="h-8" />
          <Button
            onClick={() => setFigmaDialogOpen(true)}
            variant="outline"
            className="flex h-8 items-center gap-2"
          >
            <FigmaIcon className="size-4" />
            <span className="hidden md:inline">Export to Figma</span>
          </Button>
          <UserProfileDropdown />
        </div>
      </div>

      <FigmaExportDialog open={figmaDialogOpen} onOpenChange={setFigmaDialogOpen} />
    </header>
  );
}
