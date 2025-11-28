import { Badge } from "@/components/ui/badge";

interface DayMVDIndicatorProps {
  isMinimumViableDay?: boolean;
}

export function DayMVDIndicator({ isMinimumViableDay }: DayMVDIndicatorProps) {
  if (!isMinimumViableDay) return null;

  return (
    <Badge variant="outline" className="w-fit">
      ✓ Minimum Viable Day
    </Badge>
  );
}

