"use client";

import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { useThemePresetStore } from "@/store/theme-preset-store";
import { useTheme } from "@/components/theme-provider";
import { Check } from "lucide-react";
import { useMemo } from "react";
import { SettingsHeader } from "../components/settings-header";

function PresetSwatch({ color }: { color: string }) {
  return (
    <div
      className="h-4 w-4 rounded-sm border border-black/10"
      style={{ backgroundColor: color }}
    />
  );
}

export default function ThemesPage() {
  const { theme: currentMode } = useTheme();
  const applyThemePreset = useEditorStore((s) => s.applyThemePreset);
  const themeState = useEditorStore((s) => s.themeState);
  const presets = useThemePresetStore((s) => s.getAllPresets());

  const allPresets = useMemo(() => {
    return [
      { key: "default", label: "Default" },
      ...Object.entries(presets)
        .filter(([, p]) => p.source !== "SAVED")
        .sort(([, a], [, b]) => (a.label || "").localeCompare(b.label || ""))
        .map(([key, p]) => ({ key, label: p.label || key })),
    ];
  }, [presets]);

  const currentPreset = themeState.preset ?? "default";

  return (
    <div>
      <SettingsHeader
        title="Appearance"
        description="Choose a theme to apply across the app."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {allPresets.map(({ key, label }) => {
          const styles =
            key === "default"
              ? themeState.styles[currentMode]
              : (presets[key]?.styles?.[currentMode] ?? presets[key]?.styles?.light ?? {});

          const primary = (styles as Record<string, string>).primary ?? "#3b82f6";
          const secondary = (styles as Record<string, string>).secondary ?? "#f3f4f6";
          const accent = (styles as Record<string, string>).accent ?? "#e0f2fe";
          const border = (styles as Record<string, string>).border ?? "#e5e7eb";

          const isActive = currentPreset === key;

          return (
            <button
              key={key}
              onClick={() => applyThemePreset(key)}
              className={cn(
                "group relative flex flex-col gap-3 rounded-lg border p-4 text-left transition-all hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              {/* Color swatches */}
              <div className="flex gap-1.5">
                <PresetSwatch color={primary} />
                <PresetSwatch color={accent} />
                <PresetSwatch color={secondary} />
                <PresetSwatch color={border} />
              </div>

              {/* Label row */}
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium capitalize">{label}</span>
                {isActive && (
                  <Check className="size-3.5 shrink-0 text-primary" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
