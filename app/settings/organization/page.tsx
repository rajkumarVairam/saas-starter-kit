import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsHeader } from "../components/settings-header";
import { OrganizationManager } from "./organization-manager";

export const metadata = { title: "Organization | Settings" };

export default async function OrganizationPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  return (
    <div className="space-y-6">
      <SettingsHeader
        title="Organization"
        description="Create and manage your organization, invite team members, and control access."
      />
      <OrganizationManager />
    </div>
  );
}
