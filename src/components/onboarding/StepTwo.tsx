
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { OnboardingFlowData } from "@/pages/OnboardingFlow";

interface StepTwoProps {
  onboardingData: OnboardingFlowData;
  updateOnboardingData: (data: Partial<OnboardingFlowData>) => void;
}

const frequencyToMultiplier = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  annually: 1
};

const StepTwo = ({ onboardingData, updateOnboardingData }: StepTwoProps) => {
  const [amount, setAmount] = useState(onboardingData.spendingAmount);
  
  // Recalculate annual spend and points when frequency or amount changes
  useEffect(() => {
    const frequency = onboardingData.spendingFrequency;
    const multiplier = frequencyToMultiplier[frequency];
    const annualSpend = amount * multiplier;
    
    // Calculate points (5x points on the spending amount)
    const estimatedPoints = annualSpend * 5;
    
    // Calculate min and max cashback percentages (5% and 11%)
    const minCashbackPercentage = 5;
    const maxCashbackPercentage = 15;
    
    updateOnboardingData({ 
      spendingAmount: amount,
      estimatedAnnualSpend: annualSpend,
      estimatedPoints: estimatedPoints,
      minCashbackPercentage: minCashbackPercentage,
      maxCashbackPercentage: maxCashbackPercentage
    });
  }, [amount, onboardingData.spendingFrequency, updateOnboardingData]);

  const handleFrequencyChange = (value: "weekly" | "monthly" | "quarterly" | "annually") => {
    updateOnboardingData({ spendingFrequency: value });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getSliderMax = () => {
    switch(onboardingData.spendingFrequency) {
      case "weekly":
        return 1000;
      case "monthly":
        return 3000;
      case "quarterly":
        return 9000;
      case "annually":
        return 30000;
      default:
        return 3000;
    }
  };

  // Calculate the min and max dollar savings based on percentages
  const calculateSavingsRange = () => {
    const minSavings = Math.round(onboardingData.estimatedAnnualSpend * (onboardingData.minCashbackPercentage / 100));
    const maxSavings = Math.round(onboardingData.estimatedAnnualSpend * (onboardingData.maxCashbackPercentage / 100));
    return { minSavings, maxSavings };
  };
  
  const { minSavings, maxSavings } = calculateSavingsRange();

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">Your Spending Behavior</h2>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="font-display text-xl font-bold mb-4">Your Selections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-blue-700">Primary Goal</p>
            <p className="font-medium">{onboardingData.mainGoal?.charAt(0).toUpperCase() + onboardingData.mainGoal?.slice(1)}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Subcategories</p>
            <div className="flex flex-wrap gap-1">
              {onboardingData.subcategories.map((sub) => (
                <span key={sub} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-lg text-slate-600 mb-8">
        How much do you typically spend in these categories? This helps us estimate your potential rewards.
      </p>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold mb-4">Spending Frequency</h3>
              <p className="text-slate-600 mb-4">Select how often you want to input your spending:</p>
              
              <RadioGroup 
                value={onboardingData.spendingFrequency} 
                onValueChange={(value) => handleFrequencyChange(value as any)}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly">Quarterly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="annually" id="annually" />
                  <Label htmlFor="annually">Annually</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-display text-xl font-bold">Spending Amount</h3>
              <p className="text-slate-600">
                Drag the slider to indicate how much you typically spend 
                {onboardingData.spendingFrequency === "weekly" ? " per week" : 
                 onboardingData.spendingFrequency === "monthly" ? " per month" : 
                 onboardingData.spendingFrequency === "quarterly" ? " per quarter" : 
                 " per year"} on {onboardingData.mainGoal} related purchases:
              </p>
              
              <div className="pt-6 pb-2">
                <Slider 
                  min={0}
                  max={getSliderMax()}
                  step={10}
                  value={[amount]}
                  onValueChange={(values) => setAmount(values[0])}
                  className="mb-6"
                />
                <div className="flex justify-between text-sm text-slate-500">
                  <span>$0</span>
                  <span>{formatCurrency(getSliderMax() / 2)}</span>
                  <span>{formatCurrency(getSliderMax())}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg text-center mb-4">
                <div className="text-4xl font-display font-bold text-blue-600">
                  {formatCurrency(onboardingData.spendingAmount)}
                </div>
                <p className="text-slate-600">
                  {onboardingData.spendingFrequency === "weekly" ? "Weekly" : 
                   onboardingData.spendingFrequency === "monthly" ? "Monthly" : 
                   onboardingData.spendingFrequency === "quarterly" ? "Quarterly" : 
                   "Annual"} Spending
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <h3 className="font-display text-xl font-bold mb-2">Estimated Annual Spend</h3>
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {formatCurrency(onboardingData.estimatedAnnualSpend)}
            </div>
            <p className="text-slate-600 text-sm">
              Your total estimated spending in these categories per year
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-6">
            <h3 className="font-display text-xl font-bold mb-2">Potential Annual Rewards</h3>
            <div className="text-3xl font-bold text-green-700 mb-2">
              {onboardingData.estimatedPoints.toLocaleString()} points
            </div>
            <p className="text-slate-600 text-sm">
              Approximately {formatCurrency(minSavings)} to {formatCurrency(maxSavings)} in annual savings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StepTwo;
