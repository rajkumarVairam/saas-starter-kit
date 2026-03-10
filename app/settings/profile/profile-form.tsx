"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name ?? "");
  const [image, setImage] = useState(user.image ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await authClient.updateUser({ name, image: image || undefined });
      if (error) toast.error(error.message ?? "Failed to update profile");
      else toast.success("Profile updated");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangeEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail) return;
    setSavingEmail(true);
    try {
      const { error } = await authClient.changeEmail({
        newEmail,
        callbackURL: "/settings/profile",
      });
      if (error) toast.error(error.message ?? "Failed to send verification email");
      else {
        toast.success("Verification email sent — check your inbox to confirm the change");
        setNewEmail("");
      }
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) toast.error(error.message ?? "Failed to change password");
      else {
        toast.success("Password changed — other sessions have been signed out");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Display info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display Information</CardTitle>
          <CardDescription>Your name and avatar shown across the app.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={image || ""} alt={name} />
                <AvatarFallback className="text-lg">
                  {initials || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-muted-foreground">Paste any public image URL.</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savingProfile ? "Saving…" : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Address</CardTitle>
          <CardDescription>
            Current: <span className="font-medium text-foreground">{user.email}</span>
            <br />A verification link will be sent to your new address before it is changed.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleChangeEmail}>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button type="submit" variant="outline" disabled={savingEmail || !newEmail}>
              {savingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savingEmail ? "Sending…" : "Send verification email"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
          <CardDescription>Leave blank if you signed up with a social provider.</CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Current Password</Label>
              <Input
                id="current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New Password</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
            >
              {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savingPassword ? "Changing…" : "Change password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
