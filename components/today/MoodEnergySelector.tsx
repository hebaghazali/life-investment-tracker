"use client";

interface MoodEnergySelectorProps {
  label: string;
  value?: number | null;
  onChange: (value: number) => void;
}

export function MoodEnergySelector({
  label,
  value,
  onChange,
}: MoodEnergySelectorProps) {
  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{label}</h3>
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-medium transition-all ${
              value === level
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-accent"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}

