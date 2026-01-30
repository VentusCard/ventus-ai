import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sunset, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { RetirementProfile } from "@/types/financial-planning";
import { formatCurrency } from "@/components/onboarding/step-three/FormatHelper";
import { useMemo } from "react";

interface RetirementPlanningSectionProps {
  profile: RetirementProfile;
  onProfileChange: (profile: RetirementProfile) => void;
  currentNetWorth: number;
}

export function RetirementPlanningSection({
  profile,
  onProfileChange,
  currentNetWorth,
}: RetirementPlanningSectionProps) {
  const yearsToRetirement = profile.retirementAge - profile.currentAge;
  const yearsInRetirement = profile.lifeExpectancy - profile.retirementAge;

  // Calculate retirement readiness
  const retirementAnalysis = useMemo(() => {
    const annualSavingsNeeded = profile.desiredRetirementIncome * yearsInRetirement;
    const guaranteedIncome = (profile.socialSecurityEstimate + profile.pensionIncome) * yearsInRetirement;
    const portfolioIncomeNeeded = annualSavingsNeeded - guaranteedIncome;
    
    // Using 4% safe withdrawal rate
    const requiredPortfolio = (profile.desiredRetirementIncome - profile.socialSecurityEstimate - profile.pensionIncome) / 0.04;
    
    // Project current savings forward (assuming 6% return)
    const projectedSavings = profile.currentRetirementSavings * Math.pow(1.06, yearsToRetirement);
    
    const readinessScore = Math.min(100, Math.round((projectedSavings / requiredPortfolio) * 100));
    const incomeGap = Math.max(0, profile.desiredRetirementIncome - profile.socialSecurityEstimate - profile.pensionIncome - (projectedSavings * 0.04));
    const projectedPortfolioIncome = projectedSavings * 0.04;
    
    return {
      requiredPortfolio,
      projectedSavings,
      readinessScore,
      incomeGap,
      projectedPortfolioIncome,
      totalProjectedIncome: profile.socialSecurityEstimate + profile.pensionIncome + projectedPortfolioIncome,
    };
  }, [profile, yearsToRetirement, yearsInRetirement]);

  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 100) return "On Track";
    if (score >= 80) return "Good Progress";
    if (score >= 60) return "Needs Attention";
    return "Action Required";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sunset className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Retirement Planning</CardTitle>
          </div>
          <Badge 
            variant={retirementAnalysis.readinessScore >= 80 ? "default" : "destructive"}
            className="text-sm"
          >
            {getReadinessLabel(retirementAnalysis.readinessScore)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Readiness Score & Income Gap */}
          <div className="space-y-6">
            {/* Readiness Score Circle */}
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-slate-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${retirementAnalysis.readinessScore * 3.52} 352`}
                    className={getReadinessColor(retirementAnalysis.readinessScore)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getReadinessColor(retirementAnalysis.readinessScore)}`}>
                    {retirementAnalysis.readinessScore}%
                  </span>
                  <span className="text-xs text-slate-500">Readiness</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm text-slate-500">Years to Retirement</p>
                  <p className="text-2xl font-bold">{yearsToRetirement}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Target Retirement</p>
                  <p className="font-semibold">Age {profile.retirementAge}</p>
                </div>
              </div>
            </div>

            {/* Income Gap Analysis */}
            <div className="p-4 rounded-lg bg-slate-50 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Retirement Income Analysis
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Desired Income:</span>
                  <span className="font-medium">{formatCurrency(profile.desiredRetirementIncome)}/yr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Social Security:</span>
                  <span className="font-medium">{formatCurrency(profile.socialSecurityEstimate)}/yr</span>
                </div>
                {profile.pensionIncome > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pension:</span>
                    <span className="font-medium">{formatCurrency(profile.pensionIncome)}/yr</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Projected Portfolio Income:</span>
                  <span className="font-medium">{formatCurrency(retirementAnalysis.projectedPortfolioIncome)}/yr</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Projected:</span>
                  <span className={retirementAnalysis.incomeGap > 0 ? "text-yellow-600" : "text-green-600"}>
                    {formatCurrency(retirementAnalysis.totalProjectedIncome)}/yr
                  </span>
                </div>
                {retirementAnalysis.incomeGap > 0 ? (
                  <div className="flex items-center gap-2 text-yellow-600 pt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Gap: {formatCurrency(retirementAnalysis.incomeGap)}/yr shortfall</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 pt-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>On track to meet income goal</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Current Age</Label>
                <Input
                  type="number"
                  value={profile.currentAge}
                  onChange={(e) => onProfileChange({ ...profile, currentAge: parseInt(e.target.value) || 45 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Retirement Age</Label>
                <Input
                  type="number"
                  value={profile.retirementAge}
                  onChange={(e) => onProfileChange({ ...profile, retirementAge: parseInt(e.target.value) || 65 })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Life Expectancy</Label>
                <Input
                  type="number"
                  value={profile.lifeExpectancy}
                  onChange={(e) => onProfileChange({ ...profile, lifeExpectancy: parseInt(e.target.value) || 90 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Desired Annual Income</Label>
                <Input
                  type="number"
                  value={profile.desiredRetirementIncome}
                  onChange={(e) => onProfileChange({ ...profile, desiredRetirementIncome: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Social Security (Annual)</Label>
                <Input
                  type="number"
                  value={profile.socialSecurityEstimate}
                  onChange={(e) => onProfileChange({ ...profile, socialSecurityEstimate: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Pension Income (Annual)</Label>
                <Input
                  type="number"
                  value={profile.pensionIncome}
                  onChange={(e) => onProfileChange({ ...profile, pensionIncome: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">Current Retirement Savings</Label>
              <Input
                type="number"
                value={profile.currentRetirementSavings}
                onChange={(e) => onProfileChange({ ...profile, currentRetirementSavings: parseFloat(e.target.value) || 0 })}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Required at retirement (4% rule): {formatCurrency(retirementAnalysis.requiredPortfolio)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
