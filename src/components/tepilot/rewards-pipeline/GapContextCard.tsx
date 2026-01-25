import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lightbulb, Users, DollarSign } from "lucide-react";
import type { RevenueOpportunity } from "@/types/bankwide";
import { cn } from "@/lib/utils";

interface GapContextCardProps {
  opportunity: RevenueOpportunity;
}

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const formatUsers = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  return `${(num / 1_000).toFixed(0)}K`;
};

const getPriorityStyles = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'medium':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'low':
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
};

export function GapContextCard({ opportunity }: GapContextCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{opportunity.gapTitle}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={cn("text-xs", getPriorityStyles(opportunity.priority))}>
              {opportunity.priority} priority
            </Badge>
            <Badge variant="outline" className="text-xs">
              {opportunity.merchantPartnerships.length} partnerships
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{formatCurrency(opportunity.totalOpportunityAmount)}</div>
          <div className="text-sm text-slate-500">addressable revenue</div>
        </div>
      </div>

      {/* Current → Target State */}
      <div className="flex items-stretch gap-3 p-3 bg-slate-50 rounded-lg">
        <div className="flex-1 p-3 bg-rose-50/40 dark:bg-rose-950/10 rounded-lg border border-rose-200/40 dark:border-rose-800/20">
          <div className="text-xs font-medium text-rose-600/80 dark:text-rose-400/80 mb-1">Current State</div>
          <div className="text-sm">{opportunity.currentState}</div>
        </div>
        <div className="flex items-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 p-3 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-lg border border-emerald-200/40 dark:border-emerald-800/20">
          <div className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80 mb-1">Target State</div>
          <div className="text-sm">{opportunity.potentialState}</div>
        </div>
      </div>

      {/* Strategic Insight */}
      <div className="p-3 bg-amber-50/30 dark:bg-amber-950/10 border-l-4 border-amber-400/60 rounded-r-lg">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500/80 shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">Strategic Insight: </span>
            {opportunity.strategicInsight}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <Users className="h-5 w-5 text-slate-500" />
          <div>
            <div className="text-lg font-semibold">{formatUsers(opportunity.affectedUsers)}</div>
            <div className="text-xs text-slate-500">Affected Users</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <DollarSign className="h-5 w-5 text-slate-500" />
          <div>
            <div className="text-lg font-semibold">{formatCurrency(opportunity.totalOpportunityAmount / opportunity.affectedUsers)}</div>
            <div className="text-xs text-slate-500">Per User Opportunity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
