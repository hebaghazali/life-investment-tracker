"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface MVDToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function MVDToggle({ checked, onCheckedChange }: MVDToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
      <div className="space-y-0.5">
        <Label htmlFor="mvd-toggle" className="text-sm font-medium">
          Minimum Viable Day
        </Label>
        <p className="text-xs text-muted-foreground">
          Mark today as a baseline day
        </p>
      </div>
      <Switch
        id="mvd-toggle"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

