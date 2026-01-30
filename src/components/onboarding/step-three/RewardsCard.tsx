
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { OnboardingData } from "./types";
import { formatCurrency, calculateSavingsRange } from "./FormatHelper";

interface RewardsCardProps {
  onboardingData: OnboardingData;
}

const RewardsCard = ({ onboardingData }: RewardsCardProps) => {
  const { minSavings, maxSavings } = calculateSavingsRange(
    onboardingData.estimatedAnnualSpend,
    onboardingData.minCashbackPercentage,
    onboardingData.maxCashbackPercentage
  );
  
  // Calculate percentage for progress bar
  const pointsProgress = Math.min(onboardingData.estimatedPoints / 50000 * 100, 100);

  return (
    <Card className="overflow-hidden border-0 shadow-premium bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative">
      {/* Enhanced metallic accent line */}
      <div className="h-2 bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300"></div>
      
      {/* Subtle metallic texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none"></div>
      
      <CardContent className="p-8 relative z-10">
        <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-lg">
            <Award className="text-white" size={24} />
          </div>
          <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
            Rewards Value
          </span>
        </h3>
        
        <div className="space-y-8">
          <div>
            <p className="text-sm opacity-80 mb-3 font-semibold uppercase tracking-wide">Estimated Annual Points</p>
            <div className="flex items-center gap-4 mb-4">
              <p className="font-bold text-4xl bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                {onboardingData.estimatedPoints.toLocaleString()}
              </p>
              <div className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-sm border border-cyan-400/30 text-xs px-3 py-2 rounded-full font-semibold">
                +5x on categories
              </div>
            </div>
            <div className="mb-4">
              <Progress value={pointsProgress} className="h-3 bg-white/10 border border-white/20" />
            </div>
            <p className="text-xs opacity-80">
              Equal to approximately {formatCurrency(onboardingData.estimatedPoints / 100)}
            </p>
          </div>
          
          <div>
            <p className="text-sm opacity-80 mb-3 font-semibold uppercase tracking-wide">Approximate Savings</p>
            <p className="font-bold text-4xl bg-gradient-to-r from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent">
              {formatCurrency(minSavings)} - {formatCurrency(maxSavings)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsCard;
