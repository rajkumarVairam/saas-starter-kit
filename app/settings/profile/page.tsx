import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsHeader } from "../components/settings-header";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profile | Settings" };

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Profile"
        description="Manage your public profile and account email."
      />
      <ProfileForm user={session.user} />
    </div>
  );
}
