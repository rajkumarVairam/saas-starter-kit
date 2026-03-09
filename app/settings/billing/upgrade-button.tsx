"use client";

import { createCheckout } from "@/actions/checkout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function UpgradeButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const result = await createCheckout();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.url) {
        router.push(result.url);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" onClick={handleUpgrade} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? "Redirecting..." : label}
    </Button>
  );
}
