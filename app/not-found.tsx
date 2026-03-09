"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="fixed top-4 right-4 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Toggle theme"
              onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
            >
              {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Toggle theme</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <span className="text-muted-foreground mb-6 text-[6rem] leading-none font-extrabold select-none">
        404
      </span>
      <h1 className="text-foreground mb-2 text-3xl font-bold">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-md text-center text-lg">
        The page you were looking for doesn&apos;t exist.
      </p>

      <Link
        href="/settings/themes"
        className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md px-6 py-2 font-semibold shadow transition-colors"
      >
        Back to App
      </Link>
    </div>
  );
}
