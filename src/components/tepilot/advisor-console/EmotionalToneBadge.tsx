import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmotionalToneAnalysis } from "@/types/lifestyle-signals";
import { Smile, AlertCircle, Sparkles, Users, ShieldAlert, TrendingUp } from "lucide-react";

interface EmotionalToneBadgeProps {
  analysis: EmotionalToneAnalysis;
}

const toneConfig = {
  confident: { icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", label: "Confident" },
  uncertain: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50", label: "Uncertain" },
  stressed: { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50", label: "Stressed" },
  engaged: { icon: Sparkles, color: "text-blue-600", bg: "bg-blue-50", label: "Engaged" },
  defensive: { icon: ShieldAlert, color: "text-orange-600", bg: "bg-orange-50", label: "Defensive" },
  optimistic: { icon: Smile, color: "text-purple-600", bg: "bg-purple-50", label: "Optimistic" },
};

export function EmotionalToneBadge({ analysis }: EmotionalToneBadgeProps) {
  const config = toneConfig[analysis.tone];
  const Icon = config.icon;

  return (
    <Card className={`${config.bg} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={`w-6 h-6 ${config.color} mt-1`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm">Client Emotional Tone: {config.label}</h4>
              <Badge variant="secondary" className="text-xs">
                {Math.round(analysis.confidence * 100)}% confidence
              </Badge>
            </div>
            
            {analysis.supportingQuotes.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Supporting Evidence:</p>
                {analysis.supportingQuotes.map((quote, idx) => (
                  <p key={idx} className="text-xs italic text-slate-500 ml-2 mb-1">
                    "{quote}"
                  </p>
                ))}
              </div>
            )}

            {analysis.preparationTips.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Preparation Tips:</p>
                <ul className="space-y-1 ml-2">
                  {analysis.preparationTips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-slate-900">
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
