"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function SignInButton() {
  const { openAuthDialog } = useAuthStore();

  return (
    <Button size="lg" onClick={() => openAuthDialog("signin")}>
      Sign in to continue
    </Button>
  );
}
