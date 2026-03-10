"use client";

import { siteConfig } from "@/config/site";
import Github from "@/assets/github.svg";
import Google from "@/assets/google.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/revola";
import { PostLoginActionType } from "@/hooks/use-post-login-action";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "signin" | "signup";
  trigger?: React.ReactNode;
  postLoginActionType?: PostLoginActionType | null;
}

function getContextualCopy(actionType?: PostLoginActionType | null) {
  switch (actionType) {
    case "SAVE_THEME":
      return { title: "Sign in to Save", description: "Sign in to save your theme and access it from anywhere" };
    case "SAVE_THEME_FOR_SHARE":
      return { title: "Sign in to Share", description: "Sign in to save and share your theme with others" };
    case "SAVE_THEME_FOR_V0":
      return { title: "Sign in to open in v0", description: "Sign in to save your theme and open it in v0" };
    case "AI_GENERATE_FROM_PAGE":
    case "AI_GENERATE_FROM_CHAT":
    case "AI_GENERATE_FROM_CHAT_SUGGESTION":
    case "AI_GENERATE_EDIT":
    case "AI_GENERATE_RETRY":
      return { title: "Sign in for AI", description: "Sign in to use AI-powered theme generation" };
    case "CHECKOUT":
      return { title: "Sign in to continue", description: "Sign in to complete your purchase" };
    case "FORK_THEME":
      return { title: "Sign in to use this theme", description: "Sign in to save a copy of this theme to your account" };
    default:
      return null;
  }
}

type AuthMode = "oauth" | "email";

export function AuthDialog({
  open,
  onOpenChange,
  initialMode = "signin",
  trigger,
  postLoginActionType,
}: AuthDialogProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(initialMode === "signin");
  const [authMode, setAuthMode] = useState<AuthMode>("oauth");

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const contextualCopy = getContextualCopy(postLoginActionType);

  const getCallbackUrl = () => {
    const base = pathname || "/dashboard";
    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
  };

  useEffect(() => {
    if (open) {
      setIsSignIn(initialMode === "signin");
      setAuthMode("oauth");
      setEmail("");
      setPassword("");
      setName("");
    }
  }, [open, initialMode]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: getCallbackUrl() });
    } catch (e) {
      console.error("Google Sign In Error:", e);
    }
  };

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true);
    try {
      await authClient.signIn.social({ provider: "github", callbackURL: getCallbackUrl() });
    } catch (e) {
      console.error("GitHub Sign In Error:", e);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      if (isSignIn) {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) { toast.error(error.message ?? "Invalid email or password"); return; }
        onOpenChange(false);
        router.push("/dashboard");
      } else {
        const { error } = await authClient.signUp.email({ email, password, name });
        if (error) { toast.error(error.message ?? "Failed to create account"); return; }
        toast.success("Account created! Check your email to verify.");
        onOpenChange(false);
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const title = contextualCopy?.title ?? (isSignIn ? "Welcome back" : "Create account");
  const description =
    contextualCopy?.description ??
    (isSignIn
      ? "Sign in to your account to continue"
      : `Sign up to get started with ${siteConfig.name}`);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <ResponsiveDialogTrigger asChild>{trigger}</ResponsiveDialogTrigger>}
      <ResponsiveDialogContent className="overflow-hidden sm:max-w-md">
        <div className="space-y-4">
          <ResponsiveDialogHeader className="sm:pt-6 px-6">
            <ResponsiveDialogTitle className="text-center text-2xl font-bold">
              {title}
            </ResponsiveDialogTitle>
            <p className="text-muted-foreground text-center text-sm">{description}</p>
          </ResponsiveDialogHeader>

          <div className="px-6 pb-6 space-y-4">
            {authMode === "oauth" ? (
              <>
                <div className="space-y-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    className="flex w-full items-center justify-center gap-2"
                    disabled={isGoogleLoading || isGithubLoading}
                  >
                    <Google className="h-5 w-5" />
                    <span className="font-medium">Continue with Google</span>
                    {isGoogleLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleGithubSignIn}
                    size="lg"
                    className="flex w-full items-center justify-center gap-2"
                    disabled={isGoogleLoading || isGithubLoading}
                  >
                    <Github className="h-5 w-5" />
                    <span className="font-medium">Continue with GitHub</span>
                    {isGithubLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => setAuthMode("email")}
                >
                  Continue with Email
                </Button>
              </>
            ) : (
              <>
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {!isSignIn && (
                    <div className="space-y-1.5">
                      <Label htmlFor="auth-name">Name</Label>
                      <Input
                        id="auth-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                        autoComplete="name"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-email">Email</Label>
                    <Input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-password">Password</Label>
                    <Input
                      id="auth-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      autoComplete={isSignIn ? "current-password" : "new-password"}
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={emailLoading}>
                    {emailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {emailLoading ? "Please wait…" : isSignIn ? "Sign In" : "Create Account"}
                  </Button>
                </form>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => setAuthMode("oauth")}
                >
                  ← Other sign-in options
                </Button>
              </>
            )}

            <div className="text-center text-sm pt-1">
              <span className="text-muted-foreground">
                {isSignIn ? `New to ${siteConfig.name}? ` : "Already have an account? "}
              </span>
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="text-primary font-medium hover:underline focus:outline-none"
              >
                {isSignIn ? "Create an account" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
