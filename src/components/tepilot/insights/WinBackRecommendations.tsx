import { Badge } from "@/components/ui/badge";
import { RotateCcw, Users, Lightbulb, Target } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import type { WinBackRecommendation } from "@/types/bankwide";

interface Props {
  data: WinBackRecommendation[];
}

export function WinBackRecommendations({ data }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Win-Back Recommendations</h3>
        <p className="text-xs text-muted-foreground mt-1">TEpilot-powered actions pairing outflow detection with behavioral context</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.map((rec) => (
          <div key={rec.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{rec.competitor}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {formatNumber(rec.affectedCustomers)} customers
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {rec.confidence}% confidence
              </Badge>
            </div>

            {/* Outflow pattern */}
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-xs font-medium text-red-400 mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> Detected Pattern
              </p>
              <p className="text-xs text-red-300/80">{rec.outflowPattern}</p>
            </div>

            {/* Behavioral context */}
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
              <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" /> Why They're Leaving
              </p>
              <p className="text-xs text-blue-300/80">{rec.behavioralContext}</p>
            </div>

            {/* Recommended action */}
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
              <p className="text-xs font-medium text-emerald-400 mb-1">✦ Recommended Action</p>
              <p className="text-xs text-emerald-300/80">{rec.recommendedAction}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex gap-1.5 flex-wrap">
                {rec.segmentTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] text-muted-foreground border-border">{tag}</Badge>
                ))}
              </div>
              <span className="text-sm font-semibold text-emerald-400">{formatCurrency(rec.estimatedRecapture)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
