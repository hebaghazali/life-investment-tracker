"use client";

import { Textarea } from "@/components/ui/textarea";

interface ReflectionNoteProps {
  value?: string | null;
  onChange: (value: string) => void;
}

export function ReflectionNote({ value, onChange }: ReflectionNoteProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Reflection</h3>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="One small thing I'm glad I did today…"
        maxLength={200}
        className="min-h-[80px] resize-none"
      />
      <p className="text-xs text-muted-foreground text-right">
        {value?.length || 0}/200
      </p>
    </div>
  );
}

