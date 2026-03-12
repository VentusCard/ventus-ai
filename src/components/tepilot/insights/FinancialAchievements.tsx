import { useMemo, useEffect, useRef } from "react";
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
} from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  PiggyBank,
  Shield,
  LayoutGrid,
  Plane,
  Search,
  MapPin,
  Flame,
  Heart,
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

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={score >= 55 ? "hsl(142 71% 45%)" : score >= 30 ? "hsl(38 92% 50%)" : "hsl(var(--muted-foreground))"}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-foreground">{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = ICON_MAP[achievement.icon] || Sparkles;
  const styles = STATUS_STYLES[achievement.status];
  const pct = Math.round((achievement.progress.current / achievement.progress.target) * 100);

  return (
    <div className={cn("rounded-lg border p-4 transition-all", styles.card)}>
      <div className="flex items-start justify-between mb-2">
        <div className={cn("p-2 rounded-md bg-white/80", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant="outline" className={cn("text-[10px] capitalize", styles.badge)}>
          {achievement.status === "in_progress" ? "In Progress" : achievement.status === "unlocked" ? "Unlocked ✓" : "Locked"}
        </Badge>
      </div>
      <h4 className="font-semibold text-sm text-foreground mb-1">{achievement.title}</h4>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{achievement.description}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{achievement.progress.current} / {achievement.progress.target}</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className={cn("h-2", styles.progress)} />
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
  const confettiFired = useRef(false);

  const unlockedCount = achievements.filter((a) => a.status === "unlocked").length;

  useEffect(() => {
    if (unlockedCount > 0 && !confettiFired.current) {
      confettiFired.current = true;
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, colors: ["#22c55e", "#f59e0b", "#3b82f6"] });
      }, 500);
    }
  }, [unlockedCount]);

  if (achievements.length === 0) return null;

  // Sort: unlocked first, then in_progress, then locked
  const sorted = [...achievements].sort((a, b) => {
    const order = { unlocked: 0, in_progress: 1, locked: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <Card className="border-slate-200 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Trophy className="h-5 w-5 text-amber-500" />
          Financial Health Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: Score Summary */}
        <div className="flex items-center gap-6 p-4 rounded-lg bg-slate-50 border border-slate-100">
          <ScoreRing score={score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground">Financial Health Score</h3>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200" variant="outline">
                {level.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {unlockedCount} of {achievements.length} achievements unlocked
            </p>
            <Progress
              value={(unlockedCount / achievements.length) * 100}
              className="h-2 [&>div]:bg-blue-500"
            />
          </div>
        </div>

        {/* Row 2: Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sorted.map((a) => (
            <AchievementCard key={a.id} achievement={a} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
