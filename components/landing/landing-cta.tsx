"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { ArrowRight } from "lucide-react";

export function LandingCTA({ variant = "hero" }: { variant?: "hero" | "footer" }) {
  const { openAuthDialog } = useAuthStore();

  return (
    <>
      <Button
        size="lg"
        className="w-full sm:w-auto"
        onClick={() => openAuthDialog("signup")}
      >
        Get started free
        <ArrowRight className="ml-2 size-4" />
      </Button>
      {variant === "footer" && (
        <Button
          size="lg"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => openAuthDialog("signin")}
        >
          Sign in
        </Button>
      )}
    </>
  );
}
