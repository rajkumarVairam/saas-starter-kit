"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const PREFS: NotificationPref[] = [
  {
    id: "subscription_confirmed",
    label: "Subscription confirmations",
    description: "Email when your subscription is activated or renewed.",
    defaultOn: true,
  },
  {
    id: "subscription_cancelled",
    label: "Subscription cancellations",
    description: "Email when your subscription is cancelled or expires.",
    defaultOn: true,
  },
  {
    id: "welcome",
    label: "Welcome & onboarding",
    description: "Onboarding tips when you first sign up.",
    defaultOn: true,
  },
  {
    id: "product_updates",
    label: "Product updates",
    description: "New features and changelog announcements.",
    defaultOn: false,
  },
  {
    id: "tips",
    label: "Tips & tutorials",
    description: "Occasional tips on getting the most out of the platform.",
    defaultOn: false,
  },
];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFS.map((p) => [p.id, p.defaultOn]))
  );

  const toggle = (id: string, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [id]: value }));
    // TODO: persist to server — add a user_preferences column or table
    toast({ title: value ? "Enabled" : "Disabled", description: PREFS.find((p) => p.id === id)?.label });
  };

  const transactional = PREFS.filter((p) =>
    ["subscription_confirmed", "subscription_cancelled", "welcome"].includes(p.id)
  );
  const marketing = PREFS.filter((p) =>
    ["product_updates", "tips"].includes(p.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">Choose what emails you receive from us.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4" />
            Transactional Emails
          </CardTitle>
          <CardDescription>
            Essential emails about your account and billing. These cannot be fully disabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactional.map((pref, i) => (
            <div key={pref.id}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor={pref.id} className="text-sm font-medium cursor-pointer">
                    {pref.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{pref.description}</p>
                </div>
                <Switch
                  id={pref.id}
                  checked={prefs[pref.id]}
                  onCheckedChange={(v) => toggle(pref.id, v)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Communications</CardTitle>
          <CardDescription>Optional updates and tips from the team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {marketing.map((pref, i) => (
            <div key={pref.id}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor={pref.id} className="text-sm font-medium cursor-pointer">
                    {pref.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{pref.description}</p>
                </div>
                <Switch
                  id={pref.id}
                  checked={prefs[pref.id]}
                  onCheckedChange={(v) => toggle(pref.id, v)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
