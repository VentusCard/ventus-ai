import { Badge } from "@/components/ui/badge";
import { RotateCcw, Users, Lightbulb, Target, TrendingUp, TrendingDown, Minus, DollarSign, Clock, CheckCircle2, User, Megaphone } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";
import type { WinBackRecommendation } from "@/types/bankwide";

interface Props {
  data: WinBackRecommendation[];
  onLaunchCampaign?: (productName: string, offers: string[]) => void;
}


function TrendIcon({ trend }: { trend: 'growing' | 'stable' | 'declining' }) {
  if (trend === 'growing') return <TrendingUp className="w-3.5 h-3.5 text-red-400" />;
  if (trend === 'declining') return <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

function TrendLabel({ trend }: { trend: 'growing' | 'stable' | 'declining' }) {
  const labels = { growing: 'Growing', stable: 'Stable', declining: 'Declining' };
  const colors = { growing: 'text-red-400', stable: 'text-muted-foreground', declining: 'text-emerald-400' };
  return <span className={`text-[10px] font-medium ${colors[trend]}`}>{labels[trend]}</span>;
}

export function WinBackRecommendations({ data, onLaunchCampaign }: Props) {
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
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                  <RotateCcw className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{rec.competitor}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <TrendIcon trend={rec.trend} />
                    <TrendLabel trend={rec.trend} />
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {rec.confidence}% confidence
              </Badge>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <Users className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs font-semibold text-foreground">{formatNumber(rec.affectedCustomers)}</p>
                <p className="text-[10px] text-muted-foreground">Customers</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs font-semibold text-foreground">{formatCurrency(rec.outflowVolume)}</p>
                <p className="text-[10px] text-muted-foreground">Outflow Vol.</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs font-semibold text-foreground">{formatCurrency(rec.avgTransferAmount)}</p>
                <p className="text-[10px] text-muted-foreground">Avg Transfer</p>
              </div>
            </div>

            {/* Detected pattern */}
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-xs font-medium text-red-400 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Detected Pattern
              </p>
              <p className="text-xs text-red-300/80 leading-relaxed">{rec.outflowPattern}</p>
            </div>

            {/* Behavioral context */}
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Why They're Leaving
                </p>
                <Badge variant="outline" className="text-[9px] border-primary/30 text-primary gap-1">
                  <User className="w-2.5 h-2.5" />
                  {rec.topPersona}
                </Badge>
              </div>
              <p className="text-xs text-blue-300/80 leading-relaxed">{rec.behavioralContext}</p>
            </div>

            {/* Recommended action */}
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 space-y-2.5">
              <p className="text-xs font-medium text-emerald-400 mb-1">✦ Recommended Action</p>
              <p className="text-xs text-emerald-300/80 leading-relaxed">{rec.recommendedAction}</p>
              <div className="flex gap-1.5 flex-wrap pt-1">
                {rec.channelStrategy.map((ch) => (
                  <Badge key={ch} variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    {ch}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Urgency & Success */}
            <div className="flex items-center gap-3 text-xs">
              <Badge variant="outline" className="text-[10px] gap-1 border-amber-500/30 text-amber-400 bg-amber-500/10">
                <Clock className="w-3 h-3" />
                {rec.timeToAction}
              </Badge>
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                {rec.successMetric}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex gap-1.5 flex-wrap">
                {rec.segmentTags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] text-muted-foreground border-border">{tag}</Badge>
                ))}
              </div>
              <span className="text-sm font-semibold text-emerald-400">{formatCurrency(rec.estimatedRecapture)}</span>
            </div>

            {onLaunchCampaign && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    onLaunchCampaign(rec.outflowPattern, [rec.recommendedAction, rec.behavioralContext])
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Build win-back campaign
                </button>
              </div>
            )}
          </div>

        ))}
      </div>
    </div>
  );
}
