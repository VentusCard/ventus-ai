
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Sparkles, Star, Zap, Crown, Shield } from "lucide-react";
import BenefitItem from "./BenefitItem";

const benefits = [
  {
    title: "5x Points Categories",
    description: "Earn 5x points on all purchases from the main category you selected",
    icon: Star
  },
  {
    title: "Exclusive Partner Offers",
    description: "Special discounts and bonuses with our partners in your selected categories",
    icon: Crown
  },
  {
    title: "Personalized Rewards Dashboard",
    description: "Track your spending, points earned, and available offers in one place",
    icon: TrendingUp
  },
  {
    title: "Quarterly Bonus Opportunities",
    description: "Special limited-time promotions in your selected interests",
    icon: Zap
  },
  {
    title: "Multiple Redemption Options",
    description: "Redeem your points for merchandises, experiences, account balance or transfer to partner organization",
    icon: Sparkles
  },
  {
    title: "Premium Protection",
    description: "Advanced fraud protection and purchase security for all your transactions",
    icon: Shield
  }
];

const BenefitsCard = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg">
      {/* Simple decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
      <div className="absolute top-4 right-4 opacity-20">
        <Sparkles size={32} />
      </div>
      <div className="absolute bottom-4 left-4 opacity-20">
        <TrendingUp size={28} />
      </div>
      
      <div className="relative z-10 p-8">
        {/* Simple header section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight">
              🎉 The Ventus Advantage
            </h3>
          </div>
          <p className="text-lg text-blue-100 font-medium leading-relaxed max-w-2xl mx-auto">
            One card automatically optimizes ALL your purchases for maximum rewards
          </p>
        </div>
        
        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {benefits.map((benefit, index) => (
            <BenefitItem
              key={index}
              title={benefit.title}
              description={benefit.description}
              icon={benefit.icon}
            />
          ))}
        </div>
        
        {/* Simple call-to-action section */}
        <div className="text-center">
          <div className="inline-block bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20 max-w-xl">
            <div className="space-y-3">
              <h4 className="text-xl font-bold text-white">
                Ready to maximize your rewards?
              </h4>
              <p className="text-blue-100 text-base font-medium">
                Join thousands of users already earning more with Ventus Card
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsCard;
