"use client";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetProDialogStore } from "@/store/get-pro-dialog-store";
import { PRO_SUB_FEATURES } from "@/utils/subscription";
import { Calendar, Check } from "lucide-react";
import Link from "next/link";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "./ui/revola";

export function GetProDialogWrapper() {
  const { isOpen, closeGetProDialog } = useGetProDialogStore();

  return <GetProDialog isOpen={isOpen} onClose={closeGetProDialog} />;
}

interface GetProDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetProDialog({ isOpen, onClose }: GetProDialogProps) {
  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent className="gap-0 overflow-hidden sm:max-w-lg">
        <ResponsiveDialogHeader className="sm:p-6 sm:pb-0">
          <ResponsiveDialogTitle>Get Pro</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{`Unlock all of ${siteConfig.name}'s features`}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-6 px-6 py-4">
          <ul className="space-y-3">
            {PRO_SUB_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full p-1",
                    feature.status === "done" ? "bg-primary/15" : "bg-muted"
                  )}
                >
                  {feature.status === "done" ? (
                    <Check className="text-primary size-3 stroke-2" />
                  ) : (
                    <Calendar className="text-muted-foreground size-3 stroke-2" />
                  )}
                </div>
                <span className={cn("text-sm", feature.status === "done" ? "" : "opacity-60")}>
                  {feature.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <ResponsiveDialogFooter className="bg-muted/30 relative flex-col border-t p-6">
          <Button asChild className="grow">
            <Link href="/settings/billing" onNavigate={onClose}>
              Upgrade to Pro
            </Link>
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Maybe Later
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
