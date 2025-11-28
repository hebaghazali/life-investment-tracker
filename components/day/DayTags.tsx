import { Badge } from "@/components/ui/badge";

interface DayTagsProps {
  tags?: string[];
}

export function DayTags({ tags }: DayTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

