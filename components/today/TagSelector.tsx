"use client";

import { AVAILABLE_TAGS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <Badge
              key={tag}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

