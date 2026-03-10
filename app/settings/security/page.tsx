import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsHeader } from "../components/settings-header";
import { TwoFactorSection } from "./two-factor-section";

export const metadata = { title: "Security | Settings" };

export default async function SecurityPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Security"
        description="Manage two-factor authentication and account security."
      />
      <TwoFactorSection twoFactorEnabled={!!session.user.twoFactorEnabled} />
    </div>
  );
}
