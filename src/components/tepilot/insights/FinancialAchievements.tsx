import { useMemo, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EnrichedTransaction } from "@/types/transaction";
import {
  calculateAchievements,
  calculateHealthScore,
  getLevel,
  Achievement,
} from "@/lib/achievementEngine";
import {
  PiggyBank,
  Shield,
  LayoutGrid,
  Plane,
  Search,
  MapPin,
  Flame,
  Heart,
  Trophy,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  PiggyBank, Shield, LayoutGrid, Plane, Search, MapPin, Flame, Heart,
};

const STATUS_STYLES = {
  unlocked: {
    card: "border-emerald-200 bg-emerald-50/60",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: "text-emerald-600",
    progress: "[&>div]:bg-emerald-500",
  },
  in_progress: {
    card: "border-amber-200 bg-amber-50/60",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "text-amber-600",
    progress: "[&>div]:bg-amber-500",
  },
  locked: {
    card: "border-slate-200 bg-slate-50/60",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    icon: "text-slate-400",
    progress: "[&>div]:bg-slate-300",
  },
};

function AchievementPill({ achievement }: { achievement: Achievement }) {
  const Icon = ICON_MAP[achievement.icon] || Sparkles;
  const styles = STATUS_STYLES[achievement.status];
  const pct = Math.round((achievement.progress.current / achievement.progress.target) * 100);

  return (
    <div className={cn("rounded-lg border p-3 transition-all", styles.card)}>
      <div className="flex items-center gap-3">
        <div className={cn("p-1.5 rounded-md bg-white/80 shrink-0", styles.icon)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm text-foreground truncate">{achievement.title}</h4>
            <Badge variant="outline" className={cn("text-[10px] ml-2 shrink-0", styles.badge)}>
              {achievement.status === "in_progress" ? "In Progress" : achievement.status === "unlocked" ? "✓" : "Locked"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={pct} className={cn("h-1.5 flex-1", styles.progress)} />
            <span className="text-[10px] text-muted-foreground w-7 text-right">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FinancialAchievementsProps {
  enrichedTransactions: EnrichedTransaction[];
}

export function FinancialAchievements({ enrichedTransactions }: FinancialAchievementsProps) {
  const achievements = useMemo(() => calculateAchievements(enrichedTransactions), [enrichedTransactions]);
  const score = useMemo(() => calculateHealthScore(achievements), [achievements]);
  const level = useMemo(() => getLevel(score), [score]);
  const [expanded, setExpanded] = useState(false);

  const unlockedCount = achievements.filter((a) => a.status === "unlocked").length;

  if (achievements.length === 0) return null;

  const sorted = [...achievements].sort((a, b) => {
    const order = { unlocked: 0, in_progress: 1, locked: 2 };
    return order[a.status] - order[b.status];
  });

  // The "current" achievement = first in-progress, or first unlocked
  const current = sorted.find((a) => a.status === "in_progress") || sorted[0];
  const others = sorted.filter((a) => a.id !== current.id);
  const CurrentIcon = ICON_MAP[current.icon] || Sparkles;
  const currentStyles = STATUS_STYLES[current.status];
  const currentPct = Math.round((current.progress.current / current.progress.target) * 100);

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-slate-900">
            <Trophy className="h-4 w-4 text-amber-500" />
            Financial Achievements
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{unlockedCount}/{achievements.length} unlocked</span>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]" variant="outline">
              {level.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Current / Featured Achievement */}
        <div className={cn("rounded-lg border p-4", currentStyles.card)}>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-md bg-white/80 shrink-0", currentStyles.icon)}>
              <CurrentIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-semibold text-sm text-foreground">{current.title}</h4>
                <Badge variant="outline" className={cn("text-[10px]", currentStyles.badge)}>
                  {current.status === "in_progress" ? "Current Goal" : "Unlocked ✓"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{current.description}</p>
              <div className="flex items-center gap-2">
                <Progress value={currentPct} className={cn("h-2 flex-1", currentStyles.progress)} />
                <span className="text-xs font-medium text-muted-foreground">{current.progress.current}/{current.progress.target}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        {others.length > 0 && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
              {expanded ? "Hide" : `Show ${others.length} more achievements`}
            </button>

            {expanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {others.map((a) => (
                  <AchievementPill key={a.id} achievement={a} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
