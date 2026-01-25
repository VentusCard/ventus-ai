import { Card, CardContent } from "@/components/ui/card";
import { Target, TrendingUp, Shield, Award, Brain, Zap } from "lucide-react";
const VentusSimplificationSection = () => {
  const aiFeatures = [{
    icon: Brain,
    title: "Smart Category Detection",
    description: "AI automatically identifies the best reward category for each purchase"
  }, {
    icon: Target,
    title: "Personalized Optimization",
    description: "Learns your spending patterns to maximize rewards in your lifestyle areas"
  }, {
    icon: TrendingUp,
    title: "Deal Discovery",
    description: "Continuously finds and negotiates new partnerships for better rewards"
  }];
  const simplicityBenefits = [{
    icon: Shield,
    title: "Set It & Forget It",
    description: "No manual category activation or quarterly rotations to manage"
  }, {
    icon: Award,
    title: "Always Optimized",
    description: "AI ensures you're always earning maximum rewards without any effort"
  }, {
    icon: Zap,
    title: "Real-Time Adaptation",
    description: "Automatically adjusts to new merchants and better reward opportunities"
  }];
  return <div className="mb-6">
      <div className="text-center mb-8">
        <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-white">
          Powered by Ventus AI
        </h3>
        <p className="text-lg text-white/80 w-full">
          Experience the future of rewards with AI that works behind the scenes to maximize your benefits automatically.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        {aiFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="premium-card p-4 md:p-6">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-lg text-white">{feature.title}</h4>
                </div>
                <p className="text-white/70">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-3 md:gap-6">
        {simplicityBenefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Card key={index} className="premium-card p-4 md:p-6">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Icon className="h-6 w-6 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-lg text-white">{benefit.title}</h4>
                </div>
                <p className="text-white/70">{benefit.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>;
};
export default VentusSimplificationSection;