import type { DayEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface DayKeyMetricsProps {
  entry?: DayEntry;
  totalScore: number;
}

export function DayKeyMetrics({ entry, totalScore }: DayKeyMetricsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {entry?.mood !== null && entry?.mood !== undefined && (
        <Badge variant="secondary" className="text-sm">
          Mood: {entry.mood}/5
        </Badge>
      )}
      {entry?.energy !== null && entry?.energy !== undefined && (
        <Badge variant="secondary" className="text-sm">
          Energy: {entry.energy}/5
        </Badge>
      )}
      <Badge variant="default" className="text-sm bg-primary">
        Total: {totalScore}
      </Badge>
    </div>
  );
}

