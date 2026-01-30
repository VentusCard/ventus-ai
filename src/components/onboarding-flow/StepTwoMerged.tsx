import { LifestyleGoal } from "@/pages/OnboardingFlow";
import SelectedCategoriesImpactCard from "./SelectedCategoriesImpactCard";
import TraditionalVsVentusComparison from "./TraditionalVsVentusComparison";
import VentusSimplificationSection from "./VentusSimplificationSection";
import { Card, CardContent } from "@/components/ui/card";
import { dealIcons, getDealIcon } from "../onboarding/step-three/DealIcons";
import { exampleDeals } from "../onboarding/step-three/ExampleDealsData";

interface StepTwoMergedProps {
  selectedGoal: LifestyleGoal;
  selectedSubcategories: string[];
}

const StepTwoMerged = ({
  selectedGoal,
  selectedSubcategories
}: StepTwoMergedProps) => {
  const goalTitles: Record<LifestyleGoal, string> = {
    sports: "Sports",
    wellness: "Wellness",
    pets: "Pet Owners",
    gamers: "Gamers",
    creatives: "Creatives",
    homeowners: "Homeowners"
  };

  // Helper function to get the proper title with or without "Enthusiasts"
  const getDisplayTitle = (goal: LifestyleGoal) => {
    if (goal === 'pets') {
      return goalTitles[goal]; // "Pet Owners" without "Enthusiasts"
    }
    return `${goalTitles[goal]} Enthusiasts`;
  };

  const selectedDeals = exampleDeals[selectedGoal] || {};
  const relevantCategories = selectedSubcategories.filter(sub => selectedDeals[sub]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="font-display text-xl md:text-3xl font-bold mb-4 text-white">
          Your Personalized Smart Rewards System
        </h2>
        <p className="text-base md:text-xl text-white/80 mb-6">
          See how Ventus combines your selected categories into one intelligent card that automatically maximizes your rewards.
        </p>
      </div>

      {/* Selected Categories Impact - Moved to top */}
      <SelectedCategoriesImpactCard selectedGoal={selectedGoal} selectedSubcategories={selectedSubcategories} />

      <TraditionalVsVentusComparison />

      <VentusSimplificationSection />

      {/* Example Deals Section */}
      <div className="mt-6">
        <h2 className="font-display text-xl md:text-3xl font-bold mb-6 text-white">
          Exclusive Deals for {getDisplayTitle(selectedGoal)}
        </h2>
        
        <div className="premium-card bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-400/30 p-6 mb-6">
          <h3 className="font-display text-lg md:text-2xl font-bold mb-4 text-blue-300">Your Personalized Merchant Deals</h3>
          <div>
            <h4 className="font-semibold text-blue-400 mb-4 text-sm md:text-lg">Selected Categories:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSubcategories.map(sub => {
                const CategoryIcon = dealIcons[sub as keyof typeof dealIcons];
                return (
                  <span key={sub} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500/60 to-blue-600/60 text-white rounded-lg text-base shadow-lg">
                    {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                    {sub}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {relevantCategories.length > 0 && (
          <div className="space-y-6 mb-6">
            {relevantCategories.map(category => {
              const CategoryIcon = dealIcons[category as keyof typeof dealIcons];
              return (
                <div key={category} className="premium-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    {CategoryIcon && <CategoryIcon className="h-6 w-6 text-blue-400" />}
                    <h3 className="font-display text-lg md:text-2xl font-bold text-white">Example Deals in {category}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedDeals[category]?.map((deal, index) => {
                      const DealIcon = getDealIcon(deal);
                      return (
                        <Card key={index} className="premium-card hover:shadow-titanium transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 p-2 bg-blue-500/20 rounded-full">
                                <DealIcon className="h-4 w-4 text-blue-400" />
                              </div>
                              <div className="text-white/90 text-sm md:text-base font-medium flex-1 min-h-[50px] flex items-center">
                                <span className="text-left w-full">{deal}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default StepTwoMerged;