"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Loader2,
  Mail,
  MoreHorizontal,
  Plus,
  UserCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

type Role = "admin" | "member";

export function OrganizationManager() {
  const { data: orgs, isPending: orgsLoading, refetch } = authClient.useListOrganizations();
  const { data: activeOrg } = authClient.useActiveOrganization();

  const [creating, setCreating] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [inviting, setInviting] = useState(false);

  function slugify(val: string) {
    return val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSavingOrg(true);
    try {
      const { error } = await authClient.organization.create({ name: orgName, slug: orgSlug });
      if (error) { toast.error(error.message ?? "Failed to create organization"); return; }
      toast.success("Organization created");
      setOrgName("");
      setOrgSlug("");
      setCreating(false);
      refetch();
    } finally {
      setSavingOrg(false);
    }
  }

  async function handleSwitch(organizationId: string) {
    const { error } = await authClient.organization.setActive({ organizationId });
    if (error) toast.error("Failed to switch organization");
    else { toast.success("Switched organization"); refetch(); }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg?.id) { toast.error("Select an active organization first"); return; }
    setInviting(true);
    try {
      const { error } = await authClient.organization.inviteMember({
        email: inviteEmail,
        role: inviteRole,
        organizationId: activeOrg.id,
      });
      if (error) { toast.error(error.message ?? "Failed to send invite"); return; }
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!activeOrg?.id) return;
    const { error } = await authClient.organization.removeMember({ memberIdOrEmail: memberId });
    if (error) toast.error(error.message ?? "Failed to remove member");
    else { toast.success("Member removed"); refetch(); }
  }

  const members = (activeOrg as { members?: Array<{ id: string; role: string; user: { id: string; name: string; email: string } }> } | null)?.members ?? [];

  return (
    <div className="space-y-6">
      {/* Organizations list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Your Organizations
            </CardTitle>
            <CardDescription>Switch between organizations or create a new one.</CardDescription>
          </div>
          {!creating && (
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {orgsLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {!orgsLoading && (!orgs || orgs.length === 0) && !creating && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 rounded-full bg-muted p-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No organizations yet</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Create one to collaborate with your team.
              </p>
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create organization
              </Button>
            </div>
          )}
          {orgs?.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between rounded-md border px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback>{org.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{org.name}</p>
                  <p className="text-xs text-muted-foreground truncate">/{org.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeOrg?.id === org.id ? (
                  <Badge variant="default" className="gap-1">
                    <UserCheck className="h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => handleSwitch(org.id)}>
                    Switch
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Create form */}
          {creating && (
            <>
              {orgs && orgs.length > 0 && <Separator />}
              <form onSubmit={handleCreate} className="space-y-3 pt-2">
                <p className="text-sm font-medium">New Organization</p>
                <div className="space-y-1.5">
                  <Label htmlFor="org-name">Name</Label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      setOrgSlug(slugify(e.target.value));
                    }}
                    placeholder="Acme Corp"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="org-slug">Slug</Label>
                  <Input
                    id="org-slug"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(slugify(e.target.value))}
                    placeholder="acme-corp"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={savingOrg}>
                    {savingOrg && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setCreating(false); setOrgName(""); setOrgSlug(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      {/* Members */}
      {activeOrg && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Members — {activeOrg.name}
            </CardTitle>
            <CardDescription>Manage team members and their roles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No members yet.</p>
            )}
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback>
                      {m.user.name?.[0]?.toUpperCase() ?? m.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{m.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary">{m.role}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleRemoveMember(m.id)}
                      >
                        Remove member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </CardContent>

          {/* Invite */}
          <CardFooter className="flex-col items-start gap-3 border-t pt-4">
            <p className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invite a team member
            </p>
            <form onSubmit={handleInvite} className="flex w-full flex-col sm:flex-row gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
                className="flex-1"
              />
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={inviting || !inviteEmail} className="shrink-0">
                {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Invite
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
