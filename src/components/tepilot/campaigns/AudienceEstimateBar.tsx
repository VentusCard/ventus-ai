import { Users } from "lucide-react";

interface AudienceEstimateBarProps {
  estimatedSize: number;
  hasSelections: boolean;
}

export function AudienceEstimateBar({ estimatedSize, hasSelections }: AudienceEstimateBarProps) {
  if (!hasSelections) return null;

  const formatted = estimatedSize >= 1_000_000
    ? `${(estimatedSize / 1_000_000).toFixed(1)}M`
    : estimatedSize >= 1_000
      ? `${(estimatedSize / 1_000).toFixed(0)}K`
      : estimatedSize.toString();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
      <Users className="w-5 h-5 text-primary" />
      <div>
        <p className="text-sm font-semibold text-foreground">
          {formatted} estimated reach
        </p>
        <p className="text-xs text-muted-foreground">
          Based on selected targeting criteria
        </p>
      </div>
    </div>
  );
}
