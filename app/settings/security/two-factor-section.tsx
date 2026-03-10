"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Shield, ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

type Step = "idle" | "setup" | "verify" | "backup" | "disable";

export function TwoFactorSection({ twoFactorEnabled }: { twoFactorEnabled: boolean }) {
  const [enabled, setEnabled] = useState(twoFactorEnabled);
  const [step, setStep] = useState<Step>("idle");
  const [loading, setLoading] = useState(false);

  // Enable flow
  const [password, setPassword] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpCode, setTotpCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Disable flow
  const [disablePassword, setDisablePassword] = useState("");

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await authClient.twoFactor.enable({ password });
      if (error || !data) {
        toast.error(error?.message ?? "Failed to start 2FA setup");
        return;
      }
      setTotpURI(data.totpURI);
      setBackupCodes(data.backupCodes ?? []);
      setPassword("");
      setStep("setup");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await authClient.twoFactor.verifyTotp({ code: totpCode });
      if (error) {
        toast.error("Invalid code — try again");
        return;
      }
      setEnabled(true);
      setStep("backup");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await authClient.twoFactor.disable({ password: disablePassword });
      if (error) {
        toast.error(error.message ?? "Failed to disable 2FA");
        return;
      }
      setEnabled(false);
      setStep("idle");
      setDisablePassword("");
      toast.success("Two-factor authentication disabled");
    } finally {
      setLoading(false);
    }
  }

  function copyBackupCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // QR code via google chart API (free, no key)
  const qrUrl = totpURI
    ? `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(totpURI)}`
    : "";

  return (
    <div className="space-y-6">
      {/* Status card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              {enabled ? (
                <ShieldCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Shield className="h-4 w-4 text-muted-foreground" />
              )}
              Two-Factor Authentication
            </span>
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Enabled" : "Disabled"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Add an extra layer of security. When enabled, you&apos;ll need a code from your
            authenticator app in addition to your password.
          </CardDescription>
        </CardHeader>

        {/* Not enabled — show enable form */}
        {!enabled && step === "idle" && (
          <form onSubmit={handleEnable}>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your current password to begin setting up 2FA.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="2fa-password">Current Password</Label>
                <Input
                  id="2fa-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button type="submit" disabled={loading || !password}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Setting up…" : "Set up 2FA"}
              </Button>
            </CardFooter>
          </form>
        )}

        {/* Step: scan QR */}
        {step === "setup" && (
          <form onSubmit={handleVerify}>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.),
                then enter the 6-digit code to confirm.
              </p>
              {qrUrl && (
                <div className="flex justify-center py-2">
                  <img src={qrUrl} alt="2FA QR code" className="h-48 w-48 rounded-md border p-1" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="totp-code">Verification Code</Label>
                <Input
                  id="totp-code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  maxLength={6}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setStep("idle")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || totpCode.length !== 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Verifying…" : "Verify & enable"}
              </Button>
            </CardFooter>
          </form>
        )}

        {/* Step: backup codes */}
        {step === "backup" && (
          <CardContent className="space-y-4">
            <div className="rounded-md bg-amber-50 border border-amber-200 p-4 dark:bg-amber-950/30 dark:border-amber-800">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                Save your backup codes
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Store these in a safe place. Each code can only be used once if you lose access to your authenticator.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code) => (
                <div key={code} className="rounded bg-muted px-3 py-1.5 text-center">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyBackupCodes}>
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied!" : "Copy codes"}
              </Button>
              <Button size="sm" onClick={() => setStep("idle")}>
                Done
              </Button>
            </div>
          </CardContent>
        )}

        {/* Enabled — show disable form */}
        {enabled && step === "idle" && (
          <form onSubmit={() => setStep("disable")}>
            <CardFooter className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
                onClick={() => setStep("disable")}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Disable 2FA
              </Button>
            </CardFooter>
          </form>
        )}

        {/* Disable confirmation */}
        {step === "disable" && (
          <form onSubmit={handleDisable}>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter your password to disable two-factor authentication.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="disable-pw">Current Password</Label>
                <Input
                  id="disable-pw"
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex gap-2 justify-end">
              <Button type="button" variant="ghost" onClick={() => setStep("idle")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={loading || !disablePassword}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Disabling…" : "Disable 2FA"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
