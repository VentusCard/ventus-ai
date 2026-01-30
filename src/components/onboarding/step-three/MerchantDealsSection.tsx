import { Card, CardContent } from "@/components/ui/card";
import { OnboardingFlowData } from "@/pages/OnboardingFlow";
import { dealIcons, getDealIcon } from "./DealIcons";
import { exampleDeals } from "./ExampleDealsData";

interface MerchantDealsSectionProps {
  onboardingData: OnboardingFlowData;
}

const MerchantDealsSection = ({ onboardingData }: MerchantDealsSectionProps) => {
  const selectedDeals = exampleDeals[onboardingData.mainGoal] || {};
  const relevantCategories = onboardingData.subcategories.filter(sub => selectedDeals[sub]);

  if (relevantCategories.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
        Your Exclusive Merchant Deals
      </h3>
      <p className="text-lg text-slate-600 mb-6">
        Here are example deals you'd have access to with Ventus Card based on your selected categories.
      </p>
      
      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-6">
        <h4 className="font-display text-xl font-bold mb-4 text-blue-800">Your Selected Categories</h4>
        <div className="flex flex-wrap gap-2">
          {onboardingData.subcategories.map(sub => {
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
      
      <div className="space-y-6">
        {relevantCategories.map(category => {
          const CategoryIcon = dealIcons[category as keyof typeof dealIcons];
          return (
            <div key={category} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {CategoryIcon && <CategoryIcon className="h-6 w-6 text-blue-600" />}
                <h4 className="font-bold text-xl text-slate-800">{category}</h4>
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
    </div>
  );
};

export default MerchantDealsSection;
