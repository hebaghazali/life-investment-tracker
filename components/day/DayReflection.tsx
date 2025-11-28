import { Card } from "@/components/ui/card";

interface DayReflectionProps {
  note?: string | null;
}

export function DayReflection({ note }: DayReflectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Reflection</h3>
      <Card className="p-3">
        {note ? (
          <p className="text-sm text-foreground whitespace-pre-wrap">{note}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No reflection recorded
          </p>
        )}
      </Card>
    </div>
  );
}

