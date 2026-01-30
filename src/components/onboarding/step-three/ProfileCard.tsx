
import { Card, CardContent } from "@/components/ui/card";
import { User, Target } from "lucide-react";
import { OnboardingData } from "./types";
import { formatCurrency } from "./FormatHelper";

interface ProfileCardProps {
  onboardingData: OnboardingData;
}

const ProfileCard = ({ onboardingData }: ProfileCardProps) => {
  return (
    <Card className="overflow-hidden border-0 shadow-premium bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-sm">
      <div className="h-2 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500"></div>
      <CardContent className="p-8">
        <h3 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <User className="text-white" size={24} />
          </div>
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Your Profile
          </span>
        </h3>
        
        <div className="space-y-6">
          <div>
            <p className="text-sm text-slate-500 mb-3 font-semibold uppercase tracking-wide">Main Goal</p>
            <div className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-blue-50/50 p-4 rounded-xl border border-slate-200/50 shadow-sm">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-full shadow-md">
                <Target className="h-5 w-5 text-white" />
              </div>
              <p className="font-bold text-lg text-slate-800">
                {onboardingData.mainGoal?.charAt(0).toUpperCase() + onboardingData.mainGoal?.slice(1)}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-slate-500 mb-3 font-semibold uppercase tracking-wide">Selected Interests</p>
            <div className="flex flex-wrap gap-2">
              {onboardingData.subcategories.map((sub) => (
                <span 
                  key={sub} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm shadow-md backdrop-blur-sm border border-blue-400/30 font-semibold"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-slate-500 mb-3 font-semibold uppercase tracking-wide">Estimated Annual Spend</p>
            <div className="bg-gradient-to-r from-slate-100 to-blue-100/50 p-6 rounded-xl border border-slate-300/50 shadow-sm">
              <p className="font-bold text-3xl bg-gradient-to-r from-blue-700 to-blue-800 bg-clip-text text-transparent">
                {formatCurrency(onboardingData.estimatedAnnualSpend)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
