
import { LifestyleGoal } from "@/pages/OnboardingFlow";
import { Card, CardContent } from "@/components/ui/card";
import { dealIcons, getDealIcon } from "../onboarding/step-three/DealIcons";
import { exampleDeals } from "../onboarding/step-three/ExampleDealsData";

interface StepThreePointFiveExampleDealsProps {
  selectedGoal: LifestyleGoal;
  selectedSubcategories: string[];
}

const StepThreePointFiveExampleDeals = ({
  selectedGoal,
  selectedSubcategories
}: StepThreePointFiveExampleDealsProps) => {
  const goalTitles: Record<LifestyleGoal, string> = {
    sports: "Sports",
    wellness: "Wellness",
    pets: "Pet Owners",
    gamers: "Gamers",
    creatives: "Creatives",
    homeowners: "Homeowners"
  };

  // Debug logging
  console.log("StepThreePointFiveExampleDeals - selectedGoal:", selectedGoal);
  console.log("StepThreePointFiveExampleDeals - selectedSubcategories:", selectedSubcategories);
  
  const selectedDeals = exampleDeals[selectedGoal] || {};
  console.log("StepThreePointFiveExampleDeals - selectedDeals keys:", Object.keys(selectedDeals));
  
  const relevantCategories = selectedSubcategories.filter(sub => {
    const hasDeals = selectedDeals[sub];
    console.log(`Category "${sub}" has deals:`, hasDeals ? "YES" : "NO");
    return hasDeals;
  });
  
  console.log("StepThreePointFiveExampleDeals - relevantCategories:", relevantCategories);

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
        Exclusive Deals for {goalTitles[selectedGoal]} Enthusiasts
      </h2>
      <p className="text-lg text-slate-600 mb-8">
        Here are some example deals and offers you'd have access to with Ventus Card based on your selected categories.
      </p>

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-8">
        <h3 className="font-display text-xl font-bold mb-4 text-blue-800">Your Personalized Merchant Deals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Selected Categories:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSubcategories.map(sub => {
                const CategoryIcon = dealIcons[sub as keyof typeof dealIcons];
                return (
                  <span key={sub} className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                    {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                    {sub}
                  </span>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">What This Means:</h4>
            <p className="text-sm text-blue-600">Ventus AI will continuously find and secure exclusive deals with merchants in your selected categories, ensuring you always get the best rewards.</p>
          </div>
        </div>
      </div>

      {relevantCategories.length === 0 ? (
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-8">
          <h3 className="font-display text-xl font-bold mb-2 text-yellow-800">Debug Information</h3>
          <p className="text-yellow-700 mb-2">No relevant categories found. Here's what we have:</p>
          <p className="text-sm text-yellow-600">Selected Goal: {selectedGoal}</p>
          <p className="text-sm text-yellow-600">Selected Subcategories: {selectedSubcategories.join(", ")}</p>
          <p className="text-sm text-yellow-600">Available Deal Categories: {Object.keys(selectedDeals).join(", ")}</p>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {relevantCategories.map(category => {
            const CategoryIcon = dealIcons[category as keyof typeof dealIcons];
            return (
              <div key={category} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  {CategoryIcon && <CategoryIcon className="h-6 w-6 text-blue-600" />}
                  <h3 className="font-bold text-xl text-slate-800">{category}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedDeals[category]?.map((deal, index) => {
                    const DealIcon = getDealIcon(deal);
                    return (
                      <Card key={index} className="bg-white border-slate-200 hover:shadow-md transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 p-2 bg-blue-50 rounded-full">
                              <DealIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-slate-700 text-sm font-medium flex-1 min-h-[50px] flex items-center">
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

      <div className="text-center mt-8">
        <p className="text-slate-600 text-base font-bold">
          Ready to see your potential rewards? Let's input your spending habits in the next step.
        </p>
      </div>
    </div>
  );
};

export default StepThreePointFiveExampleDeals;
