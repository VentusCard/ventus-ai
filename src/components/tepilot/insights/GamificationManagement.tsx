import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Trophy, Users, Heart, TrendingUp, Plus, Pencil, Star, Gift,
  DollarSign, Lightbulb, Zap, CreditCard, Gamepad2,
} from "lucide-react";
import { getGamificationMetrics } from "@/lib/mockBankwideData";
import { AchievementEditorDialog } from "./AchievementEditorDialog";
import type { ManagedAchievement } from "@/types/bankwide";
import { TabHeader } from "./TabHeader";

const ICON_MAP: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="h-4 w-4" />,
  Target: <Zap className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Heart: <Heart className="h-4 w-4" />,
  Plane: <Star className="h-4 w-4" />,
  ShoppingBag: <Gift className="h-4 w-4" />,
  Utensils: <CreditCard className="h-4 w-4" />,
  Home: <DollarSign className="h-4 w-4" />,
  Dumbbell: <Heart className="h-4 w-4" />,
  Smartphone: <Zap className="h-4 w-4" />,
  PawPrint: <Heart className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
};

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function rewardLabel(a: ManagedAchievement): string {
  if (!a.reward) return "—";
  const r = a.reward;
  if (r.type === "points") return `${r.value.toLocaleString()} pts`;
  if (r.type === "gift_card") return `$${r.value} ${r.merchantName || "GC"}`;
  if (r.type === "cashback") return `${r.value}% cashback`;
  return `$${r.value} custom`;
}

interface GamificationManagementProps {
  hideHeader?: boolean;
}

import { useSaveSequence, CONTENT_STAGES } from "@/hooks/useSaveSequence";
import { SaveSequence } from "@/components/tepilot/common/SaveSequence";

export function GamificationManagement({ hideHeader = false }: GamificationManagementProps) {
  const initial = getGamificationMetrics();
  const [achievements, setAchievements] = useState<ManagedAchievement[]>(initial.achievements);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedAchievement | null>(null);

  const save = useSaveSequence({ stages: CONTENT_STAGES });

  const handleSave = (a: ManagedAchievement) => {
    save.run(() => commitAchievement(a));
  };

  const commitAchievement = (a: ManagedAchievement) => {
    setAchievements((prev) => {
      const idx = prev.findIndex((x) => x.id === a.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = a;
        return next;
      }
      return [...prev, a];
    });
  };

  const toggleActive = (id: string) => {
    save.run(() =>
      setAchievements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
      ),
    );
  };

  const kpis = [
    { label: "Program Enrollment", value: formatCompact(initial.enrolledUsers), sub: `${initial.enrollmentRate}% of base`, icon: <Users className="h-5 w-5 text-primary" /> },
    { label: "Avg Health Score", value: `${initial.avgHealthScore}/100`, sub: "Across enrolled users", icon: <Heart className="h-5 w-5 text-rose-500" /> },
    { label: "Achievements Unlocked", value: formatCompact(initial.totalUnlocks), sub: `${initial.avgUnlocksPerUser} avg/user`, icon: <Trophy className="h-5 w-5 text-amber-500" /> },
    { label: "Engagement Lift", value: `+${initial.engagementLift}%`, sub: "Txn frequency vs non-enrolled", icon: <TrendingUp className="h-5 w-5 text-emerald-500" /> },
  ];

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <TabHeader
          icon={<Gamepad2 className="w-4 h-4" />}
          title="Gamification Program"
          subtitle="Achievement management and engagement metrics"
          howItWorks="Ventus tracks spending milestones, category exploration, and behavioral streaks to trigger achievement unlocks automatically."
          whyItMatters="Increases transaction frequency and card-top-of-wallet status through behavioral reinforcement loops."
        />
      )}
      <div className="flex items-center justify-end gap-3">
        <SaveSequence status={save.status} label={save.stageLabel} />
        <Button
          size="sm"
          onClick={() => { setEditing(null); setEditorOpen(true); }}
        >
          <Plus className="h-4 w-4 mr-1" /> Create Achievement
        </Button>
      </div>
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">{k.icon}<span className="text-xs text-slate-500">{k.label}</span></div>
              <p className="text-xl font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-400">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Achievement Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-10"></TableHead>
                <TableHead>Achievement</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="w-40">Completion</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead className="w-20 text-center">Active</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements.map((a) => (
                <TableRow key={a.id} className={!a.isActive ? "opacity-50" : ""}>
                  <TableCell className="text-center">
                    {ICON_MAP[a.icon] || <Trophy className="h-4 w-4" />}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm text-slate-900">{a.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{a.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{a.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Progress value={a.completionRate} className="h-2 flex-1" />
                        <span className="text-xs font-medium text-slate-700 w-10 text-right">{a.completionRate}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{a.inProgressRate}% in progress</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-slate-700">{rewardLabel(a)}</span>
                    {a.reward?.fulfillment === "automatic" && (
                      <Badge className="ml-1 bg-emerald-100 text-emerald-700 border-0 text-[10px]">Auto</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch checked={a.isActive} onCheckedChange={() => toggleActive(a.id)} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setEditing(a); setEditorOpen(true); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Program Recommendations
          </h4>
          <div className="grid md:grid-cols-3 gap-3">
            {initial.recommendations.map((r, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={r.priority === "high" ? "bg-rose-100 text-rose-700 border-0 text-[10px]" : "bg-amber-100 text-amber-700 border-0 text-[10px]"}>
                    {r.priority}
                  </Badge>
                  <span className="text-xs text-slate-400">{r.impact}</span>
                </div>
                <p className="text-sm font-medium text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500 mt-1">{r.description}</p>
              </div>
            ))}
          </div>
        </div>

      <AchievementEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        achievement={editing}
        onSave={handleSave}
      />
    </div>
  );
}
