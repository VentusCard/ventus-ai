
import { OnboardingFlowData } from "@/pages/OnboardingFlow";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Star, TrendingUp, Shield, Sparkles, Users, Clock } from "lucide-react";

interface StepFiveSummaryProps {
  onboardingData: OnboardingFlowData;
}

const StepFiveSummary = ({ onboardingData }: StepFiveSummaryProps) => {
  const goalTitles: Record<string, string> = {
    sports: "Sports",
    wellness: "Wellness", 
    pets: "Pet Owners",
    gamers: "Gamers",
    creatives: "Creatives",
    homeowners: "Homeowners"
  };

  const goalTitle = onboardingData.mainGoal ? goalTitles[onboardingData.mainGoal] : "Unknown";

  const benefits = [
    {
      icon: <Star className="h-5 w-5" />,
      title: "5x Points Everywhere",
      description: "Earn 5x points on all purchases in your selected categories"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "AI-Optimized Rewards",
      description: "Smart recommendations to maximize your earning potential"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "No Annual Fee",
      description: "Premium rewards with no yearly cost"
    }
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Your Personalized Ventus Experience
        </h2>
        <p className="text-lg text-slate-600">
          Here's your customized rewards profile based on your preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Profile Summary */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-display text-xl font-bold mb-6 text-blue-800">
              Your Profile
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Main Goal</div>
                  <div className="text-sm text-slate-600">{goalTitle}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Selected Categories ({onboardingData.subcategories.length})</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {onboardingData.subcategories.map((sub) => (
                      <span key={sub} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium">Spending Pattern</div>
                  <div className="text-sm text-slate-600">
                    ${onboardingData.spendingAmount} {onboardingData.spendingFrequency}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Projection */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-display text-xl font-bold mb-6 text-blue-800">
              Your Rewards Potential
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-slate-600">Annual Spending</div>
                <div className="text-2xl font-bold text-slate-800">
                  ${onboardingData.estimatedAnnualSpend.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-slate-600">Points Per Year</div>
                <div className="text-2xl font-bold text-blue-600">
                  {onboardingData.estimatedPoints.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">5x multiplier applied</div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-4 rounded-lg">
                <div className="text-sm opacity-90">Annual Cash Value</div>
                <div className="text-2xl font-bold">
                  ${Math.round(onboardingData.estimatedAnnualSpend * 0.05)} - ${Math.round(onboardingData.estimatedAnnualSpend * 0.15)}
                </div>
                <div className="text-xs opacity-90">5% - 15% effective return</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Benefits */}
      <Card className="mb-12">
        <CardContent className="p-6">
          <h3 className="font-display text-xl font-bold mb-6 text-center">
            Why Ventus is Perfect for You
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white mx-auto mb-3">
                  {benefit.icon}
                </div>
                <h4 className="font-semibold mb-2">{benefit.title}</h4>
                <p className="text-sm text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Call to Action */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white p-12 md:p-16 rounded-2xl shadow-2xl">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-0 right-0 top-0 bottom-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]"></div>
          <div className="absolute left-10 top-10 w-32 h-32 bg-cyan-300 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute right-10 bottom-10 w-40 h-40 bg-blue-300 rounded-full filter blur-3xl opacity-30"></div>
          <div className="absolute right-20 top-20 w-24 h-24 bg-white rounded-full filter blur-2xl opacity-20"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
            <h3 className="font-display text-3xl md:text-4xl font-bold">
              Join the Ventus Revolution!
            </h3>
            <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
          </div>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
            Be among the <span className="font-bold text-white">first 10,000</span> to experience 
            the future of personalized credit card rewards
          </p>
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-cyan-300" />
                <span className="text-2xl font-bold">8,247</span>
              </div>
              <p className="text-sm text-blue-200">People waiting</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-300" />
                <span className="text-2xl font-bold">5x</span>
              </div>
              <p className="text-sm text-blue-200">Rewards multiplier</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-300" />
                <span className="text-2xl font-bold">Q2</span>
              </div>
              <p className="text-sm text-blue-200">2025 Launch</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg px-10 py-4 h-auto rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Secure My Spot Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold text-lg px-10 py-4 h-auto rounded-xl backdrop-blur-sm bg-white/10 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Learn More Features
            </Button>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-blue-200 text-sm mb-2">
              ✨ <span className="font-semibold">Exclusive Early Access Benefits:</span>
            </p>
            <p className="text-blue-100 text-sm">
              Priority approval • Bonus welcome offer • Beta feature access
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-lg text-slate-600 font-medium">
          🎉 Congratulations! You've completed your personalized Ventus experience.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          We'll send you updates about your application status and launch timeline.
        </p>
      </div>
    </div>
  );
};

export default StepFiveSummary;
