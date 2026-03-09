import { auth } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignInButton } from "@/app/(auth)/components/sign-in-button";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    redirect("/settings/themes");
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="text-muted-foreground max-w-sm text-base">{siteConfig.description}</p>
        <SignInButton />
      </div>
    </div>
  );
}
