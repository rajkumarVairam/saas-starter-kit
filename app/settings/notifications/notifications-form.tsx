"use client";

import { setNotificationPref } from "@/actions/preferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { useState } from "react";

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

function resolvePrefs(saved: Record<string, boolean>): Record<string, boolean> {
  return Object.fromEntries(
    PREFS.map((p) => [p.id, p.id in saved ? saved[p.id] : p.defaultOn])
  );
}

export function NotificationsForm({ savedPrefs }: { savedPrefs: Record<string, boolean> }) {
  const [prefs, setPrefs] = useState(() => resolvePrefs(savedPrefs));
  const [saving, setSaving] = useState<string | null>(null);

  const toggle = async (id: string, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [id]: value }));
    setSaving(id);
    try {
      await setNotificationPref(id, value);
      toast.success(`${value ? "Enabled" : "Disabled"}: ${PREFS.find((p) => p.id === id)?.label}`);
    } catch {
      setPrefs((prev) => ({ ...prev, [id]: !value }));
      toast.error("Failed to save preference");
    } finally {
      setSaving(null);
    }
  };

  const transactional = PREFS.filter((p) =>
    ["subscription_confirmed", "subscription_cancelled", "welcome"].includes(p.id)
  );
  const marketing = PREFS.filter((p) => ["product_updates", "tips"].includes(p.id));

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
          <CardDescription>Essential emails about your account and billing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {transactional.map((pref, i) => (
            <div key={pref.id}>
              {i > 0 && <Separator className="mb-4" />}
              <PrefRow
                pref={pref}
                value={prefs[pref.id]}
                disabled={saving === pref.id}
                onToggle={toggle}
              />
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
              <PrefRow
                pref={pref}
                value={prefs[pref.id]}
                disabled={saving === pref.id}
                onToggle={toggle}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PrefRow({
  pref,
  value,
  disabled,
  onToggle,
}: {
  pref: NotificationPref;
  value: boolean;
  disabled: boolean;
  onToggle: (id: string, value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5">
        <Label htmlFor={pref.id} className="text-sm font-medium cursor-pointer">
          {pref.label}
        </Label>
        <p className="text-xs text-muted-foreground">{pref.description}</p>
      </div>
      <Switch
        id={pref.id}
        checked={value}
        disabled={disabled}
        onCheckedChange={(v) => onToggle(pref.id, v)}
      />
    </div>
  );
}
